/**
 * Human-in-the-Loop (HITL) Module
 * Contrôle humain pour conformité RGPD et actions sensibles
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Actions nécessitant un contrôle humain
 */
export const HITL_ACTIONS = {
  // Actions RGPD critiques
  DATA_EXPORT: 'data_export',
  DATA_DELETE: 'data_delete',
  CONSENT_BULK_UPDATE: 'consent_bulk_update',

  // Actions financières
  INVOICE_SEND: 'invoice_send',
  PAYMENT_PROCESS: 'payment_process',
  REFUND_PROCESS: 'refund_process',
  SUBSCRIPTION_CANCEL: 'subscription_cancel',

  // Actions IA automatisées
  AI_QUOTE_GENERATION: 'ai_quote_generation',
  AI_AUTO_RESPONSE: 'ai_auto_response',
  AI_DATA_CLASSIFICATION: 'ai_data_classification',

  // Actions de workflow
  WORKFLOW_QUOTE_AUTO: 'workflow_quote_auto',
  WORKFLOW_EMAIL_AUTO: 'workflow_email_auto',
  WORKFLOW_INTEGRATION: 'workflow_integration',

  // Actions utilisateur sensibles
  ACCOUNT_DELETE: 'account_delete',
  ROLE_CHANGE: 'role_change',
  API_KEY_CREATE: 'api_key_create',
  WEBHOOK_CREATE: 'webhook_create',

  // Actions de partage
  QUOTE_SHARE_EXTERNAL: 'quote_share_external',
  DATA_SHARE_THIRD_PARTY: 'data_share_third_party',

  // Actions administratives
  BULK_EMAIL: 'bulk_email',
  USER_IMPERSONATION: 'user_impersonation',
  SYSTEM_CONFIG_CHANGE: 'system_config_change',
} as const;

export type HITLAction = typeof HITL_ACTIONS[keyof typeof HITL_ACTIONS];

/**
 * Niveau de contrôle requis
 */
export type ControlLevel =
  | 'none'           // Pas de contrôle requis
  | 'notification'   // Notification simple
  | 'confirmation'   // Confirmation requise
  | 'approval'       // Approbation par un tiers
  | 'dual_approval'; // Double approbation

/**
 * Configuration du contrôle humain par action
 */
