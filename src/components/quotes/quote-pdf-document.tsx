/**
 * DEAL Premium PDF Document Component
 * Professional PDF generation with DEAL branding
 * Features: Premium header, 8px grid, Inter typography, elegant tables, QR code footer
 */

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
  Svg,
  Path,
  Circle,
  Line,
  G,
} from "@react-pdf/renderer";
import { PDF_TEMPLATES, type PDFTemplateId, type PDFTemplateConfig } from "@/lib/pdf-templates";
import { BRAND_COLORS, PDF_CONSTANTS } from "@/components/brand/BrandConstants";

// Register Inter font (using Google Fonts CDN)
Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_0eww.woff2",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hjp-Ek-_0eww.woff2",
      fontWeight: 500,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYAZ9hjp-Ek-_0eww.woff2",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hjp-Ek-_0eww.woff2",
      fontWeight: 700,
    },
  ],
});

// Fallback to Helvetica if Inter fails to load
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica", fontWeight: "normal" },
    { src: "Helvetica-Bold", fontWeight: "bold" },
  ],
});

// Types
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
  client_vat?: string;
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
    city?: string;
    postal_code?: string;
    phone?: string;
    email?: string;
    vat_number?: string;
    logo?: string;
    iban?: string;
    bic?: string;
  } | null;
}

interface QuotePDFDocumentProps {
  quote: QuoteData;
  template?: PDFTemplateId;
  showWatermark?: boolean;
  showQRCode?: boolean;
}

// 8px grid spacing helper
const sp = (units: number) => units * 8;

// Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

