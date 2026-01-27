import type { LocaleCode } from '@/lib/locale-packs';

export type SectorType =
  | 'ELECTRICITE'
  | 'PLOMBERIE'
  | 'CHAUFFAGE'
  | 'CONSTRUCTION'
  | 'RENOVATION'
  | 'PEINTURE'
  | 'MENUISERIE'
  | 'TOITURE'
  | 'JARDINAGE'
  | 'NETTOYAGE'
  | 'DEMENAGEMENT'
  | 'INFORMATIQUE'
  | 'COMPTABILITE'
  | 'JURIDIQUE'
  | 'CONSEIL'
  | 'FORMATION'
  | 'EVENEMENTIEL'
  | 'RESTAURATION'
  | 'TRANSPORT'
  | 'DEPANNAGE'
  | 'SECURITE'
  | 'SANTE'
  | 'BEAUTE'
  | 'PHOTO_VIDEO'
  | 'DESIGN'
  | 'MARKETING'
  | 'AUTRE';

export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'finalized' | 'exported' | 'archived';

export interface Profile {
  id: string;
  company_name: string;
  siret: string | null; // TVA number for Belgium
  address: string | null;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  logo_url: string | null;
  legal_mentions: string | null;
  default_sector: SectorType;
  quote_prefix: string;
  next_quote_number: number;
  // Banking info for EPC QR code
  iban: string | null;
  bic: string | null;
  bank_name: string | null;
  // Onboarding
  onboarding_completed: boolean;
  onboarding_step: number;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  user_id: string;
  quote_number: string;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  client_address: string | null;
  client_city: string | null;
  client_postal_code: string | null;
  sector: SectorType;
  status: QuoteStatus;
  valid_until: string | null;
  title: string | null;
  notes: string | null;
  transcription: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  pdf_url: string | null;
  signature_url: string | null;
  locale: LocaleCode | null; // Locale used when creating the quote (fr-BE, fr-FR, fr-CH)
  created_at: string;
  updated_at: string;
  finalized_at: string | null;
}

export interface QuoteItem {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
  order_index: number;
  created_at: string;
}

export interface QuoteWithItems extends Quote {
  items: QuoteItem[];
}

// Material list
export interface Material {
  id: string;
  quote_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  created_at: string;
}

// Labor estimate
export interface LaborEstimate {
  id: string;
  quote_id: string;
  task: string;
  hours: number;
  hourly_rate: number;
  workers: number;
  created_at: string;
}

// Type pour les insertions
export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>;

export type QuoteInsert = Omit<Quote, 'id' | 'quote_number' | 'created_at' | 'updated_at' | 'finalized_at' | 'subtotal' | 'tax_amount' | 'total'> & {
  locale?: LocaleCode; // Optional on insert, defaults to current locale
};
export type QuoteUpdate = Partial<Omit<Quote, 'id' | 'user_id' | 'quote_number' | 'created_at' | 'updated_at'>>;

export type QuoteItemInsert = Omit<QuoteItem, 'id' | 'total' | 'created_at'>;
export type QuoteItemUpdate = Partial<Omit<QuoteItem, 'id' | 'quote_id' | 'total' | 'created_at'>>;

