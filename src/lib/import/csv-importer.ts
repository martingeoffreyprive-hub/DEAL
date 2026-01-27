/**
 * CSV Importer - Import de données avec génération de base vectorielle
 * Clients, produits, fournisseurs
 */

import { createClient } from '@/lib/supabase/server';
import { parse } from 'csv-parse/sync';

/**
 * Types d'import supportés
 */
export type ImportType = 'clients' | 'products' | 'suppliers' | 'quote_items';

/**
 * Configuration de mapping des colonnes
 */
export interface ColumnMapping {
  csvColumn: string;
  dbField: string;
  transform?: (value: string) => any;
  required?: boolean;
}

/**
 * Résultat d'import
 */
export interface ImportResult {
  jobId: string;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field?: string;
  value?: string;
  message: string;
}

/**
 * Mappings par défaut pour chaque type
 */
export const DEFAULT_MAPPINGS: Record<ImportType, ColumnMapping[]> = {
  clients: [
    { csvColumn: 'nom', dbField: 'name', required: true },
    { csvColumn: 'email', dbField: 'email' },
    { csvColumn: 'telephone', dbField: 'phone' },
    { csvColumn: 'adresse', dbField: 'address' },
    { csvColumn: 'code_postal', dbField: 'postal_code' },
    { csvColumn: 'ville', dbField: 'city' },
    { csvColumn: 'pays', dbField: 'country' },
    { csvColumn: 'tva', dbField: 'vat_number' },
    { csvColumn: 'notes', dbField: 'notes' },
  ],
  products: [
    { csvColumn: 'reference', dbField: 'reference', required: true },
    { csvColumn: 'nom', dbField: 'name', required: true },
    { csvColumn: 'description', dbField: 'description' },
    { csvColumn: 'prix', dbField: 'unit_price', transform: parseFloat },
    { csvColumn: 'unite', dbField: 'unit' },
    { csvColumn: 'categorie', dbField: 'category' },
    { csvColumn: 'tva', dbField: 'tax_rate', transform: parseFloat },
  ],
  suppliers: [
    { csvColumn: 'nom', dbField: 'name', required: true },
    { csvColumn: 'categorie', dbField: 'category' },
    { csvColumn: 'email', dbField: 'contact_email' },
    { csvColumn: 'telephone', dbField: 'contact_phone' },
    { csvColumn: 'site_web', dbField: 'website' },
    { csvColumn: 'adresse', dbField: 'address' },
    { csvColumn: 'ville', dbField: 'city' },
    { csvColumn: 'code_postal', dbField: 'postal_code' },
    { csvColumn: 'tva', dbField: 'vat_number' },
  ],
  quote_items: [
    { csvColumn: 'description', dbField: 'description', required: true },
    { csvColumn: 'quantite', dbField: 'quantity', transform: parseFloat, required: true },
    { csvColumn: 'unite', dbField: 'unit' },
    { csvColumn: 'prix_unitaire', dbField: 'unit_price', transform: parseFloat, required: true },
  ],
};

/**
 * Parse un fichier CSV
 */
export function parseCSV(
  content: string,
  options: {
    delimiter?: string;
    encoding?: string;
    skipEmptyLines?: boolean;
  } = {}
): Record<string, string>[] {
  const { delimiter = ';', skipEmptyLines = true } = options;

  try {
    const records = parse(content, {
      columns: true,
      skip_empty_lines: skipEmptyLines,
      delimiter,
      trim: true,
      relaxQuotes: true,
      relaxColumnCount: true,
    }) as Record<string, string>[];

    return records;
  } catch (error: any) {
    throw new Error(`Failed to parse CSV: ${error.message}`);
  }
}

/**
 * Détecte automatiquement les colonnes du CSV
 */
export function detectColumns(records: Record<string, string>[]): string[] {
  if (!records.length) return [];
  return Object.keys(records[0]);
}

/**
 * Suggère un mapping automatique
 */