// Format date
const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("fr-BE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// Create styles based on template
const createStyles = (template: PDFTemplateConfig) => {
  const { colors, style } = template;

  return StyleSheet.create({
    // Page
    page: {
      padding: sp(5), // 40px
      fontSize: 10,
      fontFamily: "Inter",
      backgroundColor: colors.background,
      color: colors.text,
    },

    // Premium Header
    header: {
      flexDirection: style.headerStyle === "split" ? "row" : "column",
      justifyContent: style.headerStyle === "split" ? "space-between" : "flex-start",
      alignItems: style.logoPosition === "center" ? "center" : "flex-start",
      marginBottom: sp(4),
      paddingBottom: sp(2),
      borderBottomWidth: template.features.showGoldAccent ? 2 : 1,
      borderBottomColor: template.features.showGoldAccent ? BRAND_COLORS.secondary.DEFAULT : colors.borderColor,
    },
    headerLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: sp(2),
    },
    logoContainer: {
      width: 64,
      height: 64,
    },
    companyInfo: {
      textAlign: style.logoPosition === "right" ? "left" : "right",
    },
    companyName: {
      fontSize: 16,
      fontWeight: 700,
      color: colors.primary,
      marginBottom: sp(0.5),
    },
    companyDetail: {
      fontSize: 9,
      color: colors.muted,
      marginBottom: 2,
    },

    // Title Section
    titleSection: {
      marginBottom: sp(3),
      textAlign: style.headerStyle === "modern" ? "left" : "center",
    },
    title: {
      fontSize: 28,
      fontWeight: 700,
      color: colors.primary,
      letterSpacing: 2,
    },
    subtitle: {
      fontSize: 10,
      color: colors.muted,
      marginTop: sp(0.5),
    },

    // Quote Info Bar
    quoteInfoBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: sp(3),
      backgroundColor: colors.tableBg,
      padding: sp(2),
      borderRadius: style.cornerRadius,
      borderLeftWidth: template.features.showGoldAccent ? 4 : 0,
      borderLeftColor: BRAND_COLORS.secondary.DEFAULT,
    },
    infoBlock: {
      flex: 1,
    },
    infoLabel: {
      fontSize: 8,
      color: colors.muted,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: 2,
    },
    infoValue: {
      fontSize: 12,
      fontWeight: 600,
      color: colors.text,
    },

    // Sections
    section: {
      marginBottom: sp(3),
    },
    sectionTitle: {
      fontSize: 11,
      fontWeight: 600,
      color: colors.primary,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginBottom: sp(1),
      paddingBottom: sp(0.5),
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
    },

    // Client Info
    clientBox: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    clientInfo: {
      flex: 1,
    },
    clientName: {
      fontSize: 12,
      fontWeight: 600,
      marginBottom: sp(0.5),
    },
    clientDetail: {
      fontSize: 10,
      color: colors.text,
      marginBottom: 2,
    },

    // Table
    table: {
      marginTop: sp(1),
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: colors.tableHeaderBg,
      paddingVertical: sp(1),
      paddingHorizontal: sp(1),
      borderRadius: style.tableStyle === "cards" ? style.cornerRadius : 0,
    },
    tableHeaderText: {
      fontSize: 9,
      fontWeight: 600,
      color: colors.tableHeaderText,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: "row",
      paddingVertical: sp(1),
      paddingHorizontal: sp(1),
      borderBottomWidth: style.tableStyle === "minimal" ? 0 : 1,
      borderBottomColor: colors.borderColor,
    },
    tableRowAlt: {
      backgroundColor: style.tableStyle === "striped" ? colors.tableBg : "transparent",
    },
    tableRowCard: {
      backgroundColor: colors.background,
      marginBottom: sp(0.5),
      borderRadius: style.cornerRadius,
      borderWidth: 1,
      borderColor: colors.borderColor,
      shadowColor: "#000",
      shadowOpacity: style.shadowIntensity,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
    },

    // Table Columns
    colDescription: { flex: 4, paddingRight: sp(1) },
    colQuantity: { flex: 1, textAlign: "center" },
    colUnit: { flex: 1, textAlign: "center" },
    colPrice: { flex: 1.5, textAlign: "right" },
    colTotal: { flex: 1.5, textAlign: "right" },

    // Totals Section
    totalsSection: {
      marginTop: sp(3),
      alignItems: "flex-end",
    },
    totalsBox: {
      width: template.features.enlargedTotals ? 280 : 220,
      backgroundColor: template.features.enlargedTotals ? colors.tableBg : "transparent",
      padding: template.features.enlargedTotals ? sp(2) : 0,
      borderRadius: style.cornerRadius,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: sp(0.5),
    },
    totalLabel: {
      fontSize: 10,
      color: colors.muted,
    },
    totalValue: {
      fontSize: 10,
      fontWeight: 500,
      textAlign: "right",
    },
    grandTotalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: sp(1),
      marginTop: sp(1),
      borderTopWidth: 2,
      borderTopColor: template.features.showGoldAccent ? BRAND_COLORS.secondary.DEFAULT : colors.primary,
    },
    grandTotalLabel: {
      fontSize: template.features.enlargedTotals ? 14 : 12,
      fontWeight: 700,
      color: colors.primary,
    },
    grandTotalValue: {
      fontSize: template.features.enlargedTotals ? 18 : 14,
      fontWeight: 700,
      color: colors.primary,
    },

    // Notes
    notesBox: {
      marginTop: sp(2),
      padding: sp(2),
      backgroundColor: "#FFFBEB",
      borderRadius: style.cornerRadius,
      borderLeftWidth: 3,
      borderLeftColor: "#F59E0B",
    },
    notesTitle: {
      fontSize: 10,
      fontWeight: 600,
      color: "#92400E",
      marginBottom: sp(0.5),
    },
    notesText: {
      fontSize: 9,
      color: "#78350F",
      lineHeight: 1.5,
    },

    // Signature Block
    signatureSection: {
      marginTop: sp(4),
      flexDirection: "row",
      justifyContent: "space-between",
    },
    signatureBox: {
      width: "45%",
      padding: sp(2),
      borderWidth: 1,
      borderColor: colors.borderColor,
      borderRadius: style.cornerRadius,
      minHeight: 80,
    },
    signatureLabel: {
      fontSize: 9,
      color: colors.muted,
      marginBottom: sp(3),
    },
    signatureLine: {
      borderBottomWidth: 1,
      borderBottomColor: colors.borderColor,
      marginTop: sp(5),
    },

    // Footer
    footer: {
      position: "absolute",
      bottom: sp(3),
      left: sp(5),
      right: sp(5),
      paddingTop: sp(2),
      borderTopWidth: 1,
      borderTopColor: colors.borderColor,
    },
    footerContent: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-end",
    },
    footerLeft: {
      flex: 1,
    },
    footerCenter: {
      flex: 2,
      textAlign: "center",
    },
    footerRight: {
      flex: 1,
      alignItems: "flex-end",
    },
    legalText: {
      fontSize: 7,
      color: colors.muted,
      lineHeight: 1.4,
    },
    pageNumber: {
      fontSize: 8,
      color: colors.muted,
    },
    poweredBy: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    poweredByText: {
      fontSize: 7,
      color: colors.muted,
    },
    poweredByBrand: {
      fontSize: 8,
      fontWeight: 600,
      color: colors.primary,
    },

    // Watermark
    watermark: {
      position: "absolute",
      top: "35%",
      left: "25%",
      opacity: 0.05,
    },

    // QR Code placeholder
    qrCode: {
      width: 48,
      height: 48,
      backgroundColor: colors.tableBg,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
    },
    qrPlaceholder: {
      fontSize: 6,
      color: colors.muted,
      textAlign: "center",
    },
  });
};

