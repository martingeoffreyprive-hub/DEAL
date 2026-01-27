/**
 * Template Editor - Templates de documents modulables
 * Éditeur de templates avec aperçu en temps réel
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Types de templates
 */
export type TemplateType = 'quote' | 'invoice' | 'contract' | 'delivery_note';

/**
 * Types de blocs de template
 */
export type BlockType =
  | 'header'
  | 'company_info'
  | 'client_info'
  | 'document_info'
  | 'items_table'
  | 'totals'
  | 'notes'
  | 'footer'
  | 'signature'
  | 'text'
  | 'image'
  | 'spacer'
  | 'divider'
  | 'qr_code'
  | 'watermark';

/**
 * Configuration d'un bloc
 */
export interface TemplateBlock {
  id: string;
  type: BlockType;
  order: number;
  visible: boolean;
  config: BlockConfig;
  style: BlockStyle;
}

export interface BlockConfig {
  // Header
  showLogo?: boolean;
  logoPosition?: 'left' | 'center' | 'right';
  title?: string;

  // Text
  content?: string;
  variables?: string[]; // Ex: ['client_name', 'date']

  // Items table
  columns?: TableColumn[];
  showItemNumbers?: boolean;
  alternateRowColors?: boolean;

  // Totals
  showSubtotal?: boolean;
  showTax?: boolean;
  showTotal?: boolean;
  showAmountInWords?: boolean;

  // Footer
  showPageNumbers?: boolean;
  legalText?: string;

  // Signature
  signatureType?: 'line' | 'box' | 'digital';
  showDate?: boolean;

  // Image
  imageUrl?: string;
  imageAlt?: string;

  // QR Code
  qrData?: string;
  qrSize?: number;

  // Watermark
  watermarkText?: string;
  watermarkImage?: string;
  watermarkOpacity?: number;
}

export interface BlockStyle {
  // Dimensions
  width?: string;
  height?: string;
  minHeight?: string;
  maxWidth?: string;

  // Spacing
  margin?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
  padding?: string;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;

  // Colors
  backgroundColor?: string;
  color?: string;
  borderColor?: string;

  // Border
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderRadius?: string;

  // Typography
  fontSize?: string;
  fontWeight?: 'normal' | 'bold' | 'light';
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';

  // Layout
  display?: 'block' | 'flex' | 'grid';
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
}

export interface TableColumn {
  id: string;
  header: string;
  field: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  format?: 'text' | 'number' | 'currency' | 'percentage';
}

/**
 * Template complet
 */
export interface DocumentTemplate {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  type: TemplateType;
  category?: string;

  // Configuration globale
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };

  // Styles globaux
  globalStyles: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    baseFontSize: number;
  };

  // Blocs
  blocks: TemplateBlock[];

  // Métadonnées
  is_public: boolean;
  is_premium: boolean;
  price: number;
  downloads_count: number;
  rating?: number;

  created_at: string;
  updated_at: string;
}

/**
 * Variables disponibles pour les templates
 */