export function suggestMapping(
  csvColumns: string[],
  importType: ImportType
): ColumnMapping[] {
  const defaultMapping = DEFAULT_MAPPINGS[importType];
  const suggestions: ColumnMapping[] = [];

  for (const mapping of defaultMapping) {
    // Chercher une correspondance exacte ou similaire
    const csvColumn = csvColumns.find(col => {
      const normalizedCol = normalizeColumnName(col);
      const normalizedDb = normalizeColumnName(mapping.csvColumn);
      return normalizedCol === normalizedDb ||
             normalizedCol.includes(normalizedDb) ||
             normalizedDb.includes(normalizedCol);
    });

    suggestions.push({
      ...mapping,
      csvColumn: csvColumn || '',
    });
  }

  return suggestions;
}

/**
 * Normalise un nom de colonne pour la comparaison
 */
function normalizeColumnName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Importe les données dans la base
 */
export async function importData(
  userId: string,
  importType: ImportType,
  records: Record<string, string>[],
  mapping: ColumnMapping[],
  options: {
    updateExisting?: boolean;
    generateEmbeddings?: boolean;
  } = {}
): Promise<ImportResult> {
  const supabase = await createClient();
  const { updateExisting = false, generateEmbeddings = true } = options;

  // Créer le job d'import
  const { data: job, error: jobError } = await supabase
    .from('import_jobs')
    .insert({
      user_id: userId,
      file_name: `import_${importType}_${Date.now()}`,
      file_size: 0,
      import_type: importType,
      status: 'processing',
      total_rows: records.length,
      mapping_config: mapping,
    })
    .select()
    .single();

  if (jobError) {
    throw new Error(`Failed to create import job: ${jobError.message}`);
  }

  const errors: ImportError[] = [];
  let successCount = 0;
  const embeddings: any[] = [];

  // Traiter chaque ligne
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    const rowNumber = i + 2; // +2 for header and 0-index

    try {
      // Transformer les données selon le mapping
      const transformedData: Record<string, any> = {
        user_id: userId,
      };

      let hasRequiredFields = true;

      for (const col of mapping) {
        if (!col.csvColumn) continue;

        const rawValue = record[col.csvColumn];
        let value = rawValue?.trim() || null;

        // Vérifier les champs requis
        if (col.required && !value) {
          errors.push({
            row: rowNumber,
            field: col.dbField,
            message: `Champ requis "${col.dbField}" manquant`,
          });
          hasRequiredFields = false;
          continue;
        }

        // Appliquer la transformation
        if (value && col.transform) {
          try {
            value = col.transform(value);
          } catch {
            errors.push({
              row: rowNumber,
              field: col.dbField,
              value: rawValue,
              message: `Erreur de conversion pour "${col.dbField}"`,
            });
            continue;
          }
        }

        transformedData[col.dbField] = value;
      }

      if (!hasRequiredFields) continue;

      // Insérer ou mettre à jour selon le type
      const tableName = getTableName(importType);

      if (updateExisting && transformedData.email) {
        // Upsert basé sur l'email
        const { error } = await supabase
          .from(tableName)
          .upsert(transformedData, { onConflict: 'user_id,email' });

        if (error) throw error;
      } else {
        const { data: inserted, error } = await supabase
          .from(tableName)
          .insert(transformedData)
          .select('id')
          .single();

        if (error) throw error;

        // Préparer l'embedding si activé
        if (generateEmbeddings && inserted) {
          const textContent = Object.values(transformedData)
            .filter(v => typeof v === 'string')
            .join(' ');

          embeddings.push({
            user_id: userId,
            content_type: importType,
            content_id: inserted.id,
            content_text: textContent,
            metadata: { source: 'csv_import', job_id: job.id },
          });
        }
      }

      successCount++;
    } catch (error: any) {
      errors.push({
        row: rowNumber,
        message: error.message || 'Erreur inconnue',
      });
    }

    // Mettre à jour la progression tous les 100 enregistrements
    if ((i + 1) % 100 === 0) {
      await supabase
        .from('import_jobs')
        .update({
          processed_rows: i + 1,
          success_rows: successCount,
          error_rows: errors.length,
        })
        .eq('id', job.id);
    }
  }

  // Insérer les embeddings en batch
  if (embeddings.length > 0) {
    await supabase.from('embeddings').insert(embeddings);
  }

  // Finaliser le job
  await supabase
    .from('import_jobs')
    .update({
      status: errors.length === records.length ? 'failed' : 'completed',
      processed_rows: records.length,
      success_rows: successCount,
      error_rows: errors.length,
      error_details: errors.slice(0, 100), // Limiter à 100 erreurs
      completed_at: new Date().toISOString(),
    })
    .eq('id', job.id);

  // Log dans l'audit
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'data_imported',
    resource_type: 'import_job',
    resource_id: job.id,
    details: {
      import_type: importType,
      total_rows: records.length,
      success_rows: successCount,
      error_rows: errors.length,
    },
  });

  return {
    jobId: job.id,
    totalRows: records.length,
    processedRows: records.length,
    successRows: successCount,
    errorRows: errors.length,
    errors,
  };
}

