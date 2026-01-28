# Contrats API — DEAL Platform

> Documentation exhaustive des 47 endpoints API du projet DEAL.
> Derniere mise a jour : 28 janvier 2026

---

## Table des matieres

1. [AI / Generation](#1-ai--generation)
2. [Devis — API Publique v1](#2-devis--api-publique-v1)
3. [Devis — Interne](#3-devis--interne)
4. [Stripe / Facturation](#4-stripe--facturation)
5. [Factures](#5-factures)
6. [Workflows](#6-workflows)
7. [HITL (Human-in-the-Loop)](#7-hitl-human-in-the-loop)
8. [Widget](#8-widget)
9. [Parrainage](#9-parrainage)
10. [Tokens](#10-tokens)
11. [Cles API](#11-cles-api)
12. [Leads / CRM](#12-leads--crm)
13. [RGPD](#13-rgpd)
14. [Analytics](#14-analytics)
15. [Admin](#15-admin)
16. [Patrons de Securite](#16-patrons-de-securite)

---

## 1. AI / Generation

### POST `/api/generate`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/generate` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Genere un devis structure a partir d'une entree vocale ou textuelle via Claude AI. Transforme une description libre en lignes de devis avec descriptions, quantites et prix. |

**Requete :**
```jsonc
{
  "input": "string",        // Texte ou transcription vocale
  "context"?: "object"      // Contexte additionnel (client, historique)
}
```

**Reponse (200) :**
```jsonc
{
  "quote": {
    "items": [
      {
        "description": "string",
        "quantity": "number",
        "unit_price": "number"
      }
    ],
    "notes": "string"
  }
}
```

---

### POST `/api/ai-assistant`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/ai-assistant` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Oui — 5 requetes/minute |
| **Description** | Assistant IA multi-actions : audit de devis, optimisation tarifaire, generation d'emails, creation de materiaux commerciaux, planification de suivi. |

**Requete :**
```jsonc
{
  "action": "audit" | "optimize" | "email" | "materials" | "planning",
  "quote_id"?: "uuid",
  "params"?: "object"       // Parametres specifiques a l'action
}
```

**Reponse (200) :**
```jsonc
{
  "result": "object",       // Structure variable selon l'action
  "tokens_used": "number"
}
```

---

## 2. Devis — API Publique v1

### GET `/api/v1/quotes`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/v1/quotes` |
| **Authentification** | Cle API (scope `quotes:read`) |
| **Rate Limited** | Non |
| **Description** | Liste les devis de l'utilisateur avec pagination. Validation des parametres via Zod. |

**Parametres de requete :**
```
?page=1&per_page=20&status=draft|sent|accepted|rejected|finalized
```

**Reponse (200) :**
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "number": "string",
      "status": "string",
      "client_name": "string",
      "total_ht": "number",
      "total_ttc": "number",
      "created_at": "string"
    }
  ],
  "pagination": {
    "page": "number",
    "per_page": "number",
    "total": "number",
    "total_pages": "number"
  }
}
```

---

### POST `/api/v1/quotes`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/v1/quotes` |
| **Authentification** | Cle API (scope `quotes:write`) |
| **Rate Limited** | Non |
| **Description** | Cree un nouveau devis avec ses lignes. Validation stricte via Zod. |

**Requete :**
```jsonc
{
  "client_name": "string",
  "client_email"?: "string",
  "items": [
    {
      "description": "string",
      "quantity": "number",
      "unit_price": "number",
      "vat_rate"?: "number"    // Defaut : 21%
    }
  ],
  "notes"?: "string",
  "valid_until"?: "string"     // ISO 8601
}
```

**Reponse (201) :**
```jsonc
{
  "id": "uuid",
  "number": "string",
  "status": "draft",
  "items": ["..."],
  "total_ht": "number",
  "total_ttc": "number",
  "created_at": "string"
}
```

---

### GET `/api/v1/quotes/[id]`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/v1/quotes/:id` |
| **Authentification** | Cle API (scope `quotes:read`) |
| **Rate Limited** | Non |
| **Description** | Recupere un devis par son identifiant. Validation UUID du parametre. |

**Reponse (200) :**
```jsonc
{
  "id": "uuid",
  "number": "string",
  "status": "string",
  "client_name": "string",
  "client_email": "string",
  "items": ["..."],
  "total_ht": "number",
  "total_ttc": "number",
  "notes": "string",
  "valid_until": "string",
  "created_at": "string",
  "updated_at": "string"
}
```

**Erreur (404) :**
```jsonc
{ "error": "Devis introuvable" }
```

---

### PATCH `/api/v1/quotes/[id]`

| Champ | Valeur |
|---|---|
| **Methode** | `PATCH` |
| **Chemin** | `/api/v1/quotes/:id` |
| **Authentification** | Cle API (scope `quotes:write`) |
| **Rate Limited** | Non |
| **Description** | Met a jour un devis existant. Bloque la modification des devis finalises. |

**Requete :**
```jsonc
{
  "client_name"?: "string",
  "items"?: ["..."],
  "notes"?: "string",
  "status"?: "string"
}
```

**Reponse (200) :** Devis mis a jour (meme schema que GET).

**Erreur (403) :**
```jsonc
{ "error": "Impossible de modifier un devis finalise" }
```

---

### DELETE `/api/v1/quotes/[id]`

| Champ | Valeur |
|---|---|
| **Methode** | `DELETE` |
| **Chemin** | `/api/v1/quotes/:id` |
| **Authentification** | Cle API (scope `quotes:delete`) |
| **Rate Limited** | Non |
| **Description** | Supprime un devis. Bloque la suppression des devis finalises. |

**Reponse (200) :**
```jsonc
{ "success": true }
```

**Erreur (403) :**
```jsonc
{ "error": "Impossible de supprimer un devis finalise" }
```

---

## 3. Devis — Interne

### GET `/api/quotes/[id]/pdf`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/quotes/:id/pdf` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Redirige vers le service de generation PDF pour le devis specifie. |

**Reponse (302) :** Redirection vers l'URL du PDF genere.

**Erreur (404) :**
```jsonc
{ "error": "Devis introuvable" }
```

---

## 4. Stripe / Facturation

### POST `/api/stripe/checkout`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/stripe/checkout` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Cree une session Stripe Checkout. Supporte carte bancaire, Bancontact et iDEAL. |

**Requete :**
```jsonc
{
  "price_id": "string",
  "success_url": "string",
  "cancel_url": "string"
}
```

**Reponse (200) :**
```jsonc
{
  "url": "string"            // URL de redirection Stripe Checkout
}
```

---

### POST `/api/stripe/portal`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/stripe/portal` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Cree une session vers le portail de facturation Stripe pour gerer l'abonnement. |

**Requete :**
```jsonc
{
  "return_url": "string"
}
```

**Reponse (200) :**
```jsonc
{
  "url": "string"            // URL du portail Stripe
}
```

---

### POST `/api/stripe/webhook`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/stripe/webhook` |
| **Authentification** | Signature Stripe (`stripe-signature` header) |
| **Rate Limited** | Non |
| **Description** | Recoit les evenements Stripe (paiement, abonnement, etc.). Verification de signature. Idempotence via la table `processed_stripe_events`. |

**Requete :** Corps brut signe par Stripe.

**Reponse (200) :**
```jsonc
{ "received": true }
```

---

## 5. Factures

### GET `/api/invoices`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/invoices` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Liste les factures de l'utilisateur avec filtres optionnels. |

**Parametres de requete :**
```
?status=draft|sent|paid|cancelled&type=standard|deposit|balance&page=1&per_page=20
```

**Reponse (200) :**
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "number": "string",
      "type": "standard" | "deposit" | "balance",
      "status": "string",
      "total_ttc": "number",
      "quote_id": "uuid",
      "created_at": "string"
    }
  ],
  "pagination": { "..." }
}
```

---

### POST `/api/invoices`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/invoices` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Convertit un devis en facture. Supporte les types standard, acompte et solde. |

**Requete :**
```jsonc
{
  "quote_id": "uuid",
  "type": "standard" | "deposit" | "balance",
  "deposit_percentage"?: "number"   // Requis si type = deposit
}
```

**Reponse (201) :**
```jsonc
{
  "id": "uuid",
  "number": "string",
  "type": "string",
  "status": "draft",
  "total_ttc": "number"
}
```

---

### PATCH `/api/invoices`

| Champ | Valeur |
|---|---|
| **Methode** | `PATCH` |
| **Chemin** | `/api/invoices` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Actions sur une facture existante : marquer comme payee, envoyer ou annuler. |

**Requete :**
```jsonc
{
  "id": "uuid",
  "action": "mark_paid" | "send" | "cancel"
}
```

**Reponse (200) :**
```jsonc
{
  "id": "uuid",
  "status": "string"         // Nouveau statut
}
```

---

### GET `/api/invoices/[id]/peppol`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/invoices/:id/peppol` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Exporte une facture au format Peppol BIS 3.0 XML. Necessite un abonnement Pro ou superieur. |

**Reponse (200) :** Document XML conforme Peppol BIS 3.0 (`Content-Type: application/xml`).

**Erreur (403) :**
```jsonc
{ "error": "Abonnement Pro ou superieur requis" }
```

---

## 6. Workflows

### GET `/api/workflows`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/workflows` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Liste les workflows de l'utilisateur. Acces conditionne par le plan d'abonnement. Journalise dans l'audit log. |

**Reponse (200) :**
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "trigger": "string",
      "actions": ["..."],
      "enabled": "boolean",
      "created_at": "string"
    }
  ]
}
```

---

### POST `/api/workflows`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/workflows` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Cree un nouveau workflow. Acces conditionne par le plan. Journalise. |

**Requete :**
```jsonc
{
  "name": "string",
  "trigger": "string",
  "actions": ["..."],
  "enabled"?: "boolean"
}
```

**Reponse (201) :** Workflow cree.

---

### PATCH `/api/workflows`

| Champ | Valeur |
|---|---|
| **Methode** | `PATCH` |
| **Chemin** | `/api/workflows` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Met a jour un workflow existant. Journalise dans l'audit log. |

**Requete :**
```jsonc
{
  "id": "uuid",
  "name"?: "string",
  "trigger"?: "string",
  "actions"?: ["..."],
  "enabled"?: "boolean"
}
```

**Reponse (200) :** Workflow mis a jour.

---

### DELETE `/api/workflows`

| Champ | Valeur |
|---|---|
| **Methode** | `DELETE` |
| **Chemin** | `/api/workflows` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Supprime un workflow. Journalise dans l'audit log. |

**Requete :**
```jsonc
{
  "id": "uuid"
}
```

**Reponse (200) :**
```jsonc
{ "success": true }
```

---

## 7. HITL (Human-in-the-Loop)

### GET `/api/hitl`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/hitl` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Liste les requetes HITL en attente de validation humaine. |

**Reponse (200) :**
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "type": "string",
      "payload": "object",
      "status": "pending",
      "created_at": "string"
    }
  ]
}
```

---

### POST `/api/hitl`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/hitl` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Approuve ou rejette une requete HITL. L'action est journalisee dans l'audit log. |

**Requete :**
```jsonc
{
  "id": "uuid",
  "decision": "approve" | "reject",
  "reason"?: "string"
}
```

**Reponse (200) :**
```jsonc
{
  "id": "uuid",
  "status": "approved" | "rejected"
}
```

---

## 8. Widget

### OPTIONS `/api/widget/quote-request`

| Champ | Valeur |
|---|---|
| **Methode** | `OPTIONS` |
| **Chemin** | `/api/widget/quote-request` |
| **Authentification** | Aucune |
| **Rate Limited** | Non |
| **Description** | Reponse CORS preflight. Autorise toutes les origines (`*`). |

**Reponse (204) :** Headers CORS uniquement.

---

### POST `/api/widget/quote-request`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/widget/quote-request` |
| **Authentification** | Cle API (header) |
| **Rate Limited** | Oui |
| **Description** | Recoit une demande de devis depuis un widget externe. Inclut une protection anti-bot. Cree un lead et envoie une notification au proprietaire. |

**Requete :**
```jsonc
{
  "name": "string",
  "email": "string",
  "phone"?: "string",
  "message": "string",
  "honeypot"?: "string"      // Champ anti-bot (doit etre vide)
}
```

**Reponse (201) :**
```jsonc
{
  "success": true,
  "lead_id": "uuid"
}
```

---

## 9. Parrainage

### GET `/api/referral`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/referral` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Liste les parrainages de l'utilisateur connecte. |

**Reponse (200) :**
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "referred_email": "string",
      "status": "pending" | "signed_up" | "converted",
      "reward": "number",
      "created_at": "string"
    }
  ]
}
```

---

### POST `/api/referral`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/referral` |
| **Authentification** | Aucune (endpoint public) |
| **Rate Limited** | Non |
| **Description** | Enregistre un parrainage. Endpoint public accessible sans authentification. |

**Requete :**
```jsonc
{
  "referral_code": "string",
  "email": "string"
}
```

**Reponse (201) :**
```jsonc
{
  "success": true,
  "referral_id": "uuid"
}
```

---

### GET `/api/referral/stats`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/referral/stats` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Retourne les statistiques de parrainage et le niveau ambassadeur de l'utilisateur. |

**Reponse (200) :**
```jsonc
{
  "total_referrals": "number",
  "converted": "number",
  "total_rewards": "number",
  "ambassador_level": "string"
}
```

---

### POST `/api/referral/invite`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/referral/invite` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Envoie un email d'invitation de parrainage a un destinataire. |

**Requete :**
```jsonc
{
  "email": "string",
  "message"?: "string"
}
```

**Reponse (200) :**
```jsonc
{ "success": true }
```

---

## 10. Tokens

### GET `/api/tokens`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/tokens` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Retourne le solde de tokens et l'historique des transactions. |

**Reponse (200) :**
```jsonc
{
  "balance": "number",
  "history": [
    {
      "id": "uuid",
      "type": "earn" | "spend",
      "amount": "number",
      "reason": "string",
      "created_at": "string"
    }
  ]
}
```

---

### POST `/api/tokens`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/tokens` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Ajoute ou depense des tokens. Utilise la fonction SQL RPC `add_tokens` pour la coherence transactionnelle. |

**Requete :**
```jsonc
{
  "type": "earn" | "spend",
  "amount": "number",
  "reason": "string"
}
```

**Reponse (200) :**
```jsonc
{
  "new_balance": "number"
}
```

---

## 11. Cles API

### GET `/api/api-keys`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/api-keys` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Liste les cles API de l'utilisateur. Les cles sont stockees sous forme de hash SHA-256. Prefixe `deal_`. |

**Reponse (200) :**
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "prefix": "string",      // Premiers caracteres visibles
      "scopes": ["string"],
      "last_used_at": "string",
      "created_at": "string"
    }
  ]
}
```

---

### POST `/api/api-keys`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/api-keys` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Cree une nouvelle cle API. La cle complete n'est retournee qu'une seule fois. |