export const HITL_CONFIG: Record<HITLAction, {
  level: ControlLevel;
  timeout_hours: number;
  description: string;
  rgpd_relevant: boolean;
  can_override: boolean;
}> = {
  // RGPD - Toujours confirmation ou approbation
  [HITL_ACTIONS.DATA_EXPORT]: {
    level: 'confirmation',
    timeout_hours: 24,
    description: 'Export de données personnelles',
    rgpd_relevant: true,
    can_override: false,
  },
  [HITL_ACTIONS.DATA_DELETE]: {
    level: 'dual_approval',
    timeout_hours: 72,
    description: 'Suppression définitive de données',
    rgpd_relevant: true,
    can_override: false,
  },
  [HITL_ACTIONS.CONSENT_BULK_UPDATE]: {
    level: 'approval',
    timeout_hours: 48,
    description: 'Modification en masse des consentements',
    rgpd_relevant: true,
    can_override: false,
  },

  // Financier - Selon montant et contexte
  [HITL_ACTIONS.INVOICE_SEND]: {
    level: 'confirmation',
    timeout_hours: 1,
    description: 'Envoi de facture au client',
    rgpd_relevant: false,
    can_override: true,
  },
  [HITL_ACTIONS.PAYMENT_PROCESS]: {
    level: 'confirmation',
    timeout_hours: 0.5,
    description: 'Traitement de paiement',
    rgpd_relevant: false,
    can_override: true,
  },
  [HITL_ACTIONS.REFUND_PROCESS]: {
    level: 'approval',
    timeout_hours: 24,
    description: 'Remboursement client',
    rgpd_relevant: false,
    can_override: false,
  },
  [HITL_ACTIONS.SUBSCRIPTION_CANCEL]: {
    level: 'confirmation',
    timeout_hours: 1,
    description: 'Annulation d\'abonnement',
    rgpd_relevant: false,
    can_override: true,
  },

  // IA - Configurable par l'utilisateur
  [HITL_ACTIONS.AI_QUOTE_GENERATION]: {
    level: 'confirmation', // Peut être changé en 'none' par l'utilisateur
    timeout_hours: 24,
    description: 'Génération automatique de devis par IA',
    rgpd_relevant: true,
    can_override: true,
  },
  [HITL_ACTIONS.AI_AUTO_RESPONSE]: {
    level: 'confirmation',
    timeout_hours: 1,
    description: 'Réponse automatique générée par IA',
    rgpd_relevant: false,
    can_override: true,
  },
  [HITL_ACTIONS.AI_DATA_CLASSIFICATION]: {
    level: 'notification',
    timeout_hours: 0,
    description: 'Classification automatique des données',
    rgpd_relevant: true,
    can_override: true,
  },

  // Workflow - Configurable
  [HITL_ACTIONS.WORKFLOW_QUOTE_AUTO]: {
    level: 'confirmation',
    timeout_hours: 24,
    description: 'Devis généré automatiquement par workflow',
    rgpd_relevant: false,
    can_override: true,
  },
  [HITL_ACTIONS.WORKFLOW_EMAIL_AUTO]: {
    level: 'confirmation',
    timeout_hours: 1,
    description: 'Email envoyé automatiquement par workflow',
    rgpd_relevant: false,
    can_override: true,
  },
  [HITL_ACTIONS.WORKFLOW_INTEGRATION]: {
    level: 'notification',
    timeout_hours: 0,
    description: 'Action d\'intégration workflow',
    rgpd_relevant: false,
    can_override: true,
  },

  // Utilisateur sensible
  [HITL_ACTIONS.ACCOUNT_DELETE]: {
    level: 'dual_approval',
    timeout_hours: 168, // 7 jours
    description: 'Suppression de compte',
    rgpd_relevant: true,
    can_override: false,
  },
  [HITL_ACTIONS.ROLE_CHANGE]: {
    level: 'approval',
    timeout_hours: 24,
    description: 'Changement de rôle utilisateur',
    rgpd_relevant: false,
    can_override: false,
  },
  [HITL_ACTIONS.API_KEY_CREATE]: {
    level: 'confirmation',
    timeout_hours: 0.5,
    description: 'Création de clé API',
    rgpd_relevant: false,
    can_override: true,
  },
  [HITL_ACTIONS.WEBHOOK_CREATE]: {
    level: 'confirmation',
    timeout_hours: 0.5,
    description: 'Création de webhook',
    rgpd_relevant: false,
    can_override: true,
  },

  // Partage
  [HITL_ACTIONS.QUOTE_SHARE_EXTERNAL]: {
    level: 'confirmation',
    timeout_hours: 1,
    description: 'Partage de devis externe',
    rgpd_relevant: false,
    can_override: true,
  },
  [HITL_ACTIONS.DATA_SHARE_THIRD_PARTY]: {
    level: 'approval',
    timeout_hours: 24,
    description: 'Partage de données avec tiers',
    rgpd_relevant: true,
    can_override: false,
  },

  // Admin
  [HITL_ACTIONS.BULK_EMAIL]: {
    level: 'approval',
    timeout_hours: 24,
    description: 'Envoi d\'email en masse',
    rgpd_relevant: true,
    can_override: false,
  },
  [HITL_ACTIONS.USER_IMPERSONATION]: {
    level: 'dual_approval',
    timeout_hours: 1,
    description: 'Impersonation d\'utilisateur',
    rgpd_relevant: true,
    can_override: false,
  },
  [HITL_ACTIONS.SYSTEM_CONFIG_CHANGE]: {
    level: 'approval',
    timeout_hours: 24,
    description: 'Modification de configuration système',
    rgpd_relevant: false,
    can_override: false,
  },
};

/**
 * Demande de contrôle humain
 */
