// Locale Pack: België (NL-BE) — Dutch Belgium
import type { LocalePack } from './types';

export const nlBE: LocalePack = {
  code: 'nl-BE',
  name: 'Nederlands (België)',
  country: 'België',
  flag: '🇧🇪',

  tax: {
    standard: 21,
    reduced: 12,
    superReduced: 6,
    zero: 0,
    label: 'BTW',
    rates: [
      { value: 0, label: '0% (Vrijgesteld)', description: 'Medische diensten, opleidingen, enz.' },
      { value: 6, label: '6% (Superverlaagd)', description: 'Renovatie woning >10 jaar, basisvoeding' },
      { value: 12, label: '12% (Verlaagd)', description: 'Horeca, sociale huisvesting' },
      { value: 21, label: '21% (Normaal)', description: 'Standaard tarief van toepassing' },
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
    locale: 'nl-BE',
  },

  legal: {
    quoteValidity: 'Deze offerte is geldig gedurende 30 dagen vanaf de datum van uitgifte.',
    paymentTerms: 'Betaling binnen 30 dagen na factuurdatum, tenzij anders overeengekomen.',
    latePaymentPenalties: 'Bij laattijdige betaling worden verwijlintresten van 10% per jaar aangerekend, alsook een forfaitaire schadevergoeding van €40 voor invorderingskosten (Wet van 2 augustus 2002).',
    withdrawalRight: 'Overeenkomstig het Wetboek van economisch recht beschikt de consument over een termijn van 14 dagen om zijn herroepingsrecht uit te oefenen voor overeenkomsten op afstand.',
    jurisdiction: 'Elk geschil met betrekking tot deze offerte valt onder de bevoegdheid van de rechtbanken van het gerechtelijk arrondissement van de dienstverlener.',
    dataProtection: 'Uw persoonsgegevens worden verwerkt in overeenstemming met de AVG. Raadpleeg ons privacybeleid voor meer informatie.',
    professionalInsurance: 'Onderneming verzekerd voor beroepsaansprakelijkheid.',
  },

  vocabulary: {
    quote: 'Offerte',
    invoice: 'Factuur',
    client: 'Klant',
    provider: 'Dienstverlener',
    vat: 'BTW',
    vatNumber: 'BTW-nummer',
    subtotal: 'Subtotaal excl. BTW',
    total: 'Totaal incl. BTW',
    deposit: 'Voorschot',
    balance: 'Saldo',
    terms: 'Algemene voorwaarden',
    conditions: 'Bijzondere voorwaarden',
    validity: 'Geldigheid',
    paymentDue: 'Vervaldatum',
    bankTransfer: 'Overschrijving',
    cash: 'Contant',
    registrationNumber: 'KBO-nummer',
    socialSecurity: 'RSZ',
    workPermit: 'Arbeidsvergunning',
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
      'BTW-nummer van het bedrijf',
      'KBO-nummer (Kruispuntbank van Ondernemingen)',
      'Betalingsvoorwaarden',
      'Geldigheid van de offerte',
    ],
    rules: [
      {
        id: 'vat_format_be',
        description: 'Het Belgische BTW-nummer moet het formaat BE0XXX.XXX.XXX hebben',
        check: (data) => {
          if (!data.vat_number) return false;
          return /^BE0?\d{3}\.?\d{3}\.?\d{3}$/.test(data.vat_number);
        },
        severity: 'error',
      },
      {
        id: 'renovation_vat_6',
        description: 'Verlaagd tarief van 6% enkel voor renovatie van woningen >10 jaar',
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
        description: 'Het voorschot mag voor particulieren doorgaans niet meer dan 50% bedragen',
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
        description: 'Het gebruikte BTW-tarief wijkt af van het Belgische standaardtarief (21%). Beschikbare tarieven: 0%, 6%, 12%, 21%',
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
    quote: 'OFF-{YYYY}-{NNNN}',
    invoice: 'FAC-{YYYY}-{NNNN}',
  },

  officialContacts: {
    consumerProtection: 'FOD Economie - https://economie.fgov.be',
    tradeRegister: 'KBO - https://kbopub.economie.fgov.be',
    taxAuthority: 'FOD Financiën - https://financien.belgium.be',
  },
};