**Requete :**
```jsonc
{
  "name": "string",
  "scopes": ["quotes:read", "quotes:write", "quotes:delete"]
}
```

**Reponse (201) :**
```jsonc
{
  "id": "uuid",
  "key": "deal_xxxxxxxxxxxx",  // Affichee une seule fois
  "name": "string",
  "scopes": ["string"]
}
```

---

### DELETE `/api/api-keys`

| Champ | Valeur |
|---|---|
| **Methode** | `DELETE` |
| **Chemin** | `/api/api-keys` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Revoque une cle API existante. |

**Requete :**
```jsonc
{
  "id": "uuid"
}
```

**Reponse (200) :**
```jsonc
{ "success": true }
```

---

## 12. Leads / CRM

### GET `/api/leads`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/leads` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Liste les leads avec filtres optionnels (statut, source, date). |

**Parametres de requete :**
```
?status=new|contacted|qualified|lost|won&source=widget|manual|referral&page=1&per_page=20
```

**Reponse (200) :**
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "phone": "string",
      "status": "string",
      "source": "string",
      "created_at": "string"
    }
  ],
  "pagination": { "..." }
}
```

---

### POST `/api/leads`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/leads` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Cree un nouveau lead manuellement. |

**Requete :**
```jsonc
{
  "name": "string",
  "email"?: "string",
  "phone"?: "string",
  "company"?: "string",
  "notes"?: "string"
}
```

