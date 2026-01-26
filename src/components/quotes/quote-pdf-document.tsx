/**
 * Server-compatible PDF Document Component
 * Can be used for both client and server-side PDF generation
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import type { PDFTemplateId } from "@/lib/pdf-templates";

// Register fonts
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.cdnfonts.com/s/29136/Helvetica.woff", fontWeight: "normal" },
    { src: "https://fonts.cdnfonts.com/s/29136/Helvetica-Bold.woff", fontWeight: "bold" },
  ],
});

// Template color schemes - matches PDFTemplateId from pdf-templates.ts
const TEMPLATE_COLORS: Record<PDFTemplateId, { primary: string; text: string; muted: string }> = {
  "classic-pro": { primary: "#1E3A5F", text: "#0D1B2A", muted: "#64748B" },
  "corporate": { primary: "#1F2937", text: "#111827", muted: "#6B7280" },
  "artisan": { primary: "#78350F", text: "#451A03", muted: "#A16207" },
  "modern": { primary: "#7C3AED", text: "#1E1B4B", muted: "#6366F1" },
  "luxe": { primary: "#0D1B2A", text: "#0D1B2A", muted: "#64748B" },
  "minimal": { primary: "#18181B", text: "#09090B", muted: "#A1A1AA" },
};

interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

interface QuoteData {
  quote_number?: string;
  client_name: string;
  client_email?: string;
  client_address?: string;
  client_postal_code?: string;
  client_city?: string;
  client_phone?: string;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes?: string;
  created_at: string;
  valid_until?: string;
  sector?: string;
  items: QuoteItem[];
  company?: {
    name: string;
    address?: string;
    phone?: string;
    email?: string;
    siret?: string;
    logo?: string;
  } | null;
}

interface QuotePDFDocumentProps {
  quote: QuoteData;
  template?: PDFTemplateId;
}

// Create styles based on template
const createStyles = (colors: { primary: string; text: string; muted: string }) =>
  StyleSheet.create({
    page: {
      padding: 40,
      fontSize: 10,
      fontFamily: "Helvetica",
      color: colors.text,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 30,
    },
    companyInfo: {
      textAlign: "right",
    },
    companyName: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 4,
      color: colors.primary,
    },
    companyDetail: {
      fontSize: 9,
      color: colors.muted,
      marginBottom: 2,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      color: colors.primary,
      marginBottom: 20,
      textAlign: "center",
    },
    quoteInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
      backgroundColor: "#f8fafc",
      padding: 15,
      borderRadius: 4,
    },
    infoBlock: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 8,
      color: colors.muted,
      marginBottom: 2,
      textTransform: "uppercase",
    },
    infoValue: {
      fontSize: 11,
      fontWeight: "bold",
    },
    section: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 12,
      fontWeight: "bold",
      marginBottom: 8,
      color: colors.text,
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      paddingBottom: 5,
    },
    clientInfo: {
      fontSize: 10,
      lineHeight: 1.5,
    },
    table: {
      marginTop: 8,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: colors.primary,
      color: "#ffffff",
      padding: 8,
      fontWeight: "bold",
      fontSize: 9,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      padding: 8,
      fontSize: 9,
    },
    tableRowAlt: {
      backgroundColor: "#f8fafc",
    },
    colDescription: {
      flex: 3,
    },
    colQuantity: {
      flex: 1,
      textAlign: "center",
    },
    colUnit: {
      flex: 1,
      textAlign: "center",
    },
    colPrice: {
      flex: 1,
      textAlign: "right",
    },
    colTotal: {
      flex: 1,
      textAlign: "right",
    },
    totals: {
      marginTop: 20,
      alignItems: "flex-end",
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "flex-end",
      paddingVertical: 4,
      width: 200,
    },
    totalLabel: {
      flex: 1,
      textAlign: "right",
      marginRight: 20,
      color: colors.muted,
    },
    totalValue: {
      width: 80,
      textAlign: "right",
      fontWeight: "bold",
    },
    grandTotal: {
      borderTopWidth: 2,
      borderTopColor: colors.primary,
      paddingTop: 8,
      marginTop: 8,
    },
    grandTotalLabel: {
      fontSize: 12,
      fontWeight: "bold",
      color: colors.text,
    },
    grandTotalValue: {
      fontSize: 14,
      fontWeight: "bold",
      color: colors.primary,
    },
    notes: {
      marginTop: 20,
      padding: 15,
      backgroundColor: "#fffbeb",
      borderRadius: 4,
      borderLeftWidth: 3,
      borderLeftColor: "#f59e0b",
    },
    notesTitle: {
      fontSize: 10,
      fontWeight: "bold",
      marginBottom: 5,
      color: "#92400e",
    },
    notesText: {
      fontSize: 9,
      color: "#78350f",
      lineHeight: 1.5,
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: 40,
      right: 40,
      borderTopWidth: 1,
      borderTopColor: "#e2e8f0",
      paddingTop: 10,
    },
    legalText: {
      fontSize: 7,
      color: colors.muted,
      textAlign: "center",
      lineHeight: 1.4,
    },
  });

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function QuotePDFDocument({ quote, template = "classic-pro" }: QuotePDFDocumentProps) {
  const colors = TEMPLATE_COLORS[template] || TEMPLATE_COLORS["classic-pro"];
  const styles = createStyles(colors);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {quote.company?.logo && (
              <Image src={quote.company.logo} style={{ width: 80, height: 80, objectFit: "contain" }} />
            )}
          </View>
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>{quote.company?.name || "Mon Entreprise"}</Text>
            {quote.company?.address && <Text style={styles.companyDetail}>{quote.company.address}</Text>}
            {quote.company?.phone && <Text style={styles.companyDetail}>Tél: {quote.company.phone}</Text>}
            {quote.company?.email && <Text style={styles.companyDetail}>{quote.company.email}</Text>}
            {quote.company?.siret && <Text style={styles.companyDetail}>SIRET: {quote.company.siret}</Text>}
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>DEVIS</Text>

        {/* Quote Info */}
        <View style={styles.quoteInfo}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Numéro</Text>
            <Text style={styles.infoValue}>{quote.quote_number || "-"}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(quote.created_at)}</Text>
          </View>
          {quote.valid_until && (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Validité</Text>
              <Text style={styles.infoValue}>{formatDate(quote.valid_until)}</Text>
            </View>
          )}
        </View>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLIENT</Text>
          <View style={styles.clientInfo}>
            <Text style={{ fontWeight: "bold", marginBottom: 4 }}>{quote.client_name}</Text>
            {quote.client_address && <Text>{quote.client_address}</Text>}
            {(quote.client_postal_code || quote.client_city) && (
              <Text>{quote.client_postal_code} {quote.client_city}</Text>
            )}
            {quote.client_email && <Text>{quote.client_email}</Text>}
            {quote.client_phone && <Text>Tél: {quote.client_phone}</Text>}
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRESTATIONS</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={styles.colDescription}>Description</Text>
              <Text style={styles.colQuantity}>Qté</Text>
              <Text style={styles.colUnit}>Unité</Text>
              <Text style={styles.colPrice}>P.U. HT</Text>
              <Text style={styles.colTotal}>Total HT</Text>
            </View>
            {/* Rows */}
            {quote.items.map((item, index) => (
              <View key={item.id} style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}>
                <Text style={styles.colDescription}>{item.description}</Text>
                <Text style={styles.colQuantity}>{item.quantity}</Text>
                <Text style={styles.colUnit}>{item.unit}</Text>
                <Text style={styles.colPrice}>{formatCurrency(item.unit_price)}</Text>
                <Text style={styles.colTotal}>{formatCurrency(item.quantity * item.unit_price)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Sous-total HT</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({quote.tax_rate}%)</Text>
            <Text style={styles.totalValue}>{formatCurrency(quote.tax_amount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={[styles.totalLabel, styles.grandTotalLabel]}>Total TTC</Text>
            <Text style={[styles.totalValue, styles.grandTotalValue]}>{formatCurrency(quote.total)}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>Conditions</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.legalText}>
            Devis valable 30 jours. Paiement selon conditions convenues.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
