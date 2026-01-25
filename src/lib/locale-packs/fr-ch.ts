// Locale Pack: Suisse (FR-CH)
import type { LocalePack } from './types';

export const frCH: LocalePack = {
  code: 'fr-CH',
  name: 'Français (Suisse)',
  country: 'Suisse',
  flag: '🇨🇭',

  tax: {
    standard: 8.1,
    reduced: 2.6,
    zero: 0,
    label: 'TVA',
    rates: [
      { value: 0, label: '0% (Exonéré)', description: 'Exportations, services médicaux, formations' },
      { value: 2.6, label: '2,6% (Réduit)', description: 'Alimentation, médicaments, livres, journaux' },
      { value: 3.8, label: '3,8% (Hébergement)', description: 'Services d\'hébergement' },
      { value: 8.1, label: '8,1% (Normal)', description: 'Taux standard applicable' },
    ],
  },

  currency: {
    code: 'CHF',
    symbol: 'CHF',
    position: 'before',
    decimalSeparator: '.',
    thousandsSeparator: '\'',
    decimals: 2,
  },

  date: {
    format: 'DD.MM.YYYY',
    locale: 'fr-CH',
  },

  legal: {
    quoteValidity: 'Ce devis est valable 30 jours à compter de sa date d\'établissement.',
    paymentTerms: 'Paiement net à 30 jours. Un escompte de 2% est accordé pour paiement comptant.',
    latePaymentPenalties: 'En cas de retard de paiement, des intérêts moratoires de 5% l\'an seront appliqués (Art. 104 CO).',
    jurisdiction: 'Le for juridique est au siège de l\'entreprise. Le droit suisse est applicable.',
    dataProtection: 'Vos données sont traitées conformément à la Loi fédérale sur la protection des données (LPD).',
    professionalInsurance: 'Entreprise au bénéfice d\'une assurance responsabilité civile professionnelle.',
  },

  vocabulary: {
    quote: 'Devis',
    invoice: 'Facture',
    client: 'Client',
    provider: 'Prestataire',
    vat: 'TVA',
    vatNumber: 'N° IDE-TVA',
    subtotal: 'Total hors TVA',
    total: 'Total TTC',
    deposit: 'Acompte',
    balance: 'Solde',
    terms: 'CG',
    conditions: 'Conditions particulières',
    validity: 'Validité',
    paymentDue: 'Échéance',
    bankTransfer: 'Virement bancaire',
    cash: 'Comptant',
    // Termes suisses spécifiques
    ide: 'Numéro IDE',
    rc: 'Registre du Commerce',
    canton: 'Canton',
    qrBill: 'QR-facture',
  },

  compliance: {
    requiredFields: [
      'company_name',
      'ide_number', // Numéro IDE obligatoire
      'address',
      'quote_number',
      'date',
      'client_name',
      'description',
      'quantity',
      'unit_price',
      'vat_rate',
      'total',
    ],
    mandatoryMentions: [
      'Numéro IDE (Identification des entreprises)',
      'Raison sociale complète',
      'Siège de l\'entreprise',
      'Numéro de TVA si assujetti',
    ],
    rules: [
      {
        id: 'ide_format',
        description: 'Le numéro IDE doit être au format CHE-XXX.XXX.XXX',
        check: (data) => {
          if (!data.ide_number) return false;
          return /^CHE-?\d{3}\.?\d{3}\.?\d{3}$/.test(data.ide_number);
        },
        severity: 'error',
      },
      {
        id: 'vat_format_ch',
        description: 'Le numéro de TVA suisse doit être au format CHE-XXX.XXX.XXX TVA',
        check: (data) => {
          if (!data.vat_number) return true; // Peut ne pas être assujetti
          return /^CHE-?\d{3}\.?\d{3}\.?\d{3}\s*(TVA|MWST|IVA)?$/.test(data.vat_number);
        },
        severity: 'error',
      },
      {
        id: 'vat_threshold',
        description: 'L\'assujettissement à la TVA est obligatoire au-delà de CHF 100\'000 de CA',
        check: (data) => {
          if (!data.annual_revenue) return true;
          if (data.annual_revenue > 100000 && !data.vat_number) {
            return false;
          }
          return true;
        },
        severity: 'warning',
      },
      {
        id: 'qr_bill_iban',
        description: 'Pour la QR-facture, un IBAN suisse (QR-IBAN) est recommandé',
        check: (data) => {
          if (data.iban && !data.iban.startsWith('CH')) {
            return false;
          }
          return true;
        },
        severity: 'info',
      },
      {
        id: 'currency_mismatch_ch',
        description: 'En Suisse, les devis doivent être en CHF (franc suisse), pas en EUR',
        check: (data) => {
          // Pass if currency is CHF, undefined, or not set
          return !data.currency || data.currency === 'CHF';
        },
        severity: 'warning',
      },
      {
        id: 'non_standard_vat_ch',
        description: 'Le taux TVA utilisé diffère du taux standard suisse (8.1%). Taux disponibles: 0%, 2.6%, 3.8%, 8.1%',
        check: (data) => {
          if (!data.tax_rate && data.tax_rate !== 0) return true;
          const validRates = [0, 2.6, 3.8, 8.1];
          return validRates.includes(data.tax_rate);
        },
        severity: 'info',
      },
    ],
  },

  numberFormats: {
    quote: 'OFF-{YYYY}-{NNNN}', // Offre en suisse
    invoice: 'FACT-{YYYY}-{NNNN}',
  },

  officialContacts: {
    consumerProtection: 'SECO - https://www.seco.admin.ch',
    tradeRegister: 'Zefix - https://www.zefix.ch',
    taxAuthority: 'AFC - https://www.estv.admin.ch',
  },
};
