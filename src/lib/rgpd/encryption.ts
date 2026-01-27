/**
 * RGPD Encryption Module
 * Chiffrement AES-256-GCM pour données sensibles
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 32;

// Clé de chiffrement depuis les variables d'environnement
const getEncryptionKey = (): Buffer => {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is required for RGPD compliance');
  }
  // Dériver une clé de 32 bytes à partir de la clé fournie
  return crypto.scryptSync(key, 'deal-rgpd-salt', 32);
};

/**
 * Chiffre une donnée sensible
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

/**
 * Déchiffre une donnée sensible
 */
export function decrypt(ciphertext: string): string {
  if (!ciphertext || !ciphertext.includes(':')) return ciphertext;

  try {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encryptedData] = ciphertext.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt sensitive data');
  }
}

/**
 * Hash une donnée pour recherche (one-way)
 */
export function hashForSearch(data: string): string {
  const salt = process.env.HASH_SALT || 'deal-search-salt';
  return crypto
    .createHash('sha256')
    .update(data + salt)
    .digest('hex');
}

/**
 * Anonymise un email (préserve le domaine)
 */
export function anonymizeEmail(email: string): string {
  const [local, domain] = email.split('@');
  const anonymizedLocal = local.substring(0, 2) + '***';
  return `${anonymizedLocal}@${domain}`;
}

/**
 * Anonymise un numéro de téléphone
 */
export function anonymizePhone(phone: string): string {
  if (!phone || phone.length < 4) return '****';
  return phone.substring(0, 3) + '****' + phone.substring(phone.length - 2);
}

/**
 * Anonymise un IBAN
 */
export function anonymizeIBAN(iban: string): string {
  if (!iban || iban.length < 8) return '****';
  return iban.substring(0, 4) + '****' + iban.substring(iban.length - 4);
}

/**
 * Masque des données pour affichage
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (!data || data.length <= visibleChars) return '****';
  return '*'.repeat(data.length - visibleChars) + data.substring(data.length - visibleChars);
}

/**
 * Données sensibles RGPD à chiffrer
 */
export const SENSITIVE_FIELDS = [
  'bank_account',
  'iban',
  'bic',
  'tax_number',
  'national_id',
  'siret',
  'vat_number',
  'credit_card',
  'social_security',
] as const;

/**
 * Données personnelles RGPD
 */
export const PERSONAL_DATA_FIELDS = [
  'first_name',
  'last_name',
  'email',
  'phone',
  'address',
  'city',
  'postal_code',
  'country',
  'date_of_birth',
] as const;

export type SensitiveField = typeof SENSITIVE_FIELDS[number];
export type PersonalDataField = typeof PERSONAL_DATA_FIELDS[number];