// DEAL Logo for PDF (inline SVG)
function DealLogoSVG({ size = 48, variant = "primary" }: { size?: number; variant?: "primary" | "white" }) {
  const colors = variant === "primary"
    ? { main: BRAND_COLORS.primary.DEFAULT, accent: BRAND_COLORS.secondary.DEFAULT }
    : { main: "#FFFFFF", accent: BRAND_COLORS.secondary.DEFAULT };

  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Circle cx="32" cy="32" r="30" fill={colors.main} />
      <Circle cx="32" cy="32" r="28" fill="none" stroke={colors.accent} strokeWidth="1.5" />
      <Path
        d="M22 16H34C42.837 16 50 23.163 50 32C50 40.837 42.837 48 34 48H22V16Z"
        fill="none"
        stroke={colors.accent}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="22" y1="16" x2="22" y2="48" stroke={colors.accent} strokeWidth="3" strokeLinecap="round" />
      <Path d="M38 32L40 30L42 32L40 34L38 32Z" fill={colors.accent} />
    </Svg>
  );
}

// Watermark Component
function WatermarkSVG({ opacity = 0.05 }: { opacity?: number }) {
  return (
    <Svg width={300} height={300} viewBox="0 0 512 512" style={{ opacity }}>
      <Circle cx="256" cy="256" r="240" fill={BRAND_COLORS.primary.DEFAULT} fillOpacity={0.3} />
      <Circle cx="256" cy="256" r="230" fill="none" stroke={BRAND_COLORS.primary.DEFAULT} strokeWidth="4" strokeOpacity={0.5} />
      <Path
        d="M176 128H272C326.772 128 370 171.228 370 226V286C370 340.772 326.772 384 272 384H176V128Z"
        fill="none"
        stroke={BRAND_COLORS.primary.DEFAULT}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1="176" y1="128" x2="176" y2="384" stroke={BRAND_COLORS.primary.DEFAULT} strokeWidth="20" strokeLinecap="round" />
      <Path d="M300 256L320 236L340 256L320 276L300 256Z" fill={BRAND_COLORS.primary.DEFAULT} fillOpacity={0.8} />
    </Svg>
  );
}