**Reponse (201) :** Lead cree.

---

### PATCH `/api/leads`

| Champ | Valeur |
|---|---|
| **Methode** | `PATCH` |
| **Chemin** | `/api/leads` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Met a jour un lead existant (statut, informations de contact, notes). |

**Requete :**
```jsonc
{
  "id": "uuid",
  "status"?: "string",
  "name"?: "string",
  "email"?: "string",
  "notes"?: "string"
}
```

**Reponse (200) :** Lead mis a jour.

---

### DELETE `/api/leads`

| Champ | Valeur |
|---|---|
| **Methode** | `DELETE` |
| **Chemin** | `/api/leads` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Supprime un lead. |

**Requete :**
```jsonc
{
  "id": "uuid"
}
```

**Reponse (200) :**
```jsonc
{ "success": true }
```

---

## 13. RGPD

### GET `/api/gdpr/export`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/gdpr/export` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Export des donnees personnelles conformement a l'article 20 du RGPD (droit a la portabilite). Retourne un fichier JSON structure. |

**Reponse (200) :**
```jsonc
{
  "user": { "..." },
  "quotes": ["..."],
  "invoices": ["..."],
  "leads": ["..."],
  "tokens": ["..."],
  "exported_at": "string"
}
```
`Content-Disposition: attachment; filename="deal-export-{date}.json"`

