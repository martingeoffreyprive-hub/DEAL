/**
 * Referral System - Programme de parrainage multi-niveaux
 * B2B, B2C, Non-membres
 * NOTE: Ce fichier est réservé au code serveur uniquement
 */

import { createClient } from '@/lib/supabase/server';
import type { ReferralType, ReferralStatus, RewardType, Ambassador, AmbassadorLevel } from './constants';
import { REFERRAL_REWARDS, AMBASSADOR_LEVELS, generateReferralLink, generateReferralQRData } from './constants';

// Re-export types and constants from client-safe module
export type { ReferralType, ReferralStatus, RewardType, Ambassador, AmbassadorLevel };
export { REFERRAL_REWARDS, AMBASSADOR_LEVELS, generateReferralLink, generateReferralQRData };

/**
 * Génère un code de parrainage unique
 */
export async function generateReferralCode(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data } = await supabase.rpc('generate_referral_code', { p_user_id: userId });

  return data || `deal-${userId.slice(0, 8)}`;
}

/**
 * Crée une invitation de parrainage
 */
export async function createReferralInvitation(
  referrerId: string,
  referredEmail: string,
  type: ReferralType = 'b2b_to_b2b'
): Promise<{ success: boolean; code: string; error?: string }> {
  const supabase = await createClient();

  // Vérifier si l'email n'est pas déjà utilisé
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', referredEmail)
    .single();

  if (existingUser) {
    return { success: false, code: '', error: 'Cet email est déjà inscrit' };
  }

  // Vérifier si un parrainage existe déjà
  const { data: existingReferral } = await supabase
    .from('referrals')
    .select('id')
    .eq('referrer_id', referrerId)
    .eq('referred_email', referredEmail)
    .single();

  if (existingReferral) {
    return { success: false, code: '', error: 'Une invitation a déjà été envoyée à cet email' };
  }

  // Générer le code
  const code = await generateReferralCode(referrerId);

  // Créer le parrainage
  const { error } = await supabase.from('referrals').insert({
    referrer_id: referrerId,
    referred_email: referredEmail,
    referral_code: `${code}-${Date.now().toString(36)}`,
    status: 'pending',
    reward_type: REFERRAL_REWARDS[type].referrer.type,
    reward_amount: REFERRAL_REWARDS[type].referrer.amount,
  });

  if (error) {
    return { success: false, code: '', error: error.message };
  }

  return { success: true, code };
}

/**
 * Traite une inscription via parrainage
 */
export async function processReferralSignup(
  referralCode: string,
  newUserId: string
): Promise<{ success: boolean; rewards?: { referrer: any; referred: any } }> {
  const supabase = await createClient();

  // Trouver le parrainage
  const { data: referral, error: findError } = await supabase
    .from('referrals')
    .select('*')
    .eq('referral_code', referralCode)
    .eq('status', 'pending')
    .single();

  if (findError || !referral) {
    return { success: false };
  }

  // Mettre à jour le parrainage
  const { error: updateError } = await supabase
    .from('referrals')
    .update({
      referred_user_id: newUserId,
      status: 'signed_up',
    })
    .eq('id', referral.id);

  if (updateError) {
    return { success: false };
  }

  // Déterminer le type de parrainage
  const type: ReferralType = 'b2b_to_b2b'; // À déterminer selon le contexte

  // Appliquer les récompenses pour le filleul
  const referredReward = REFERRAL_REWARDS[type].referred;
  if (referredReward.type === 'tokens') {
    await supabase.rpc('add_tokens', {
      p_user_id: newUserId,
      p_amount: referredReward.amount,
      p_type: 'bonus',
      p_source: 'referral_signup',
      p_description: 'Bonus de bienvenue - Parrainage',
    });
  }

  // Log
  await supabase.from('audit_logs').insert({
    user_id: newUserId,
    action: 'referral_signup',
    resource_type: 'referral',
    resource_id: referral.id,
    details: { referrer_id: referral.referrer_id },
  });

  return {
    success: true,
    rewards: {
      referrer: REFERRAL_REWARDS[type].referrer,
      referred: referredReward,
    },
  };
}

