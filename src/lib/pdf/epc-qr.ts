// EPC QR Code Generator
// Generates QR codes following the European Payments Council standard
// For SEPA credit transfers

import QRCode from 'qrcode';

export interface EPCQRData {
  beneficiaryName: string;
  iban: string;
  bic?: string;
  amount: number;
  currency: 'EUR' | 'CHF';
  reference?: string;
  remittanceInfo?: string;
}

/**
 * Generates an EPC QR code payload following the EPC069-12 specification
 * Version 002, Character set 1 (UTF-8), Identification SCT
 */
export function generateEPCPayload(data: EPCQRData): string {
  // EPC QR Code format (line-separated):
  // 1. BCD - Service Tag
  // 2. 002 - Version
  // 3. 1 - Character set (UTF-8)
  // 4. SCT - Identification code (SEPA Credit Transfer)
  // 5. BIC (optional, 8 or 11 chars)
  // 6. Beneficiary Name (max 70 chars)
  // 7. IBAN
  // 8. Amount with currency (EUR12.50 or empty)
  // 9. Purpose (4 chars, optional)
  // 10. Structured reference or empty
  // 11. Unstructured remittance info (max 140 chars)
  // 12. Beneficiary to originator info (optional)

  const lines: string[] = [
    'BCD',                                    // Service Tag
    '002',                                    // Version
    '1',                                      // Character set (UTF-8)
    'SCT',                                    // Identification (SEPA Credit Transfer)
    data.bic || '',                           // BIC (optional)
    data.beneficiaryName.slice(0, 70),        // Beneficiary Name (max 70)
    data.iban.replace(/\s/g, ''),             // IBAN (no spaces)
    `${data.currency}${data.amount.toFixed(2)}`, // Amount with currency
    '',                                       // Purpose code (empty)
    data.reference || '',                     // Structured reference
    (data.remittanceInfo || '').slice(0, 140), // Remittance info (max 140)
    '',                                       // Beneficiary to originator info
  ];

  return lines.join('\n');
}

/**
 * Generates an EPC QR code as a data URL (base64 PNG)
 * Compatible with @react-pdf/renderer Image component
 */
export async function generateEPCQRCode(
  data: EPCQRData,
  options: { size?: number; margin?: number } = {}
): Promise<string> {
  const payload = generateEPCPayload(data);
  const size = options.size || 150;
  const margin = options.margin || 2;

  try {
    const dataUrl = await QRCode.toDataURL(payload, {
      width: size,
      margin: margin,
      errorCorrectionLevel: 'M',
      type: 'image/png',
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate EPC QR code:', error);
    throw error;
  }
}

/**
 * Validates if the provided data can generate a valid EPC QR code
 */
export function isValidEPCData(data: Partial<EPCQRData>): boolean {
  if (!data.beneficiaryName || data.beneficiaryName.length < 1) return false;
  if (!data.iban || data.iban.length < 15) return false;
  if (!data.amount || data.amount <= 0) return false;
  if (!data.currency || !['EUR', 'CHF'].includes(data.currency)) return false;
  return true;
}

/**
 * Formats IBAN for display (with spaces every 4 chars)
 */
export function formatIBAN(iban: string): string {
  const clean = iban.replace(/\s/g, '').toUpperCase();
  return clean.match(/.{1,4}/g)?.join(' ') || clean;
}