---

### GET `/api/gdpr/delete`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/gdpr/delete` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Endpoint informatif sur la procedure de suppression des donnees. Retourne les consequences de la suppression. |

**Reponse (200) :**
```jsonc
{
  "warning": "string",
  "data_to_delete": ["string"],
  "retention_exceptions": ["string"]
}
```

---

### DELETE `/api/gdpr/delete`

| Champ | Valeur |
|---|---|
| **Methode** | `DELETE` |
| **Chemin** | `/api/gdpr/delete` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Suppression des donnees conformement a l'article 17 du RGPD (droit a l'effacement). Le mot de passe est requis pour confirmer. |

**Requete :**
```jsonc
{
  "password": "string"
}
```

**Reponse (200) :**
```jsonc
{ "success": true, "deleted_at": "string" }
```

---

### DELETE `/api/user/delete-account`

| Champ | Valeur |
|---|---|
| **Methode** | `DELETE` |
| **Chemin** | `/api/user/delete-account` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Suppression complete du compte utilisateur, y compris l'enregistrement dans Supabase Auth. Irreversible. |

**Requete :**
```jsonc
{
  "password": "string",
  "confirmation": "DELETE"
}
```

**Reponse (200) :**
```jsonc
{ "success": true }
```

---

### GET `/api/user/data-export`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/user/data-export` |
| **Authentification** | Session Supabase (cookie) |
| **Rate Limited** | Non |
| **Description** | Point d'acces alternatif pour l'export des donnees utilisateur. Meme fonctionnalite que `/api/gdpr/export`. |

