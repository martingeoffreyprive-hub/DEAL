/**
 * RGPD Data Retention Policy
 * Politique de conservation des données conforme RGPD
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Durées de conservation par type de données (en jours)
 */
export const RETENTION_PERIODS = {
  // Données de compte
  user_account: 365 * 3, // 3 ans après suppression du compte
  user_profile: 365 * 3,

  // Données commerciales (obligations légales belges)
  quotes: 365 * 10, // 10 ans (obligation comptable)
  invoices: 365 * 10, // 10 ans (obligation comptable)
  contracts: 365 * 10,

  // Données de paiement
  payment_records: 365 * 10, // 10 ans
  bank_details: 365 * 1, // 1 an après dernière utilisation

  // Données de session
  session_logs: 90, // 90 jours
  access_logs: 365, // 1 an

  // Données analytiques
  analytics: 365 * 2, // 2 ans
  performance_metrics: 365, // 1 an

  // Données de consentement
  consent_records: 365 * 5, // 5 ans (preuve de consentement)

  // Données de communication
  email_logs: 365, // 1 an
  notification_history: 90, // 90 jours

  // Données IA
  ai_transcriptions: 365, // 1 an
  ai_cache: 30, // 30 jours

  // Données temporaires
  temp_files: 7, // 7 jours
  draft_quotes: 30, // 30 jours

  // Audit trail (RGPD requirement)
  audit_logs: 365 * 5, // 5 ans
} as const;

export type DataCategory = keyof typeof RETENTION_PERIODS;

/**
 * Calcule la date d'expiration pour une catégorie de données
 */
export function getExpirationDate(category: DataCategory, fromDate?: Date): Date {
  const baseDate = fromDate || new Date();
  const retentionDays = RETENTION_PERIODS[category];
  const expirationDate = new Date(baseDate);
  expirationDate.setDate(expirationDate.getDate() + retentionDays);
  return expirationDate;
}

/**
 * Vérifie si une donnée a expiré
 */
export function isDataExpired(category: DataCategory, createdAt: Date): boolean {
  const expirationDate = getExpirationDate(category, createdAt);
  return new Date() > expirationDate;
}

/**
 * Nettoie les données expirées
 */
export async function cleanupExpiredData(): Promise<{
  category: string;
  deletedCount: number;
}[]> {
  const supabase = await createClient();
  const results: { category: string; deletedCount: number }[] = [];

  // Nettoyer les logs de session expirés
  const sessionCutoff = new Date();
  sessionCutoff.setDate(sessionCutoff.getDate() - RETENTION_PERIODS.session_logs);

  const { data: sessionData } = await supabase
    .from('session_logs')
    .delete()
    .lt('created_at', sessionCutoff.toISOString())
    .select();

  results.push({ category: 'session_logs', deletedCount: sessionData?.length || 0 });

  // Nettoyer le cache IA expiré
  const aiCacheCutoff = new Date();
  aiCacheCutoff.setDate(aiCacheCutoff.getDate() - RETENTION_PERIODS.ai_cache);

  const { data: cacheData } = await supabase
    .from('ai_cache')
    .delete()
    .lt('created_at', aiCacheCutoff.toISOString())
    .select();

  results.push({ category: 'ai_cache', deletedCount: cacheData?.length || 0 });

  // Nettoyer les brouillons de devis expirés
  const draftCutoff = new Date();
  draftCutoff.setDate(draftCutoff.getDate() - RETENTION_PERIODS.draft_quotes);

  const { data: draftData } = await supabase
    .from('quotes')
    .delete()
    .eq('status', 'draft')
    .lt('updated_at', draftCutoff.toISOString())
    .select();

  results.push({ category: 'draft_quotes', deletedCount: draftData?.length || 0 });

  // Nettoyer l'historique des notifications
  const notifCutoff = new Date();
  notifCutoff.setDate(notifCutoff.getDate() - RETENTION_PERIODS.notification_history);

  const { data: notifData } = await supabase
    .from('notifications')
    .delete()
    .lt('created_at', notifCutoff.toISOString())
    .select();

  results.push({ category: 'notifications', deletedCount: notifData?.length || 0 });

  // Log le nettoyage
  await supabase.from('audit_logs').insert({
    action: 'data_retention_cleanup',
    resource_type: 'system',
    details: { results },
  });

  return results;
}

