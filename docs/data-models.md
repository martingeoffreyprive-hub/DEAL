# DEAL -- Modeles de Donnees

> Documentation complete du schema PostgreSQL Supabase pour le projet DEAL.
> Derniere mise a jour : 28 janvier 2026

---

## Table des matieres

1. [Extensions](#1-extensions)
2. [Types ENUM](#2-types-enum)
3. [Tables](#3-tables)
4. [Politiques RLS (Row Level Security)](#4-politiques-rls)
5. [Fonctions et Triggers](#5-fonctions-et-triggers)
6. [Historique des Migrations](#6-historique-des-migrations)
7. [Storage Buckets](#7-storage-buckets)
8. [Donnees de Seed](#8-donnees-de-seed)

---

## 1. Extensions

| Extension   | Description                              |
|-------------|------------------------------------------|
| `uuid-ossp` | Generation d'UUID v4 (`uuid_generate_v4()`) |
| `pgcrypto`  | Fonctions cryptographiques (`gen_random_uuid()`, `gen_random_bytes()`) |

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 2. Types ENUM

### 2.1 `sector_type` -- Secteurs d'activite

| Valeur     | Description            |
|------------|------------------------|
| `BTP`      | Batiment et travaux publics |
| `IT`       | Technologies de l'information |
| `CONSEIL`  | Conseil                |
| `ARTISAN`  | Artisanat              |
| `SERVICES` | Services               |
| `AUTRE`    | Autre (par defaut)     |

### 2.2 `quote_status` -- Statuts de devis

| Valeur     | Description                      |
|------------|----------------------------------|
| `draft`    | Brouillon (par defaut)           |
| `sent`     | Envoye au client                 |
| `accepted` | Accepte par le client            |
| `rejected` | Refuse par le client             |

> **Note :** Les anciens statuts (`finalized`, `exported`, `archived`) ont ete migres vers `draft` lors de la migration v2.

### 2.3 `subscription_plan` -- Plans d'abonnement

| Valeur     | Description                      |
|------------|----------------------------------|
| `free`     | Gratuit : 1 secteur, 5 devis/mois |
| `starter`  | Starter : 3 secteurs, 30 devis/mois |
| `pro`      | Pro : 10 secteurs, 100 devis/mois |
| `ultimate` | Ultime : tous secteurs, illimite |

### 2.4 `audit_action` -- Actions d'audit

| Valeur     | Description            |
|------------|------------------------|
| `CREATE`   | Creation de ressource  |
| `READ`     | Lecture de ressource   |
| `UPDATE`   | Mise a jour            |
| `DELETE`   | Suppression            |
| `LOGIN`    | Connexion utilisateur  |
| `LOGOUT`   | Deconnexion            |
| `EXPORT`   | Export de donnees      |
| `IMPORT`   | Import de donnees      |
| `SEND`     | Envoi (devis, facture) |
| `APPROVE`  | Approbation            |
| `REJECT`   | Rejet                  |
| `API_CALL` | Appel API              |

### 2.5 `audit_resource` -- Types de ressources auditees

| Valeur          | Description          |
|-----------------|----------------------|
| `quote`         | Devis                |
| `quote_item`    | Ligne de devis       |
| `profile`       | Profil utilisateur   |
| `subscription`  | Abonnement           |
| `user`          | Utilisateur          |
| `organization`  | Organisation         |
| `team_member`   | Membre d'equipe      |
| `api_key`       | Cle API              |
| `settings`      | Parametres           |

### 2.6 `org_role` -- Roles d'organisation

| Valeur   | Description                                         |
|----------|-----------------------------------------------------|
| `owner`  | Controle total, facturation, suppression org        |
| `admin`  | Gestion des membres, parametres, CRUD complet       |
| `member` | Creation/edition de ses propres ressources           |
| `viewer` | Acces lecture seule                                  |

### 2.7 `invitation_status` -- Statuts d'invitation

| Valeur     | Description          |
|------------|----------------------|
| `pending`  | En attente           |
| `accepted` | Acceptee             |
| `declined` | Refusee              |
| `expired`  | Expiree              |

---

## 3. Tables

### 3.1 `profiles` -- Profils utilisateurs

Extension de `auth.users` pour les donnees entreprise.

| Colonne                | Type           | Contraintes / Defaut                     |
|------------------------|----------------|------------------------------------------|
| `id`                   | UUID           | PK, FK -> `auth.users(id)` ON DELETE CASCADE |
| `email`                | VARCHAR(255)   |                                          |
| `full_name`            | VARCHAR(255)   |                                          |
| `first_name`           | VARCHAR(100)   |                                          |
| `last_name`            | VARCHAR(100)   |                                          |
| `company_name`         | VARCHAR(255)   | DEFAULT ''                               |
| `company_id`           | UUID           | FK -> `companies(id)`                    |
| `phone`                | VARCHAR(50)    |                                          |
| `avatar_url`           | TEXT           |                                          |
| `siret`                | VARCHAR(50)    | Numero TVA                               |
| `address`              | TEXT           |                                          |
| `city`                 | VARCHAR(255)   |                                          |
| `postal_code`          | VARCHAR(20)    |                                          |
| `website`              | VARCHAR(255)   |                                          |
| `logo_url`             | TEXT           |                                          |
| `legal_mentions`       | TEXT           | Mentions legales par defaut              |
| `default_sector`       | VARCHAR(50)    | DEFAULT 'AUTRE'                          |
| `quote_prefix`         | VARCHAR(20)    | DEFAULT 'DEV-'                           |
| `next_quote_number`    | INTEGER        | DEFAULT 1                                |
| `iban`                 | VARCHAR(50)    |                                          |
| `bic`                  | VARCHAR(20)    |                                          |
| `bank_name`            | VARCHAR(255)   |                                          |
| `subscription_tier`    | VARCHAR(50)    | DEFAULT 'freemium'                       |
| `subscription_status`  | VARCHAR(50)    | DEFAULT 'active'                         |
| `stripe_customer_id`   | VARCHAR(255)   |                                          |
| `role`                 | VARCHAR(100)   | admin, super_admin, etc.                 |
| `onboarding_completed` | BOOLEAN        | DEFAULT false                            |
| `onboarding_step`      | INTEGER        | DEFAULT 0                                |
| `last_activity_at`     | TIMESTAMPTZ    |                                          |
| `token_balance`        | INTEGER        | DEFAULT 0                                |
| `created_at`           | TIMESTAMPTZ    | DEFAULT NOW()                            |
| `updated_at`           | TIMESTAMPTZ    | DEFAULT NOW()                            |

**Index :** `idx_profiles_company` (GIN, full-text french sur `company_name`)

---

### 3.2 `quotes` -- Devis

| Colonne                  | Type           | Contraintes / Defaut                          |
|--------------------------|----------------|-----------------------------------------------|
| `id`                     | UUID           | PK, DEFAULT `uuid_generate_v4()`              |
| `user_id`                | UUID           | NOT NULL, FK -> `auth.users(id)` ON DELETE CASCADE |
| `quote_number`           | VARCHAR(50)    | UNIQUE par utilisateur                         |
| `title`                  | VARCHAR(255)   |                                                |
| `description`            | TEXT           |                                                |
| `client_name`            | VARCHAR(255)   | NOT NULL                                       |
| `client_email`           | VARCHAR(255)   |                                                |
| `client_phone`           | VARCHAR(50)    |                                                |
| `client_address`         | TEXT           |                                                |
| `client_city`            | TEXT           |                                                |
| `client_postal_code`     | TEXT           |                                                |
| `sector`                 | `sector_type`  | DEFAULT 'AUTRE'                                |
| `status`                 | `quote_status` | DEFAULT 'draft'                                |
| `valid_until`            | DATE           |                                                |
| `notes`                  | TEXT           |                                                |
| `terms`                  | TEXT           |                                                |
| `transcription`          | TEXT           |                                                |
| `subtotal`               | DECIMAL(12,2)  | DEFAULT 0                                      |
| `tax_rate`               | DECIMAL(5,2)   | DEFAULT 21.00 (TVA belge)                      |
| `tax_amount`             | DECIMAL(12,2)  | DEFAULT 0                                      |
| `total`                  | DECIMAL(12,2)  | DEFAULT 0                                      |
| `pdf_url`                | TEXT           |                                                |
| `signature_url`          | TEXT           |                                                |
| `signature_hash`         | VARCHAR(255)   |                                                |
| `source`                 | VARCHAR(100)   | DEFAULT 'manual'                               |
| `watermark_enabled`      | BOOLEAN        | DEFAULT false                                  |
| `watermark_config`       | JSONB          |                                                |
| `pdf_password`           | VARCHAR(255)   |                                                |
| `organization_id`        | UUID           | FK -> `organizations(id)` ON DELETE SET NULL   |
| `workflow_execution_id`  | UUID           | FK -> `workflow_executions(id)`                |
| `lead_id`                | UUID           | FK -> `leads(id)`                              |
| `created_at`             | TIMESTAMPTZ    | DEFAULT NOW()                                  |
| `updated_at`             | TIMESTAMPTZ    | DEFAULT NOW()                                  |
| `sent_at`                | TIMESTAMPTZ    |                                                |
| `accepted_at`            | TIMESTAMPTZ    |                                                |
| `finalized_at`           | TIMESTAMPTZ    |                                                |

**Contrainte :** `UNIQUE(user_id, quote_number)`

**Index :** `idx_quotes_user_pagination`, `idx_quotes_user_status`, `idx_quotes_analytics`, `idx_quotes_sector`, `idx_quotes_client_name`, `idx_quotes_search` (GIN full-text french), `idx_quotes_organization`

---

### 3.3 `quote_items` -- Lignes de devis

| Colonne       | Type          | Contraintes / Defaut                     |
|---------------|---------------|------------------------------------------|
| `id`          | UUID          | PK, DEFAULT `uuid_generate_v4()`         |
| `quote_id`    | UUID          | NOT NULL, FK -> `quotes(id)` ON DELETE CASCADE |
| `description` | TEXT          | NOT NULL                                 |
| `quantity`     | DECIMAL(10,2) | DEFAULT 1                                |
| `unit`        | VARCHAR(50)   | DEFAULT 'unite'                          |
| `unit_price`  | DECIMAL(12,2) | NOT NULL                                 |
| `tax_rate`    | DECIMAL(5,2)  | DEFAULT 21                               |
| `total`       | DECIMAL(12,2) | `GENERATED ALWAYS AS (quantity * unit_price) STORED` |
| `sort_order`  | INTEGER       | DEFAULT 0 (alias `order_index`)          |
| `created_at`  | TIMESTAMPTZ   | DEFAULT NOW()                            |

**Index :** `idx_quote_items_quote` (`quote_id, order_index`), `idx_quote_items_search` (GIN full-text)

---

### 3.4 `quote_materials` -- Materiaux (BTP)

| Colonne       | Type          | Contraintes / Defaut                      |
|---------------|---------------|-------------------------------------------|
| `id`          | UUID          | PK, DEFAULT `uuid_generate_v4()`          |
| `quote_id`    | UUID          | NOT NULL, FK -> `quotes(id)` ON DELETE CASCADE |
| `name`        | TEXT          | NOT NULL                                  |
| `category`    | TEXT          | DEFAULT 'Autre'                           |
| `quantity`    | NUMERIC(10,2) | DEFAULT 1                                 |
| `unit`        | TEXT          | DEFAULT 'unite'                           |
| `unit_price`  | NUMERIC(12,2) | DEFAULT 0                                 |
| `total`       | NUMERIC(12,2) | `GENERATED ALWAYS AS (quantity * unit_price) STORED` |
| `created_at`  | TIMESTAMPTZ   | DEFAULT NOW()                             |

---

### 3.5 `quote_labor` -- Main d'oeuvre (BTP)

| Colonne       | Type          | Contraintes / Defaut                      |
|---------------|---------------|-------------------------------------------|
| `id`          | UUID          | PK, DEFAULT `uuid_generate_v4()`          |
| `quote_id`    | UUID          | NOT NULL, FK -> `quotes(id)` ON DELETE CASCADE |
| `task`        | TEXT          | NOT NULL                                  |
| `hours`       | NUMERIC(10,2) | DEFAULT 1                                 |
| `hourly_rate` | NUMERIC(12,2) | DEFAULT 45                                |
| `workers`     | INTEGER       | DEFAULT 1                                 |
| `total`       | NUMERIC(12,2) | `GENERATED ALWAYS AS (hours * hourly_rate * workers) STORED` |
| `created_at`  | TIMESTAMPTZ   | DEFAULT NOW()                             |

---

### 3.6 `quote_comments` -- Commentaires de devis (temps reel)

| Colonne      | Type        | Contraintes / Defaut                      |
|--------------|-------------|-------------------------------------------|
| `id`         | UUID        | PK, DEFAULT `gen_random_uuid()`           |
| `quote_id`   | UUID        | NOT NULL, FK -> `quotes(id)` ON DELETE CASCADE |
| `user_id`    | UUID        | NOT NULL, FK -> `auth.users(id)` ON DELETE CASCADE |
| `content`    | TEXT        | NOT NULL                                  |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW()                             |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW()                             |

**Publication Realtime :** `ALTER PUBLICATION supabase_realtime ADD TABLE quote_comments;`

---

### 3.7 `notifications` -- Notifications in-app (temps reel)

| Colonne      | Type         | Contraintes / Defaut                      |
|--------------|--------------|-------------------------------------------|
| `id`         | UUID         | PK, DEFAULT `gen_random_uuid()`           |
| `user_id`    | UUID         | NOT NULL, FK -> `auth.users(id)` ON DELETE CASCADE |
| `type`       | VARCHAR(50)  | NOT NULL, DEFAULT 'info'                  |
| `title`      | VARCHAR(255) | NOT NULL                                  |
| `message`    | TEXT         |                                           |
| `link`       | VARCHAR(500) |                                           |
| `data`       | JSONB        | DEFAULT '{}'                              |
| `read`       | BOOLEAN      | DEFAULT false                             |
| `read_at`    | TIMESTAMPTZ  |                                           |
| `created_at` | TIMESTAMPTZ  | DEFAULT NOW()                             |

**Publication Realtime :** `ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`

---

### 3.8 `plans` -- Plans d'abonnement

| Colonne                  | Type              | Contraintes / Defaut           |
|--------------------------|-------------------|--------------------------------|
| `id`                     | UUID              | PK, DEFAULT `uuid_generate_v4()` |
| `name`                   | `subscription_plan` | UNIQUE, NOT NULL              |
| `display_name`           | TEXT              | NOT NULL                       |
| `description`            | TEXT              |                                |
| `price_monthly`          | NUMERIC(10,2)    | DEFAULT 0                      |
| `price_yearly`           | NUMERIC(10,2)    | DEFAULT 0                      |
| `max_sectors`            | INTEGER           | DEFAULT 1 (-1 = illimite)     |
| `max_quotes_per_month`   | INTEGER           | DEFAULT 5 (-1 = illimite)     |
| `ai_assistant_enabled`   | BOOLEAN           | DEFAULT false                  |
| `pdf_export_enabled`     | BOOLEAN           | DEFAULT true                   |
| `pdf_protection_enabled` | BOOLEAN           | DEFAULT false                  |
| `priority_support`       | BOOLEAN           | DEFAULT false                  |
| `created_at`             | TIMESTAMPTZ       | DEFAULT NOW()                  |

**RLS :** Lecture publique pour tous.

---

### 3.9 `subscriptions` -- Abonnements utilisateurs

| Colonne                  | Type              | Contraintes / Defaut            |
|--------------------------|-------------------|---------------------------------|
| `id`                     | UUID              | PK, DEFAULT `uuid_generate_v4()` |
| `user_id`                | UUID              | NOT NULL, FK -> `auth.users(id)`, UNIQUE |
| `plan_name`              | `subscription_plan` / VARCHAR(50) | DEFAULT 'free'     |
| `status`                 | VARCHAR(50)       | DEFAULT 'active'                |
| `current_period_start`   | TIMESTAMPTZ       | DEFAULT NOW()                   |
| `current_period_end`     | TIMESTAMPTZ       |                                 |
| `cancel_at_period_end`   | BOOLEAN           | DEFAULT false                   |
| `stripe_customer_id`     | VARCHAR(255)      |                                 |
| `stripe_subscription_id` | VARCHAR(255)      |                                 |
| `created_at`             | TIMESTAMPTZ       | DEFAULT NOW()                   |
| `updated_at`             | TIMESTAMPTZ       | DEFAULT NOW()                   |

---

### 3.10 `user_sectors` -- Secteurs debloques par utilisateur

| Colonne      | Type          | Contraintes / Defaut                      |
|--------------|---------------|-------------------------------------------|
| `id`         | UUID          | PK                                        |
| `user_id`    | UUID          | NOT NULL, FK -> `auth.users(id)`          |
| `sector`     | `sector_type` | NOT NULL                                  |
| `is_primary` | BOOLEAN       | DEFAULT false                             |
| `unlocked_at`| TIMESTAMPTZ   | DEFAULT NOW()                             |
| `expires_at` | TIMESTAMPTZ   | NULL = permanent                          |
| `created_at` | TIMESTAMPTZ   | DEFAULT NOW()                             |

**Contrainte :** `UNIQUE(user_id, sector)`

---

### 3.11 `usage_stats` -- Statistiques d'utilisation mensuelle

| Colonne          | Type        | Contraintes / Defaut                      |
|------------------|-------------|-------------------------------------------|
| `id`             | UUID        | PK                                        |
| `user_id`        | UUID        | NOT NULL, FK -> `auth.users(id)`          |
| `month_year`     | VARCHAR(7)  | NOT NULL, format "2026-01"                |
| `quotes_created` | INTEGER     | DEFAULT 0                                 |
| `ai_requests`    | INTEGER     | DEFAULT 0                                 |
| `pdf_exports`    | INTEGER     | DEFAULT 0                                 |
| `created_at`     | TIMESTAMPTZ | DEFAULT NOW()                             |
| `updated_at`     | TIMESTAMPTZ | DEFAULT NOW()                             |

**Contrainte :** `UNIQUE(user_id, month_year)`

---

### 3.12 `organizations` -- Organisations (multi-tenant)

| Colonne               | Type        | Contraintes / Defaut                      |
|------------------------|-------------|-------------------------------------------|
| `id`                  | UUID        | PK, DEFAULT `gen_random_uuid()`           |
| `name`                | TEXT        | NOT NULL                                  |
| `slug`                | TEXT        | UNIQUE, NOT NULL                          |
| `logo_url`            | TEXT        |                                           |
| `primary_color`       | TEXT        | DEFAULT '#3B82F6'                         |
| `siret`               | TEXT        |                                           |
| `vat_number`          | TEXT        |                                           |
| `address`             | TEXT        |                                           |
| `city`                | TEXT        |                                           |
| `postal_code`         | TEXT        |                                           |
| `country`             | TEXT        | DEFAULT 'BE'                              |
| `email`               | TEXT        |                                           |
| `phone`               | TEXT        |                                           |
| `website`             | TEXT        |                                           |
| `stripe_customer_id`  | TEXT        | UNIQUE                                    |
| `subscription_plan`   | TEXT        | DEFAULT 'free'                            |
| `subscription_status` | TEXT        | DEFAULT 'active'                          |
| `settings`            | JSONB       | DEFAULT '{}'                              |
| `created_by`          | UUID        | FK -> `auth.users(id)` ON DELETE SET NULL |
| `created_at`          | TIMESTAMPTZ | DEFAULT now()                             |
| `updated_at`          | TIMESTAMPTZ | DEFAULT now()                             |

---

### 3.13 `organization_members` -- Membres d'organisation

| Colonne           | Type        | Contraintes / Defaut                      |
|-------------------|-------------|-------------------------------------------|
| `id`              | UUID        | PK                                        |
| `organization_id` | UUID        | NOT NULL, FK -> `organizations(id)` ON DELETE CASCADE |
| `user_id`         | UUID        | NOT NULL, FK -> `auth.users(id)` ON DELETE CASCADE |
| `role`            | `org_role`  | NOT NULL, DEFAULT 'member'                |
| `invited_by`      | UUID        | FK -> `auth.users(id)`                    |
| `invited_at`      | TIMESTAMPTZ |                                           |
| `joined_at`       | TIMESTAMPTZ | DEFAULT now()                             |

**Contrainte :** `UNIQUE(organization_id, user_id)`

---

### 3.14 `organization_invitations` -- Invitations d'organisation

| Colonne           | Type                | Contraintes / Defaut                     |
|-------------------|---------------------|------------------------------------------|
| `id`              | UUID                | PK                                       |
| `organization_id` | UUID                | NOT NULL, FK -> `organizations(id)` ON DELETE CASCADE |
| `email`           | TEXT                | NOT NULL                                 |
| `role`            | `org_role`          | DEFAULT 'member'                         |
| `token`           | TEXT                | UNIQUE, DEFAULT `encode(gen_random_bytes(32), 'hex')` |
| `status`          | `invitation_status` | DEFAULT 'pending'                        |
| `invited_by`      | UUID                | FK -> `auth.users(id)`                   |
| `created_at`      | TIMESTAMPTZ         | DEFAULT now()                            |
| `expires_at`      | TIMESTAMPTZ         | DEFAULT `now() + INTERVAL '7 days'`      |
| `accepted_at`     | TIMESTAMPTZ         |                                          |

**Contrainte :** `UNIQUE(organization_id, email, status)`

---

### 3.15 `api_keys` -- Cles API

| Colonne              | Type         | Contraintes / Defaut                     |
|----------------------|--------------|------------------------------------------|
| `id`                 | UUID         | PK                                       |
| `user_id`            | UUID         | NOT NULL, FK -> `auth.users(id)`         |
| `organization_id`    | UUID         | FK -> `organizations(id)` ON DELETE CASCADE |
| `name`               | TEXT         | NOT NULL                                 |
| `key_prefix`         | TEXT         | NOT NULL (ex: `qv_live_xxxxxxxx`)        |
| `key_hash`           | TEXT         | NOT NULL, UNIQUE (SHA-256)               |
| `scopes`             | TEXT[]       | DEFAULT `{'quotes:read','quotes:write'}` |
| `permissions`        | JSONB        | DEFAULT `'["widget:create_lead"]'`       |
| `rate_limit`         | INTEGER      | DEFAULT 100                              |
| `rate_limit_per_hour`| INTEGER      | DEFAULT 100                              |
| `rate_limit_remaining`| INTEGER     | DEFAULT 100                              |
| `rate_limit_reset_at`| TIMESTAMPTZ  |                                          |
| `last_used_at`       | TIMESTAMPTZ  |                                          |
| `request_count`      | BIGINT       | DEFAULT 0                                |
| `is_active`          | BOOLEAN      | DEFAULT true                             |
| `revoked`            | BOOLEAN      | DEFAULT false                            |
| `revoked_at`         | TIMESTAMPTZ  |                                          |
| `revoked_reason`     | TEXT         |                                          |
| `expires_at`         | TIMESTAMPTZ  |                                          |
| `created_at`         | TIMESTAMPTZ  | DEFAULT now()                            |

---

### 3.16 `api_request_logs` -- Logs de requetes API

| Colonne              | Type        | Contraintes / Defaut                     |
|----------------------|-------------|------------------------------------------|
| `id`                 | UUID        | PK                                       |
| `api_key_id`         | UUID        | FK -> `api_keys(id)` ON DELETE SET NULL  |
| `user_id`            | UUID        | FK -> `auth.users(id)` ON DELETE SET NULL|
| `method`             | TEXT        | NOT NULL                                 |
| `path`               | TEXT        | NOT NULL                                 |
| `status_code`        | INTEGER     | NOT NULL                                 |
| `response_time_ms`   | INTEGER     |                                          |
| `request_size_bytes` | INTEGER     |                                          |
| `response_size_bytes`| INTEGER     |                                          |
| `ip_address`         | TEXT        |                                          |
| `user_agent`         | TEXT        |                                          |
| `error_message`      | TEXT        |                                          |
| `created_at`         | TIMESTAMPTZ | DEFAULT now()                            |

---

### 3.17 `audit_logs` -- Journal d'audit

| Colonne           | Type             | Contraintes / Defaut                     |
|-------------------|------------------|------------------------------------------|
| `id`              | UUID             | PK                                       |
| `user_id`         | UUID             | FK -> `auth.users(id)` ON DELETE SET NULL|
| `user_email`      | TEXT             |                                          |
| `action`          | `audit_action`   | NOT NULL                                 |
| `resource_type`   | `audit_resource` | NOT NULL (ou `entity_type TEXT`)         |
| `resource_id`     | UUID             | (ou `entity_id`)                         |
| `details`         | JSONB            | DEFAULT '{}'                             |
| `old_data`        | JSONB            |                                          |
| `new_data`        | JSONB            |                                          |
| `ip_address`      | TEXT / INET      |                                          |
| `user_agent`      | TEXT             |                                          |
| `organization_id` | UUID             |                                          |
| `created_at`      | TIMESTAMPTZ      | DEFAULT now()                            |

---

### 3.18 `processed_stripe_events` -- Evenements Stripe traites

| Colonne        | Type        | Contraintes / Defaut                     |
|----------------|-------------|------------------------------------------|
| `id`           | UUID        | PK                                       |
| `event_id`     | TEXT        | UNIQUE, NOT NULL                         |
| `event_type`   | TEXT        | NOT NULL                                 |
| `processed_at` | TIMESTAMPTZ | DEFAULT now()                            |

> **RLS active mais sans politique** -- Seul le service role (webhook handler) peut acceder a cette table.

---

### 3.19 `performance_metrics` -- Metriques Web Vitals

| Colonne        | Type        | Contraintes / Defaut                     |
|----------------|-------------|------------------------------------------|
| `id`           | UUID        | PK                                       |
| `metric_name`  | TEXT        | NOT NULL, CHECK IN ('LCP','FID','CLS','FCP','TTPS','INP') |
| `metric_value` | NUMERIC     | NOT NULL                                 |
| `rating`       | TEXT        | NOT NULL, CHECK IN ('good','needs-improvement','poor') |
| `url`          | TEXT        | NOT NULL                                 |
| `user_agent`   | TEXT        |                                          |
| `connection_type` | TEXT     |                                          |
| `created_at`   | TIMESTAMPTZ | DEFAULT NOW()                            |

---

### 3.20 `user_consents` -- Consentements RGPD

| Colonne           | Type         | Contraintes / Defaut                     |
|-------------------|--------------|------------------------------------------|
| `id`              | UUID         | PK                                       |
| `user_id`         | UUID         | NOT NULL, FK -> `auth.users(id)`         |
| `consent_type`    | VARCHAR(100) | NOT NULL                                 |
| `granted`         | BOOLEAN      | DEFAULT false                            |
| `granted_at`      | TIMESTAMPTZ  |                                          |
| `revoked_at`      | TIMESTAMPTZ  |                                          |
| `ip_address`      | INET         |                                          |
| `user_agent`      | TEXT         |                                          |
| `consent_version` | VARCHAR(20)  | DEFAULT '1.0.0'                          |
| `source`          | VARCHAR(50)  | DEFAULT 'settings'                       |
| `created_at`      | TIMESTAMPTZ  | DEFAULT NOW()                            |
| `updated_at`      | TIMESTAMPTZ  | DEFAULT NOW()                            |

**Contrainte :** `UNIQUE(user_id, consent_type)`

---

### 3.21 `hitl_requests` -- Requetes Human-in-the-Loop (RGPD)

| Colonne          | Type         | Contraintes / Defaut                     |
|------------------|--------------|------------------------------------------|
| `id`             | UUID         | PK                                       |
| `action`         | VARCHAR(100) | NOT NULL                                 |
| `user_id`        | UUID         | NOT NULL, FK -> `auth.users(id)`         |
| `resource_type`  | VARCHAR(100) | NOT NULL                                 |
| `resource_id`    | VARCHAR(255) | NOT NULL                                 |
| `details`        | JSONB        | DEFAULT '{}'                             |
| `level`          | VARCHAR(50)  | DEFAULT 'confirmation'                   |
| `status`         | VARCHAR(50)  | DEFAULT 'pending'                        |
| `created_at`     | TIMESTAMPTZ  | DEFAULT NOW()                            |
| `expires_at`     | TIMESTAMPTZ  | NOT NULL                                 |
| `decided_at`     | TIMESTAMPTZ  |                                          |
| `decided_by`     | UUID         | FK -> `auth.users(id)`                   |
| `decision_reason`| TEXT         |                                          |

---

### 3.22 `user_settings` -- Parametres utilisateur

| Colonne                    | Type        | Contraintes / Defaut            |
|----------------------------|-------------|---------------------------------|
| `id`                       | UUID        | PK                              |
| `user_id`                  | UUID        | NOT NULL, FK, UNIQUE            |
| `theme_variant`            | VARCHAR(50) | DEFAULT 'classic'               |
| `accessibility_mode`       | VARCHAR(50) | DEFAULT 'standard'              |
| `language`                 | VARCHAR(10) | DEFAULT 'fr'                    |
| `hitl_preferences`         | JSONB       | DEFAULT '{}'                    |
| `notification_preferences` | JSONB       | DEFAULT '{}'                    |
| `workflow_preferences`     | JSONB       | DEFAULT '{}'                    |
| `referral_code`            | VARCHAR(50) | UNIQUE                          |
| `created_at`               | TIMESTAMPTZ | DEFAULT NOW()                   |
| `updated_at`               | TIMESTAMPTZ | DEFAULT NOW()                   |

---

### 3.23 `workflows` -- Workflows automatises

| Colonne         | Type         | Contraintes / Defaut                     |
|-----------------|--------------|------------------------------------------|
| `id`            | UUID         | PK                                       |
| `user_id`       | UUID         | NOT NULL, FK -> `auth.users(id)`         |
| `name`          | VARCHAR(255) | NOT NULL                                 |
| `description`   | TEXT         |                                          |
| `enabled`       | BOOLEAN      | DEFAULT true                             |
| `trigger_type`  | VARCHAR(100) | NOT NULL                                 |
| `trigger_config`| JSONB        | DEFAULT '{}'                             |
| `steps`         | JSONB        | NOT NULL, DEFAULT '[]'                   |
| `human_review`  | JSONB        | DEFAULT `'{"enabled":true,"required_for":[]}'` |
| `created_at`    | TIMESTAMPTZ  | DEFAULT NOW()                            |
| `updated_at`    | TIMESTAMPTZ  | DEFAULT NOW()                            |

---

### 3.24 `workflow_executions` -- Executions de workflows

| Colonne           | Type         | Contraintes / Defaut                     |
|-------------------|--------------|------------------------------------------|
| `id`              | UUID         | PK                                       |
| `workflow_id`     | UUID         | NOT NULL, FK -> `workflows(id)` ON DELETE CASCADE |
| `user_id`         | UUID         | NOT NULL, FK -> `auth.users(id)`         |
| `status`          | VARCHAR(50)  | DEFAULT 'pending'                        |
| `trigger_data`    | JSONB        | DEFAULT '{}'                             |
| `current_step_id` | VARCHAR(255) |                                          |
| `results`         | JSONB        | DEFAULT '{}'                             |
| `error`           | TEXT         |                                          |
| `started_at`      | TIMESTAMPTZ  | DEFAULT NOW()                            |
| `completed_at`    | TIMESTAMPTZ  |                                          |

---

### 3.25 `invoices` -- Factures

| Colonne                | Type          | Contraintes / Defaut                     |
|------------------------|---------------|------------------------------------------|
| `id`                   | UUID          | PK                                       |
| `user_id`              | UUID          | NOT NULL, FK -> `auth.users(id)`         |
| `quote_id`             | UUID          | FK -> `quotes(id)` ON DELETE SET NULL    |
| `invoice_number`       | VARCHAR(50)   | NOT NULL                                 |
| `invoice_type`         | VARCHAR(50)   | DEFAULT 'standard' (standard, deposit, balance) |
| `status`               | VARCHAR(50)   | DEFAULT 'draft'                          |
| `client_name`          | VARCHAR(255)  | NOT NULL                                 |
| `client_email`         | VARCHAR(255)  |                                          |
| `client_phone`         | VARCHAR(50)   |                                          |
| `client_address`       | TEXT          |                                          |
| `client_vat_number`    | VARCHAR(50)   |                                          |
| `subtotal`             | DECIMAL(12,2) | DEFAULT 0                                |
| `tax_rate`             | DECIMAL(5,2)  | DEFAULT 21                               |
| `tax_amount`           | DECIMAL(12,2) | DEFAULT 0                                |
| `total`                | DECIMAL(12,2) | DEFAULT 0                                |
| `amount_paid`          | DECIMAL(12,2) | DEFAULT 0                                |
| `amount_due`           | DECIMAL(12,2) | DEFAULT 0                                |
| `peppol_id`            | VARCHAR(100)  | E-invoicing Peppol                       |
| `structured_reference` | VARCHAR(50)   |                                          |
| `qr_code_data`         | TEXT          |                                          |
| `issue_date`           | DATE          | DEFAULT CURRENT_DATE                     |
| `due_date`             | DATE          | NOT NULL                                 |
| `paid_at`              | TIMESTAMPTZ   |                                          |
| `notes`                | TEXT          |                                          |
| `payment_terms`        | TEXT          |                                          |
| `created_at`           | TIMESTAMPTZ   | DEFAULT NOW()                            |
| `updated_at`           | TIMESTAMPTZ   | DEFAULT NOW()                            |

---

### 3.26 `invoice_items` -- Lignes de facture

| Colonne       | Type          | Contraintes / Defaut                     |
|---------------|---------------|------------------------------------------|
| `id`          | UUID          | PK                                       |
| `invoice_id`  | UUID          | NOT NULL, FK -> `invoices(id)` ON DELETE CASCADE |
| `description` | TEXT          | NOT NULL                                 |
| `quantity`    | DECIMAL(10,2) | DEFAULT 1                                |
| `unit`        | VARCHAR(50)   | DEFAULT 'unite'                          |
| `unit_price`  | DECIMAL(12,2) | NOT NULL                                 |
| `tax_rate`    | DECIMAL(5,2)  | DEFAULT 21                               |
| `total`       | DECIMAL(12,2) | NOT NULL                                 |
| `sort_order`  | INTEGER       | DEFAULT 0                                |
| `created_at`  | TIMESTAMPTZ   | DEFAULT NOW()                            |

---

### 3.27 `suppliers` -- Fournisseurs / Grossistes

| Colonne            | Type          | Contraintes / Defaut                     |
|--------------------|---------------|------------------------------------------|
| `id`               | UUID          | PK                                       |
| `name`             | VARCHAR(255)  | NOT NULL                                 |
| `category`         | VARCHAR(100)  |                                          |
| `contact_email`    | VARCHAR(255)  |                                          |
| `contact_phone`    | VARCHAR(50)   |                                          |
| `website`          | VARCHAR(255)  |                                          |
| `address`          | TEXT          |                                          |
| `city`             | VARCHAR(100)  |                                          |
| `postal_code`      | VARCHAR(20)   |                                          |
| `country`          | VARCHAR(100)  | DEFAULT 'Belgique'                       |
| `vat_number`       | VARCHAR(50)   |                                          |
| `api_endpoint`     | VARCHAR(255)  |                                          |
| `api_key_encrypted`| TEXT          |                                          |
| `is_verified`      | BOOLEAN       | DEFAULT false                            |
| `rating`           | DECIMAL(3,2)  |                                          |
| `created_at`       | TIMESTAMPTZ   | DEFAULT NOW()                            |
| `updated_at`       | TIMESTAMPTZ   | DEFAULT NOW()                            |

**RLS :** Lecture publique des fournisseurs verifies (`is_verified = true`).

---

### 3.28 `user_suppliers` -- Liens utilisateur-fournisseur

| Colonne         | Type          | Contraintes / Defaut                     |
|-----------------|---------------|------------------------------------------|
| `id`            | UUID          | PK                                       |
| `user_id`       | UUID          | NOT NULL, FK -> `auth.users(id)`         |
| `supplier_id`   | UUID          | NOT NULL, FK -> `suppliers(id)` ON DELETE CASCADE |
| `custom_code`   | VARCHAR(100)  |                                          |
| `discount_rate` | DECIMAL(5,2)  |                                          |
| `notes`         | TEXT          |                                          |
| `created_at`    | TIMESTAMPTZ   | DEFAULT NOW()                            |

**Contrainte :** `UNIQUE(user_id, supplier_id)`

---

### 3.29 `document_templates` -- Modeles de documents

| Colonne            | Type          | Contraintes / Defaut                     |
|--------------------|---------------|------------------------------------------|
| `id`               | UUID          | PK                                       |
| `user_id`          | UUID          | FK, NULL pour les modeles systeme        |
| `name`             | VARCHAR(255)  | NOT NULL                                 |
| `description`      | TEXT          |                                          |
| `type`             | VARCHAR(50)   | DEFAULT 'quote' (quote, invoice, contract) |
| `category`         | VARCHAR(100)  |                                          |
| `template_data`    | JSONB         | NOT NULL                                 |
| `preview_image_url`| TEXT          |                                          |
| `is_public`        | BOOLEAN       | DEFAULT false                            |
| `is_premium`       | BOOLEAN       | DEFAULT false                            |
| `price`            | DECIMAL(8,2)  | DEFAULT 0                                |
| `downloads_count`  | INTEGER       | DEFAULT 0                                |
| `rating`           | DECIMAL(3,2)  |                                          |
| `created_at`       | TIMESTAMPTZ   | DEFAULT NOW()                            |
| `updated_at`       | TIMESTAMPTZ   | DEFAULT NOW()                            |

---

### 3.30 `template_purchases` -- Achats de modeles

| Colonne        | Type          | Contraintes / Defaut                     |
|----------------|---------------|------------------------------------------|
| `id`           | UUID          | PK                                       |
| `user_id`      | UUID          | NOT NULL, FK -> `auth.users(id)`         |
| `template_id`  | UUID          | NOT NULL, FK -> `document_templates(id)` |
| `price_paid`   | DECIMAL(8,2)  | NOT NULL                                 |
| `purchased_at` | TIMESTAMPTZ   | DEFAULT NOW()                            |

**Contrainte :** `UNIQUE(user_id, template_id)`

---

### 3.31 `referrals` -- Programme de parrainage

| Colonne           | Type          | Contraintes / Defaut                     |
|-------------------|---------------|------------------------------------------|
| `id`              | UUID          | PK                                       |
| `referrer_id`     | UUID          | NOT NULL, FK -> `auth.users(id)`         |
| `referred_email`  | VARCHAR(255)  | NOT NULL                                 |
| `referred_user_id`| UUID          | FK -> `auth.users(id)` ON DELETE SET NULL|
| `referral_code`   | VARCHAR(50)   | UNIQUE, NOT NULL                         |
| `status`          | VARCHAR(50)   | DEFAULT 'pending' (pending, signed_up, converted, rewarded) |
| `reward_type`     | VARCHAR(50)   | (month_free, cash, tokens)               |
| `reward_amount`   | DECIMAL(10,2) |                                          |
| `reward_paid_at`  | TIMESTAMPTZ   |                                          |
| `created_at`      | TIMESTAMPTZ   | DEFAULT NOW()                            |
| `converted_at`    | TIMESTAMPTZ   |                                          |

---

### 3.32 `token_transactions` -- Transactions TokenDEAL

| Colonne         | Type         | Contraintes / Defaut                     |
|-----------------|--------------|------------------------------------------|
| `id`            | UUID         | PK                                       |
| `user_id`       | UUID         | NOT NULL, FK -> `auth.users(id)`         |
| `amount`        | INTEGER      | NOT NULL (negatif = depense)             |
| `balance_after` | INTEGER      | NOT NULL                                 |
| `type`          | VARCHAR(50)  | NOT NULL (earn, spend, bonus, refund)    |
| `source`        | VARCHAR(100) | NOT NULL (referral, review, purchase...) |
| `reference_id`  | VARCHAR(255) |                                          |
| `description`   | TEXT         |                                          |
| `created_at`    | TIMESTAMPTZ  | DEFAULT NOW()                            |

---

### 3.33 `import_jobs` -- Jobs d'import CSV

| Colonne          | Type         | Contraintes / Defaut                     |
|------------------|--------------|------------------------------------------|
| `id`             | UUID         | PK                                       |
| `user_id`        | UUID         | NOT NULL, FK -> `auth.users(id)`         |
| `file_name`      | VARCHAR(255) | NOT NULL                                 |
| `file_size`      | INTEGER      | NOT NULL                                 |
| `import_type`    | VARCHAR(100) | NOT NULL (clients, products, suppliers)  |
| `status`         | VARCHAR(50)  | DEFAULT 'pending'                        |
| `total_rows`     | INTEGER      |                                          |
| `processed_rows` | INTEGER      | DEFAULT 0                                |
| `success_rows`   | INTEGER      | DEFAULT 0                                |
| `error_rows`     | INTEGER      | DEFAULT 0                                |
| `error_details`  | JSONB        | DEFAULT '[]'                             |
| `mapping_config` | JSONB        |                                          |
| `created_at`     | TIMESTAMPTZ  | DEFAULT NOW()                            |
| `completed_at`   | TIMESTAMPTZ  |                                          |

---

### 3.34 `embeddings` -- Embeddings vectoriels (recherche IA)

| Colonne        | Type         | Contraintes / Defaut                     |
|----------------|--------------|------------------------------------------|
| `id`           | UUID         | PK                                       |
| `user_id`      | UUID         | NOT NULL, FK -> `auth.users(id)`         |
| `content_type` | VARCHAR(100) | NOT NULL (quote, product, client, document) |
| `content_id`   | UUID         | NOT NULL                                 |
| `content_text` | TEXT         | NOT NULL                                 |
| `metadata`     | JSONB        | DEFAULT '{}'                             |
| `created_at`   | TIMESTAMPTZ  | DEFAULT NOW()                            |

> **Note :** Colonne `embedding VECTOR(1536)` disponible si l'extension `pgvector` est activee.

---

### 3.35 `session_logs` -- Logs de session (RGPD)

| Colonne        | Type         | Contraintes / Defaut                     |
|----------------|--------------|------------------------------------------|
| `id`           | UUID         | PK                                       |
| `user_id`      | UUID         | FK -> `auth.users(id)` ON DELETE SET NULL|
| `session_id`   | VARCHAR(255) |                                          |
| `ip_address`   | INET         |                                          |
| `user_agent`   | TEXT         |                                          |
| `action`       | VARCHAR(100) | NOT NULL                                 |
| `resource_type`| VARCHAR(100) |                                          |
| `resource_id`  | VARCHAR(255) |                                          |
| `details`      | JSONB        | DEFAULT '{}'                             |
| `created_at`   | TIMESTAMPTZ  | DEFAULT NOW()                            |

**RLS :** Lecture seule pour l'utilisateur proprietaire.

---

### 3.36 `leads` -- Prospects / Soumissions de formulaire

| Colonne          | Type         | Contraintes / Defaut                     |
|------------------|--------------|------------------------------------------|
| `id`             | UUID         | PK                                       |
| `user_id`        | UUID         | NOT NULL, FK -> `auth.users(id)`         |
| `name`           | VARCHAR(255) | NOT NULL                                 |
| `email`          | VARCHAR(255) |                                          |
| `phone`          | VARCHAR(50)  |                                          |
| `address`        | TEXT         |                                          |
| `work_type`      | VARCHAR(100) |                                          |
| `description`    | TEXT         |                                          |
| `source`         | VARCHAR(100) | DEFAULT 'manual' (manual, widget, email, form, chatbot) |
| `source_details` | JSONB        | DEFAULT '{}'                             |
| `status`         | VARCHAR(50)  | DEFAULT 'new' (new, contacted, qualified, converted, lost) |
| `assigned_to`    | UUID         | FK -> `auth.users(id)`                   |
| `quote_id`       | UUID         | FK -> `quotes(id)`                       |
| `notes`          | TEXT         |                                          |
| `created_at`     | TIMESTAMPTZ  | DEFAULT NOW()                            |
| `updated_at`     | TIMESTAMPTZ  | DEFAULT NOW()                            |
| `contacted_at`   | TIMESTAMPTZ  |                                          |
| `converted_at`   | TIMESTAMPTZ  |                                          |

---

### 3.37 `vat_rates` -- Taux de TVA

| Colonne        | Type          | Contraintes / Defaut                     |
|----------------|---------------|------------------------------------------|
| `id`           | UUID          | PK                                       |
| `country_code` | VARCHAR(2)    | DEFAULT 'BE'                             |
| `rate`         | DECIMAL(5,2)  | NOT NULL                                 |
| `name`         | VARCHAR(100)  | NOT NULL                                 |
| `description`  | TEXT          |                                          |
| `conditions`   | TEXT          |                                          |
| `is_default`   | BOOLEAN       | DEFAULT false                            |

---

### 3.38 `companies` -- Entreprises (B2B)

| Colonne      | Type         | Contraintes / Defaut                     |
|--------------|--------------|------------------------------------------|
| `id`         | UUID         | PK                                       |
| `name`       | VARCHAR(255) | NOT NULL                                 |
| `email`      | VARCHAR(255) |                                          |
| `phone`      | VARCHAR(50)  |                                          |
| `address`    | TEXT         |                                          |
| `logo_url`   | TEXT         |                                          |
| `sector`     | VARCHAR(100) |                                          |
| `vat_number` | VARCHAR(50)  |                                          |
| `postal_code`| VARCHAR(20)  |                                          |
| `city`       | VARCHAR(100) |                                          |
| `country`    | VARCHAR(100) | DEFAULT 'Belgique'                       |
| `bank_name`  | VARCHAR(100) |                                          |
| `iban`       | VARCHAR(50)  |                                          |
| `bic`        | VARCHAR(20)  |                                          |
| `created_at` | TIMESTAMPTZ  | DEFAULT NOW()                            |
| `updated_at` | TIMESTAMPTZ  | DEFAULT NOW()                            |

---

## 4. Politiques RLS

### 4.1 Pattern : Donnees utilisateur (`auth.uid() = user_id`)

Les tables suivantes utilisent le pattern standard ou l'utilisateur ne peut acceder qu'a ses propres donnees :

| Table                  | Operations                               |
|------------------------|------------------------------------------|
| `profiles`             | ALL USING (`auth.uid() = id`)            |
| `quotes`               | ALL USING (`auth.uid() = user_id`)       |
| `subscriptions`        | SELECT/UPDATE USING (`auth.uid() = user_id`) |
| `user_sectors`         | SELECT/INSERT/DELETE USING (`auth.uid() = user_id`) |
| `usage_stats`          | SELECT USING (`auth.uid() = user_id`)    |
| `user_consents`        | ALL USING (`auth.uid() = user_id`)       |
| `hitl_requests`        | ALL USING (`auth.uid() = user_id`)       |
| `user_settings`        | ALL USING (`auth.uid() = user_id`)       |
| `workflows`            | ALL USING (`auth.uid() = user_id`)       |
| `workflow_executions`  | ALL USING (`auth.uid() = user_id`)       |
| `leads`                | ALL USING (`auth.uid() = user_id`)       |
| `api_keys`             | ALL USING (`auth.uid() = user_id`)       |
| `invoices`             | ALL USING (`auth.uid() = user_id`)       |
| `user_suppliers`       | ALL USING (`auth.uid() = user_id`)       |
| `referrals`            | ALL USING (`auth.uid() = referrer_id`)   |
| `notifications`        | ALL USING (`auth.uid() = user_id`)       |
| `audit_logs`           | SELECT USING (`auth.uid() = user_id`)    |
| `import_jobs`          | ALL USING (`auth.uid() = user_id`)       |
| `embeddings`           | ALL USING (`auth.uid() = user_id`)       |

### 4.2 Pattern : Acces via relation parent

| Table                  | Logique                                  |
|------------------------|------------------------------------------|
| `quote_items`          | Via `quotes.user_id = auth.uid()`        |
| `invoice_items`        | Via `invoices.user_id = auth.uid()`      |
| `quote_materials`      | Via `quotes.user_id = auth.uid()`        |
| `quote_labor`          | Via `quotes.user_id = auth.uid()`        |
| `quote_comments`       | SELECT via proprietaire du devis OU membre de l'organisation ; INSERT/UPDATE/DELETE pour ses propres commentaires |

### 4.3 Pattern : Acces multi-tenant (organisations)

| Table                     | Logique                                 |
|---------------------------|------------------------------------------|
| `organizations`           | SELECT si membre ; UPDATE si owner/admin ; DELETE si owner uniquement |
| `organization_members`    | SELECT si membre de l'org ; INSERT/UPDATE/DELETE si owner/admin |
| `organization_invitations`| ALL si admin/owner ; SELECT si email = propre email et pending |

### 4.4 Pattern : Lecture publique

| Table               | Logique                                  |
|---------------------|------------------------------------------|
| `plans`             | SELECT pour tous (`USING (true)`)        |
| `suppliers`         | SELECT si `is_verified = true`           |
| `document_templates`| SELECT si `is_public = true` OU proprietaire |

### 4.5 Pattern : Sans politique (service role uniquement)

| Table                      | Logique                                  |
|----------------------------|------------------------------------------|
| `processed_stripe_events`  | RLS active, aucune politique -- seul le service role peut acceder |

### 4.6 Pattern : Metriques

| Table                 | Logique                                  |
|-----------------------|------------------------------------------|
| `performance_metrics` | INSERT pour tous ; SELECT si `profiles.role IN ('admin', 'super_admin')` |
| `session_logs`        | SELECT pour l'utilisateur proprietaire uniquement |
| `token_transactions`  | SELECT pour l'utilisateur proprietaire uniquement |

---

## 5. Fonctions et Triggers

### 5.1 Fonctions utilitaires

| Fonction                          | Type      | Description                                        |
|-----------------------------------|-----------|----------------------------------------------------|
| `update_updated_at()`             | TRIGGER   | Met a jour `updated_at` a `NOW()` avant chaque UPDATE. Appliquee dynamiquement a toutes les tables avec la colonne `updated_at`. |
| `calculate_quote_totals()`        | TRIGGER   | Recalcule `subtotal`, `tax_amount`, `total` du devis apres INSERT/UPDATE/DELETE sur `quote_items`. |
| `generate_quote_number()`         | TRIGGER   | Genere le numero de devis format `PREFIX-YYYY-MM-XXXX` avant INSERT si `quote_number` est vide. |

### 5.2 Fonctions d'inscription

| Fonction                            | Type      | Description                                      |
|-------------------------------------|-----------|--------------------------------------------------|
| `handle_new_user()`                 | TRIGGER   | Cree un profil dans `profiles` apres inscription dans `auth.users`. `SECURITY DEFINER`. |
| `handle_new_user_subscription()`    | TRIGGER   | Cree un abonnement gratuit et initialise `usage_stats` pour chaque nouvel utilisateur. `SECURITY DEFINER`. |

### 5.3 Fonctions d'abonnement et quotas

| Fonction                            | Type      | Description                                      |
|-------------------------------------|-----------|--------------------------------------------------|
| `increment_quote_count()`           | TRIGGER   | Incremente `quotes_created` dans `usage_stats` apres chaque INSERT sur `quotes`. |
| `can_create_quote(UUID)`            | FUNCTION  | Retourne `BOOLEAN` -- verifie si l'utilisateur n'a pas depasse son quota mensuel de devis. |
| `has_sector_access(UUID, sector_type)` | FUNCTION | Retourne `BOOLEAN` -- verifie si l'utilisateur a acces au secteur (plan ultimate = acces total). |

### 5.4 Fonctions d'audit et journalisation

| Fonction                            | Type      | Description                                      |
|-------------------------------------|-----------|--------------------------------------------------|
| `create_audit_log(...)`             | FUNCTION  | Cree une entree dans `audit_logs` avec tous les details (action, resource, IP, etc.). `SECURITY DEFINER`. |
| `increment_ai_usage(UUID)`          | FUNCTION  | Incremente le compteur `ai_requests` dans `usage_stats`. `SECURITY DEFINER`. |
| `log_audit_event(TEXT, TEXT, UUID, JSONB, JSONB)` | FUNCTION | Version simplifiee de journalisation d'audit avec `old_data`/`new_data`. `SECURITY DEFINER`. |

### 5.5 Fonctions d'organisation

| Fonction                            | Type      | Description                                      |
|-------------------------------------|-----------|--------------------------------------------------|
| `create_organization(TEXT, TEXT, TEXT, TEXT)` | FUNCTION | Cree une organisation et ajoute le createur comme `owner`. `SECURITY DEFINER`. |
| `has_org_permission(UUID, org_role)` | FUNCTION  | Verifie si l'utilisateur a le role requis dans l'organisation (hierarchie owner > admin > member > viewer). |
| `accept_invitation(TEXT)`           | FUNCTION  | Accepte une invitation par token, ajoute l'utilisateur comme membre. `SECURITY DEFINER`. |
| `get_user_organizations()`          | FUNCTION  | Retourne la liste des organisations de l'utilisateur avec role et nombre de membres. |

### 5.6 Fonctions API

| Fonction                            | Type      | Description                                      |
|-------------------------------------|-----------|--------------------------------------------------|
| `verify_api_key(TEXT)`              | FUNCTION  | Verifie un hash de cle API, retourne `user_id`, `organization_id`, `scopes`, `rate_limit`. Met a jour `last_used_at` et `request_count`. |
| `log_api_request(...)`              | FUNCTION  | Enregistre une requete API dans `api_request_logs`. |
| `get_api_usage_stats(UUID, INTEGER)`| FUNCTION  | Retourne les statistiques API : total, succes, echecs, temps moyen, repartition journaliere. |

### 5.7 Fonctions de recherche et statistiques

| Fonction                            | Type      | Description                                      |
|-------------------------------------|-----------|--------------------------------------------------|
| `search_quotes(UUID, TEXT, INT, INT)` | FUNCTION | Recherche full-text (french) sur les devis avec ranking. |
| `get_user_quote_stats(UUID)`        | FUNCTION  | Retourne les statistiques de devis : total, revenus, devis du mois, taux d'acceptation. |
| `get_dashboard_stats(...)`          | FUNCTION  | Statistiques du tableau de bord.                 |
| `get_performance_summary(INT, TEXT)`| FUNCTION  | Resume des metriques Web Vitals (avg, p75, p90, pourcentages). |
| `cleanup_old_performance_metrics()` | FUNCTION  | Supprime les metriques de plus de 30 jours.      |

### 5.8 Fonctions metier

| Fonction                            | Type      | Description                                      |
|-------------------------------------|-----------|--------------------------------------------------|
| `notify_quote_comment()`           | TRIGGER   | Cree des notifications pour le proprietaire du devis et les commentateurs precedents lors d'un nouveau commentaire. `SECURITY DEFINER`. |
| `generate_invoice_number(UUID)`     | FUNCTION  | Genere un numero de facture format `FYYYY-00001`. |
| `generate_referral_code(UUID)`      | FUNCTION  | Genere un code de parrainage base sur le nom de l'utilisateur. |
| `add_tokens(UUID, INT, VARCHAR, VARCHAR, TEXT)` | FUNCTION | Ajoute des tokens au solde de l'utilisateur et enregistre la transaction. `SECURITY DEFINER`. |

### 5.9 Triggers

| Trigger                              | Table             | Evenement         | Fonction                         |
|--------------------------------------|-------------------|-------------------|----------------------------------|
| `trigger_profiles_updated_at`        | `profiles`        | BEFORE UPDATE     | `update_updated_at()`            |
| `trigger_quotes_updated_at`          | `quotes`          | BEFORE UPDATE     | `update_updated_at()`            |
| `update_*_updated_at`               | Toutes tables avec `updated_at` | BEFORE UPDATE | `update_updated_at()` (dynamique) |
| `trigger_calculate_totals_insert`    | `quote_items`     | AFTER INSERT      | `calculate_quote_totals()`       |
| `trigger_calculate_totals_update`    | `quote_items`     | AFTER UPDATE      | `calculate_quote_totals()`       |
| `trigger_calculate_totals_delete`    | `quote_items`     | AFTER DELETE       | `calculate_quote_totals()`       |
| `trigger_generate_quote_number`      | `quotes`          | BEFORE INSERT     | `generate_quote_number()`        |
| `on_auth_user_created`               | `auth.users`      | AFTER INSERT      | `handle_new_user()`              |
| `on_auth_user_created_subscription`  | `auth.users`      | AFTER INSERT      | `handle_new_user_subscription()` |
| `trigger_increment_quote_count`      | `quotes`          | AFTER INSERT      | `increment_quote_count()`        |
| `on_quote_comment_notify`            | `quote_comments`  | AFTER INSERT      | `notify_quote_comment()`         |
| `quote_comments_updated_at`          | `quote_comments`  | BEFORE UPDATE     | `update_quote_comment_updated_at()` |
| `organizations_updated_at`           | `organizations`   | BEFORE UPDATE     | `update_updated_at()`            |

---

## 6. Historique des Migrations

| #  | Fichier                                     | Description                                            |
|----|---------------------------------------------|--------------------------------------------------------|
| 1  | `schema.sql`                                | Schema de base : profiles, quotes, quote_items, extensions, fonctions, RLS, storage buckets |
| 2  | `migration-v2.sql`                          | Infos bancaires belges, signature, statuts quote_status (draft/sent/accepted/rejected), bucket signatures, quote_materials, quote_labor |
| 3  | `migration-subscriptions.sql`               | Systeme d'abonnements : enum subscription_plan, tables plans/subscriptions/user_sectors/usage_stats, fonctions de quota |
| 4  | `migration-organizations.sql`               | Multi-tenant : enums org_role/invitation_status, tables organizations/organization_members/organization_invitations, fonctions RBAC |
| 5  | `migration-api-keys.sql`                    | API publique : api_keys, api_request_logs, fonctions verify/log/stats |
| 6  | `migration-processed-stripe-events.sql`     | Idempotence Stripe : processed_stripe_events, pas de politique RLS |
| 7  | `migration-performance.sql`                 | Dashboard stats, metriques performance                 |
| 8  | `FULL_MIGRATION.sql`                        | Migration consolidee entreprise : audit_logs avec enums audit_action/audit_resource, organisations, create_audit_log, increment_ai_usage |
| 9  | `20240127_performance_indexes.sql`          | Index de performance, audit_logs restructure, fonctions search_quotes, get_user_quote_stats, log_audit_event |
| 10 | `20240128_quote_comments.sql`               | Table quote_comments, RLS avec acces organisation, publication Realtime |
| 11 | `20240128_notifications.sql`                | Table notifications, publication Realtime, fonction notify_quote_comment |
| 12 | `20240129_performance_metrics.sql`          | Table performance_metrics, fonctions get_performance_summary et cleanup |
| 13 | `20240130_complete_schema.sql`              | Schema complet v2.0 : user_consents, hitl_requests, user_settings, workflows, workflow_executions, invoices, invoice_items, suppliers, user_suppliers, document_templates, template_purchases, referrals, token_transactions, import_jobs, embeddings, session_logs, leads, vat_rates, api_keys |
| 14 | `20240130_complete_schema_fixed.sql`        | Version corrigee : cree les tables de base si manquantes (companies, profiles, quotes, quote_items, audit_logs, notifications), puis applique les extensions |
| 15 | `20260126_add_api_keys_permissions.sql`     | Ajout colonnes manquantes : permissions, rate_limit_remaining, revoked_at sur api_keys |
| 16 | `20260126_fix_missing_tables.sql`           | Tables manquantes : subscriptions, quote_comments, usage_stats, colonnes profiles supplementaires, abonnements par defaut pour utilisateurs existants |

---

## 7. Storage Buckets

| Bucket       | Public | Description                              | Politique d'acces                        |
|--------------|--------|------------------------------------------|------------------------------------------|
| `logos`      | Oui    | Logos des entreprises                    | Lecture publique ; upload/update/delete par proprietaire (`auth.uid() = folder`) |
| `pdfs`       | Non    | Devis et factures PDF                    | Lecture/upload/delete par proprietaire uniquement |
| `signatures` | Non    | Signatures electroniques                 | Lecture/upload/delete par proprietaire uniquement |

**Structure des dossiers :** `{bucket}/{user_id}/{filename}`

---

## 8. Donnees de Seed

### 8.1 Plans d'abonnement (4 niveaux)

| Plan     | Nom affiche | Prix/mois | Prix/an | Secteurs | Devis/mois | IA  | PDF Protection | Support prioritaire |
|----------|-------------|-----------|---------|----------|------------|-----|----------------|---------------------|
| `free`   | Gratuit     | 0.00      | 0       | 1        | 5          | Non | Non            | Non                 |
| `starter`| Starter     | 9.99      | 99      | 3        | 30         | Oui | Non            | Non                 |
| `pro`    | Pro         | 24.99     | 249     | 10       | 100        | Oui | Oui            | Non                 |
| `ultimate`| Ultime     | 49.99     | 499     | Illimite | Illimite   | Oui | Oui            | Oui                 |

### 8.2 Taux de TVA belges (4 taux)

| Taux   | Nom                       | Description                              | Conditions                               |
|--------|---------------------------|------------------------------------------|------------------------------------------|
| 21.00% | TVA Standard              | Taux normal (par defaut)                 | --                                       |
| 6.00%  | TVA Reduit (Renovation)   | Renovation de logements de plus de 10 ans| Habitation privee de plus de 10 ans      |
| 6.00%  | TVA Reduit (Social)       | Logements sociaux                        | Logements sociaux                        |
| 0.00%  | Exonere / Export          | Livraisons intracommunautaires           | Numero TVA valide requis                 |

---

## Diagramme des relations (resume)

```
auth.users
  |
  +-- profiles (1:1)
  |     +-- company_id -> companies
  |
  +-- quotes (1:N)
  |     +-- quote_items (1:N)
  |     +-- quote_materials (1:N, BTP)
  |     +-- quote_labor (1:N, BTP)
  |     +-- quote_comments (1:N)
  |     +-- organization_id -> organizations
  |     +-- workflow_execution_id -> workflow_executions
  |     +-- lead_id -> leads
  |
  +-- subscriptions (1:1)
  +-- user_sectors (1:N)
  +-- usage_stats (1:N, par mois)
  +-- user_settings (1:1)
  +-- user_consents (1:N)
  +-- hitl_requests (1:N)
  +-- workflows (1:N)
  |     +-- workflow_executions (1:N)
  |
  +-- invoices (1:N)
  |     +-- invoice_items (1:N)
  |     +-- quote_id -> quotes
  |
  +-- leads (1:N)
  +-- api_keys (1:N)
  +-- notifications (1:N)
  +-- audit_logs (1:N)
  +-- referrals (1:N)
  +-- token_transactions (1:N)
  +-- import_jobs (1:N)
  +-- embeddings (1:N)
  +-- session_logs (1:N)
  +-- document_templates (1:N)
  +-- template_purchases (1:N)
  +-- user_suppliers (N:M -> suppliers)

organizations
  +-- organization_members (1:N -> auth.users)
  +-- organization_invitations (1:N)
  +-- quotes (1:N, optionnel)

plans (table de reference, 4 lignes seeded)
vat_rates (table de reference, 4 lignes seeded)
processed_stripe_events (service role uniquement)
performance_metrics (metriques anonymes)
api_request_logs (logs API -> api_keys)
```
