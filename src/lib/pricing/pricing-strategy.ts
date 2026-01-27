/**
 * Pricing Strategy - Stratégie tarifaire DEAL
 * Plans, packs additionnels, TokenDEAL
 */

/**
 * Plans d'abonnement
 */
export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  features: PlanFeature[];
  limits: PlanLimits;
  pricing: PlanPricing;
  badge?: string;
  popular?: boolean;
  enterprise?: boolean;
}

export interface PlanFeature {
  name: string;
  included: boolean;
  limit?: number | 'unlimited';
  description?: string;
}

export interface PlanLimits {
  quotes_per_month: number | 'unlimited';
  ai_transcriptions_per_month: number | 'unlimited';
  storage_gb: number;
  team_members: number | 'unlimited';
  workflows: number | 'unlimited';
  integrations: number | 'unlimited';
  api_calls_per_day: number | 'unlimited';
  templates: number | 'unlimited';
}

export interface PlanPricing {
  monthly: number;
  yearly: number;
  yearly_discount_percent: number;
  setup_fee?: number;
  currency: string;
}

/**
 * Plans disponibles
 */
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'freemium',
    name: 'Freemium',
    slug: 'freemium',
    description: 'Pour démarrer gratuitement',
    badge: 'Gratuit',
    features: [
      { name: 'Création de devis', included: true, limit: 5 },
      { name: 'Transcription IA', included: true, limit: 10 },
      { name: 'Templates de base', included: true, limit: 3 },
      { name: 'Export PDF', included: true },
      { name: 'Support email', included: true },
      { name: 'Workflows automatisés', included: false },
      { name: 'Intégrations', included: false },
      { name: 'API', included: false },
      { name: 'Facturation', included: false },
      { name: 'Multi-utilisateurs', included: false },
    ],
    limits: {
      quotes_per_month: 5,
      ai_transcriptions_per_month: 10,
      storage_gb: 1,
      team_members: 1,
      workflows: 0,
      integrations: 0,
      api_calls_per_day: 0,
      templates: 3,
    },
    pricing: {
      monthly: 0,
      yearly: 0,
      yearly_discount_percent: 0,
      currency: 'EUR',
    },
  },
  {
    id: 'starter',
    name: 'Starter',
    slug: 'starter',
    description: 'Pour les artisans indépendants',
    features: [
      { name: 'Création de devis', included: true, limit: 30 },
      { name: 'Transcription IA', included: true, limit: 50 },
      { name: 'Templates', included: true, limit: 10 },
      { name: 'Export PDF personnalisé', included: true },
      { name: 'Support prioritaire', included: true },
      { name: 'Facturation basique', included: true },
      { name: '1 Workflow', included: true, limit: 1 },
      { name: 'Intégrations', included: false },
      { name: 'API', included: false },
      { name: 'Multi-utilisateurs', included: false },
    ],
    limits: {
      quotes_per_month: 30,
      ai_transcriptions_per_month: 50,
      storage_gb: 5,
      team_members: 1,
      workflows: 1,
      integrations: 0,
      api_calls_per_day: 0,
      templates: 10,
    },
    pricing: {
      monthly: 19,
      yearly: 190,
      yearly_discount_percent: 17,
      currency: 'EUR',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    slug: 'pro',
    description: 'Pour les PME en croissance',
    badge: 'Populaire',
    popular: true,
    features: [
      { name: 'Création de devis', included: true, limit: 'unlimited' },
      { name: 'Transcription IA', included: true, limit: 200 },
      { name: 'Templates illimités', included: true, limit: 'unlimited' },
      { name: 'Export PDF + filigrane', included: true },
      { name: 'Facturation Peppol', included: true },
      { name: 'Workflows illimités', included: true, limit: 'unlimited' },
      { name: '5 Intégrations', included: true, limit: 5 },
      { name: 'API (5000/jour)', included: true, limit: 5000 },
      { name: '5 Utilisateurs', included: true, limit: 5 },
      { name: 'Support téléphonique', included: true },
    ],
    limits: {
      quotes_per_month: 'unlimited',
      ai_transcriptions_per_month: 200,
      storage_gb: 25,
      team_members: 5,
      workflows: 'unlimited',
      integrations: 5,
      api_calls_per_day: 5000,
      templates: 'unlimited',
    },
    pricing: {
      monthly: 49,
      yearly: 470,
      yearly_discount_percent: 20,
      currency: 'EUR',
    },
  },
  {
    id: 'business',
    name: 'Business',
    slug: 'business',
    description: 'Pour les entreprises établies',
    features: [
      { name: 'Tout illimité', included: true, limit: 'unlimited' },
      { name: 'Transcription IA illimitée', included: true, limit: 'unlimited' },
      { name: 'Base fournisseurs', included: true },
      { name: 'CRM/ERP intégration', included: true },
      { name: 'Workflows MCP', included: true },
      { name: 'White-label PDF', included: true },
      { name: 'Utilisateurs illimités', included: true, limit: 'unlimited' },
      { name: 'API illimitée', included: true, limit: 'unlimited' },
      { name: 'Support dédié', included: true },
      { name: 'Formation incluse', included: true },
    ],
    limits: {
      quotes_per_month: 'unlimited',
      ai_transcriptions_per_month: 'unlimited',
      storage_gb: 100,
      team_members: 'unlimited',
      workflows: 'unlimited',
      integrations: 'unlimited',
      api_calls_per_day: 'unlimited',
      templates: 'unlimited',
    },
    pricing: {
      monthly: 149,
      yearly: 1430,
      yearly_discount_percent: 20,
      currency: 'EUR',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    slug: 'enterprise',
    description: 'Solutions sur mesure',
    enterprise: true,
    features: [
      { name: 'Tout Business +', included: true },
      { name: 'Déploiement dédié', included: true },
      { name: 'SLA garanti 99.9%', included: true },
      { name: 'Audit RGPD inclus', included: true },
      { name: 'SSO/SAML', included: true },
      { name: 'Account manager dédié', included: true },
      { name: 'Développements custom', included: true },
      { name: 'Formation sur site', included: true },
      { name: 'Support 24/7', included: true },
    ],
    limits: {
      quotes_per_month: 'unlimited',
      ai_transcriptions_per_month: 'unlimited',
      storage_gb: 'unlimited' as any,
      team_members: 'unlimited',
      workflows: 'unlimited',
      integrations: 'unlimited',
      api_calls_per_day: 'unlimited',
      templates: 'unlimited',
    },
    pricing: {
      monthly: 0, // Sur devis
      yearly: 0,
      yearly_discount_percent: 0,
      currency: 'EUR',
    },
  },
];

/**
 * Packs additionnels
 */
export interface AdditionalPack {
  id: string;
  name: string;
  description: string;
  type: 'quotes' | 'ai' | 'storage' | 'users' | 'unlimited';
  quantity: number | 'unlimited';
  price: number;
  currency: string;
  validity_days?: number;
  popular?: boolean;
}

export const ADDITIONAL_PACKS: AdditionalPack[] = [
  {
    id: 'pack-quotes-10',
    name: 'Pack Devis +10',
    description: '10 devis supplémentaires',
    type: 'quotes',
    quantity: 10,
    price: 4.99,
    currency: 'EUR',
    validity_days: 30,
  },
  {
    id: 'pack-quotes-50',
    name: 'Pack Devis +50',
    description: '50 devis supplémentaires',
    type: 'quotes',
    quantity: 50,
    price: 19.99,
    currency: 'EUR',
    validity_days: 30,
    popular: true,
  },
  {
    id: 'pack-ai-30',
    name: 'Pack IA +30',
    description: '30 transcriptions IA',
    type: 'ai',
    quantity: 30,
    price: 7.99,
    currency: 'EUR',
    validity_days: 30,
  },
  {
    id: 'pack-ai-100',
    name: 'Pack IA +100',
    description: '100 transcriptions IA',
    type: 'ai',
    quantity: 100,
    price: 19.99,
    currency: 'EUR',
    validity_days: 30,
    popular: true,
  },
  {
    id: 'pack-unlimited-month',
    name: 'Pack Illimité',
    description: 'Tout illimité pendant 30 jours',
    type: 'unlimited',
    quantity: 'unlimited',
    price: 29.99,
    currency: 'EUR',
    validity_days: 30,
  },
  {
    id: 'pack-storage-10',
    name: 'Pack Stockage +10 Go',
    description: '10 Go de stockage supplémentaire',
    type: 'storage',
    quantity: 10,
    price: 4.99,
    currency: 'EUR',
  },
  {
    id: 'pack-users-3',
    name: 'Pack Utilisateurs +3',
    description: '3 utilisateurs supplémentaires',
    type: 'users',
    quantity: 3,
    price: 14.99,
    currency: 'EUR',
  },
];

/**
 * Économie TokenDEAL
 */
export interface TokenReward {
  action: string;
  tokens: number;
  description: string;
  limit_per_month?: number;
}

export const TOKEN_REWARDS_LIST: TokenReward[] = [
  { action: 'referral_signup', tokens: 100, description: 'Parrainage - inscription' },
  { action: 'referral_convert', tokens: 500, description: 'Parrainage - conversion payante' },
  { action: 'referral_b2b', tokens: 1000, description: 'Parrainage B2B' },
  { action: 'review_google', tokens: 200, description: 'Avis Google', limit_per_month: 1 },
  { action: 'review_trustpilot', tokens: 200, description: 'Avis Trustpilot', limit_per_month: 1 },
  { action: 'review_verified', tokens: 150, description: 'Avis vérifié', limit_per_month: 1 },
  { action: 'social_share', tokens: 25, description: 'Partage sur réseaux sociaux', limit_per_month: 4 },
  { action: 'complete_profile', tokens: 50, description: 'Profil complet', limit_per_month: 1 },
  { action: 'first_quote', tokens: 100, description: 'Premier devis créé', limit_per_month: 1 },
  { action: 'first_invoice', tokens: 100, description: 'Première facture', limit_per_month: 1 },
  { action: 'quote_milestone_10', tokens: 200, description: '10 devis créés' },
  { action: 'template_created', tokens: 50, description: 'Template créé', limit_per_month: 5 },
  { action: 'template_sold', tokens: 100, description: 'Template vendu' },
  { action: 'daily_login', tokens: 5, description: 'Connexion quotidienne', limit_per_month: 30 },
  { action: 'streak_7_days', tokens: 50, description: '7 jours consécutifs' },
  { action: 'streak_30_days', tokens: 200, description: '30 jours consécutifs' },
];

// Objet mappé pour accès par clé
export const TOKEN_REWARDS: Record<string, number> = TOKEN_REWARDS_LIST.reduce(
  (acc, reward) => ({ ...acc, [reward.action]: reward.tokens }),
  {} as Record<string, number>
);

/**
 * Prix en TokenDEAL
 */
export interface TokenPrice {
  item: string;
  tokens: number;
  description: string;
}

export const TOKEN_PRICES_LIST: TokenPrice[] = [
  { item: 'quote_1', tokens: 20, description: '1 devis supplémentaire' },
  { item: 'ai_1', tokens: 15, description: '1 transcription IA' },
  { item: 'ai_credits_10', tokens: 120, description: '10 crédits IA' },
  { item: 'template_basic', tokens: 100, description: 'Template basique' },
  { item: 'template_premium', tokens: 300, description: 'Template premium' },
  { item: 'premium_template', tokens: 300, description: 'Modèle premium' },
  { item: 'visibility_boost', tokens: 150, description: 'Boost visibilité' },
  { item: 'feature_watermark', tokens: 50, description: 'Filigrane pour 1 mois' },
  { item: 'feature_signature', tokens: 100, description: 'Signature électronique pour 1 mois' },
];

// Objet mappé pour accès par clé
export const TOKEN_PRICES: Record<string, number> = TOKEN_PRICES_LIST.reduce(
  (acc, price) => ({ ...acc, [price.item]: price.tokens }),
  {} as Record<string, number>
);

/**
 * Offres de lancement
 */
export interface LaunchOffer {
  id: string;
  name: string;
  description: string;
  discount_percent: number;
  valid_until: string;
  max_uses?: number;
  code?: string;
  applicable_plans: string[];
}

export const LAUNCH_OFFERS: LaunchOffer[] = [
  {
    id: 'launch-belgium-500',
    name: 'Pionniers Belgique',
    description: 'Offre exclusive pour les 500 premiers artisans belges',
    discount_percent: 50,
    valid_until: '2024-06-30',
    max_uses: 500,
    code: 'PIONNIER50',
    applicable_plans: ['starter', 'pro', 'business'],
  },
  {
    id: 'yearly-bonus',
    name: 'Bonus Annuel',
    description: '2 mois offerts sur abonnement annuel',
    discount_percent: 17,
    valid_until: '2024-12-31',
    applicable_plans: ['starter', 'pro', 'business'],
  },
  {
    id: 'referral-30',
    name: 'Parrainage',
    description: '30% de réduction via parrainage',
    discount_percent: 30,
    valid_until: '2025-12-31',
    applicable_plans: ['starter', 'pro', 'business'],
  },
];

/**
 * Calcule le prix avec réductions
 */
export function calculatePrice(
  plan: SubscriptionPlan,
  billing: 'monthly' | 'yearly',
  offer?: LaunchOffer
): {
  originalPrice: number;
  finalPrice: number;
  discount: number;
  discountPercent: number;
} {
  const originalPrice = billing === 'yearly' ? plan.pricing.yearly : plan.pricing.monthly;
  let discountPercent = 0;

  if (offer && offer.applicable_plans.includes(plan.id)) {
    discountPercent = offer.discount_percent;
  } else if (billing === 'yearly') {
    discountPercent = plan.pricing.yearly_discount_percent;
  }

  const discount = originalPrice * (discountPercent / 100);
  const finalPrice = originalPrice - discount;

  return {
    originalPrice,
    finalPrice,
    discount,
    discountPercent,
  };
}

/**
 * Vérifie si une limite est atteinte
 */
export function checkLimit(
  plan: SubscriptionPlan,
  metric: keyof PlanLimits,
  currentUsage: number
): { exceeded: boolean; remaining: number | 'unlimited'; limit: number | 'unlimited' } {
  const limit = plan.limits[metric];

  if (limit === 'unlimited') {
    return { exceeded: false, remaining: 'unlimited', limit: 'unlimited' };
  }

  return {
    exceeded: currentUsage >= limit,
    remaining: Math.max(0, limit - currentUsage),
    limit,
  };
}

/**
 * Obtient le plan recommandé basé sur l'usage
 */
export function getRecommendedPlan(usage: {
  quotes_per_month: number;
  ai_transcriptions_per_month: number;
  team_members: number;
  needs_api: boolean;
  needs_integrations: boolean;
}): SubscriptionPlan {
  const plans = SUBSCRIPTION_PLANS.filter(p => !p.enterprise);

  for (const plan of plans.slice().reverse()) {
    const limits = plan.limits;

    const quotesOk = limits.quotes_per_month === 'unlimited' ||
                     usage.quotes_per_month <= limits.quotes_per_month;
    const aiOk = limits.ai_transcriptions_per_month === 'unlimited' ||
                 usage.ai_transcriptions_per_month <= limits.ai_transcriptions_per_month;
    const teamOk = limits.team_members === 'unlimited' ||
                   usage.team_members <= limits.team_members;
    const apiOk = !usage.needs_api ||
                  (limits.api_calls_per_day !== 0 && limits.api_calls_per_day !== 'unlimited') ||
                  limits.api_calls_per_day === 'unlimited';
    const integrationsOk = !usage.needs_integrations ||
                           limits.integrations !== 0;

    if (quotesOk && aiOk && teamOk && apiOk && integrationsOk) {
      return plan;
    }
  }

  return plans[plans.length - 1]; // Business par défaut
}
