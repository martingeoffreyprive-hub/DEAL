# DEAL - Modules Métier

## Vue d'Ensemble

| Module | Fichiers | Description |
|--------|----------|-------------|
| legal-risk | 4 | Détection risques juridiques |
| locale-packs | 5 | Multi-localisation BE/FR/CH |
| pdf | 4 | Génération PDF + QR EPC |
| ai | 2 | Cache IA Redis |
| rgpd | 4 | Conformité RGPD |
| integrations | 4 | DocuSign, HubSpot, QuickBooks |
| workflow | 1 | Automatisation |
| pricing | 1 | Stratégies de pricing |
| referral | 2 | Système de parrainage |
| suppliers | 2 | Base fournisseurs |
| invoices | 1 | Génération factures |
| templates | 1 | Templates personnalisés |

**Total: 47 fichiers dans src/lib/**

---

## 1. Legal Risk Engine

**Chemin:** `src/lib/legal-risk/`

Moteur de détection silencieuse des risques juridiques dans les devis.

### Fichiers

| Fichier | Description |
|---------|-------------|
| `engine.ts` | Moteur d'analyse principal |
| `patterns.ts` | Patterns de détection |
| `types.ts` | Types TypeScript |
| `index.ts` | Exports publics |

### API

```typescript
import { analyzeLegalRisk, RiskLevel, RiskCategory } from '@/lib/legal-risk';

const analysis = analyzeLegalRisk({
  items: quoteItems,
  sector: 'ELECTRICITE',
  locale: 'fr-BE'
});

// Retourne
{
  level: 'medium',        // 'low' | 'medium' | 'high' | 'critical'
  score: 45,              // 0-100
  risks: [
    {
      category: 'compliance',
      message: 'Certification RGIE recommandée',
      severity: 'warning',
      suggestion: 'Ajoutez la certification...'
    }
  ]
}
```

### Catégories de Risques

| Catégorie | Description |
|-----------|-------------|
| `compliance` | Conformité réglementaire |
| `pricing` | Prix anormaux |
| `liability` | Responsabilité civile |
| `warranty` | Garanties manquantes |
| `insurance` | Assurances requises |

---

## 2. Locale Packs

**Chemin:** `src/lib/locale-packs/`

Système de multi-localisation pour Belgique, France et Suisse.

### Fichiers

| Fichier | Description |
|---------|-------------|
| `fr-be.ts` | Pack Belgique |
| `fr-fr.ts` | Pack France |
| `fr-ch.ts` | Pack Suisse |
| `types.ts` | Types communs |
| `index.ts` | Exports + helpers |

### API

```typescript
import { getLocalePack, formatCurrency, LocaleCode } from '@/lib/locale-packs';

const pack = getLocalePack('fr-BE');

// Formatage monétaire
formatCurrency(1250.50, 'fr-BE'); // "1.250,50 €"
formatCurrency(1250.50, 'fr-CH'); // "CHF 1'250.50"

// TVA par défaut
pack.defaultTaxRate; // 21 (BE), 20 (FR), 8.1 (CH)

// Mentions légales
pack.legalMentions; // Mentions spécifiques au pays
```

### Configuration par Locale

| Locale | Devise | TVA | Format nombres |
|--------|--------|-----|----------------|
| `fr-BE` | EUR (€) | 21% | 1.234,56 |
| `fr-FR` | EUR (€) | 20% | 1 234,56 |
| `fr-CH` | CHF | 8.1% | 1'234.56 |

---

## 3. PDF Generation

**Chemin:** `src/lib/pdf/`

Génération PDF avec cache LRU et QR Code EPC SEPA.

### Fichiers

| Fichier | Description |
|---------|-------------|
| `index.ts` | Exports publics |
| `cache.ts` | Cache LRU 10MB |
| `epc-qr.ts` | QR Code EPC SEPA |
| `types.ts` | Types PDF |

### Cache PDF

```typescript
import { pdfCache } from '@/lib/pdf';

// Mise en cache
pdfCache.set(quoteId, pdfBlob);

// Récupération
const cached = pdfCache.get(quoteId);

// Stats
const stats = pdfCache.stats();
// { size: 5242880, hits: 150, misses: 30, hitRate: 0.83 }
```

Configuration:
- **Taille max:** 10 MB
- **TTL:** 30 minutes
- **Éviction:** LRU

### QR Code EPC

```typescript
import { generateEPCQRCode } from '@/lib/pdf/epc-qr';

const qrDataUrl = await generateEPCQRCode({
  iban: 'BE68539007547034',
  bic: 'BBRUBEBB',
  beneficiary: 'DEAL SRL',
  amount: 1250.50,
  reference: 'DEV-2026-0042'
});
```

Génère un QR Code conforme au standard EPC 009 pour paiements SEPA instantanés.

---

## 4. AI Cache

**Chemin:** `src/lib/ai/`

Cache Redis pour réponses IA via Upstash.

### API

```typescript
import { aiCache } from '@/lib/ai';

// Vérifier le cache
const cached = await aiCache.get(prompt, action);

// Stocker en cache
await aiCache.set(prompt, action, result, ttl);

// Stats
const stats = await aiCache.stats();
// { hits: 450, misses: 300, savings: '60%' }
```

Configuration:
- **TTL par action:**
  - `audit`: 2h
  - `optimize`: 1h
  - `email`: 30min
  - `materials`: 2h
  - `planning`: 1h

**Économie estimée:** 60% des tokens API.

---

## 5. RGPD Compliance

**Chemin:** `src/lib/rgpd/`

Modules de conformité RGPD complets.

### Fichiers

| Fichier | Description |
|---------|-------------|
| `encryption.ts` | Chiffrement AES-256-GCM |
| `consent.ts` | Gestion consentements |
| `data-retention.ts` | Rétention des données |
| `human-in-the-loop.ts` | Validation humaine |

### Encryption

```typescript
import { encrypt, decrypt } from '@/lib/rgpd/encryption';

// Chiffrement
const encrypted = encrypt(sensitiveData);

// Déchiffrement
const decrypted = decrypt(encrypted);
```

Utilise AES-256-GCM avec clé dérivée de `ENCRYPTION_KEY`.

### Consent Management

```typescript
import { recordConsent, checkConsent } from '@/lib/rgpd/consent';

// Enregistrer un consentement
await recordConsent(userId, {
  type: 'marketing',
  version: '2.0',
  granted: true
});

// Vérifier
const hasConsent = await checkConsent(userId, 'marketing');
```

### Human-in-the-Loop

```typescript
import { requestHumanApproval, HitlAction } from '@/lib/rgpd/human-in-the-loop';

// Demander approbation
const request = await requestHumanApproval({
  action: 'delete_account',
  userId,
  data: { reason: 'User request' }
});

// Traiter la décision
// POST /api/hitl { requestId, action: 'approve' | 'reject' }
```

Actions nécessitant approbation:
- Suppression de compte
- Export de données massif
- Modifications sensibles

---

## 6. Integrations

**Chemin:** `src/lib/integrations/`

Intégrations tierces (préparées, non activées).

### DocuSign

```typescript
import { docusign } from '@/lib/integrations/docusign';

// Envoyer pour signature
const envelope = await docusign.createEnvelope({
  document: pdfBuffer,
  signers: [{ email, name }]
});
```

### HubSpot

```typescript
import { hubspot } from '@/lib/integrations/hubspot';

// Sync contact
await hubspot.syncContact({
  email: client.email,
  properties: {
    quote_count: 5,
    total_value: 15000
  }
});
```

### QuickBooks

```typescript
import { quickbooks } from '@/lib/integrations/quickbooks';

// Créer facture
await quickbooks.createInvoice(quote);
```

---

## 7. Workflow Engine

**Chemin:** `src/lib/workflow/workflow-engine.ts`

Moteur d'automatisation pour workflows conditionnels.

```typescript
import { WorkflowEngine } from '@/lib/workflow/workflow-engine';

const workflow = new WorkflowEngine({
  trigger: 'quote.accepted',
  conditions: [
    { field: 'total', operator: '>', value: 1000 }
  ],
  actions: [
    { type: 'send_email', template: 'large_order_notification' },
    { type: 'create_invoice' },
    { type: 'notify_team', channel: 'slack' }
  ]
});

await workflow.execute(quote);
```

---

## 8. Pricing Strategy

**Chemin:** `src/lib/pricing/pricing-strategy.ts`

Stratégies de pricing dynamique.

```typescript
import { calculateOptimalPrice, PricingStrategy } from '@/lib/pricing/pricing-strategy';

const suggestion = calculateOptimalPrice({
  basePrice: 100,
  strategy: 'market_rate',
  sector: 'ELECTRICITE',
  region: 'Brussels'
});
```

Stratégies:
- `cost_plus`: Coût + marge
- `market_rate`: Prix du marché
- `value_based`: Basé sur la valeur
- `competitive`: Aligné concurrence

---

## 9. Referral System

**Chemin:** `src/lib/referral/`

Système de parrainage multi-niveaux.

### Niveaux Ambassadeur

| Niveau | Parrainages | Commission |
|--------|-------------|------------|
| Bronze | 0-4 | 10% |
| Silver | 5-14 | 15% |
| Gold | 15-29 | 20% |
| Platinum | 30+ | 25% |

```typescript
import { ReferralSystem } from '@/lib/referral/referral-system';

const system = new ReferralSystem(userId);

// Générer code
const code = await system.generateCode();

// Appliquer parrainage
await system.applyReferral(newUserId, code);

// Stats
const stats = await system.getStats();
// { level: 'gold', referrals: 18, earnings: 450 }
```

---

## 10. Supplier Database

**Chemin:** `src/lib/suppliers/`

Base de données fournisseurs pour estimations.

```typescript
import { supplierDB } from '@/lib/suppliers/supplier-database';

// Rechercher fournisseurs
const suppliers = await supplierDB.search({
  category: 'electrical',
  region: 'Brussels',
  minRating: 4
});

// Prix moyen matériau
const avgPrice = await supplierDB.getAveragePrice('cable_2.5mm', 'BE');
```

---

## 11. Invoice Generator

**Chemin:** `src/lib/invoices/invoice-generator.ts`

Conversion devis → facture.

```typescript
import { generateInvoice } from '@/lib/invoices/invoice-generator';

const invoice = await generateInvoice(quote, {
  paymentTerms: 30,
  bankDetails: profile.bankInfo
});
```

---

## 12. Template Editor

**Chemin:** `src/lib/templates/template-editor.ts`

Éditeur de templates de devis personnalisés.

```typescript
import { TemplateEditor } from '@/lib/templates/template-editor';

const editor = new TemplateEditor();

// Créer template
const template = await editor.create({
  name: 'Installation Standard',
  sector: 'ELECTRICITE',
  items: defaultItems
});

// Appliquer template
const quote = await editor.apply(template, clientData);
```

---

## Autres Modules

### Rate Limiter

```typescript
// src/lib/rate-limit.ts
import { rateLimit } from '@/lib/rate-limit';

const limiter = rateLimit({
  interval: 60000,
  uniqueTokenPerInterval: 500
});

await limiter.check(userId, 10); // 10 req/min
```

### Audit Logger

```typescript
// src/lib/audit.ts
import { auditLog } from '@/lib/audit';

await auditLog({
  userId,
  action: 'quote.create',
  resourceId: quote.id,
  metadata: { sector: quote.sector }
});
```

### RBAC

```typescript
// src/lib/rbac.ts
import { checkPermission, Role } from '@/lib/rbac';

const canEdit = checkPermission(user.role, 'quotes:write');
```

| Rôle | Permissions |
|------|------------|
| Viewer | `quotes:read` |
| Member | `quotes:read`, `quotes:write` |
| Admin | Tout sauf delete users |
| Owner | Tout |

### Performance Prefetch

```typescript
// src/lib/performance/prefetch.ts
import { prefetchRoutes } from '@/lib/performance/prefetch';

// Précharger routes probables
prefetchRoutes(['/quotes', '/dashboard']);
```

---

*Documentation générée par BMAD Document-Project Workflow - 26/01/2026*
