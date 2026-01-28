# DEAL - Devis Professionnels pour Artisans

Application web mobile pour générer automatiquement des devis et offres commerciales personnalisés à partir de transcriptions vocales, avec validation humaine avant export PDF.

**Production**: [www.dealofficialapp.com](https://www.dealofficialapp.com)

## Fonctionnalités

- **Import de transcription** : Collez directement votre transcription depuis Plaud Note Pro ou tout autre outil
- **Analyse IA** : Détection automatique du secteur d'activité et extraction des informations
- **Génération de devis** : Création automatique d'un devis structuré avec vocabulaire adapté
- **Édition** : Modification complète du devis généré (client, prestations, prix)
- **Export PDF** : Génération d'un PDF professionnel avec logo et mentions légales
- **Historique** : Gestion complète de tous vos devis
- **Panel Admin** : Interface d'administration complète

## Secteurs supportés (27)

- BTP / Construction
- Électricité
- Plomberie
- Chauffage / HVAC
- Menuiserie
- Peinture
- Carrelage
- Toiture
- Jardinage / Paysagisme
- Services Informatiques / IT
- Conseil / Consulting
- Et plus encore...

## Stack Technique

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : Next.js API Routes, Supabase
- **Base de données** : PostgreSQL (Supabase)
- **Authentification** : Supabase Auth
- **IA** : API Claude (Anthropic)
- **PDF** : @react-pdf/renderer
- **Paiements** : Stripe
- **Rate Limiting** : Upstash Redis

---

## Installation

### Prérequis

- Node.js 18+ installé
- Compte Supabase (gratuit)
- Clé API Anthropic (Claude)
- Compte Stripe (pour les paiements)
- Compte Upstash (pour le rate limiting)

### Étapes d'installation

#### 1. Cloner le repository

```bash
git clone https://github.com/martingeoffreyprive-hub/DEAL.git
cd DEAL
```

#### 2. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Cliquez sur "New Project"
3. Donnez un nom à votre projet (ex: "deal")
4. Choisissez un mot de passe pour la base de données
5. Sélectionnez la région la plus proche (ex: "West EU")
6. Attendez que le projet soit créé (~2 minutes)

#### 3. Configurer la base de données

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur "New Query"
3. Copiez tout le contenu du fichier `supabase/schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur "Run" pour exécuter le script

#### 4. Configurer les variables d'environnement

```bash
# Copiez le fichier d'exemple
cp .env.example .env.local

# Éditez .env.local avec vos clés
```

Voir `.env.example` pour la liste complète des variables requises.

#### 5. Installer les dépendances

```bash
npm install
```

#### 6. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## Structure du projet

```
deal/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── (auth)/             # Pages d'authentification
│   │   ├── (dashboard)/        # Pages du dashboard
│   │   ├── (admin)/            # Panel d'administration
│   │   ├── api/                # API Routes
│   │   └── page.tsx            # Page d'accueil
│   ├── components/
│   │   ├── ui/                 # Composants shadcn/ui
│   │   ├── layout/             # Header, Sidebar
│   │   ├── brand/              # Composants branding DEAL
│   │   └── quotes/             # Composants devis
│   ├── lib/
│   │   ├── supabase/           # Clients Supabase
│   │   ├── cors.ts             # Configuration CORS
│   │   ├── rate-limit.ts       # Rate limiting
│   │   └── utils.ts            # Fonctions utilitaires
│   ├── hooks/                  # React hooks
│   └── types/                  # Types TypeScript
├── supabase/
│   └── schema.sql              # Schéma de base de données
├── docs/
│   ├── bmad/                   # Documentation BMAD
│   └── generated/              # Documents générés
├── _bmad-output/               # Artefacts BMM
└── public/                     # Assets statiques
```

---

## Déploiement

### Vercel (recommandé)

1. Poussez votre code sur GitHub
2. Connectez-vous à [vercel.com](https://vercel.com)
3. Importez votre repository
4. Configurez les variables d'environnement (voir `.env.example`)
5. Déployez

### Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase |
| `ANTHROPIC_API_KEY` | Clé API Anthropic |
| `NEXT_PUBLIC_APP_URL` | URL de l'application |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe |
| `UPSTASH_REDIS_REST_URL` | URL Redis Upstash |
| `UPSTASH_REDIS_REST_TOKEN` | Token Redis Upstash |

---

## Branding

- **Couleurs**: Navy (#252B4A) + Coral (#E85A5A)
- **Police**: Inter
- **Logo**: Voir `/public/` et composants `/src/components/brand/`

---

## Licence

Projet privé - Tous droits réservés

---

## Support

Pour toute question ou problème, contactez l'équipe DEAL.