// Main PDF Document Component
export function QuotePDFDocument({
  quote,
  template = "classic-pro",
  showWatermark,
  showQRCode,
}: QuotePDFDocumentProps) {
  const templateConfig = PDF_TEMPLATES[template] || PDF_TEMPLATES["classic-pro"];
  const styles = createStyles(templateConfig);

  // Determine watermark visibility
  const displayWatermark = showWatermark !== undefined ? showWatermark : templateConfig.features.showWatermark;
  const displayQRCode = showQRCode !== undefined ? showQRCode : templateConfig.features.showQRCode;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        {displayWatermark && (
          <View style={styles.watermark} fixed>
            <WatermarkSVG opacity={0.05} />
          </View>
        )}

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {quote.company?.logo ? (
              <Image src={quote.company.logo} style={styles.logoContainer} />
            ) : (
              <DealLogoSVG size={48} />
            )}
            {templateConfig.style.headerStyle !== "split" && (
              <View>
                <Text style={styles.companyName}>{quote.company?.name || "Mon Entreprise"}</Text>
              </View>
            )}
          </View>
          <View style={styles.companyInfo}>
            {templateConfig.style.headerStyle === "split" && (
              <Text style={styles.companyName}>{quote.company?.name || "Mon Entreprise"}</Text>
            )}
            {quote.company?.address && <Text style={styles.companyDetail}>{quote.company.address}</Text>}
            {(quote.company?.postal_code || quote.company?.city) && (
              <Text style={styles.companyDetail}>
                {quote.company?.postal_code} {quote.company?.city}
              </Text>
            )}
            {quote.company?.phone && <Text style={styles.companyDetail}>Tel: {quote.company.phone}</Text>}
            {quote.company?.email && <Text style={styles.companyDetail}>{quote.company.email}</Text>}
            {quote.company?.vat_number && (
              <Text style={styles.companyDetail}>TVA: {quote.company.vat_number}</Text>
            )}
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>DEVIS</Text>
          {quote.sector && <Text style={styles.subtitle}>{quote.sector}</Text>}
        </View>

        {/* Quote Info Bar */}
        <View style={styles.quoteInfoBar}>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Numero</Text>
            <Text style={styles.infoValue}>{quote.quote_number || "-"}</Text>
          </View>
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(quote.created_at)}</Text>
          </View>
          {quote.valid_until && (
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Validite</Text>
              <Text style={styles.infoValue}>{formatDate(quote.valid_until)}</Text>
            </View>
          )}
          <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>TVA</Text>
            <Text style={styles.infoValue}>{quote.tax_rate}%</Text>
          </View>
        </View>

        {/* Client Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client</Text>
          <View style={styles.clientBox}>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{quote.client_name}</Text>
              {quote.client_address && <Text style={styles.clientDetail}>{quote.client_address}</Text>}
              {(quote.client_postal_code || quote.client_city) && (
                <Text style={styles.clientDetail}>
                  {quote.client_postal_code} {quote.client_city}
                </Text>
              )}
              {quote.client_email && <Text style={styles.clientDetail}>{quote.client_email}</Text>}
              {quote.client_phone && <Text style={styles.clientDetail}>Tel: {quote.client_phone}</Text>}
              {quote.client_vat && <Text style={styles.clientDetail}>TVA: {quote.client_vat}</Text>}
            </View>
          </View>
        </View>

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prestations</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderText, styles.colDescription]}>Description</Text>
              <Text style={[styles.tableHeaderText, styles.colQuantity]}>Qte</Text>
              <Text style={[styles.tableHeaderText, styles.colUnit]}>Unite</Text>
              <Text style={[styles.tableHeaderText, styles.colPrice]}>P.U. HT</Text>
              <Text style={[styles.tableHeaderText, styles.colTotal]}>Total HT</Text>
            </View>

            {/* Rows */}
            {quote.items.map((item, index) => (
              <View
                key={item.id}
                style={[
                  styles.tableRow,
                  index % 2 === 1 && templateConfig.style.tableStyle === "striped" ? styles.tableRowAlt : {},
                  templateConfig.style.tableStyle === "cards" ? styles.tableRowCard : {},
                ]}
              >
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
        <View style={styles.totalsSection}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Sous-total HT</Text>
              <Text style={styles.totalValue}>{formatCurrency(quote.subtotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TVA ({quote.tax_rate}%)</Text>
              <Text style={styles.totalValue}>{formatCurrency(quote.tax_amount)}</Text>
            </View>
            <View style={styles.grandTotalRow}>
              <Text style={styles.grandTotalLabel}>Total TTC</Text>
              <Text style={styles.grandTotalValue}>{formatCurrency(quote.total)}</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notesBox}>
            <Text style={styles.notesTitle}>Conditions et remarques</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Signature Block */}
        {templateConfig.features.showSignatureBlock && (
          <View style={styles.signatureSection}>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Signature client</Text>
              <Text style={styles.signatureLabel}>(Bon pour accord)</Text>
              <View style={styles.signatureLine} />
            </View>
            <View style={styles.signatureBox}>
              <Text style={styles.signatureLabel}>Date</Text>
              <View style={styles.signatureLine} />
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View style={styles.footerContent}>
            <View style={styles.footerLeft}>
              {quote.company?.iban && (
                <Text style={styles.legalText}>IBAN: {quote.company.iban}</Text>
              )}
              {quote.company?.bic && (
                <Text style={styles.legalText}>BIC: {quote.company.bic}</Text>
              )}
            </View>
            <View style={styles.footerCenter}>
              <Text style={styles.legalText}>
                Devis valable 30 jours. En cas d'acceptation, ce devis fait office de contrat.
              </Text>
              <Text style={styles.legalText}>
                Paiement selon conditions convenues. TVA applicable en Belgique.
              </Text>
            </View>
            <View style={styles.footerRight}>
              {displayQRCode ? (
                <View style={styles.qrCode}>
                  <Text style={styles.qrPlaceholder}>QR</Text>
                  <Text style={styles.qrPlaceholder}>Code</Text>
                </View>
              ) : (
                <View style={styles.poweredBy}>
                  <Text style={styles.poweredByText}>Powered by</Text>
                  <Text style={styles.poweredByBrand}>DEAL</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// Export for backward compatibility
export default QuotePDFDocument;