export const TEMPLATE_VARIABLES: Record<string, { label: string; example: string }> = {
  // Document
  'document_number': { label: 'Numéro de document', example: 'D2024-00001' },
  'document_date': { label: 'Date du document', example: '26/01/2024' },
  'valid_until': { label: 'Valide jusqu\'au', example: '26/02/2024' },
  'due_date': { label: 'Date d\'échéance', example: '26/02/2024' },

  // Entreprise
  'company_name': { label: 'Nom entreprise', example: 'Mon Entreprise SPRL' },
  'company_address': { label: 'Adresse entreprise', example: 'Rue Example 123' },
  'company_postal_code': { label: 'Code postal entreprise', example: '1000' },
  'company_city': { label: 'Ville entreprise', example: 'Bruxelles' },
  'company_phone': { label: 'Téléphone entreprise', example: '+32 2 123 45 67' },
  'company_email': { label: 'Email entreprise', example: 'contact@monentreprise.be' },
  'company_vat': { label: 'N° TVA entreprise', example: 'BE0123.456.789' },
  'company_iban': { label: 'IBAN entreprise', example: 'BE00 0000 0000 0000' },

  // Client
  'client_name': { label: 'Nom client', example: 'Client SPRL' },
  'client_address': { label: 'Adresse client', example: 'Avenue du Client 456' },
  'client_postal_code': { label: 'Code postal client', example: '2000' },
  'client_city': { label: 'Ville client', example: 'Anvers' },
  'client_email': { label: 'Email client', example: 'contact@client.be' },
  'client_phone': { label: 'Téléphone client', example: '+32 3 987 65 43' },
  'client_vat': { label: 'N° TVA client', example: 'BE0987.654.321' },

  // Montants
  'subtotal': { label: 'Sous-total HT', example: '1 000,00 €' },
  'tax_rate': { label: 'Taux TVA', example: '21%' },
  'tax_amount': { label: 'Montant TVA', example: '210,00 €' },
  'total': { label: 'Total TTC', example: '1 210,00 €' },
  'total_in_words': { label: 'Total en lettres', example: 'Mille deux cent dix euros' },
  'amount_paid': { label: 'Montant payé', example: '0,00 €' },
  'amount_due': { label: 'Montant dû', example: '1 210,00 €' },

  // Paiement
  'structured_reference': { label: 'Communication structurée', example: '+++123/4567/89012+++' },
  'payment_terms': { label: 'Conditions de paiement', example: 'Paiement à 30 jours' },

  // Autres
  'current_date': { label: 'Date actuelle', example: '26/01/2024' },
  'page_number': { label: 'Numéro de page', example: '1' },
  'total_pages': { label: 'Total pages', example: '2' },
};

/**
 * Templates par défaut
 */
export const DEFAULT_TEMPLATES: Partial<DocumentTemplate>[] = [
  {
    name: 'Classique Professionnel',
    type: 'quote',
    category: 'Classique',
    pageSize: 'A4',
    orientation: 'portrait',
    margins: { top: 40, right: 40, bottom: 40, left: 40 },
    globalStyles: {
      primaryColor: '#1E3A5F',
      secondaryColor: '#C9A962',
      fontFamily: 'Helvetica',
      baseFontSize: 10,
    },
    blocks: [
      {
        id: 'header-1',
        type: 'header',
        order: 0,
        visible: true,
        config: { showLogo: true, logoPosition: 'left', title: 'DEVIS' },
        style: { marginBottom: '20px' },
      },
      {
        id: 'info-row',
        type: 'document_info',
        order: 1,
        visible: true,
        config: {},
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
        },
      },
      {
        id: 'client-info',
        type: 'client_info',
        order: 2,
        visible: true,
        config: {},
        style: { marginBottom: '20px' },
      },
      {
        id: 'items-table',
        type: 'items_table',
        order: 3,
        visible: true,
        config: {
          columns: [
            { id: 'desc', header: 'Description', field: 'description', width: '40%', align: 'left' },
            { id: 'qty', header: 'Qté', field: 'quantity', width: '10%', align: 'center' },
            { id: 'unit', header: 'Unité', field: 'unit', width: '10%', align: 'center' },
            { id: 'price', header: 'P.U. HT', field: 'unit_price', width: '20%', align: 'right', format: 'currency' },
            { id: 'total', header: 'Total HT', field: 'total', width: '20%', align: 'right', format: 'currency' },
          ],
          showItemNumbers: true,
          alternateRowColors: true,
        },
        style: { marginBottom: '20px' },
      },
      {
        id: 'totals',
        type: 'totals',
        order: 4,
        visible: true,
        config: {
          showSubtotal: true,
          showTax: true,
          showTotal: true,
        },
        style: { marginBottom: '20px' },
      },
      {
        id: 'notes',
        type: 'notes',
        order: 5,
        visible: true,
        config: {},
        style: { marginBottom: '20px' },
      },
      {
        id: 'footer',
        type: 'footer',
        order: 6,
        visible: true,
        config: {
          showPageNumbers: true,
          legalText: 'Devis valable 30 jours. Paiement selon conditions convenues.',
        },
        style: {},
      },
    ],
  },
];

