# DEAL - Catalogue API (26 Routes)

## Vue d'Ensemble

| Catégorie | Routes | Description |
|-----------|--------|-------------|
| Génération IA | 2 | Création devis + Assistant |
| Stripe | 3 | Checkout, Portal, Webhook |
| Devis (v1) | 5 | CRUD API publique |
| RGPD | 4 | Export, Delete, Consent |
| Leads | 2 | Gestion prospects |
| Parrainage | 3 | Invitations, Stats |
| Admin | 1 | Statistiques plateforme |
| Autres | 6 | Tokens, Workflows, HITL, etc. |

---

## 1. GÉNÉRATION IA

### POST /api/generate

**Génération de devis par IA (Anthropic Claude)**

```typescript
// Requête
{
  "transcription": string,  // Texte à analyser (requis)
  "sector": string         // Secteur d'activité (optionnel)
}

// Réponse
{
  "sector": string,
  "client": {
    "name": string,
    "email": string | null,
    "address": string | null,
    "phone": string | null,
    "city": string | null,
    "postalCode": string | null
  },
  "items": [{
    "description": string,
    "quantity": number,
    "unit": string,
    "unitPrice": number
  }],
  "notes": string | null
}
```

**Auth**: Bearer Token (Supabase)

---

### POST /api/ai-assistant

**Assistant IA multi-actions**

```typescript
// Requête
{
  "action": "audit" | "optimize" | "email" | "materials" | "planning" | "improve" | "suggest",
  "quoteId": string
}

// Réponse
{
  "result": string,      // Texte ou tableau formaté
  "cached": boolean,     // Résultat depuis cache?
  "cacheEnabled": boolean
}
```

**Auth**: Bearer Token + Rate limit (5 req/min)

| Action | Description |
|--------|-------------|
| `audit` | Analyse tarifs et cohérence |
| `optimize` | Suggestions optimisation |
| `email` | Rédaction email commercial |
| `materials` | Estimation matériaux |
| `planning` | Estimation temps travail |
| `improve` | Amélioration descriptions |
| `suggest` | Prestations complémentaires |

---

## 2. STRIPE

### POST /api/stripe/checkout

**Création session checkout**

```typescript
// Requête
{
  "planName": "pro" | "business",
  "billingPeriod": "monthly" | "yearly"
}

// Réponse
{
  "url": "https://checkout.stripe.com/..."
}
```

---

### POST /api/stripe/portal

**Lien portail facturation**

```typescript
// Réponse
{
  "url": "https://billing.stripe.com/..."
}
```

---

### POST /api/stripe/webhook

**Webhooks Stripe (sécurisé par signature)**

Événements traités :
- `checkout.session.completed` → Activation abonnement
- `customer.subscription.updated` → Mise à jour
- `customer.subscription.deleted` → Annulation
- `invoice.payment_failed` → Échec paiement

---

## 3. API PUBLIQUE v1

### GET /api/v1/quotes

**Liste paginée des devis**

```typescript
// Query params
?page=1
&pageSize=20          // max 100
&status=draft|sent|accepted|rejected|finalized|exported|archived
&sector=ELECTRICITE
&search=client
&sortBy=created_at|updated_at|total|quote_number
&sortOrder=asc|desc

// Réponse
{
  "data": [Quote[]],
  "pagination": {
    "page": number,
    "pageSize": number,
    "total": number,
    "hasMore": boolean
  }
}
```

**Auth**: API Key avec scope `quotes:read`

---

### POST /api/v1/quotes

**Créer un devis**

```typescript
// Requête
{
  "client_name": string,      // requis
  "client_email": string,
  "client_phone": string,
  "client_address": string,
  "client_city": string,
  "client_postal_code": string,
  "sector": string,           // requis
  "title": string,
  "notes": string,
  "valid_until": string,      // ISO datetime
  "tax_rate": number,         // 0-100, défaut 21
  "items": [{
    "description": string,
    "quantity": number,
    "unit": string,
    "unit_price": number
  }]
}
```

**Auth**: API Key avec scope `quotes:write`

---

### GET /api/v1/quotes/[id]

**Détail d'un devis**

**Auth**: API Key avec scope `quotes:read`

---

### PATCH /api/v1/quotes/[id]

**Mise à jour d'un devis**

**Restrictions**: Impossible si `finalized`, `exported` ou `archived`

**Auth**: API Key avec scope `quotes:write`

---

### DELETE /api/v1/quotes/[id]

**Suppression d'un devis**

**Restrictions**: Impossible si `finalized` ou `exported`

**Auth**: API Key avec scope `quotes:delete`

---

## 4. RGPD

### GET /api/user/data-export

**Export données (Article 20)**