// Secteurs avec labels
export const SECTORS: Record<SectorType, string> = {
  ELECTRICITE: 'Électricité',
  PLOMBERIE: 'Plomberie / Sanitaire',
  CHAUFFAGE: 'Chauffage / Climatisation',
  CONSTRUCTION: 'Construction / Gros œuvre',
  RENOVATION: 'Rénovation générale',
  PEINTURE: 'Peinture / Décoration',
  MENUISERIE: 'Menuiserie / Ébénisterie',
  TOITURE: 'Toiture / Couverture',
  JARDINAGE: 'Jardinage / Paysagisme',
  NETTOYAGE: 'Nettoyage / Entretien',
  DEMENAGEMENT: 'Déménagement / Logistique',
  INFORMATIQUE: 'Informatique / IT',
  COMPTABILITE: 'Comptabilité / Finance',
  JURIDIQUE: 'Juridique / Avocat',
  CONSEIL: 'Conseil / Consulting',
  FORMATION: 'Formation / Coaching',
  EVENEMENTIEL: 'Événementiel / Traiteur',
  RESTAURATION: 'Restauration / Horeca',
  TRANSPORT: 'Transport / Livraison',
  DEPANNAGE: 'Dépannage / Urgence',
  SECURITE: 'Sécurité / Gardiennage',
  SANTE: 'Santé / Paramédical',
  BEAUTE: 'Beauté / Bien-être',
  PHOTO_VIDEO: 'Photo / Vidéo / Production',
  DESIGN: 'Design / Graphisme',
  MARKETING: 'Marketing / Communication',
  AUTRE: 'Autre secteur',
};

// Statuts avec labels
export const QUOTE_STATUSES: Record<QuoteStatus, string> = {
  draft: 'Brouillon',
  sent: 'Envoyé',
  accepted: 'Accepté',
  rejected: 'Refusé',
  finalized: 'Finalisé',
  exported: 'Exporté',
  archived: 'Archivé',
};

// Taux de TVA belges
export const TAX_RATES = [
  { value: 0, label: '0% (Exonéré)' },
  { value: 6, label: '6% (Taux réduit)' },
  { value: 12, label: '12% (Taux intermédiaire)' },
  { value: 21, label: '21% (Taux normal)' },
];

// Configuration par secteur
export interface SectorConfig {
  label: string;
  icon: string;
  defaultSections: string[];
  units: string[];
  materialCategories: string[];
  commonServices: string[];
  aiContext: string;
  documentTitle: string;
  taxRate: number;
}