**Reponse (200) :** Meme format que `/api/gdpr/export`.

---

## 14. Analytics

### POST `/api/analytics/vitals`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/analytics/vitals` |
| **Authentification** | Aucune |
| **Rate Limited** | Non |
| **Description** | Recoit les metriques Web Vitals (LCP, FID, CLS, etc.). Execute en edge runtime. No-op en production. |

**Requete :**
```jsonc
{
  "name": "string",           // LCP, FID, CLS, TTFB, INP
  "value": "number",
  "rating": "good" | "needs-improvement" | "poor",
  "path": "string"
}
```

**Reponse (200) :**
```jsonc
{ "ok": true }
```

---

### OPTIONS `/api/analytics/vitals`

| Champ | Valeur |
|---|---|
| **Methode** | `OPTIONS` |
| **Chemin** | `/api/analytics/vitals` |
| **Authentification** | Aucune |
| **Rate Limited** | Non |
| **Description** | Reponse CORS preflight pour l'endpoint analytics. |

**Reponse (204) :** Headers CORS uniquement.

---

## 15. Admin

### GET `/api/admin/users`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/admin/users` |
| **Authentification** | Service role Supabase + whitelist email |
| **Rate Limited** | Non |
| **Description** | Liste les utilisateurs de la plateforme avec pagination. Acces restreint aux administrateurs via whitelist d'emails. Utilise le service role pour contourner le RLS. |

**Parametres de requete :**
```
?page=1&per_page=50&search=email
```

**Reponse (200) :**
```jsonc
{
  "data": [
    {
      "id": "uuid",
      "email": "string",
      "plan_name": "string",
      "created_at": "string",
      "last_sign_in": "string"
    }
  ],
  "pagination": { "..." }
}
```

---

### GET `/api/admin/subscriptions`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/admin/subscriptions` |
| **Authentification** | Service role Supabase + whitelist email |
| **Rate Limited** | Non |
| **Description** | Liste les abonnements avec calcul du MRR (Monthly Recurring Revenue). Utilise le service role pour contourner le RLS. |

