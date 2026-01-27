/**
 * Supplier Constants - Constantes pour les fournisseurs
 * Ce fichier peut être importé par les composants client
 */

/**
 * Catégories de fournisseurs
 */
export const SUPPLIER_CATEGORIES = {
  electrical: 'Électricité',
  plumbing: 'Plomberie / Sanitaire',
  heating: 'Chauffage / Climatisation',
  building: 'Matériaux de construction',
  wood: 'Bois / Menuiserie',
  paint: 'Peinture / Décoration',
  tools: 'Outillage',
  safety: 'Sécurité / EPI',
  garden: 'Jardin / Extérieur',
  general: 'Généraliste',
} as const;

export type SupplierCategory = keyof typeof SUPPLIER_CATEGORIES;

/**
 * Catégories avec icônes (pour les listes)
 */
export const SUPPLIER_CATEGORIES_WITH_ICONS = [
  { id: 'electrical', label: 'Électricité', icon: '⚡' },
  { id: 'plumbing', label: 'Plomberie / Sanitaire', icon: '🔧' },
  { id: 'heating', label: 'Chauffage / Climatisation', icon: '🔥' },
  { id: 'building', label: 'Matériaux de construction', icon: '🧱' },
  { id: 'wood', label: 'Bois / Menuiserie', icon: '🪵' },
  { id: 'paint', label: 'Peinture / Décoration', icon: '🎨' },
  { id: 'tools', label: 'Outillage', icon: '🔨' },
  { id: 'safety', label: 'Sécurité / EPI', icon: '🦺' },
  { id: 'garden', label: 'Jardin / Extérieur', icon: '🌳' },
  { id: 'general', label: 'Généraliste', icon: '📦' },
] as const;

/**
 * Fournisseurs belges populaires (seed data)
 */
export const POPULAR_BELGIAN_SUPPLIERS = [
  { name: 'Rexel Belgium', category: 'electrical', website: 'https://www.rexel.be', city: 'Bruxelles' },
  { name: 'Sonepar Belgium', category: 'electrical', website: 'https://www.sonepar.be', city: 'Bruxelles' },
  { name: 'Van Marcke', category: 'plumbing', website: 'https://www.vanmarcke.be', city: 'Courtrai' },
  { name: 'Facq', category: 'plumbing', website: 'https://www.facq.be', city: 'Bruxelles' },
  { name: 'Deschacht', category: 'building', website: 'https://www.deschacht.eu', city: 'Roulers' },
  { name: 'BigMat', category: 'building', website: 'https://www.bigmat.be', city: 'Belgique' },
  { name: 'Brico', category: 'tools', website: 'https://www.brico.be', city: 'Belgique' },
  { name: 'Gamma', category: 'general', website: 'https://www.gamma.be', city: 'Belgique' },
  { name: 'Hubo', category: 'general', website: 'https://www.hubo.be', city: 'Belgique' },
  { name: 'Leroy Merlin', category: 'general', website: 'https://www.leroymerlin.be', city: 'Belgique' },
] as const;
