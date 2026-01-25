// Locale Pack: Belgique (FR-BE)
import type { LocalePack } from './types';

export const frBE: LocalePack = {
  code: 'fr-BE',
  name: 'Français (Belgique)',
  country: 'Belgique',
  flag: '🇧🇪',

  tax: {
    standard: 21,
    reduced: 12,
    superReduced: 6,
    zero: 0,
    label: 'TVA',
    rates: [
      { value: 0, label: '0% (Exonéré)', description: 'Services médicaux, formations, etc.' },
      { value: 6, label: '6% (Super réduit)', description: 'Rénovation logement >10 ans, alimentation de base' },
      { value: 12, label: '12% (Réduit)', description: 'Restauration, logement social' },
      { value: 21, label: '21% (Normal)', description: 'Taux standard applicable' },
    ],
  },

  currency: {
    code: 'EUR',
    symbol: '€',
    position: 'after',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimals: 2,
  },

  date: {
    format: 'DD/MM/YYYY',
    locale: 'fr-BE',
  },

  legal: {
    quoteValidity: 'Ce devis est valable 30 jours à compter de sa date d\'émission.',
    paymentTerms: 'Paiement à 30 jours date de facture, sauf accord contraire.',
    latePaymentPenalties: 'En cas de retard de paiement, des intérêts de retard de 10% par an seront appliqués, ainsi qu\'une indemnité forfaitaire de 40€ pour frais de recouvrement (Loi du 2 août 2002).',
    withdrawalRight: 'Conformément au Code de droit économique, le consommateur dispose d\'un délai de 14 jours pour exercer son droit de rétractation pour les contrats conclus à distance.',
    jurisdiction: 'Tout litige relatif au présent devis sera soumis aux tribunaux compétents de l\'arrondissement judiciaire du prestataire.',
    dataProtection: 'Vos données personnelles sont traitées conformément au RGPD. Pour plus d\'informations, consultez notre politique de confidentialité.',
    professionalInsurance: 'Entreprise assurée en responsabilité civile professionnelle.',
  },

  vocabulary: {
    quote: 'Devis',
    invoice: 'Facture',
    client: 'Client',
    provider: 'Prestataire',
    vat: 'TVA',
    vatNumber: 'Numéro de TVA',
    subtotal: 'Sous-total HTVA',
    total: 'Total TVAC',
    deposit: 'Acompte',
    balance: 'Solde',
    terms: 'Conditions générales',
    conditions: 'Conditions particulières',
    validity: 'Validité',
    paymentDue: 'Échéance',
    bankTransfer: 'Virement bancaire',
    cash: 'Espèces',
    // Termes belges spécifiques
    registrationNumber: 'Numéro BCE',
    socialSecurity: 'ONSS',
    workPermit: 'Permis de travail',
  },

  compliance: {
    requiredFields: [
      'company_name',
      'vat_number', // Numéro de TVA obligatoire
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
      'Numéro de TVA de l\'entreprise',
      'Numéro BCE (Banque-Carrefour des Entreprises)',
      'Conditions de paiement',
      'Validité du devis',
    ],
    rules: [
      {
        id: 'vat_format_be',
        description: 'Le numéro de TVA belge doit être au format BE0XXX.XXX.XXX',
        check: (data) => {
          if (!data.vat_number) return false;
          return /^BE0?\d{3}\.?\d{3}\.?\d{3}$/.test(data.vat_number);
        },
        severity: 'error',
      },
      {
        id: 'renovation_vat_6',
        description: 'Taux réduit de 6% uniquement pour rénovation de logements >10 ans',
        check: (data) => {
          if (data.tax_rate === 6 && data.sector === 'RENOVATION') {
            return true; // Doit vérifier l'âge du bâtiment
          }
          return true;
        },
        severity: 'warning',
      },
      {
        id: 'deposit_max_50',
        description: 'L\'acompte ne peut généralement pas dépasser 50% pour les particuliers',
        check: (data) => {
          if (data.is_consumer && data.deposit_percent > 50) {
            return false;
          }
          return true;
        },
        severity: 'warning',
      },
      {
        id: 'non_standard_vat_be',
        description: 'Le taux TVA utilisé diffère du taux standard belge (21%). Taux disponibles: 0%, 6%, 12%, 21%',
        check: (data) => {
          if (!data.tax_rate && data.tax_rate !== 0) return true;
          const validRates = [0, 6, 12, 21];
          return validRates.includes(data.tax_rate);
        },
        severity: 'info',
      },
    ],
  },

  numberFormats: {
    quote: 'DEV-{YYYY}-{NNNN}',
    invoice: 'FAC-{YYYY}-{NNNN}',
  },

  officialContacts: {
    consumerProtection: 'SPF Économie - https://economie.fgov.be',
    tradeRegister: 'BCE - https://kbopub.economie.fgov.be',
    taxAuthority: 'SPF Finances - https://finances.belgium.be',
  },
};
