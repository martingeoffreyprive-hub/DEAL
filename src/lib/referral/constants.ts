/**
 * Referral System Constants - Client-safe exports
 * Types et constantes utilisables côté client
 */

/**
 * Types de parrainage
 */
export type ReferralType = 'b2b_to_b2b' | 'b2b_to_b2c' | 'b2c_to_b2c' | 'external';

/**
 * Statuts de parrainage
 */
export type ReferralStatus = 'pending' | 'signed_up' | 'converted' | 'rewarded' | 'expired';

/**
 * Types de récompenses
 */
export type RewardType = 'month_free' | 'cash' | 'tokens' | 'discount';

/**
 * Configuration des récompenses par type
 */
export const REFERRAL_REWARDS: Record<ReferralType, {
  referrer: { type: RewardType; amount: number; description: string };
  referred: { type: RewardType; amount: number; description: string };
}> = {
  b2b_to_b2b: {
    referrer: { type: 'month_free', amount: 1, description: '1 mois d\'abonnement offert' },
    referred: { type: 'discount', amount: 30, description: '30 jours d\'essai gratuit' },
  },
  b2b_to_b2c: {
    referrer: { type: 'tokens', amount: 100, description: '100 TokenDEAL' },
    referred: { type: 'discount', amount: 10, description: '10% sur 1er paiement' },
  },
  b2c_to_b2c: {
    referrer: { type: 'tokens', amount: 50, description: '50 TokenDEAL' },
    referred: { type: 'tokens', amount: 25, description: '25 TokenDEAL de bienvenue' },
  },
  external: {
    referrer: { type: 'cash', amount: 30, description: '30€ en bon d\'achat' },
    referred: { type: 'discount', amount: 30, description: '30 jours gratuits' },
  },
};

/**
 * Niveaux d'ambassadeur
 */
export const AMBASSADOR_LEVELS = {
  bronze: { min_referrals: 0, commission: 0, perks: [] as string[] },
  silver: { min_referrals: 5, commission: 5, perks: ['Badge Ambassadeur', 'Support prioritaire'] },
  gold: { min_referrals: 15, commission: 10, perks: ['Commission 10%', 'Accès anticipé', 'Groupe privé'] },
  platinum: { min_referrals: 50, commission: 15, perks: ['Commission 15%', 'Formation offerte', 'Rencontre équipe'] },
};

export type AmbassadorLevel = keyof typeof AMBASSADOR_LEVELS;

/**
 * Ambassadeur
 */
export interface Ambassador {
  user_id: string;
  level: AmbassadorLevel;
  specialty?: string; // Corps de métier
  total_referrals: number;
  successful_referrals: number;
  total_earnings: number;
  commission_rate: number; // % sur abonnements récurrents
  badge_earned_at?: string;
}

/**
 * Génère le lien de parrainage personnalisé
 */
export function generateReferralLink(code: string, baseUrl: string = 'https://deal.be'): string {
  return `${baseUrl}/join/${code}`;
}

/**
 * Génère le QR code pour carte de visite
 */
export function generateReferralQRData(code: string, baseUrl: string = 'https://deal.be'): string {
  return generateReferralLink(code, baseUrl);
}
