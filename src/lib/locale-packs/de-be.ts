// Locale Pack: Belgien (DE-BE) — German Belgium (Ostbelgien)
import type { LocalePack } from './types';

export const deBE: LocalePack = {
  code: 'de-BE',
  name: 'Deutsch (Belgien)',
  country: 'Belgien',
  flag: '🇧🇪',

  tax: {
    standard: 21,
    reduced: 12,
    superReduced: 6,
    zero: 0,
    label: 'MwSt.',
    rates: [
      { value: 0, label: '0% (Befreit)', description: 'Medizinische Leistungen, Ausbildung usw.' },
      { value: 6, label: '6% (Super ermäßigt)', description: 'Renovierung Wohnung >10 Jahre, Grundnahrungsmittel' },
      { value: 12, label: '12% (Ermäßigt)', description: 'Gastronomie, Sozialwohnungen' },
      { value: 21, label: '21% (Normal)', description: 'Anwendbarer Standardsatz' },
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
    format: 'DD.MM.YYYY',
    locale: 'de-BE',
  },

  legal: {
    quoteValidity: 'Dieses Angebot ist 30 Tage ab Ausstellungsdatum gültig.',
    paymentTerms: 'Zahlung innerhalb von 30 Tagen nach Rechnungsdatum, sofern nicht anders vereinbart.',
    latePaymentPenalties: 'Bei verspäteter Zahlung werden Verzugszinsen von 10% pro Jahr berechnet sowie eine pauschale Entschädigung von 40€ für Inkassokosten (Gesetz vom 2. August 2002).',
    withdrawalRight: 'Gemäß dem Wirtschaftsgesetzbuch hat der Verbraucher eine Frist von 14 Tagen, um sein Widerrufsrecht bei Fernabsatzverträgen auszuüben.',
    jurisdiction: 'Jeder Streit bezüglich dieses Angebots unterliegt der Zuständigkeit der Gerichte des Gerichtsbezirks des Dienstleisters.',
    dataProtection: 'Ihre personenbezogenen Daten werden gemäß der DSGVO verarbeitet. Weitere Informationen finden Sie in unserer Datenschutzerklärung.',
    professionalInsurance: 'Unternehmen mit Berufshaftpflichtversicherung.',
  },

  vocabulary: {
    quote: 'Angebot',
    invoice: 'Rechnung',
    client: 'Kunde',
    provider: 'Dienstleister',
    vat: 'MwSt.',
    vatNumber: 'MwSt.-Nummer',
    subtotal: 'Zwischensumme ohne MwSt.',
    total: 'Gesamtbetrag inkl. MwSt.',
    deposit: 'Anzahlung',
    balance: 'Restbetrag',
    terms: 'Allgemeine Geschäftsbedingungen',
    conditions: 'Besondere Bedingungen',
    validity: 'Gültigkeit',
    paymentDue: 'Fälligkeitsdatum',
    bankTransfer: 'Überweisung',
    cash: 'Bargeld',
    registrationNumber: 'ZDU-Nummer',
    socialSecurity: 'LSS',
    workPermit: 'Arbeitserlaubnis',
  },

  compliance: {
    requiredFields: [
      'company_name',
      'vat_number',
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
      'MwSt.-Nummer des Unternehmens',
      'ZDU-Nummer (Zentrale Datenbank der Unternehmen)',
      'Zahlungsbedingungen',
      'Gültigkeit des Angebots',
    ],
    rules: [
      {
        id: 'vat_format_be',
        description: 'Die belgische MwSt.-Nummer muss das Format BE0XXX.XXX.XXX haben',
        check: (data) => {
          if (!data.vat_number) return false;
          return /^BE0?\d{3}\.?\d{3}\.?\d{3}$/.test(data.vat_number);
        },
        severity: 'error',
      },
      {
        id: 'renovation_vat_6',
        description: 'Ermäßigter Satz von 6% nur für Renovierung von Wohnungen >10 Jahre',
        check: (data) => {
          if (data.tax_rate === 6 && data.sector === 'RENOVATION') {
            return true;
          }
          return true;
        },
        severity: 'warning',
      },
      {
        id: 'deposit_max_50',
        description: 'Die Anzahlung darf für Privatpersonen in der Regel 50% nicht überschreiten',
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
        description: 'Der verwendete MwSt.-Satz weicht vom belgischen Standardsatz (21%) ab. Verfügbare Sätze: 0%, 6%, 12%, 21%',
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
    quote: 'ANG-{YYYY}-{NNNN}',
    invoice: 'REC-{YYYY}-{NNNN}',
  },

  officialContacts: {
    consumerProtection: 'FÖD Wirtschaft - https://economie.fgov.be',
    tradeRegister: 'ZDU - https://kbopub.economie.fgov.be',
    taxAuthority: 'FÖD Finanzen - https://finanzen.belgium.be',
  },
};