export const SECTOR_CONFIGS: Record<SectorType, SectorConfig> = {
  ELECTRICITE: {
    label: 'Électricité',
    icon: 'Zap',
    defaultSections: ['Installation électrique', 'Mise en conformité', 'Dépannage'],
    units: ['unité', 'point', 'ml', 'forfait', 'heure'],
    materialCategories: ['Câbles', 'Prises/Interrupteurs', 'Tableau électrique', 'Éclairage', 'Domotique', 'Protection'],
    commonServices: ['Installation prise', 'Remplacement tableau', 'Mise à la terre', 'Éclairage LED', 'Certification RGIE'],
    aiContext: 'électricien professionnel, normes RGIE, installations électriques résidentielles et tertiaires',
    documentTitle: 'DEVIS ÉLECTRICITÉ',
    taxRate: 21,
  },
  PLOMBERIE: {
    label: 'Plomberie',
    icon: 'Droplets',
    defaultSections: ['Plomberie', 'Sanitaires', 'Évacuation'],
    units: ['unité', 'ml', 'forfait', 'heure', 'point'],
    materialCategories: ['Tuyauterie', 'Robinetterie', 'Sanitaires', 'Évacuation', 'Chauffe-eau', 'Accessoires'],
    commonServices: ['Installation robinet', 'Débouchage', 'Réparation fuite', 'Pose WC', 'Installation douche'],
    aiContext: 'plombier sanitaire, installations eau chaude/froide, évacuations, normes sanitaires',
    documentTitle: 'DEVIS PLOMBERIE',
    taxRate: 21,
  },
  CHAUFFAGE: {
    label: 'Chauffage',
    icon: 'Flame',
    defaultSections: ['Chauffage', 'Climatisation', 'Entretien'],
    units: ['unité', 'forfait', 'heure', 'm²'],
    materialCategories: ['Chaudières', 'Radiateurs', 'Climatiseurs', 'Pompes à chaleur', 'Thermostat', 'Conduits'],
    commonServices: ['Entretien chaudière', 'Installation radiateur', 'Pose climatisation', 'Remplacement chaudière', 'Désembouage'],
    aiContext: 'chauffagiste, installations HVAC, chaudières gaz/mazout, pompes à chaleur, climatisation',
    documentTitle: 'DEVIS CHAUFFAGE/CLIM',
    taxRate: 21,
  },
  CONSTRUCTION: {
    label: 'Construction',
    icon: 'Building2',
    defaultSections: ['Gros œuvre', 'Fondations', 'Maçonnerie', 'Charpente'],
    units: ['m²', 'm³', 'ml', 'forfait', 'jour', 'unité'],
    materialCategories: ['Béton', 'Briques/Blocs', 'Acier', 'Bois structure', 'Isolation', 'Étanchéité'],
    commonServices: ['Fondations', 'Murs porteurs', 'Dalle béton', 'Charpente', 'Terrassement'],
    aiContext: 'entrepreneur en construction, gros œuvre, maçonnerie, normes de construction, PEB',
    documentTitle: 'DEVIS CONSTRUCTION',
    taxRate: 21,
  },
  RENOVATION: {
    label: 'Rénovation',
    icon: 'Hammer',
    defaultSections: ['Démolition', 'Rénovation', 'Finitions'],
    units: ['m²', 'forfait', 'jour', 'heure', 'unité'],
    materialCategories: ['Matériaux de base', 'Isolation', 'Plâtre/Gyproc', 'Sols', 'Finitions'],
    commonServices: ['Démolition', 'Rénovation cuisine', 'Rénovation salle de bain', 'Isolation', 'Aménagement combles'],
    aiContext: 'rénovation générale, transformation, aménagement intérieur, coordination de chantier',
    documentTitle: 'DEVIS RÉNOVATION',
    taxRate: 6,
  },
  PEINTURE: {
    label: 'Peinture',
    icon: 'PaintBucket',
    defaultSections: ['Préparation', 'Peinture intérieure', 'Peinture extérieure'],
    units: ['m²', 'pièce', 'forfait', 'heure'],
    materialCategories: ['Peintures', 'Enduits', 'Papier peint', 'Vernis', 'Accessoires'],
    commonServices: ['Peinture murs', 'Peinture plafond', 'Pose papier peint', 'Laquage boiseries', 'Ravalement façade'],
    aiContext: 'peintre en bâtiment, décoration intérieure, finitions murales, techniques de peinture',
    documentTitle: 'DEVIS PEINTURE',
    taxRate: 21,
  },
  MENUISERIE: {
    label: 'Menuiserie',
    icon: 'Ruler',
    defaultSections: ['Menuiserie intérieure', 'Menuiserie extérieure', 'Sur mesure'],
    units: ['unité', 'm²', 'ml', 'forfait'],
    materialCategories: ['Bois massif', 'Panneaux', 'Quincaillerie', 'Vernis/Finitions', 'PVC/Alu'],
    commonServices: ['Pose portes', 'Pose châssis', 'Escalier sur mesure', 'Dressing', 'Terrasse bois'],
    aiContext: 'menuisier ébéniste, travail du bois, fabrication sur mesure, pose de châssis',
    documentTitle: 'DEVIS MENUISERIE',
    taxRate: 21,
  },
  TOITURE: {
    label: 'Toiture',
    icon: 'Home',
    defaultSections: ['Couverture', 'Charpente', 'Zinguerie', 'Isolation'],
    units: ['m²', 'ml', 'forfait', 'unité'],
    materialCategories: ['Tuiles', 'Ardoises', 'Zinc', 'Charpente', 'Isolation toiture', 'Évacuation eaux'],
    commonServices: ['Réfection toiture', 'Réparation fuite', 'Pose velux', 'Isolation toiture', 'Gouttières'],
    aiContext: 'couvreur zingueur, toitures plates et en pente, étanchéité, isolation par le toit',
    documentTitle: 'DEVIS TOITURE',
    taxRate: 6,
  },
  JARDINAGE: {
    label: 'Jardinage',
    icon: 'TreeDeciduous',
    defaultSections: ['Entretien jardin', 'Aménagement', 'Élagage'],
    units: ['m²', 'heure', 'forfait', 'unité', 'arbre'],
    materialCategories: ['Plantes', 'Terre/Substrat', 'Clôtures', 'Pavage', 'Arrosage', 'Éclairage extérieur'],
    commonServices: ['Tonte pelouse', 'Taille haies', 'Élagage', 'Création jardin', 'Pose clôture'],
    aiContext: 'jardinier paysagiste, entretien espaces verts, aménagement extérieur, élagage',
    documentTitle: 'DEVIS JARDINAGE',
    taxRate: 21,
  },
  NETTOYAGE: {
    label: 'Nettoyage',
    icon: 'Sparkles',
    defaultSections: ['Nettoyage régulier', 'Nettoyage spécial', 'Vitres'],
    units: ['m²', 'heure', 'forfait', 'passage'],
    materialCategories: ['Produits', 'Équipement', 'Consommables'],
    commonServices: ['Nettoyage bureaux', 'Nettoyage après chantier', 'Vitres', 'Dégraissage cuisine', 'Moquettes'],
    aiContext: 'entreprise de nettoyage, entretien ménager, nettoyage industriel et tertiaire',
    documentTitle: 'DEVIS NETTOYAGE',
    taxRate: 21,
  },
  DEMENAGEMENT: {
    label: 'Déménagement',
    icon: 'Truck',
    defaultSections: ['Déménagement', 'Emballage', 'Montage/Démontage'],
    units: ['m³', 'heure', 'forfait', 'camion', 'carton'],
    materialCategories: ['Cartons', 'Protection', 'Matériel de levage'],
    commonServices: ['Déménagement complet', 'Transport meuble', 'Emballage', 'Monte-meuble', 'Garde-meuble'],
    aiContext: 'déménageur professionnel, logistique, transport de biens, garde-meuble',
    documentTitle: 'DEVIS DÉMÉNAGEMENT',
    taxRate: 21,
  },
  INFORMATIQUE: {
    label: 'Informatique',
    icon: 'Monitor',
    defaultSections: ['Développement', 'Infrastructure', 'Support'],
    units: ['heure', 'jour', 'forfait', 'licence', 'utilisateur'],
    materialCategories: ['Matériel', 'Logiciels', 'Licences', 'Cloud', 'Sécurité'],
    commonServices: ['Développement web', 'Maintenance', 'Installation réseau', 'Cybersécurité', 'Support IT'],
    aiContext: 'prestataire informatique, développement, infrastructure IT, cybersécurité, cloud',
    documentTitle: 'DEVIS INFORMATIQUE',
    taxRate: 21,
  },
  COMPTABILITE: {
    label: 'Comptabilité',
    icon: 'Calculator',
    defaultSections: ['Comptabilité', 'Fiscalité', 'Conseil'],
    units: ['heure', 'forfait', 'dossier', 'mois', 'an'],
    materialCategories: ['Logiciels comptables', 'Abonnements'],
    commonServices: ['Tenue comptabilité', 'Déclarations TVA', 'Bilan annuel', 'Conseil fiscal', 'Création société'],
    aiContext: 'expert-comptable, fiscalité belge, déclarations, bilans, conseil aux entreprises',
    documentTitle: 'DEVIS COMPTABILITÉ',
    taxRate: 21,
  },
  JURIDIQUE: {
    label: 'Juridique',
    icon: 'Scale',
    defaultSections: ['Consultation', 'Rédaction', 'Procédure'],
    units: ['heure', 'forfait', 'dossier', 'acte'],
    materialCategories: ['Frais de dossier', 'Honoraires'],
    commonServices: ['Consultation juridique', 'Rédaction contrat', 'Contentieux', 'Médiation', 'Création statuts'],
    aiContext: 'avocat juriste, droit belge, contentieux, contrats, conseil juridique',
    documentTitle: 'DEVIS HONORAIRES',
    taxRate: 21,
  },
  CONSEIL: {
    label: 'Conseil',
    icon: 'Lightbulb',
    defaultSections: ['Diagnostic', 'Accompagnement', 'Formation'],
    units: ['heure', 'jour', 'forfait', 'mission'],
    materialCategories: ['Livrables', 'Outils'],
    commonServices: ['Audit', 'Stratégie', 'Accompagnement', 'Étude de marché', 'Business plan'],
    aiContext: 'consultant, stratégie d\'entreprise, accompagnement, transformation, optimisation',
    documentTitle: 'DEVIS CONSEIL',
    taxRate: 21,
  },
  FORMATION: {
    label: 'Formation',
    icon: 'GraduationCap',
    defaultSections: ['Formation', 'Coaching', 'Supports'],
    units: ['heure', 'jour', 'participant', 'session', 'forfait'],
    materialCategories: ['Supports pédagogiques', 'Matériel', 'Certification'],
    commonServices: ['Formation sur mesure', 'Coaching individuel', 'Team building', 'E-learning', 'Certification'],
    aiContext: 'formateur coach, pédagogie, développement des compétences, soft skills',
    documentTitle: 'DEVIS FORMATION',
    taxRate: 21,
  },
  EVENEMENTIEL: {
    label: 'Événementiel',
    icon: 'PartyPopper',
    defaultSections: ['Organisation', 'Traiteur', 'Logistique', 'Animation'],
    units: ['personne', 'forfait', 'heure', 'jour', 'unité'],
    materialCategories: ['Décoration', 'Sonorisation', 'Éclairage', 'Mobilier', 'Vaisselle', 'Alimentation'],
    commonServices: ['Organisation événement', 'Traiteur', 'Location matériel', 'Animation', 'Décoration'],
    aiContext: 'organisateur événementiel, traiteur, wedding planner, soirées corporate, festivals',
    documentTitle: 'DEVIS ÉVÉNEMENT',
    taxRate: 21,
  },
  RESTAURATION: {
    label: 'Restauration',
    icon: 'UtensilsCrossed',
    defaultSections: ['Menu', 'Boissons', 'Service'],
    units: ['personne', 'pièce', 'forfait', 'heure'],
    materialCategories: ['Alimentation', 'Boissons', 'Équipement', 'Personnel'],
    commonServices: ['Traiteur', 'Buffet', 'Menu servi', 'Cocktail', 'Petit-déjeuner'],
    aiContext: 'restaurateur traiteur, Horeca, cuisine professionnelle, banquets, service traiteur',
    documentTitle: 'DEVIS TRAITEUR',
    taxRate: 12,
  },
  TRANSPORT: {
    label: 'Transport',
    icon: 'Car',
    defaultSections: ['Transport', 'Manutention', 'Logistique'],
    units: ['km', 'heure', 'jour', 'trajet', 'colis', 'palette'],
    materialCategories: ['Carburant', 'Péages', 'Emballage'],
    commonServices: ['Livraison express', 'Transport marchandises', 'Navette', 'Coursier', 'Groupage'],
    aiContext: 'transporteur, logistique, livraison, messagerie, transport de marchandises',
    documentTitle: 'DEVIS TRANSPORT',
    taxRate: 21,
  },
  DEPANNAGE: {
    label: 'Dépannage',
    icon: 'Wrench',
    defaultSections: ['Intervention urgente', 'Réparation', 'Déplacement'],
    units: ['intervention', 'heure', 'forfait', 'km'],
    materialCategories: ['Pièces détachées', 'Consommables'],
    commonServices: ['Dépannage urgent', 'Ouverture de porte', 'Réparation fuite', 'Panne électrique', 'Débouchage'],
    aiContext: 'dépanneur urgentiste, intervention 24/7, multi-services, réparations urgentes',
    documentTitle: 'DEVIS INTERVENTION',
    taxRate: 21,
  },
  SECURITE: {
    label: 'Sécurité',
    icon: 'Shield',
    defaultSections: ['Gardiennage', 'Installation alarme', 'Vidéosurveillance'],
    units: ['heure', 'nuit', 'agent', 'forfait', 'mois'],
    materialCategories: ['Alarmes', 'Caméras', 'Contrôle d\'accès', 'Détecteurs'],
    commonServices: ['Gardiennage', 'Installation alarme', 'Vidéosurveillance', 'Contrôle accès', 'Ronde'],
    aiContext: 'société de sécurité, gardiennage, alarme intrusion, vidéoprotection, contrôle d\'accès',
    documentTitle: 'DEVIS SÉCURITÉ',
    taxRate: 21,
  },
  SANTE: {
    label: 'Santé',
    icon: 'Heart',
    defaultSections: ['Consultation', 'Soins', 'Suivi'],
    units: ['séance', 'consultation', 'forfait', 'heure'],
    materialCategories: ['Consommables médicaux', 'Équipement'],
    commonServices: ['Consultation', 'Soins à domicile', 'Kinésithérapie', 'Infirmier', 'Accompagnement'],
    aiContext: 'professionnel de santé, paramédical, soins à domicile, bien-être',
    documentTitle: 'DEVIS SOINS',
    taxRate: 0,
  },
  BEAUTE: {
    label: 'Beauté',
    icon: 'Scissors',
    defaultSections: ['Soins', 'Coiffure', 'Esthétique'],
    units: ['séance', 'prestation', 'forfait', 'heure'],
    materialCategories: ['Produits cosmétiques', 'Consommables', 'Équipement'],
    commonServices: ['Coiffure', 'Maquillage', 'Manucure', 'Massage', 'Épilation'],
    aiContext: 'esthéticienne, coiffeuse, institut de beauté, soins du corps, bien-être',
    documentTitle: 'DEVIS BEAUTÉ',
    taxRate: 21,
  },
  PHOTO_VIDEO: {
    label: 'Photo/Vidéo',
    icon: 'Camera',
    defaultSections: ['Captation', 'Post-production', 'Livraison'],
    units: ['heure', 'jour', 'forfait', 'photo', 'vidéo'],
    materialCategories: ['Équipement', 'Logiciels', 'Accessoires', 'Studio'],
    commonServices: ['Reportage photo', 'Vidéo corporate', 'Mariage', 'Packshot', 'Montage vidéo'],
    aiContext: 'photographe vidéaste, production audiovisuelle, post-production, studio',
    documentTitle: 'DEVIS PRODUCTION',
    taxRate: 21,
  },
  DESIGN: {
    label: 'Design',
    icon: 'Palette',
    defaultSections: ['Création graphique', 'Web design', 'Branding'],
    units: ['forfait', 'heure', 'jour', 'projet'],
    materialCategories: ['Licences', 'Logiciels', 'Impressions'],
    commonServices: ['Logo', 'Charte graphique', 'Site web', 'Flyer', 'Packaging'],
    aiContext: 'graphiste designer, création visuelle, identité de marque, UI/UX, print et digital',
    documentTitle: 'DEVIS CRÉATIF',
    taxRate: 21,
  },
  MARKETING: {
    label: 'Marketing',
    icon: 'Megaphone',
    defaultSections: ['Stratégie', 'Campagnes', 'Reporting'],
    units: ['forfait', 'heure', 'jour', 'campagne', 'mois'],
    materialCategories: ['Publicité', 'Outils', 'Abonnements'],
    commonServices: ['Community management', 'Campagne pub', 'SEO/SEA', 'Stratégie digitale', 'Création contenu'],
    aiContext: 'agence marketing, communication digitale, réseaux sociaux, publicité, growth',
    documentTitle: 'DEVIS MARKETING',
    taxRate: 21,
  },
  AUTRE: {
    label: 'Autre',
    icon: 'Briefcase',
    defaultSections: ['Prestations', 'Services', 'Fournitures'],
    units: ['unité', 'heure', 'jour', 'forfait', 'm²', 'km'],
    materialCategories: ['Fournitures', 'Matériel', 'Consommables'],
    commonServices: ['Service sur mesure', 'Prestation', 'Intervention', 'Conseil'],
    aiContext: 'prestataire de services, professionnel polyvalent',
    documentTitle: 'DEVIS',
    taxRate: 21,
  },
};