/**
 * Anonymise les données d'un utilisateur (droit à l'oubli partiel)
 * Conserve les données pour obligations légales mais anonymise les données personnelles
 */
export async function anonymizeUserData(userId: string): Promise<void> {
  const supabase = await createClient();

  // Anonymiser le profil
  await supabase
    .from('profiles')
    .update({
      first_name: 'ANONYMIZED',
      last_name: 'USER',
      phone: null,
      avatar_url: null,
      bio: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  // Anonymiser les coordonnées entreprise
  await supabase
    .from('companies')
    .update({
      contact_email: 'anonymized@deleted.user',
      contact_phone: null,
      address: 'ANONYMIZED',
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  // Anonymiser les données client dans les devis (conserver pour comptabilité)
  await supabase
    .from('quotes')
    .update({
      client_email: 'anonymized@deleted.user',
      client_phone: null,
      notes: '[DONNÉES ANONYMISÉES RGPD]',
    })
    .eq('user_id', userId);

  // Log l'anonymisation
  await supabase.from('audit_logs').insert({
    user_id: userId,
    action: 'user_data_anonymized',
    resource_type: 'user',
    resource_id: userId,
    details: { reason: 'RGPD right to erasure (partial)' },
  });
}

/**
 * Supprime complètement les données d'un utilisateur
 * À utiliser avec précaution - certaines données doivent être conservées
 */
export async function deleteUserData(
  userId: string,
  options: {
    keepLegalRequired?: boolean;
    reason?: string;
  } = {}
): Promise<{ success: boolean; keptCategories?: string[] }> {
  const { keepLegalRequired = true, reason } = options;
  const supabase = await createClient();
  const keptCategories: string[] = [];

  if (keepLegalRequired) {
    // Anonymiser au lieu de supprimer les données comptables
    await anonymizeUserData(userId);
    keptCategories.push('quotes', 'invoices', 'payments');
  } else {
    // Suppression complète (attention: peut violer les obligations légales)
    await supabase.from('quote_items').delete().eq('quote_id',
      supabase.from('quotes').select('id').eq('user_id', userId)
    );
    await supabase.from('quotes').delete().eq('user_id', userId);
  }

  // Supprimer les données non-légales
  await supabase.from('user_consents').delete().eq('user_id', userId);
  await supabase.from('notifications').delete().eq('user_id', userId);
  await supabase.from('user_settings').delete().eq('user_id', userId);

  // Log la suppression
  await supabase.from('audit_logs').insert({
    action: 'user_data_deleted',
    resource_type: 'user',
    resource_id: userId,
    details: {
      reason,
      kept_categories: keptCategories,
      legal_retention: keepLegalRequired,
    },
  });

  return { success: true, keptCategories };
}

/**
 * Génère un rapport de rétention des données
 */
export async function generateRetentionReport(userId: string): Promise<{
  category: string;
  count: number;
  oldestRecord: string | null;
  expiresAt: string;
}[]> {
  const supabase = await createClient();
  const report: {
    category: string;
    count: number;
    oldestRecord: string | null;
    expiresAt: string;
  }[] = [];

  // Devis
  const { data: quotesData, count: quotesCount } = await supabase
    .from('quotes')
    .select('created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1);

  if (quotesCount) {
    report.push({
      category: 'quotes',
      count: quotesCount,
      oldestRecord: quotesData?.[0]?.created_at || null,
      expiresAt: quotesData?.[0]?.created_at
        ? getExpirationDate('quotes', new Date(quotesData[0].created_at)).toISOString()
        : 'N/A',
    });
  }

  // Consentements
  const { data: consentsData, count: consentsCount } = await supabase
    .from('user_consents')
    .select('created_at', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1);

  if (consentsCount) {
    report.push({
      category: 'consent_records',
      count: consentsCount,
      oldestRecord: consentsData?.[0]?.created_at || null,
      expiresAt: consentsData?.[0]?.created_at
        ? getExpirationDate('consent_records', new Date(consentsData[0].created_at)).toISOString()
        : 'N/A',
    });
  }

  return report;
}
