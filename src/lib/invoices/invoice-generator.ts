/**
 * Invoice Generator - Quote to Invoice Conversion
 * Conforme Peppol avec QR code
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Types de factures
 */
export type InvoiceType = 'standard' | 'deposit' | 'balance' | 'credit_note';

/**
 * Statuts de facture
 */
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

/**
 * Interface Facture
 */
export interface Invoice {
  id: string;
  user_id: string;
  quote_id?: string;
  invoice_number: string;
  invoice_type: InvoiceType;
  status: InvoiceStatus;

  // Client
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_address?: string;
  client_vat_number?: string;

  // Montants
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  amount_paid: number;
  amount_due: number;

  // Peppol
  peppol_id?: string;
  structured_reference?: string;
  qr_code_data?: string;

  // Dates
  issue_date: string;
  due_date: string;
  paid_at?: string;

  notes?: string;
  payment_terms?: string;

  items: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  tax_rate: number;
  total: number;
}

/**
 * Convertit un devis en facture
 */
export async function convertQuoteToInvoice(
  quoteId: string,
  options: {
    type?: InvoiceType;
    depositPercentage?: number; // Pour facture d'acompte
    dueInDays?: number;
  } = {}
): Promise<Invoice> {
  const supabase = await createClient();
  const { type = 'standard', depositPercentage = 30, dueInDays = 30 } = options;

  // Récupérer le devis
  const { data: quote, error: quoteError } = await supabase
    .from('quotes')
    .select(`
      *,
      items:quote_items(*)
    `)
    .eq('id', quoteId)
    .single();

  if (quoteError || !quote) {
    throw new Error('Quote not found');
  }

  // Vérifier qu'il n'y a pas déjà une facture standard pour ce devis
  if (type === 'standard') {
    const { data: existing } = await supabase
      .from('invoices')
      .select('id')
      .eq('quote_id', quoteId)
      .eq('invoice_type', 'standard')
      .single();

    if (existing) {
      throw new Error('A standard invoice already exists for this quote');
    }
  }

  // Générer le numéro de facture
  const { data: invoiceNumber } = await supabase
    .rpc('generate_invoice_number', { p_user_id: quote.user_id });

  // Calculer les montants
  let subtotal = quote.subtotal;
  let taxAmount = quote.tax_amount;
  let total = quote.total;

  if (type === 'deposit') {
    const factor = depositPercentage / 100;
    subtotal = Math.round(quote.subtotal * factor * 100) / 100;
    taxAmount = Math.round(quote.tax_amount * factor * 100) / 100;
    total = Math.round(quote.total * factor * 100) / 100;
  }

  // Date d'échéance
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + dueInDays);

  // Générer la communication structurée belge
  const structuredReference = generateStructuredReference(invoiceNumber);

  // Créer la facture
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      user_id: quote.user_id,
      quote_id: quoteId,
      invoice_number: invoiceNumber,
      invoice_type: type,
      status: 'draft',
      client_name: quote.client_name,
      client_email: quote.client_email,
      client_phone: quote.client_phone,
      client_address: quote.client_address,
      subtotal,
      tax_rate: quote.tax_rate,
      tax_amount: taxAmount,
      total,
      amount_paid: 0,
      amount_due: total,
      structured_reference: structuredReference,
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate.toISOString().split('T')[0],
      payment_terms: `Paiement à ${dueInDays} jours`,
      notes: type === 'deposit'
        ? `Facture d'acompte de ${depositPercentage}% sur devis ${quote.quote_number}`
        : undefined,
    })
    .select()
    .single();

  if (invoiceError) {
    throw new Error(`Failed to create invoice: ${invoiceError.message}`);
  }

  // Créer les lignes de facture
  const items = quote.items.map((item: any, index: number) => ({
    invoice_id: invoice.id,
    description: item.description,
    quantity: type === 'deposit' ? item.quantity : item.quantity,
    unit: item.unit,
    unit_price: type === 'deposit'
      ? Math.round(item.unit_price * (depositPercentage / 100) * 100) / 100
      : item.unit_price,
    tax_rate: quote.tax_rate,
    total: type === 'deposit'
      ? Math.round(item.quantity * item.unit_price * (depositPercentage / 100) * 100) / 100
      : item.quantity * item.unit_price,
    sort_order: index,
  }));

  await supabase.from('invoice_items').insert(items);

  // Générer le QR code Peppol/EPC
  const qrCodeData = generateEPCQRCode({
    beneficiary: quote.company?.name || 'Entreprise',
    iban: quote.company?.iban,
    bic: quote.company?.bic,
    amount: total,
    reference: structuredReference,
  });

  // Mettre à jour avec le QR code
  await supabase
    .from('invoices')
    .update({ qr_code_data: qrCodeData })
    .eq('id', invoice.id);

  // Log dans l'audit
  await supabase.from('audit_logs').insert({
    user_id: quote.user_id,
    action: 'invoice_created',
    resource_type: 'invoice',
    resource_id: invoice.id,
    details: {
      quote_id: quoteId,
      invoice_type: type,
      total,
    },
  });

  return {
    ...invoice,
    items: items.map((item: any, index: number) => ({ ...item, id: `temp-${index}` })),
  };
}

/**
 * Génère une facture de solde après acompte
 */
