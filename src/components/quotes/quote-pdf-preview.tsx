"use client";

import { useState, useEffect } from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFDownloadLink,
  PDFViewer,
  Font,
  Image,
} from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Loader2,
  Eye,
  Lock,
  Calculator,
  FileText,
  Settings2,
  Palette,
  Globe,
  LayoutGrid,
} from "lucide-react";
import { useLocaleContext } from "@/contexts/locale-context";
import { formatDateWithLocale } from "@/lib/utils";
import { SECTORS, TAX_RATES, type Quote, type QuoteItem, type Profile, type SectorType } from "@/types/database";
import {
  type PDFDensity,
  type PDFBranding,
  DENSITY_CONFIGS,
  DEFAULT_BRANDING,
  getDensityConfig,
  suggestDensity,
} from "@/lib/pdf";
import {
  getLocalePack,
  getAllLocalePacks,
  formatLocaleCurrency,
  generateLegalMentions,
  getTaxRates,
  getQuoteLocale,
  type LocaleCode,
} from "@/lib/locale-packs";

// Register fonts
Font.register({
  family: "Helvetica",
  fonts: [
    { src: "https://fonts.cdnfonts.com/s/29136/Helvetica.woff", fontWeight: "normal" },
    { src: "https://fonts.cdnfonts.com/s/29136/Helvetica-Bold.woff", fontWeight: "bold" },
  ],
});

// Deposit percentages for advance payment
const DEPOSIT_PERCENTAGES = [5, 10, 15, 30, 45, 50, 60, 100];

interface QuotePDFProps {
  quote: Quote;
  items: QuoteItem[];
  profile: Profile | null;
  depositPercent?: number;
  density?: PDFDensity;
  branding?: Partial<PDFBranding>;
  locale?: LocaleCode;
}

