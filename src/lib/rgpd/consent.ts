/**
 * RGPD Consent Management
 * Gestion du consentement utilisateur conforme RGPD
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Types de consentement RGPD
 */
export const CONSENT_TYPES = {
  // Consentements obligatoires (base légale: contrat)
  TERMS_OF_SERVICE: 'terms_of_service',
  PRIVACY_POLICY: 'privacy_policy',
  DATA_PROCESSING: 'data_processing',

  // Consentements optionnels (base légale: consentement)
  MARKETING_EMAIL: 'marketing_email',
  MARKETING_SMS: 'marketing_sms',
  MARKETING_PHONE: 'marketing_phone',
  ANALYTICS: 'analytics',
  PERSONALIZATION: 'personalization',
  THIRD_PARTY_SHARING: 'third_party_sharing',
  NEWSLETTER: 'newsletter',
  PRODUCT_UPDATES: 'product_updates',

  // Consentements spécifiques
  AI_PROCESSING: 'ai_processing',
  VOICE_RECORDING: 'voice_recording',
  LOCATION_DATA: 'location_data',
  COOKIE_ANALYTICS: 'cookie_analytics',
  COOKIE_MARKETING: 'cookie_marketing',
} as const;

export type ConsentType = typeof CONSENT_TYPES[keyof typeof CONSENT_TYPES];

/**
 * Statut du consentement
 */
export interface ConsentRecord {
  type: ConsentType;
  granted: boolean;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  version: string;
  source: 'onboarding' | 'settings' | 'banner' | 'api';
}

/**
 * Enregistre un consentement
 */
export async function recordConsent(
  userId: string,
  consent: Omit<ConsentRecord, 'timestamp'>
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from('user_consents').upsert({
    user_id: userId,
    consent_type: consent.type,
    granted: consent.granted,
    granted_at: consent.granted ? new Date().toISOString() : null,
    revoked_at: !consent.granted ? new Date().toISOString() : null,
    ip_address: consent.ip_address,
    user_agent: consent.user_agent,
    consent_version: consent.version,
    source: consent.source,
    updated_at: new Date().toISOString(),
  }, {
    onConflict: 'user_id,consent_type',
  });

  if (error) {
    console.error('Failed to record consent:', error);
    throw new Error('Failed to record consent');
  }

  // Log dans l'audit trail
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: consent.granted ? 'consent_granted' : 'consent_revoked',
    resource_type: 'consent',
    resource_id: consent.type,
    details: {
      consent_type: consent.type,
      version: consent.version,
      source: consent.source,
    },
    ip_address: consent.ip_address,
    user_agent: consent.user_agent,
  });
}

/**
 * Récupère tous les consentements d'un utilisateur
 */
export async function getUserConsents(userId: string): Promise<Record<ConsentType, boolean>> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_consents')
    .select('consent_type, granted')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to get consents:', error);
    return {} as Record<ConsentType, boolean>;
  }

  const consents: Record<string, boolean> = {};
  for (const record of data || []) {
    consents[record.consent_type] = record.granted;
  }

  return consents as Record<ConsentType, boolean>;
}

/**
 * Vérifie si un consentement spécifique est accordé
 */
export async function hasConsent(userId: string, type: ConsentType): Promise<boolean> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_consents')
    .select('granted')
    .eq('user_id', userId)
    .eq('consent_type', type)
    .single();

  if (error || !data) {
    return false;
  }

  return data.granted;
}

/**
 * Révoque tous les consentements (droit à l'oubli)
 */
export async function revokeAllConsents(userId: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('user_consents')
    .update({
      granted: false,
      revoked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to revoke consents:', error);
    throw new Error('Failed to revoke consents');
  }
}

/**
 * Exporte les consentements pour le droit d'accès
 */
export async function exportConsents(userId: string): Promise<ConsentRecord[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('user_consents')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Failed to export consents:', error);
    return [];
  }

  return data.map(record => ({
    type: record.consent_type as ConsentType,
    granted: record.granted,
    timestamp: record.updated_at,
    ip_address: record.ip_address,
    user_agent: record.user_agent,
    version: record.consent_version,
    source: record.source,
  }));
}

/**
 * Consentements requis pour l'utilisation du service
 */
export const REQUIRED_CONSENTS: ConsentType[] = [
  CONSENT_TYPES.TERMS_OF_SERVICE,
  CONSENT_TYPES.PRIVACY_POLICY,
  CONSENT_TYPES.DATA_PROCESSING,
];

/**
 * Vérifie si l'utilisateur a donné tous les consentements requis
 */
export async function hasRequiredConsents(userId: string): Promise<boolean> {
  const consents = await getUserConsents(userId);
  return REQUIRED_CONSENTS.every(type => consents[type] === true);
}

/**
 * Versions actuelles des documents de consentement
 */
export const CONSENT_VERSIONS = {
  [CONSENT_TYPES.TERMS_OF_SERVICE]: '2.0.0',
  [CONSENT_TYPES.PRIVACY_POLICY]: '2.0.0',
  [CONSENT_TYPES.DATA_PROCESSING]: '2.0.0',
  [CONSENT_TYPES.MARKETING_EMAIL]: '1.0.0',
  [CONSENT_TYPES.MARKETING_SMS]: '1.0.0',
  [CONSENT_TYPES.AI_PROCESSING]: '1.0.0',
  [CONSENT_TYPES.VOICE_RECORDING]: '1.0.0',
} as const;
