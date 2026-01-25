// Locale Pack: France (FR-FR)
import type { LocalePack } from './types';

export const frFR: LocalePack = {
  code: 'fr-FR',
  name: 'Français (France)',
  country: 'France',
  flag: '🇫🇷',

  tax: {
    standard: 20,
    reduced: 10,
    superReduced: 5.5,
    zero: 0,
    label: 'TVA',
    rates: [
      { value: 0, label: '0% (Exonéré)', description: 'Activités exonérées, DOM-TOM' },
      { value: 2.1, label: '2,1% (Super réduit)', description: 'Médicaments remboursés, presse' },
      { value: 5.5, label: '5,5% (Réduit)', description: 'Alimentation, énergie, travaux rénovation énergétique' },
      { value: 10, label: '10% (Intermédiaire)', description: 'Restauration, travaux logement, transport' },
      { value: 20, label: '20% (Normal)', description: 'Taux standard applicable' },
    ],
  },

  currency: {
    code: 'EUR',
    symbol: '€',
    position: 'after',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    decimals: 2,
  },

  date: {
    format: 'DD/MM/YYYY',
    locale: 'fr-FR',
  },

  legal: {
    quoteValidity: 'Ce devis est valable 30 jours à compter de sa date d\'émission, sauf indication contraire.',
    paymentTerms: 'Paiement à 30 jours date de facture. Pas d\'escompte pour paiement anticipé.',
    latePaymentPenalties: 'En cas de retard de paiement, une pénalité de 3 fois le taux d\'intérêt légal sera appliquée, ainsi qu\'une indemnité forfaitaire de 40€ pour frais de recouvrement (Art. L441-10 Code de commerce).',
    withdrawalRight: 'Conformément au Code de la consommation (Art. L221-18), le consommateur dispose d\'un délai de 14 jours pour exercer son droit de rétractation.',
    jurisdiction: 'Tout litige relatif au présent devis sera soumis à la compétence exclusive des tribunaux français.',
    dataProtection: 'Conformément à la loi Informatique et Libertés et au RGPD, vous disposez d\'un droit d\'accès, de rectification et de suppression de vos données.',
    professionalInsurance: 'Garantie décennale et assurance responsabilité civile professionnelle souscrites.',
  },

  vocabulary: {
    quote: 'Devis',
    invoice: 'Facture',
    client: 'Client',
    provider: 'Prestataire',
    vat: 'TVA',
    vatNumber: 'N° TVA intracommunautaire',
    subtotal: 'Total HT',
    total: 'Total TTC',
    deposit: 'Acompte',
    balance: 'Solde à payer',
    terms: 'CGV',
    conditions: 'Conditions particulières',
    validity: 'Validité du devis',
    paymentDue: 'Date d\'échéance',
    bankTransfer: 'Virement bancaire',
    cash: 'Espèces',
    // Termes français spécifiques
    siret: 'SIRET',
    siren: 'SIREN',
    rcs: 'RCS',
    ape: 'Code APE',
    decennale: 'Garantie décennale',
  },

  compliance: {
    requiredFields: [
      'company_name',
      'siret', // Obligatoire en France
      'address',
      'quote_number',
      'date',
      'client_name',
      'client_address',
      'description',
      'quantity',
      'unit_price',
      'vat_rate',
      'total_ht',
      'total_ttc',
    ],
    mandatoryMentions: [
      'Numéro SIRET',
      'Numéro RCS et ville',
      'Forme juridique et capital social',
      'Adresse du siège social',
      'Numéro de TVA intracommunautaire',
      'Mention "TVA non applicable, art. 293 B du CGI" si auto-entrepreneur',
    ],
    rules: [
      {
        id: 'siret_format',
        description: 'Le SIRET doit contenir 14 chiffres',
        check: (data) => {
          if (!data.siret) return false;
          return /^\d{14}$/.test(data.siret.replace(/\s/g, ''));
        },
        severity: 'error',
      },
      {
        id: 'vat_format_fr',
        description: 'Le numéro de TVA français doit être au format FR XX XXXXXXXXX',
        check: (data) => {
          if (!data.vat_number) return true; // Peut être exonéré
          return /^FR\s?\d{2}\s?\d{9}$/.test(data.vat_number);
        },
        severity: 'error',
      },
      {
        id: 'renovation_vat_10',
        description: 'Taux réduit de 10% pour travaux dans logements achevés depuis plus de 2 ans',
        check: (data) => {
          if (data.tax_rate === 10 && data.sector === 'RENOVATION') {
            return true; // Attestation simplifiée requise
          }
          return true;
        },
        severity: 'info',
      },
      {
        id: 'auto_entrepreneur_mention',
        description: 'Mention obligatoire pour auto-entrepreneur exonéré de TVA',
        check: (data) => {
          if (data.is_auto_entrepreneur && data.tax_rate === 0) {
            return data.notes?.includes('art. 293 B') || false;
          }
          return true;
        },
        severity: 'error',
      },
      {
        id: 'decennale_required',
        description: 'Garantie décennale obligatoire pour travaux du bâtiment',
        check: (data) => {
          const buildingSectors = ['CONSTRUCTION', 'RENOVATION', 'TOITURE', 'ELECTRICITE', 'PLOMBERIE', 'CHAUFFAGE'];
          if (buildingSectors.includes(data.sector)) {
            return data.decennale_number !== undefined;
          }
          return true;
        },
        severity: 'warning',
      },
      {
        id: 'non_standard_vat_fr',
        description: 'Le taux TVA utilisé diffère du taux standard français (20%). Taux disponibles: 0%, 2.1%, 5.5%, 10%, 20%',
        check: (data) => {
          if (!data.tax_rate && data.tax_rate !== 0) return true;
          const validRates = [0, 2.1, 5.5, 10, 20];
          return validRates.includes(data.tax_rate);
        },
        severity: 'info',
      },
    ],
  },

  numberFormats: {
    quote: 'D{YYYY}{MM}-{NNN}',
    invoice: 'F{YYYY}{MM}-{NNN}',
  },

  officialContacts: {
    consumerProtection: 'DGCCRF - https://www.economie.gouv.fr/dgccrf',
    tradeRegister: 'Infogreffe - https://www.infogreffe.fr',
    taxAuthority: 'impots.gouv.fr - https://www.impots.gouv.fr',
  },
};