/**
 * Retourne le nom de la table pour un type d'import
 */
function getTableName(importType: ImportType): string {
  const tables: Record<ImportType, string> = {
    clients: 'clients',
    products: 'products',
    suppliers: 'user_suppliers',
    quote_items: 'quote_item_templates',
  };
  return tables[importType];
}

/**
 * Génère un template CSV pour un type d'import
 */
export function generateCSVTemplate(importType: ImportType): string {
  const mapping = DEFAULT_MAPPINGS[importType];
  const headers = mapping.map(m => m.csvColumn).join(';');

  // Ajouter une ligne d'exemple
  const exampleRow = mapping.map(m => {
    switch (m.dbField) {
      case 'name': return 'Exemple SPRL';
      case 'email': return 'contact@exemple.be';
      case 'phone': return '+32 2 123 45 67';
      case 'address': return 'Rue de l\'Exemple 123';
      case 'postal_code': return '1000';
      case 'city': return 'Bruxelles';
      case 'country': return 'Belgique';
      case 'vat_number': return 'BE0123.456.789';
      case 'unit_price': return '100.00';
      case 'quantity': return '1';
      case 'unit': return 'unité';
      case 'reference': return 'REF-001';
      case 'description': return 'Description du produit';
      case 'category': return 'Catégorie';
      case 'tax_rate': return '21';
      default: return '';
    }
  }).join(';');

  return `${headers}\n${exampleRow}`;
}

/**
 * Valide un fichier CSV avant import
 */
export function validateCSV(
  records: Record<string, string>[],
  mapping: ColumnMapping[]
): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  if (records.length === 0) {
    return { valid: false, warnings: ['Le fichier est vide'] };
  }

  if (records.length > 10000) {
    warnings.push('Le fichier contient plus de 10 000 lignes. L\'import peut prendre du temps.');
  }

  // Vérifier les colonnes requises
  const requiredMappings = mapping.filter(m => m.required);
  const missingRequired = requiredMappings.filter(m => !m.csvColumn);

  if (missingRequired.length > 0) {
    return {
      valid: false,
      warnings: missingRequired.map(m =>
        `Colonne requise non mappée: ${m.dbField}`
      ),
    };
  }

  // Vérifier les valeurs vides dans les colonnes requises
  let emptyRequiredCount = 0;
  for (const record of records) {
    for (const req of requiredMappings) {
      if (!record[req.csvColumn]?.trim()) {
        emptyRequiredCount++;
      }
    }
  }

  if (emptyRequiredCount > 0) {
    warnings.push(`${emptyRequiredCount} valeurs requises sont vides`);
  }

  return { valid: true, warnings };
}