**Reponse (200) :**
```jsonc
{
  "data": [
    {
      "user_id": "uuid",
      "email": "string",
      "plan_name": "string",
      "status": "string",
      "current_period_end": "string"
    }
  ],
  "mrr": "number"
}
```

---

### POST `/api/admin/update-plan`

| Champ | Valeur |
|---|---|
| **Methode** | `POST` |
| **Chemin** | `/api/admin/update-plan` |
| **Authentification** | Service role Supabase + whitelist email |
| **Rate Limited** | Non |
| **Description** | Change le plan d'abonnement d'un utilisateur. Utilise le service role pour contourner le RLS. |

**Requete :**
```jsonc
{
  "user_id": "uuid",
  "plan_name": "free" | "pro" | "business" | "corporate"
}
```

**Reponse (200) :**
```jsonc
{
  "success": true,
  "plan_name": "string"
}
```

---

### GET `/api/admin/stats`

| Champ | Valeur |
|---|---|
| **Methode** | `GET` |
| **Chemin** | `/api/admin/stats` |
| **Authentification** | Service role Supabase + whitelist email |
| **Rate Limited** | Non |
| **Description** | Statistiques globales de la plateforme : MRR, ARR, nombre d'utilisateurs, repartition par plan. |

**Reponse (200) :**
```jsonc
{
  "total_users": "number",
  "mrr": "number",
  "arr": "number",
  "plans_distribution": {
    "free": "number",
    "pro": "number",
    "business": "number",
    "corporate": "number"
  },
  "quotes_total": "number",
  "invoices_total": "number"
}
```

---

## 16. Patrons de Securite

### Methodes d'authentification

| Methode | Utilisation | Endpoints |
|---|---|---|
| **Session Supabase** | Cookie de session gere par `@supabase/ssr`. Methode principale pour les utilisateurs connectes. | Majorite des endpoints internes |
| **Cle API** | Header `Authorization: Bearer deal_xxx`. Hash SHA-256 stocke en base. Prefixe `deal_`. Scopes granulaires. | API publique v1, Widget |
| **Signature Stripe** | Header `stripe-signature`. Verification via `stripe.webhooks.constructEvent()`. | Webhook Stripe |
| **Service role** | Cle service Supabase cote serveur + verification whitelist d'emails administrateurs. | Endpoints Admin |

### Row Level Security (RLS)

Toutes les tables applicatives sont protegees par des politiques RLS Supabase. Chaque utilisateur ne peut acceder qu'a ses propres donnees. Les endpoints Admin contournent le RLS via le service role (`supabaseAdmin`) pour les operations d'administration.

### Rate Limiting

| Endpoint | Limite |
|---|---|
| `/api/ai-assistant` | 5 requetes par minute |
| `/api/widget/quote-request` | Limite configurable |

Le rate limiting est implemente via un compteur en memoire ou via les headers de reponse. Les endpoints depasses retournent un statut `429 Too Many Requests`.

### Validation Zod

Tous les endpoints de l'API publique v1 (`/api/v1/*`) utilisent des schemas Zod pour la validation stricte des entrees. Les erreurs de validation retournent un statut `400` avec le detail des champs invalides :

```jsonc
{
  "error": "Validation failed",
  "details": [
    { "field": "items[0].quantity", "message": "Expected number, received string" }
  ]
}
```

### Journalisation d'audit

Les actions sensibles sont enregistrees dans une table d'audit :
- Operations CRUD sur les workflows
- Decisions HITL (approbation / rejet)
- Modifications de plan par les administrateurs
- Suppressions de compte RGPD

### Idempotence

Le webhook Stripe utilise la table `processed_stripe_events` pour garantir le traitement unique de chaque evenement. L'identifiant d'evenement Stripe sert de cle d'idempotence.

### CORS

| Endpoint | Politique |
|---|---|
| `/api/widget/quote-request` | Toutes origines (`*`) |
| `/api/analytics/vitals` | Toutes origines (`*`) |
| Autres endpoints | Meme origine uniquement (defaut Next.js) |

Les endpoints widget et analytics exposent des headers CORS permissifs via des handlers `OPTIONS` dedies, permettant l'integration depuis des sites tiers.