/**
 * Crée un nouveau template
 */
export async function createTemplate(
  userId: string,
  template: Omit<DocumentTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<DocumentTemplate> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('document_templates')
    .insert({
      user_id: userId,
      name: template.name,
      description: template.description,
      type: template.type,
      category: template.category,
      template_data: {
        pageSize: template.pageSize,
        orientation: template.orientation,
        margins: template.margins,
        globalStyles: template.globalStyles,
        blocks: template.blocks,
      },
      is_public: template.is_public,
      is_premium: template.is_premium,
      price: template.price,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create template: ${error.message}`);
  }

  return data;
}

/**
 * Met à jour un template
 */
export async function updateTemplate(
  templateId: string,
  userId: string,
  updates: Partial<DocumentTemplate>
): Promise<void> {
  const supabase = await createClient();

  const templateData: any = {};
  if (updates.pageSize) templateData.pageSize = updates.pageSize;
  if (updates.orientation) templateData.orientation = updates.orientation;
  if (updates.margins) templateData.margins = updates.margins;
  if (updates.globalStyles) templateData.globalStyles = updates.globalStyles;
  if (updates.blocks) templateData.blocks = updates.blocks;

  const { error } = await supabase
    .from('document_templates')
    .update({
      name: updates.name,
      description: updates.description,
      category: updates.category,
      template_data: templateData,
      is_public: updates.is_public,
      is_premium: updates.is_premium,
      price: updates.price,
      updated_at: new Date().toISOString(),
    })
    .eq('id', templateId)
    .eq('user_id', userId);

  if (error) {
    throw new Error(`Failed to update template: ${error.message}`);
  }
}

/**
 * Duplique un template
 */
export async function duplicateTemplate(
  templateId: string,
  userId: string
): Promise<DocumentTemplate> {
  const supabase = await createClient();

  // Récupérer le template original
  const { data: original, error: fetchError } = await supabase
    .from('document_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (fetchError || !original) {
    throw new Error('Template not found');
  }

  // Créer la copie
  const { data: copy, error: createError } = await supabase
    .from('document_templates')
    .insert({
      user_id: userId,
      name: `${original.name} (copie)`,
      description: original.description,
      type: original.type,
      category: original.category,
      template_data: original.template_data,
      is_public: false,
      is_premium: false,
      price: 0,
    })
    .select()
    .single();

  if (createError) {
    throw new Error(`Failed to duplicate template: ${createError.message}`);
  }

  return copy;
}

/**
 * Interpole les variables dans un template
 */
export function interpolateTemplate(
  template: DocumentTemplate,
  data: Record<string, any>
): DocumentTemplate {
  const interpolated = JSON.parse(JSON.stringify(template));

  const interpolateString = (str: string): string => {
    return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match;
    });
  };

  const interpolateObject = (obj: any): any => {
    if (typeof obj === 'string') {
      return interpolateString(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(interpolateObject);
    }
    if (obj && typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = interpolateObject(value);
      }
      return result;
    }
    return obj;
  };

  interpolated.blocks = interpolateObject(interpolated.blocks);

  return interpolated;
}

/**
 * Génère un aperçu HTML du template
 */
export function generateHTMLPreview(
  template: DocumentTemplate,
  data: Record<string, any>
): string {
  const interpolated = interpolateTemplate(template, data);
  const { globalStyles, blocks } = interpolated;

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page {
          size: ${template.pageSize} ${template.orientation};
          margin: ${template.margins.top}px ${template.margins.right}px ${template.margins.bottom}px ${template.margins.left}px;
        }
        body {
          font-family: ${globalStyles.fontFamily}, sans-serif;
          font-size: ${globalStyles.baseFontSize}pt;
          color: #333;
          line-height: 1.4;
        }
        .primary { color: ${globalStyles.primaryColor}; }
        .secondary { color: ${globalStyles.secondaryColor}; }
        .bg-primary { background-color: ${globalStyles.primaryColor}; color: white; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 8px; text-align: left; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .bold { font-weight: bold; }
      </style>
    </head>
    <body>
  `;

  for (const block of blocks.filter(b => b.visible).sort((a, b) => a.order - b.order)) {
    html += renderBlock(block, data, globalStyles);
  }

  html += `
    </body>
    </html>
  `;

  return html;
}

/**
 * Rend un bloc en HTML
 */
function renderBlock(
  block: TemplateBlock,
  data: Record<string, any>,
  globalStyles: DocumentTemplate['globalStyles']
): string {
  const style = Object.entries(block.style)
    .map(([key, value]) => `${camelToKebab(key)}: ${value}`)
    .join('; ');

  switch (block.type) {
    case 'header':
      return `
        <div style="${style}">
          ${block.config.showLogo && data.company_logo
            ? `<img src="${data.company_logo}" alt="Logo" style="max-height: 60px;" />`
            : ''}
          <h1 class="primary" style="font-size: 24pt; margin: 0;">${block.config.title || 'DOCUMENT'}</h1>
        </div>
      `;

    case 'company_info':
      return `
        <div style="${style}">
          <strong class="primary">${data.company_name || ''}</strong><br/>
          ${data.company_address || ''}<br/>
          ${data.company_postal_code || ''} ${data.company_city || ''}<br/>
          ${data.company_phone ? `Tél: ${data.company_phone}<br/>` : ''}
          ${data.company_email || ''}<br/>
          ${data.company_vat ? `TVA: ${data.company_vat}` : ''}
        </div>
      `;

    case 'client_info':
      return `
        <div style="${style}">
          <strong>Client:</strong><br/>
          <strong>${data.client_name || ''}</strong><br/>
          ${data.client_address || ''}<br/>
          ${data.client_postal_code || ''} ${data.client_city || ''}<br/>
          ${data.client_email || ''}
        </div>
      `;

    case 'items_table':
      const columns = block.config.columns || [];
      const items = data.items || [];
      return `
        <table style="${style}">
          <thead>
            <tr class="bg-primary">
              ${columns.map(col => `<th style="width: ${col.width}; text-align: ${col.align};">${col.header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${items.map((item: any, i: number) => `
              <tr style="background-color: ${block.config.alternateRowColors && i % 2 ? '#f5f5f5' : 'white'};">
                ${columns.map(col => {
                  let value = item[col.field];
                  if (col.format === 'currency' && typeof value === 'number') {
                    value = new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(value);
                  }
                  return `<td style="text-align: ${col.align};">${value || ''}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;

    case 'totals':
      return `
        <div style="${style}; text-align: right;">
          ${block.config.showSubtotal ? `<div>Sous-total HT: <strong>${data.subtotal || '0,00 €'}</strong></div>` : ''}
          ${block.config.showTax ? `<div>TVA (${data.tax_rate || '21'}%): <strong>${data.tax_amount || '0,00 €'}</strong></div>` : ''}
          ${block.config.showTotal ? `<div class="primary bold" style="font-size: 14pt; border-top: 2px solid ${globalStyles.primaryColor}; padding-top: 8px; margin-top: 8px;">Total TTC: ${data.total || '0,00 €'}</div>` : ''}
        </div>
      `;

    case 'notes':
      return data.notes ? `
        <div style="${style}; background-color: #fffbeb; padding: 12px; border-left: 3px solid #f59e0b;">
          <strong>Notes:</strong><br/>
          ${data.notes}
        </div>
      ` : '';

    case 'footer':
      return `
        <div style="${style}; border-top: 1px solid #ddd; padding-top: 10px; font-size: 8pt; color: #666;">
          ${block.config.legalText || ''}
          ${block.config.showPageNumbers ? '<div style="text-align: center;">Page {{page_number}} / {{total_pages}}</div>' : ''}
        </div>
      `;

    default:
      return '';
  }
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