// Unités disponibles (toutes les unités possibles)
export const UNITS = [
  'unité',
  'heure',
  'jour',
  'forfait',
  'm²',
  'm³',
  'ml',
  'kg',
  'lot',
  'pièce',
  'semaine',
  'mois',
  'point',
  'arbre',
  'passage',
  'carton',
  'camion',
  'licence',
  'utilisateur',
  'dossier',
  'acte',
  'mission',
  'participant',
  'session',
  'personne',
  'km',
  'trajet',
  'colis',
  'palette',
  'intervention',
  'agent',
  'nuit',
  'séance',
  'consultation',
  'prestation',
  'photo',
  'vidéo',
  'projet',
  'campagne',
  'an',
];

// Helper function to get sector config
export function getSectorConfig(sector: SectorType): SectorConfig {
  return SECTOR_CONFIGS[sector] || SECTOR_CONFIGS.AUTRE;
}

// Helper function to get units for a sector
export function getSectorUnits(sector: SectorType): string[] {
  const config = getSectorConfig(sector);
  return config.units;
}

// Helper function to get material categories for a sector
export function getSectorMaterialCategories(sector: SectorType): string[] {
  const config = getSectorConfig(sector);
  return config.materialCategories;
}

// =============================================
// SYSTÈME D'ABONNEMENTS
// =============================================

