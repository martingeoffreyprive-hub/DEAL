# QuoteVoice - Générateur de Devis par Transcription Vocale

Application web mobile pour générer automatiquement des devis et offres commerciales personnalisés à partir de transcriptions vocales, avec validation humaine avant export PDF.

## Fonctionnalités

- **Import de transcription** : Collez directement votre transcription depuis Plaud Note Pro ou tout autre outil
- **Analyse IA** : Détection automatique du secteur d'activité et extraction des informations
- **Génération de devis** : Création automatique d'un devis structuré avec vocabulaire adapté
- **Édition** : Modification complète du devis généré (client, prestations, prix)
- **Export PDF** : Génération d'un PDF professionnel avec logo et mentions légales
- **Historique** : Gestion complète de tous vos devis

## Secteurs supportés

- BTP / Construction
- Services Informatiques / IT
- Conseil / Consulting
- Artisanat
- Services à la personne
- Autres (détection intelligente)

## Stack Technique

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : Next.js API Routes, Supabase
- **Base de données** : PostgreSQL (Supabase)
- **Authentification** : Supabase Auth
- **IA** : API Claude (Anthropic)
- **PDF** : @react-pdf/renderer

---

## Installation

### Prérequis

- Node.js 18+ installé
- Compte Supabase (gratuit)
- Clé API Anthropic (Claude)

### Étapes d'installation

#### 1. Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com) et créez un compte
2. Cliquez sur "New Project"
3. Donnez un nom à votre projet (ex: "quotevoice")
4. Choisissez un mot de passe pour la base de données
5. Sélectionnez la région la plus proche (ex: "West EU")
6. Attendez que le projet soit créé (~2 minutes)

#### 2. Configurer la base de données

1. Dans votre projet Supabase, allez dans **SQL Editor**
2. Cliquez sur "New Query"
3. Copiez tout le contenu du fichier `supabase/schema.sql`
4. Collez-le dans l'éditeur SQL
5. Cliquez sur "Run" pour exécuter le script

#### 3. Récupérer les clés Supabase

1. Dans Supabase, allez dans **Settings > API**
2. Copiez :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` (sous "Project API keys") → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` (sous "Project API keys") → `SUPABASE_SERVICE_ROLE_KEY`

#### 4. Obtenir une clé API Anthropic

1. Allez sur [console.anthropic.com](https://console.anthropic.com)
2. Créez un compte ou connectez-vous
3. Allez dans **API Keys**
4. Créez une nouvelle clé API
5. Copiez la clé → `ANTHROPIC_API_KEY`

#### 5. Configurer les variables d'environnement

```bash
# Copiez le fichier d'exemple
cp .env.example .env.local

# Éditez .env.local avec vos clés
```

Contenu de `.env.local` :
```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
ANTHROPIC_API_KEY=sk-ant-api03-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### 6. Installer les dépendances

```bash
npm install
```

#### 7. Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

---

## Utilisation

### 1. Créer un compte

1. Accédez à l'application
2. Cliquez sur "Commencer" ou "Créer un compte"
3. Entrez votre email et un mot de passe (min. 8 caractères)

### 2. Configurer votre profil entreprise

1. Allez dans "Profil entreprise"
2. Remplissez les informations de votre entreprise
3. Uploadez votre logo
4. Définissez vos mentions légales
5. Sauvegardez

### 3. Créer un devis

1. Cliquez sur "Nouveau devis"
2. Collez votre transcription vocale
3. Sélectionnez le secteur (ou laissez sur "Détection automatique")
4. Cliquez sur "Générer le devis"
5. L'IA analyse et génère un devis structuré

### 4. Éditer le devis

1. Modifiez les informations client si nécessaire
2. Ajustez les prestations (description, quantité, prix)
3. Ajoutez ou supprimez des lignes
4. Modifiez le taux de TVA si besoin
5. Ajoutez des notes ou conditions particulières

### 5. Exporter en PDF

1. Allez dans l'onglet "Aperçu PDF"
2. Vérifiez le rendu du document
3. Cliquez sur "Télécharger PDF"

---

## Structure du projet

```
quotevoice/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── (auth)/             # Pages d'authentification
│   │   ├── (dashboard)/        # Pages du dashboard
│   │   ├── api/                # API Routes
│   │   └── page.tsx            # Page d'accueil
│   ├── components/
│   │   ├── ui/                 # Composants shadcn/ui
│   │   ├── layout/             # Header, Sidebar
│   │   └── quotes/             # Composants devis
│   ├── lib/
│   │   ├── supabase/           # Clients Supabase
│   │   └── utils.ts            # Fonctions utilitaires
│   ├── hooks/                  # React hooks
│   └── types/                  # Types TypeScript
├── supabase/
│   └── schema.sql              # Schéma de base de données
├── docs/
│   └── bmad/                   # Documentation BMAD
└── public/                     # Assets statiques
```

---

## Flux utilisateur

```
┌─────────────────────────────────────────────────────────────┐
│                     Page d'accueil                          │
│                          │                                   │
│                          ▼                                   │
│              ┌──── Connexion ────┐                          │
│              │                   │                          │
│              ▼                   ▼                          │
│        Inscription          Connexion                       │
│              │                   │                          │
│              └─────────┬─────────┘                          │
│                        │                                    │
│                        ▼                                    │
│               ┌─── Dashboard ───┐                           │
│               │                 │                           │
│    ┌──────────┼─────────────────┼──────────┐               │
│    │          │                 │          │               │
│    ▼          ▼                 ▼          ▼               │
│  Profil   Nouveau devis    Mes devis   Statistiques        │
│    │          │                 │                          │
│    │          ▼                 │                          │
│    │   Coller transcription     │                          │
│    │          │                 │                          │
│    │          ▼                 │                          │
│    │   Génération IA            │                          │
│    │          │                 │                          │
│    │          ▼                 │                          │
│    │   Édition du devis ◄───────┘                          │
│    │          │                                            │
│    │          ▼                                            │
│    │   Aperçu PDF                                          │
│    │          │                                            │
│    │          ▼                                            │
│    │   Téléchargement                                      │
│    │                                                       │
│    └───────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────┘
```

---

## Captures d'écran

### Page d'accueil
La landing page présente les fonctionnalités clés de QuoteVoice avec un design moderne et épuré.

### Dashboard
Vue d'ensemble de votre activité : nombre de devis, montant total, devis récents.

### Création de devis
Interface simple pour coller votre transcription et lancer la génération IA.

### Éditeur de devis
Formulaire complet pour modifier tous les aspects du devis généré.

### Aperçu PDF
Prévisualisation du document final avant téléchargement.

---

## Déploiement en production

### Vercel (recommandé)

1. Poussez votre code sur GitHub
2. Connectez-vous à [vercel.com](https://vercel.com)
3. Importez votre repository
4. Configurez les variables d'environnement
5. Déployez

### Variables d'environnement Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
NEXT_PUBLIC_APP_URL (votre domaine Vercel)
```

---

## Licence

Projet privé - Tous droits réservés

---

## Support

Pour toute question ou problème, ouvrez une issue sur le repository GitHub.