/**
 * Traite une conversion (premier paiement)
 */
export async function processReferralConversion(
  referredUserId: string,
  subscriptionAmount: number
): Promise<void> {
  const supabase = await createClient();

  // Trouver le parrainage
  const { data: referral } = await supabase
    .from('referrals')
    .select('*')
    .eq('referred_user_id', referredUserId)
    .eq('status', 'signed_up')
    .single();

  if (!referral) return;

  // Mettre à jour le statut
  await supabase
    .from('referrals')
    .update({
      status: 'converted',
      converted_at: new Date().toISOString(),
    })
    .eq('id', referral.id);

  // Récompenser le parrain
  const rewardType = referral.reward_type as RewardType;
  const rewardAmount = referral.reward_amount;

  if (rewardType === 'month_free') {
    // Ajouter un mois gratuit
    // TODO: Implémenter via Stripe
  } else if (rewardType === 'tokens') {
    await supabase.rpc('add_tokens', {
      p_user_id: referral.referrer_id,
      p_amount: rewardAmount,
      p_type: 'earn',
      p_source: 'referral_convert',
      p_description: 'Parrainage converti',
    });
  } else if (rewardType === 'cash') {
    // Enregistrer pour paiement
    await supabase.from('payouts').insert({
      user_id: referral.referrer_id,
      amount: rewardAmount,
      currency: 'EUR',
      reason: 'referral_reward',
      reference_id: referral.id,
      status: 'pending',
    });
  }

  // Mettre à jour le statut
  await supabase
    .from('referrals')
    .update({
      status: 'rewarded',
      reward_paid_at: new Date().toISOString(),
    })
    .eq('id', referral.id);

  // Vérifier le niveau d'ambassadeur
  await checkAmbassadorLevel(referral.referrer_id);
}

/**
 * Vérifie et met à jour le niveau d'ambassadeur
 */
async function checkAmbassadorLevel(userId: string): Promise<void> {
  const supabase = await createClient();

  // Compter les parrainages réussis
  const { count } = await supabase
    .from('referrals')
    .select('*', { count: 'exact', head: true })
    .eq('referrer_id', userId)
    .in('status', ['converted', 'rewarded']);

  const successfulReferrals = count || 0;

  // Déterminer le niveau
  let level: Ambassador['level'] = 'bronze';
  if (successfulReferrals >= AMBASSADOR_LEVELS.platinum.min_referrals) {
    level = 'platinum';
  } else if (successfulReferrals >= AMBASSADOR_LEVELS.gold.min_referrals) {
    level = 'gold';
  } else if (successfulReferrals >= AMBASSADOR_LEVELS.silver.min_referrals) {
    level = 'silver';
  }

  // Mettre à jour le profil
  await supabase
    .from('profiles')
    .update({
      ambassador_level: level,
      ambassador_referrals: successfulReferrals,
    })
    .eq('id', userId);
}

/**
 * Récupère les statistiques de parrainage
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  pendingReferrals: number;
  convertedReferrals: number;
  totalEarnings: number;
  ambassadorLevel: Ambassador['level'];
  referralCode: string;
}> {
  const supabase = await createClient();

  const { data: referrals } = await supabase
    .from('referrals')
    .select('status, reward_amount')
    .eq('referrer_id', userId);

  const stats = {
    totalReferrals: referrals?.length || 0,
    pendingReferrals: referrals?.filter(r => r.status === 'pending').length || 0,
    convertedReferrals: referrals?.filter(r => ['converted', 'rewarded'].includes(r.status)).length || 0,
    totalEarnings: referrals
      ?.filter(r => r.status === 'rewarded')
      .reduce((sum, r) => sum + (r.reward_amount || 0), 0) || 0,
  };

  const { data: profile } = await supabase
    .from('profiles')
    .select('ambassador_level, referral_code')
    .eq('id', userId)
    .single();

  return {
    ...stats,
    ambassadorLevel: (profile?.ambassador_level as Ambassador['level']) || 'bronze',
    referralCode: profile?.referral_code || await generateReferralCode(userId),
  };
}