// Dynamic styles based on density and branding
const createStyles = (density: PDFDensity, branding: PDFBranding) => {
  const config = getDensityConfig(density);

  return StyleSheet.create({
    page: {
      padding: config.pageMargin,
      fontSize: config.bodySize,
      fontFamily: branding.fontFamily === 'helvetica' ? 'Helvetica' : branding.fontFamily,
      color: branding.textColor,
    },
    header: {
      flexDirection: "row",
      justifyContent: branding.logoPosition === 'left' ? "space-between" : "flex-end",
      marginBottom: config.sectionSpacing,
    },
    logo: {
      width: branding.logoSize === 'small' ? 60 : branding.logoSize === 'large' ? 100 : 80,
      height: branding.logoSize === 'small' ? 60 : branding.logoSize === 'large' ? 100 : 80,
      objectFit: "contain",
    },
    companyInfo: {
      textAlign: branding.logoPosition === 'left' ? "right" : "left",
    },
    companyName: {
      fontSize: config.headerSize + 4,
      fontWeight: "bold",
      marginBottom: 4,
      color: branding.primaryColor,
    },
    companyDetail: {
      fontSize: config.smallSize,
      color: branding.mutedColor,
      marginBottom: 2,
    },
    title: {
      fontSize: config.titleSize,
      fontWeight: "bold",
      color: branding.primaryColor,
      marginBottom: config.sectionSpacing,
      textAlign: "center",
    },
    quoteInfo: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: config.sectionSpacing,
      backgroundColor: "#f8fafc",
      padding: density === 'compact' ? 10 : 15,
      borderRadius: 4,
    },
    infoBlock: {
      flex: 1,
    },
    infoLabel: {
      fontSize: config.smallSize - 1,
      color: branding.mutedColor,
      marginBottom: 2,
      textTransform: "uppercase",
    },
    infoValue: {
      fontSize: config.bodySize + 1,
      fontWeight: "bold",
    },
    section: {
      marginBottom: config.sectionSpacing,
    },
    sectionTitle: {
      fontSize: config.headerSize,
      fontWeight: "bold",
      marginBottom: config.itemSpacing + 2,
      color: branding.textColor,
      borderBottomWidth: 1,
      borderBottomColor: "#e2e8f0",
      paddingBottom: 5,
    },
    clientInfo: {
      fontSize: config.bodySize,
      lineHeight: 1.5,
    },
    table: {
      marginTop: config.itemSpacing,
    },
    tableHeader: {
      flexDirection: "row",
      backgroundColor: branding.primaryColor,
      color: "#ffffff",
      padding: config.tablePadding,
      fontWeight: "bold",
      fontSize: config.smallSize,
    },
    tableRow: {
      flexDirection: "row",
      borderBottomWidth: config.showTableBorders ? 1 : 0,
      borderBottomColor: "#e2e8f0",
      padding: config.tablePadding,
      fontSize: config.smallSize,
    },
    tableRowAlt: {
      backgroundColor: config.alternateRowColors ? "#f8fafc" : "transparent",
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
      marginTop: config.sectionSpacing,
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
      color: branding.mutedColor,
    },
    totalValue: {
      width: 80,
      textAlign: "right",
      fontWeight: "bold",
    },
    grandTotal: {
      borderTopWidth: 2,
      borderTopColor: branding.primaryColor,
      paddingTop: 8,
      marginTop: 8,
    },
    grandTotalLabel: {
      fontSize: config.headerSize,
      fontWeight: "bold",
      color: branding.textColor,
    },
    grandTotalValue: {
      fontSize: config.headerSize + 2,
      fontWeight: "bold",
      color: branding.primaryColor,
    },
    notes: {
      marginTop: config.sectionSpacing,
      padding: density === 'compact' ? 10 : 15,
      backgroundColor: "#fffbeb",
      borderRadius: 4,
      borderLeftWidth: 3,
      borderLeftColor: "#f59e0b",
    },
    notesTitle: {
      fontSize: config.bodySize,
      fontWeight: "bold",
      marginBottom: 5,
      color: "#92400e",
    },
    notesText: {
      fontSize: config.smallSize,
      color: "#78350f",
      lineHeight: 1.5,
    },
    footer: {
      position: "absolute",
      bottom: 30,
      left: config.pageMargin,
      right: config.pageMargin,
      borderTopWidth: 1,
      borderTopColor: "#e2e8f0",
      paddingTop: 10,
    },
    legalText: {
      fontSize: density === 'compact' ? 6 : 7,
      color: branding.mutedColor,
      textAlign: "center",
      lineHeight: 1.4,
    },
    validityBadge: {
      backgroundColor: "#dcfce7",
      color: "#166534",
      padding: "4 8",
      borderRadius: 4,
      fontSize: config.smallSize - 1,
      alignSelf: "flex-start",
      marginTop: 4,
    },
    signatureBlock: {
      marginTop: config.sectionSpacing,
      padding: 15,
      borderWidth: 1,
      borderColor: "#e2e8f0",
      borderRadius: 4,
    },
    signatureTitle: {
      fontSize: config.bodySize,
      fontWeight: "bold",
      marginBottom: 10,
    },
    signatureLine: {
      marginTop: 40,
      borderTopWidth: 1,
      borderTopColor: "#94a3b8",
      width: 200,
    },
    signatureLabel: {
      fontSize: config.smallSize,
      color: branding.mutedColor,
      marginTop: 5,
    },
    watermark: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%) rotate(-45deg)",
      fontSize: 60,
      color: branding.mutedColor,
      opacity: branding.watermarkOpacity || 0.1,
    },
  });
};