export type SubscriptionPlan = 'free' | 'pro' | 'business' | 'corporate';
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';

export interface Plan {
  id: string;
  name: SubscriptionPlan;
  display_name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  max_sectors: number; // -1 = illimité
  max_quotes_per_month: number; // -1 = illimité
  ai_assistant_enabled: boolean;
  pdf_export_enabled: boolean;
  pdf_protection_enabled: boolean;
  priority_support: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_name: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserSector {
  id: string;
  user_id: string;
  sector: SectorType;
  is_primary: boolean;
  unlocked_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface UsageStats {
  id: string;
  user_id: string;
  month_year: string;
  quotes_created: number;
  ai_requests: number;
  pdf_exports: number;
  created_at: string;
  updated_at: string;
}

// Plan features helper
export const PLAN_FEATURES: Record<SubscriptionPlan, {
  displayName: string;
  maxSectors: number;
  maxQuotes: number;
  features: string[];
}> = {
  free: {
    displayName: 'Gratuit',
    maxSectors: 1,
    maxQuotes: 5,
    features: [
      '1 secteur',
      '5 devis/mois',
      'Export PDF basique',
    ],
  },
  pro: {
    displayName: 'Pro',
    maxSectors: 10,
    maxQuotes: 100,
    features: [
      '10 secteurs',
      '100 devis/mois',
      'Assistant IA',
      'Templates personnalisés',
    ],
  },
  business: {
    displayName: 'Business',
    maxSectors: -1,
    maxQuotes: -1,
    features: [
      'Secteurs illimités',
      'Devis illimités',
      'Support prioritaire',
      'API access',
    ],
  },
  corporate: {
    displayName: 'Corporate (All-In)',
    maxSectors: -1,
    maxQuotes: -1,
    features: [
      'Tout illimité',
      'White label',
      'Support dédié',
      'API access',
      'Développement sur mesure',
    ],
  },
};

// Material categories (legacy - kept for compatibility)
export const MATERIAL_CATEGORIES = [
  'Électricité',
  'Plomberie',
  'Maçonnerie',
  'Menuiserie',
  'Peinture',
  'Isolation',
  'Toiture',
  'Chauffage',
  'Sanitaire',
  'Carrelage',
  'Parquet',
  'Quincaillerie',
  'Outillage',
  'Autre',
];