export interface HITLRequest {
  id: string;
  action: HITLAction;
  user_id: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, any>;
  level: ControlLevel;
  status: 'pending' | 'approved' | 'rejected' | 'expired' | 'auto_approved';
  created_at: string;
  expires_at: string;
  decided_at?: string;
  decided_by?: string;
  decision_reason?: string;
}

/**
 * Crée une demande de contrôle humain
 */
export async function createHITLRequest(
  action: HITLAction,
  userId: string,
  resourceType: string,
  resourceId: string,
  details: Record<string, any>
): Promise<HITLRequest> {
  const supabase = await createClient();
  const config = HITL_CONFIG[action];

  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + config.timeout_hours);

  const { data, error } = await supabase
    .from('hitl_requests')
    .insert({
      action,
      user_id: userId,
      resource_type: resourceType,
      resource_id: resourceId,
      details,
      level: config.level,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create HITL request: ${error.message}`);
  }

  // Notifier l'utilisateur
  await supabase.from('notifications').insert({
    user_id: userId,
    type: 'hitl_request',
    title: `Action en attente: ${config.description}`,
    message: `Une action nécessite votre ${config.level === 'confirmation' ? 'confirmation' : 'approbation'}`,
    data: { hitl_request_id: data.id },
  });

  return data;
}

/**
 * Approuve une demande HITL
 */
export async function approveHITLRequest(
  requestId: string,
  decidedBy: string,
  reason?: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('hitl_requests')
    .update({
      status: 'approved',
      decided_at: new Date().toISOString(),
      decided_by: decidedBy,
      decision_reason: reason,
    })
    .eq('id', requestId)
    .eq('status', 'pending');

  if (error) {
    throw new Error(`Failed to approve HITL request: ${error.message}`);
  }
}

/**
 * Rejette une demande HITL
 */
export async function rejectHITLRequest(
  requestId: string,
  decidedBy: string,
  reason: string
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from('hitl_requests')
    .update({
      status: 'rejected',
      decided_at: new Date().toISOString(),
      decided_by: decidedBy,
      decision_reason: reason,
    })
    .eq('id', requestId)
    .eq('status', 'pending');

  if (error) {
    throw new Error(`Failed to reject HITL request: ${error.message}`);
  }
}

/**
 * Vérifie si une action nécessite un contrôle humain
 */
export function requiresHumanControl(action: HITLAction): boolean {
  const config = HITL_CONFIG[action];
  return config.level !== 'none';
}

/**
 * Récupère les préférences HITL de l'utilisateur
 */
export async function getUserHITLPreferences(
  userId: string
): Promise<Record<HITLAction, ControlLevel>> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('user_settings')
    .select('hitl_preferences')
    .eq('user_id', userId)
    .single();

  // Merge avec les defaults
  const defaults: Record<string, ControlLevel> = {};
  for (const [action, config] of Object.entries(HITL_CONFIG)) {
    defaults[action] = config.level;
  }

  return { ...defaults, ...(data?.hitl_preferences || {}) };
}

/**
 * Met à jour les préférences HITL (si autorisé)
 */
export async function updateUserHITLPreference(
  userId: string,
  action: HITLAction,
  level: ControlLevel
): Promise<boolean> {
  const config = HITL_CONFIG[action];

  // Vérifier si la modification est autorisée
  if (!config.can_override) {
    return false;
  }

  // Ne pas permettre de réduire le niveau pour les actions RGPD
  if (config.rgpd_relevant && level === 'none') {
    return false;
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from('user_settings')
    .select('hitl_preferences')
    .eq('user_id', userId)
    .single();

  const preferences = existing?.hitl_preferences || {};
  preferences[action] = level;

  await supabase
    .from('user_settings')
    .upsert({
      user_id: userId,
      hitl_preferences: preferences,
      updated_at: new Date().toISOString(),
    });

  return true;
}

/**
 * Liste des actions en attente pour un utilisateur
 */
export async function getPendingHITLRequests(userId: string): Promise<HITLRequest[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('hitl_requests')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to get pending HITL requests:', error);
    return [];
  }

  return data;
}