// PDF Document Component
const QuotePDFDocument = ({
  quote,
  items,
  profile,
  depositPercent = 0,
  density = "normal",
  branding = DEFAULT_BRANDING,
  locale = "fr-BE",
}: QuotePDFProps) => {
  const finalBranding = { ...DEFAULT_BRANDING, ...branding };
  const styles = createStyles(density, finalBranding);
  const config = getDensityConfig(density);
  const localePack = getLocalePack(locale);

  const depositAmount = depositPercent > 0 ? (quote.total * depositPercent) / 100 : 0;
  const remainingAmount = quote.total - depositAmount;

  // Format currency according to locale
  const formatAmount = (amount: number) => formatLocaleCurrency(amount, localePack);

  // Generate legal mentions based on locale
  const legalMentions = config.showLegalMentions
    ? generateLegalMentions(locale, {
        includeDataProtection: density !== 'compact',
        includeInsurance: density === 'detailed',
      })
    : "";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        {finalBranding.showWatermark && finalBranding.watermarkText && (
          <Text style={styles.watermark}>{finalBranding.watermarkText}</Text>
        )}

        {/* Header */}
        {config.showCompanyLogo && (
          <View style={styles.header}>
            <View>
              {profile?.logo_url && finalBranding.logoPosition === 'left' && (
                <Image src={profile.logo_url} style={styles.logo} />
              )}
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {profile?.company_name || "Mon Entreprise"}
              </Text>
              {profile?.address && (
                <Text style={styles.companyDetail}>{profile.address}</Text>
              )}
              {(profile?.postal_code || profile?.city) && (
                <Text style={styles.companyDetail}>
                  {profile.postal_code} {profile.city}
                </Text>
              )}
              {profile?.phone && (
                <Text style={styles.companyDetail}>Tél: {profile.phone}</Text>
              )}
              {profile?.email && (
                <Text style={styles.companyDetail}>{profile.email}</Text>
              )}
              {profile?.siret && (
                <Text style={styles.companyDetail}>
                  {localePack.vocabulary.vatNumber}: {profile.siret}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Title */}
        <Text style={styles.title}>{localePack.vocabulary.quote.toUpperCase()}</Text>

        {/* Quote Info */}
        {config.showQuoteDetails && (
          <View style={styles.quoteInfo}>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Numéro</Text>
              <Text style={styles.infoValue}>{quote.quote_number}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDateWithLocale(quote.created_at, locale)}</Text>
            </View>
            <View style={styles.infoBlock}>
              <Text style={styles.infoLabel}>Secteur</Text>
              <Text style={styles.infoValue}>
                {SECTORS[quote.sector as SectorType]}
              </Text>
            </View>
            {quote.valid_until && (
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>{localePack.vocabulary.validity}</Text>
                <Text style={styles.infoValue}>{formatDateWithLocale(quote.valid_until, locale)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Client */}
        {config.showClientDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{localePack.vocabulary.client.toUpperCase()}</Text>
            <View style={styles.clientInfo}>
              <Text style={{ fontWeight: "bold", marginBottom: 4 }}>
                {quote.client_name}
              </Text>
              {quote.client_address && <Text>{quote.client_address}</Text>}
              {(quote.client_postal_code || quote.client_city) && (
                <Text>
                  {quote.client_postal_code} {quote.client_city}
                </Text>
              )}
              {quote.client_email && <Text>{quote.client_email}</Text>}
              {quote.client_phone && <Text>Tél: {quote.client_phone}</Text>}
            </View>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRESTATIONS</Text>
          <View style={styles.table}>
            {/* Header */}
            <View style={styles.tableHeader}>
              {config.showItemNumbers && <Text style={{ width: 25 }}>#</Text>}
              <Text style={styles.colDescription}>Description</Text>
              <Text style={styles.colQuantity}>Qté</Text>
              <Text style={styles.colUnit}>Unité</Text>
              {config.showUnitPrices && (
                <Text style={styles.colPrice}>P.U. HT</Text>
              )}
              <Text style={styles.colTotal}>Total HT</Text>
            </View>
            {/* Rows */}
            {items.map((item, index) => (
              <View
                key={item.id}
                style={[styles.tableRow, index % 2 === 1 ? styles.tableRowAlt : {}]}
              >
                {config.showItemNumbers && (
                  <Text style={{ width: 25 }}>{index + 1}</Text>
                )}
                <Text style={styles.colDescription}>
                  {config.maxDescriptionLength && item.description.length > config.maxDescriptionLength
                    ? item.description.substring(0, config.maxDescriptionLength) + "..."
                    : item.description}
                </Text>
                <Text style={styles.colQuantity}>{item.quantity}</Text>
                <Text style={styles.colUnit}>{item.unit}</Text>
                {config.showUnitPrices && (
                  <Text style={styles.colPrice}>{formatAmount(item.unit_price)}</Text>
                )}
                <Text style={styles.colTotal}>
                  {formatAmount(item.quantity * item.unit_price)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Totals */}
        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{localePack.vocabulary.subtotal}</Text>
            <Text style={styles.totalValue}>{formatAmount(quote.subtotal)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{localePack.vocabulary.vat} ({quote.tax_rate}%)</Text>
            <Text style={styles.totalValue}>{formatAmount(quote.tax_amount)}</Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={[styles.totalLabel, styles.grandTotalLabel]}>
              {localePack.vocabulary.total}
            </Text>
            <Text style={[styles.totalValue, styles.grandTotalValue]}>
              {formatAmount(quote.total)}
            </Text>
          </View>
          {depositPercent > 0 && (
            <>
              <View style={[styles.totalRow, { marginTop: 10 }]}>
                <Text style={[styles.totalLabel, { color: '#059669' }]}>
                  {localePack.vocabulary.deposit} ({depositPercent}%)
                </Text>
                <Text style={[styles.totalValue, { color: '#059669' }]}>
                  {formatAmount(depositAmount)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>{localePack.vocabulary.balance}</Text>
                <Text style={styles.totalValue}>{formatAmount(remainingAmount)}</Text>
              </View>
            </>
          )}
        </View>

        {/* Notes */}
        {config.showNotes && quote.notes && (
          <View style={styles.notes}>
            <Text style={styles.notesTitle}>{localePack.vocabulary.conditions}</Text>
            <Text style={styles.notesText}>{quote.notes}</Text>
          </View>
        )}

        {/* Signature Block */}
        {config.showSignatureBlock && (
          <View style={styles.signatureBlock}>
            <Text style={styles.signatureTitle}>Bon pour accord</Text>
            <Text style={{ fontSize: 8, color: '#64748b', marginBottom: 20 }}>
              Je soussigné(e), {quote.client_name}, déclare accepter le présent devis.
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View>
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Date et signature du client</Text>
              </View>
              <View>
                <Text style={{ fontSize: 8, color: '#64748b' }}>
                  Mention "Lu et approuvé"
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {config.showLegalMentions && (
            <Text style={styles.legalText}>
              {legalMentions || profile?.legal_mentions || localePack.legal.paymentTerms}
            </Text>
          )}
          {config.showBankingInfo && profile?.iban && (
            <Text style={[styles.legalText, { marginTop: 4 }]}>
              IBAN: {profile.iban} {profile.bic ? `- BIC: ${profile.bic}` : ""} {profile.bank_name ? `(${profile.bank_name})` : ""}
            </Text>
          )}
          {finalBranding.showPageNumbers && (
            <Text style={[styles.legalText, { marginTop: 4 }]}>
              Page 1/1
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
};

// Preview Component
export function QuotePDFPreview({ quote, items, profile }: Omit<QuotePDFProps, 'density' | 'branding' | 'locale'>) {
  const [isClient, setIsClient] = useState(false);
  const [depositPercent, setDepositPercent] = useState(0);
  const [showPDFViewer, setShowPDFViewer] = useState(false);

  // New adaptive settings - use quote's stored locale or fallback to fr-BE
  const [locale, setLocale] = useState<LocaleCode>(() => getQuoteLocale(quote.locale));
  const [density, setDensity] = useState<PDFDensity>(() => suggestDensity(items.length));
  const [branding, setBranding] = useState<Partial<PDFBranding>>({});
  const [showSettings, setShowSettings] = useState(false);

  // Only render PDF on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-suggest density when items change
  useEffect(() => {
    setDensity(suggestDensity(items.length));
  }, [items.length]);

  const depositAmount = depositPercent > 0 ? (quote.total * depositPercent) / 100 : 0;
  const localePack = getLocalePack(locale);
  const allLocales = getAllLocalePacks();

  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const fileName = `${quote.quote_number}-${quote.client_name.replace(/\s+/g, "-")}.pdf`;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/30 rounded-lg">
        {/* Locale Selector */}
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-muted-foreground" />
          <Select value={locale} onValueChange={(v) => setLocale(v as LocaleCode)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allLocales.map((pack) => (
                <SelectItem key={pack.code} value={pack.code}>
                  <span className="flex items-center gap-2">
                    <span>{pack.flag}</span>
                    <span>{pack.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Density Selector */}
        <div className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-muted-foreground" />
          <Select value={density} onValueChange={(v) => setDensity(v as PDFDensity)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">
                <span className="flex items-center gap-2">
                  Compact
                  <Badge variant="secondary" className="text-xs">Court</Badge>
                </span>
              </SelectItem>
              <SelectItem value="normal">
                <span className="flex items-center gap-2">
                  Normal
                  <Badge variant="secondary" className="text-xs">Standard</Badge>
                </span>
              </SelectItem>
              <SelectItem value="detailed">
                <span className="flex items-center gap-2">
                  Détaillé
                  <Badge variant="secondary" className="text-xs">Complet</Badge>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Deposit Calculator */}
        <div className="flex items-center gap-2">
          <Calculator className="h-4 w-4 text-muted-foreground" />
          <Label className="text-sm">{localePack.vocabulary.deposit}:</Label>
          <Select
            value={depositPercent.toString()}
            onValueChange={(value) => setDepositPercent(parseInt(value))}
          >
            <SelectTrigger className="w-28">
              <SelectValue placeholder="0%" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Aucun</SelectItem>
              {DEPOSIT_PERCENTAGES.map((percent) => (
                <SelectItem key={percent} value={percent.toString()}>
                  {percent}%
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {depositPercent > 0 && (
            <span className="text-sm font-medium text-accent">
              = {formatLocaleCurrency(depositAmount, localePack)}
            </span>
          )}
        </div>

        {/* Advanced Settings */}
        <Popover open={showSettings} onOpenChange={setShowSettings}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings2 className="h-4 w-4" />
              Options
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-4">
              <h4 className="font-medium">Options du PDF</h4>

              {/* Branding Color */}
              <div className="space-y-2">
                <Label className="text-xs">Couleur principale</Label>
                <div className="flex gap-2">
                  {['#2563eb', '#059669', '#dc2626', '#7c3aed', '#ea580c', '#0891b2'].map((color) => (
                    <button
                      key={color}
                      className="w-6 h-6 rounded-full border-2 transition-all"
                      style={{
                        backgroundColor: color,
                        borderColor: branding.primaryColor === color ? '#000' : 'transparent',
                      }}
                      onClick={() => setBranding({ ...branding, primaryColor: color })}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Logo Position */}
              <div className="space-y-2">
                <Label className="text-xs">Position du logo</Label>
                <Select
                  value={branding.logoPosition || 'left'}
                  onValueChange={(v) => setBranding({ ...branding, logoPosition: v as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="left">Gauche</SelectItem>
                    <SelectItem value="right">Droite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Show Watermark */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">Filigrane "DEVIS"</Label>
                <Switch
                  checked={branding.showWatermark || false}
                  onCheckedChange={(v) => setBranding({
                    ...branding,
                    showWatermark: v,
                    watermarkText: 'DEVIS',
                    watermarkOpacity: 0.05,
                  })}
                />
              </div>

              {/* Page Numbers */}
              <div className="flex items-center justify-between">
                <Label className="text-xs">Numéros de page</Label>
                <Switch
                  checked={branding.showPageNumbers !== false}
                  onCheckedChange={(v) => setBranding({ ...branding, showPageNumbers: v })}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex-1" />

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPDFViewer(!showPDFViewer)}
          className="gap-2"
        >
          <Eye className="h-4 w-4" />
          {showPDFViewer ? "Aperçu simple" : "Aperçu PDF"}
        </Button>

        <PDFDownloadLink
          document={
            <QuotePDFDocument
              quote={quote}
              items={items}
              profile={profile}
              depositPercent={depositPercent}
              density={density}
              branding={branding}
              locale={locale}
            />
          }
          fileName={fileName}
        >
          {({ loading }) => (
            <Button disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Télécharger PDF
            </Button>
          )}
        </PDFDownloadLink>
      </div>

      {/* PDF Viewer or Simple Preview */}
      {showPDFViewer ? (
        <div className="border rounded-lg overflow-hidden bg-gray-100" style={{ height: "800px" }}>
          <PDFViewer width="100%" height="100%" showToolbar={false}>
            <QuotePDFDocument
              quote={quote}
              items={items}
              profile={profile}
              depositPercent={depositPercent}
              density={density}
              branding={branding}
              locale={locale}
            />
          </PDFViewer>
        </div>
      ) : (
        <QuoteHTMLPreview
          quote={quote}
          items={items}
          profile={profile}
          depositPercent={depositPercent}
          density={density}
          branding={{ ...DEFAULT_BRANDING, ...branding }}
          locale={locale}
        />
      )}
    </div>
  );
}

// HTML Preview Component (simplified)
function QuoteHTMLPreview({
  quote,
  items,
  profile,
  depositPercent = 0,
  density,
  branding,
  locale,
}: QuotePDFProps & { branding: PDFBranding }) {
  const config = getDensityConfig(density || 'normal');
  const localePack = getLocalePack(locale || 'fr-BE');
  const depositAmount = depositPercent > 0 ? (quote.total * depositPercent) / 100 : 0;
  const remainingAmount = quote.total - depositAmount;

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <div className="aspect-[210/297] bg-white overflow-auto">
        <div className="p-8 text-sm text-gray-900" style={{ fontSize: config.bodySize }}>
          {/* Header */}
          {config.showCompanyLogo && (
            <div className="flex justify-between mb-8">
              <div>
                {profile?.logo_url && branding.logoPosition === 'left' && (
                  <img
                    src={profile.logo_url}
                    alt="Logo"
                    className="h-16 w-16 object-contain"
                  />
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-lg" style={{ color: branding.primaryColor }}>
                  {profile?.company_name || "Mon Entreprise"}
                </p>
                {profile?.address && <p className="text-gray-500 text-xs">{profile.address}</p>}
                {(profile?.postal_code || profile?.city) && (
                  <p className="text-gray-500 text-xs">{profile.postal_code} {profile.city}</p>
                )}
                {profile?.phone && <p className="text-gray-500 text-xs">Tél: {profile.phone}</p>}
                {profile?.email && <p className="text-gray-500 text-xs">{profile.email}</p>}
                {profile?.siret && (
                  <p className="text-gray-500 text-xs">
                    {localePack.vocabulary.vatNumber}: {profile.siret}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Watermark */}
          {branding.showWatermark && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ opacity: branding.watermarkOpacity || 0.05 }}
            >
              <span
                className="text-7xl font-bold text-gray-500 -rotate-45"
              >
                {branding.watermarkText || 'DEVIS'}
              </span>
            </div>
          )}

          {/* Title */}
          <h1
            className="text-2xl font-bold text-center mb-6"
            style={{ color: branding.primaryColor }}
          >
            {localePack.vocabulary.quote.toUpperCase()}
          </h1>

          {/* Quote Info */}
          {config.showQuoteDetails && (
            <div className="flex justify-between mb-6 bg-gray-50 p-4 rounded">
              <div>
                <p className="text-xs text-gray-500 uppercase">Numéro</p>
                <p className="font-bold text-gray-900">{quote.quote_number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Date</p>
                <p className="font-bold text-gray-900">{formatDateWithLocale(quote.created_at, locale || 'fr-BE')}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Secteur</p>
                <p className="font-bold text-gray-900">{SECTORS[quote.sector as SectorType]}</p>
              </div>
              {quote.valid_until && (
                <div>
                  <p className="text-xs text-gray-500 uppercase">{localePack.vocabulary.validity}</p>
                  <p className="font-bold text-gray-900">{formatDateWithLocale(quote.valid_until, locale || 'fr-BE')}</p>
                </div>
              )}
            </div>
          )}

          {/* Client */}
          {config.showClientDetails && (
            <div className="mb-6">
              <h2 className="font-bold border-b border-gray-200 pb-2 mb-2 text-gray-900">
                {localePack.vocabulary.client.toUpperCase()}
              </h2>
              <p className="font-semibold text-gray-900">{quote.client_name}</p>
              {quote.client_address && <p className="text-gray-600">{quote.client_address}</p>}
              {(quote.client_postal_code || quote.client_city) && (
                <p className="text-gray-600">{quote.client_postal_code} {quote.client_city}</p>
              )}
              {quote.client_email && <p className="text-gray-600">{quote.client_email}</p>}
              {quote.client_phone && <p className="text-gray-600">Tél: {quote.client_phone}</p>}
            </div>
          )}

          {/* Items */}
          <div className="mb-6">
            <h2 className="font-bold border-b border-gray-200 pb-2 mb-2 text-gray-900">PRESTATIONS</h2>
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune ligne de prestation</p>
              </div>
            ) : (
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ backgroundColor: branding.primaryColor }} className="text-white">
                    {config.showItemNumbers && <th className="p-2 text-left w-8">#</th>}
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-center w-16">Qté</th>
                    <th className="p-2 text-center w-20">Unité</th>
                    {config.showUnitPrices && <th className="p-2 text-right w-24">P.U. HT</th>}
                    <th className="p-2 text-right w-24">Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr
                      key={item.id}
                      className={config.alternateRowColors && index % 2 === 1 ? "bg-gray-50" : "bg-white"}
                    >
                      {config.showItemNumbers && <td className="p-2 text-gray-500">{index + 1}</td>}
                      <td className="p-2 text-gray-900">
                        {item.description || <span className="text-gray-400 italic">Sans description</span>}
                      </td>
                      <td className="p-2 text-center text-gray-900">{item.quantity}</td>
                      <td className="p-2 text-center text-gray-900">{item.unit}</td>
                      {config.showUnitPrices && (
                        <td className="p-2 text-right text-gray-900">{formatLocaleCurrency(item.unit_price, localePack)}</td>
                      )}
                      <td className="p-2 text-right font-medium text-gray-900">
                        {formatLocaleCurrency(item.quantity * item.unit_price, localePack)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">{localePack.vocabulary.subtotal}</span>
                <span className="font-medium text-gray-900">{formatLocaleCurrency(quote.subtotal, localePack)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">{localePack.vocabulary.vat} ({quote.tax_rate}%)</span>
                <span className="font-medium text-gray-900">{formatLocaleCurrency(quote.tax_amount, localePack)}</span>
              </div>
              <div
                className="flex justify-between py-2 border-t-2 mt-2"
                style={{ borderColor: branding.primaryColor }}
              >
                <span className="font-bold text-gray-900">{localePack.vocabulary.total}</span>
                <span className="font-bold text-lg" style={{ color: branding.primaryColor }}>
                  {formatLocaleCurrency(quote.total, localePack)}
                </span>
              </div>
              {depositPercent > 0 && (
                <>
                  <div className="flex justify-between py-1 mt-3 pt-3 border-t border-gray-200">
                    <span className="text-emerald-600 font-medium">
                      {localePack.vocabulary.deposit} ({depositPercent}%)
                    </span>
                    <span className="font-bold text-emerald-600">{formatLocaleCurrency(depositAmount, localePack)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-gray-500">{localePack.vocabulary.balance}</span>
                    <span className="font-medium text-gray-900">{formatLocaleCurrency(remainingAmount, localePack)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {config.showNotes && quote.notes && (
            <div className="mt-6 p-4 bg-amber-50 border-l-4 border-amber-400 rounded">
              <p className="font-bold text-amber-800 text-xs mb-1">{localePack.vocabulary.conditions}</p>
              <p className="text-amber-700 text-xs whitespace-pre-wrap">{quote.notes}</p>
            </div>
          )}

          {/* Signature Block */}
          {config.showSignatureBlock && (
            <div className="mt-6 p-4 border border-gray-200 rounded">
              <p className="font-bold text-sm mb-2">Bon pour accord</p>
              <p className="text-xs text-gray-500 mb-8">
                Je soussigné(e), {quote.client_name}, déclare accepter le présent devis.
              </p>
              <div className="flex justify-between">
                <div>
                  <div className="w-48 border-t border-gray-400 mt-10" />
                  <p className="text-xs text-gray-500 mt-1">Date et signature du client</p>
                </div>
                <p className="text-xs text-gray-500">Mention "Lu et approuvé"</p>
              </div>
            </div>
          )}

          {/* Banking Info */}
          {config.showBankingInfo && profile?.iban && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
              <p>IBAN: {profile.iban} {profile.bic ? `- BIC: ${profile.bic}` : ""}</p>
              {profile.bank_name && <p>{profile.bank_name}</p>}
            </div>
          )}

          {/* Legal */}
          {config.showLegalMentions && (
            <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400 text-center">
              <p>{profile?.legal_mentions || localePack.legal.paymentTerms}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
