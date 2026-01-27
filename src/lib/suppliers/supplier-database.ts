/**
 * Supplier Database - Base de données fournisseurs/grossistes
 * API pour import/export et intégration
 * NOTE: Ce fichier est réservé au code serveur uniquement
 */

import { createClient } from '@/lib/supabase/server';
import { encrypt, decrypt } from '@/lib/rgpd/encryption';
import type { SupplierCategory } from './constants';
import { POPULAR_BELGIAN_SUPPLIERS, SUPPLIER_CATEGORIES_WITH_ICONS } from './constants';

// Re-export constants for backward compatibility (server-side only)
export type { SupplierCategory };
export { POPULAR_BELGIAN_SUPPLIERS };

// Alias for internal use
const SUPPLIER_CATEGORIES = SUPPLIER_CATEGORIES_WITH_ICONS;

/**
 * Interface Fournisseur
 */
export interface Supplier {
  id: string;
  name: string;
  category: SupplierCategory;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country: string;
  vat_number?: string;
  is_verified: boolean;
  rating?: number;
  api_available: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Lien utilisateur-fournisseur
 */
export interface UserSupplier {
  id: string;
  user_id: string;
  supplier_id: string;
  custom_code?: string; // Code client chez le fournisseur
  discount_rate?: number;
  notes?: string;
  api_key_encrypted?: string;
  supplier: Supplier;
}

/**
 * Produit fournisseur
 */
export interface SupplierProduct {
  id: string;
  supplier_id: string;
  reference: string;
  name: string;
  description?: string;
  category?: string;
  unit: string;
  price: number;
  vat_rate: number;
  stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock' | 'unknown';
  last_updated: string;
}

/**
 * Récupère tous les fournisseurs vérifiés
 */
export async function getVerifiedSuppliers(
  category?: SupplierCategory
): Promise<Supplier[]> {
  const supabase = await createClient();

  let query = supabase
    .from('suppliers')
    .select('*')
    .eq('is_verified', true)
    .order('name');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Failed to get suppliers:', error);
    return [];
  }

  return data;
}

/**
 * Récupère les fournisseurs d'un utilisateur
 */