```typescript
// Réponse JSON téléchargeable
{
  "profile": Profile,
  "quotes": Quote[],
  "subscription": Subscription,
  "usage": UsageStats[],
  "audit_logs": AuditLog[]  // 1000 derniers
}
```

---

### DELETE /api/user/delete-account

**Suppression compte (Article 17)**

```typescript
// Requête
{
  "confirmation": "DELETE_MY_ACCOUNT",
  "password": string  // optionnel
}
```

Suppression en cascade : items → quotes → logs → usage → subscription → memberships → api_keys → profile → auth

---

### GET /api/gdpr/export

Alternative à `/user/data-export`

---

### DELETE /api/gdpr/delete

```typescript
// Requête
{
  "confirm": "DELETE_MY_ACCOUNT",
  "password": string,  // requis
  "reason": string     // optionnel
}
```

---

## 5. LEADS

### GET /api/leads

```typescript
?status=new|contacted|qualified|converted|lost
&source=widget|manual|import|api
&limit=50
&offset=0
```

---

### POST /api/leads

```typescript
{
  "name": string,       // requis
  "email": string,
  "phone": string,
  "address": string,
  "work_type": string,
  "description": string,
  "notes": string
}
```

---

### POST /api/widget/quote-request

**Widget public (CORS autorisé)**

```typescript
// Header
X-API-Key: deal_xxxxx

// Requête
{
  "name": string,
  "email": string,
  "phone": string,
  "address": string,
  "company": string,
  "description": string,
  "workType": string,
  "humanVerification": string,  // Anti-bot
  "timestamp": string
}
```

---

## 6. PARRAINAGE

### GET /api/referral

Liste des parrainages de l'utilisateur

---

### POST /api/referral/invite

```typescript
{
  "email": string  // Email destinataire
}
```

---

### GET /api/referral/stats

```typescript
// Réponse
{
  "totalReferrals": number,
  "pendingReferrals": number,
  "convertedReferrals": number,
  "totalEarnings": number,
  "ambassadorLevel": "bronze" | "silver" | "gold" | "platinum",
  "referralCode": string
}
```

---

## 7. ADMIN

### GET /api/admin/stats

**Statistiques plateforme**

```typescript
// Réponse
{
  "totalUsers": number,
  "activeUsers": number,        // 30 jours
  "totalQuotes": number,
  "totalRevenue": number,
  "proSubscriptions": number,
  "businessSubscriptions": number,
  "enterpriseSubscriptions": number,
  "freeUsers": number,
  "recentSignups": number,      // 7 jours
  "mrr": number,
  "arr": number
}
```

**Auth**: Rôle admin/super_admin requis

---

## 8. AUTRES

### GET/POST /api/tokens

**Gestion TokenDEAL**

```typescript
// GET - Solde et historique
{
  "balance": number,
  "transactions": [{
    "id": string,
    "amount": number,
    "type": "earn" | "spend",
    "source": string,
    "created_at": string
  }]
}

// POST - Transaction
{
  "amount": number,      // positif=gain, négatif=dépense
  "type": "earn" | "spend",
  "source": string,
  "description": string,
  "reference_id": string
}
```

---

### GET/POST/PATCH/DELETE /api/workflows

**Automatisation**

---

### GET/POST /api/hitl

**Human-in-the-loop**

```typescript
// POST - Décision
{
  "requestId": string,
  "action": "approve" | "reject",
  "reason": string       // Requis pour reject
}
```

---

### GET/POST/DELETE /api/api-keys

**Gestion clés API**

```typescript
// POST - Créer clé
{
  "name": string,                    // requis
  "permissions": string[],           // scopes
  "rate_limit_per_hour": number,     // défaut 100
  "expires_in_days": number          // optionnel
}

// Réponse (clé visible UNE SEULE FOIS)
{
  "id": string,
  "key": "deal_xxxxxxxxxxxx",
  "warning": "Store this key securely..."
}
```

---

### POST /api/analytics/vitals

**Collection Web Vitals (Edge Runtime)**

```typescript
{
  "id": string,
  "name": "LCP" | "FID" | "CLS" | "TTFB",
  "value": number,
  "rating": "good" | "needs-improvement" | "poor",
  "delta": number,
  "navigationType": string,
  "url": string,
  "timestamp": number,
  "userAgent": string,
  "connection": string
}
```

**Auth**: Aucune (public, non-bloquant)

---

## Codes de Réponse

| Code | Description |
|------|-------------|
| 200 | Succès |
| 201 | Créé |
| 400 | Requête invalide |
| 401 | Non authentifié |
| 403 | Non autorisé |
| 404 | Non trouvé |
| 429 | Rate limit dépassé |
| 500 | Erreur serveur |

---

## Headers Rate Limiting

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1706300400
```

---

*Documentation générée par BMAD Document-Project Workflow - 26/01/2026*