export async function generateBalanceInvoice(
  quoteId: string,
  dueInDays: number = 30
): Promise<Invoice> {
  const supabase = await createClient();

  // Récupérer les factures d'acompte existantes
  const { data: deposits } = await supabase
    .from('invoices')
    .select('total, amount_paid')
    .eq('quote_id', quoteId)
    .eq('invoice_type', 'deposit');

  const totalDeposits = deposits?.reduce((sum, d) => sum + (d.amount_paid || 0), 0) || 0;

  // Récupérer le devis original
  const { data: quote } = await supabase
    .from('quotes')
    .select('*')
    .eq('id', quoteId)
    .single();

  if (!quote) {
    throw new Error('Quote not found');
  }

  // Calculer le solde restant
  const balanceAmount = quote.total - totalDeposits;

  if (balanceAmount <= 0) {
    throw new Error('No balance remaining');
  }

  // Créer la facture de solde
  return convertQuoteToInvoice(quoteId, {
    type: 'balance',
    depositPercentage: (balanceAmount / quote.total) * 100,
    dueInDays,
  });
}

/**
 * Génère une communication structurée belge
 * Format: +++XXX/XXXX/XXXXX+++
 */
function generateStructuredReference(invoiceNumber: string): string {
  // Extraire les chiffres du numéro de facture
  const digits = invoiceNumber.replace(/\D/g, '').padStart(10, '0').slice(-10);

  // Calculer le modulo 97
  const numericValue = BigInt(digits);
  let checksum = Number(numericValue % BigInt(97));
  if (checksum === 0) checksum = 97;

  const checksumStr = checksum.toString().padStart(2, '0');
  const fullRef = digits + checksumStr;

  // Formater: +++XXX/XXXX/XXXXX+++
  return `+++${fullRef.slice(0, 3)}/${fullRef.slice(3, 7)}/${fullRef.slice(7)}+++`;
}

/**
 * Génère un QR code EPC (European Payments Council)
 * Compatible avec les apps bancaires belges
 */
function generateEPCQRCode(params: {
  beneficiary: string;
  iban?: string;
  bic?: string;
  amount: number;
  reference: string;
}): string {
  if (!params.iban) return '';

  // Format EPC QR code
  const lines = [
    'BCD',                          // Service Tag
    '002',                          // Version
    '1',                            // Character set (UTF-8)
    'SCT',                          // Identification
    params.bic || '',               // BIC
    params.beneficiary.slice(0, 70), // Beneficiary name
    params.iban.replace(/\s/g, ''), // IBAN
    `EUR${params.amount.toFixed(2)}`, // Amount
    '',                             // Purpose
    params.reference.replace(/[+\/]/g, ''), // Reference
    '',                             // Remittance info
    '',                             // Beneficiary to originator info
  ];

  return lines.join('\n');
}

/**
 * Marque une facture comme payée
 */
export async function markInvoiceAsPaid(
  invoiceId: string,
  amountPaid?: number
): Promise<void> {
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from('invoices')
    .select('total, amount_paid')
    .eq('id', invoiceId)
    .single();

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  const newAmountPaid = amountPaid ?? invoice.total;
  const amountDue = invoice.total - newAmountPaid;

  await supabase
    .from('invoices')
    .update({
      amount_paid: newAmountPaid,
      amount_due: amountDue,
      status: amountDue <= 0 ? 'paid' : 'sent',
      paid_at: amountDue <= 0 ? new Date().toISOString() : null,
    })
    .eq('id', invoiceId);
}

/**
 * Vérifie et met à jour les factures en retard
 */
export async function checkOverdueInvoices(): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invoices')
    .update({ status: 'overdue' })
    .eq('status', 'sent')
    .lt('due_date', new Date().toISOString().split('T')[0])
    .select('id');

  return data?.length || 0;
}

/**
 * Exporte une facture au format Peppol BIS 3.0 (XML)
 */
export function exportToPeppolXML(invoice: Invoice, company: any): string {
  // Simplified Peppol BIS 3.0 structure
  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2"
         xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2"
         xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:CustomizationID>urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0</cbc:CustomizationID>
  <cbc:ProfileID>urn:fdc:peppol.eu:2017:poacc:billing:01:1.0</cbc:ProfileID>
  <cbc:ID>${invoice.invoice_number}</cbc:ID>
  <cbc:IssueDate>${invoice.issue_date}</cbc:IssueDate>
  <cbc:DueDate>${invoice.due_date}</cbc:DueDate>
  <cbc:InvoiceTypeCode>380</cbc:InvoiceTypeCode>
  <cbc:DocumentCurrencyCode>EUR</cbc:DocumentCurrencyCode>
  <cbc:PaymentMeans>
    <cbc:PaymentMeansCode>30</cbc:PaymentMeansCode>
    <cbc:PaymentID>${invoice.structured_reference}</cbc:PaymentID>
  </cbc:PaymentMeans>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${company?.name || ''}</cbc:Name></cac:PartyName>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${company?.vat_number || ''}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyName><cbc:Name>${invoice.client_name}</cbc:Name></cac:PartyName>
      ${invoice.client_vat_number ? `
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${invoice.client_vat_number}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>` : ''}
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="EUR">${invoice.tax_amount.toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:LineExtensionAmount currencyID="EUR">${invoice.subtotal.toFixed(2)}</cbc:LineExtensionAmount>
    <cbc:TaxExclusiveAmount currencyID="EUR">${invoice.subtotal.toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="EUR">${invoice.total.toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:PayableAmount currencyID="EUR">${invoice.amount_due.toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>
  ${invoice.items.map((item, index) => `
  <cac:InvoiceLine>
    <cbc:ID>${index + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="EA">${item.quantity}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="EUR">${item.total.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:Item><cbc:Name>${item.description}</cbc:Name></cac:Item>
    <cac:Price><cbc:PriceAmount currencyID="EUR">${item.unit_price.toFixed(2)}</cbc:PriceAmount></cac:Price>
  </cac:InvoiceLine>`).join('')}
</Invoice>`;
}