export async function getUserSuppliers(userId: string): Promise<UserSupplier[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_suppliers')
    .select(`
      *,
      supplier:suppliers(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get user suppliers:', error);
    return [];
  }

  return data;
}

/**
 * Ajoute un fournisseur à la liste de l'utilisateur
 */
export async function addUserSupplier(
  userId: string,
  supplierId: string,
  options: {
    customCode?: string;
    discountRate?: number;
    notes?: string;
    apiKey?: string;
  } = {}
): Promise<UserSupplier | null> {
  const supabase = await createClient();

  const insertData: any = {
    user_id: userId,
    supplier_id: supplierId,
    custom_code: options.customCode,
    discount_rate: options.discountRate,
    notes: options.notes,
  };

  // Chiffrer la clé API si fournie
  if (options.apiKey) {
    insertData.api_key_encrypted = encrypt(options.apiKey);
  }

  const { data, error } = await supabase
    .from('user_suppliers')
    .insert(insertData)
    .select(`
      *,
      supplier:suppliers(*)
    `)
    .single();

  if (error) {
    console.error('Failed to add user supplier:', error);
    return null;
  }

  return data;
}

/**
 * Met à jour un lien fournisseur
 */
export async function updateUserSupplier(
  userId: string,
  userSupplierId: string,
  updates: {
    customCode?: string;
    discountRate?: number;
    notes?: string;
    apiKey?: string;
  }
): Promise<boolean> {
  const supabase = await createClient();

  const updateData: any = {
    custom_code: updates.customCode,
    discount_rate: updates.discountRate,
    notes: updates.notes,
  };

  if (updates.apiKey !== undefined) {
    updateData.api_key_encrypted = updates.apiKey ? encrypt(updates.apiKey) : null;
  }

  const { error } = await supabase
    .from('user_suppliers')
    .update(updateData)
    .eq('id', userSupplierId)
    .eq('user_id', userId);

  return !error;
}

/**
 * Supprime un fournisseur de la liste de l'utilisateur
 */
export async function removeUserSupplier(
  userId: string,
  userSupplierId: string
): Promise<boolean> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_suppliers')
    .delete()
    .eq('id', userSupplierId)
    .eq('user_id', userId);

  return !error;
}

/**
 * Recherche de produits chez un fournisseur
 */
export async function searchSupplierProducts(
  supplierId: string,
  query: string,
  options: {
    category?: string;
    limit?: number;
  } = {}
): Promise<SupplierProduct[]> {
  const supabase = await createClient();
  const { category, limit = 50 } = options;

  let dbQuery = supabase
    .from('supplier_products')
    .select('*')
    .eq('supplier_id', supplierId)
    .or(`name.ilike.%${query}%,reference.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(limit);

  if (category) {
    dbQuery = dbQuery.eq('category', category);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('Failed to search products:', error);
    return [];
  }

  return data;
}

/**
 * Importe des produits depuis un fournisseur via API
 */
export async function importSupplierProducts(
  userId: string,
  userSupplierId: string
): Promise<{ imported: number; errors: string[] }> {
  const supabase = await createClient();

  // Récupérer le lien fournisseur avec la clé API
  const { data: userSupplier } = await supabase
    .from('user_suppliers')
    .select(`
      *,
      supplier:suppliers(*)
    `)
    .eq('id', userSupplierId)
    .eq('user_id', userId)
    .single();

  if (!userSupplier || !userSupplier.api_key_encrypted) {
    return { imported: 0, errors: ['Clé API non configurée'] };
  }

  const apiKey = decrypt(userSupplier.api_key_encrypted);
  const supplier = userSupplier.supplier;

  if (!supplier.api_endpoint) {
    return { imported: 0, errors: ['Fournisseur sans API disponible'] };
  }

  // Appeler l'API du fournisseur
  try {
    const response = await fetch(supplier.api_endpoint, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { imported: 0, errors: [`Erreur API: ${response.status}`] };
    }

    const products = await response.json();

    // Insérer les produits
    const { error } = await supabase
      .from('supplier_products')
      .upsert(
        products.map((p: any) => ({
          supplier_id: supplier.id,
          reference: p.reference,
          name: p.name,
          description: p.description,
          category: p.category,
          unit: p.unit || 'unité',
          price: p.price,
          vat_rate: p.vat_rate || 21,
          stock_status: p.stock_status,
          last_updated: new Date().toISOString(),
        })),
        { onConflict: 'supplier_id,reference' }
      );

    if (error) {
      return { imported: 0, errors: [error.message] };
    }

    return { imported: products.length, errors: [] };
  } catch (error: any) {
    return { imported: 0, errors: [error.message] };
  }
}

/**
 * Exporte les fournisseurs de l'utilisateur en CSV
 */
export async function exportUserSuppliersCSV(userId: string): Promise<string> {
  const suppliers = await getUserSuppliers(userId);

  const headers = ['Nom', 'Catégorie', 'Email', 'Téléphone', 'Site web', 'Code client', 'Remise %'];
  const rows = suppliers.map(us => [
    us.supplier.name,
    SUPPLIER_CATEGORIES.find(c => c.id === us.supplier.category)?.label || '',
    us.supplier.contact_email || '',
    us.supplier.contact_phone || '',
    us.supplier.website || '',
    us.custom_code || '',
    us.discount_rate?.toString() || '',
  ]);

  const csv = [
    headers.join(';'),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(';')),
  ].join('\n');

  return csv;
}

/**
 * Importe des fournisseurs depuis un CSV
 */
export async function importSuppliersFromCSV(
  userId: string,
  csvContent: string
): Promise<{ imported: number; errors: string[] }> {
  const lines = csvContent.split('\n').filter(l => l.trim());
  if (lines.length < 2) {
    return { imported: 0, errors: ['Fichier vide ou invalide'] };
  }

  const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim().toLowerCase());
  const errors: string[] = [];
  let imported = 0;

  const supabase = await createClient();

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(';').map(v => v.replace(/"/g, '').trim());
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });

    const name = row['nom'] || row['name'];
    if (!name) {
      errors.push(`Ligne ${i + 1}: Nom manquant`);
      continue;
    }

    // Créer le fournisseur personnalisé
    const { data: supplier, error: supplierError } = await supabase
      .from('suppliers')
      .insert({
        name,
        category: 'general',
        contact_email: row['email'] || row['contact_email'],
        contact_phone: row['telephone'] || row['phone'] || row['contact_phone'],
        website: row['site'] || row['site web'] || row['website'],
        is_verified: false,
      })
      .select()
      .single();

    if (supplierError) {
      errors.push(`Ligne ${i + 1}: ${supplierError.message}`);
      continue;
    }

    // Lier à l'utilisateur
    await supabase.from('user_suppliers').insert({
      user_id: userId,
      supplier_id: supplier.id,
      custom_code: row['code client'] || row['custom_code'],
      discount_rate: parseFloat(row['remise'] || row['discount']) || null,
    });

    imported++;
  }

  return { imported, errors };
}

// POPULAR_BELGIAN_SUPPLIERS est maintenant exporté depuis ./constants
