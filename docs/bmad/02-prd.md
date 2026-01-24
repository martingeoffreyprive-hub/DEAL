# QuoteVoice - Product Requirements Document (PRD)

## 1. Aperçu du Produit

### 1.1 Objectif
QuoteVoice est une application web mobile qui transforme les transcriptions vocales en devis professionnels grâce à l'IA, avec validation humaine avant export PDF.

### 1.2 Contexte
Les professionnels utilisent de plus en plus des outils de transcription comme Plaud Note Pro pour capturer leurs échanges avec les clients. QuoteVoice s'intègre dans ce workflow en automatisant la création de documents commerciaux.

## 2. Personas Utilisateurs

### 2.1 Pierre - Artisan Plombier
- 45 ans, entrepreneur individuel
- Fait 3-5 rendez-vous clients par jour
- Utilise Plaud Note Pro pour prendre des notes
- Besoin : Générer des devis rapidement entre deux interventions

### 2.2 Marie - Consultante IT
- 35 ans, freelance
- Réalise des audits et propositions commerciales
- Besoin : Structurer ses notes en offres professionnelles avec vocabulaire technique

### 2.3 Thomas - Chef d'entreprise BTP
- 50 ans, dirige une PME de 10 personnes
- Délègue la création de devis mais veut garder le contrôle
- Besoin : Standardiser les devis de son équipe

## 3. User Stories

### 3.1 Authentification
- **US-001** : En tant qu'utilisateur, je peux créer un compte avec mon email et mot de passe
- **US-002** : En tant qu'utilisateur, je peux me connecter à mon compte
- **US-003** : En tant qu'utilisateur, je peux réinitialiser mon mot de passe
- **US-004** : En tant qu'utilisateur, je peux me déconnecter

### 3.2 Profil Entreprise
- **US-010** : En tant qu'utilisateur, je peux configurer mon profil entreprise (nom, SIRET, adresse)
- **US-011** : En tant qu'utilisateur, je peux uploader mon logo
- **US-012** : En tant qu'utilisateur, je peux définir mes mentions légales par défaut
- **US-013** : En tant qu'utilisateur, je peux choisir mon secteur d'activité principal

### 3.3 Création de Devis
- **US-020** : En tant qu'utilisateur, je peux coller une transcription texte
- **US-021** : En tant qu'utilisateur, je vois l'IA analyser ma transcription
- **US-022** : En tant qu'utilisateur, je vois le secteur détecté automatiquement
- **US-023** : En tant qu'utilisateur, je peux modifier le secteur si la détection est incorrecte
- **US-024** : En tant qu'utilisateur, je reçois un devis généré avec vocabulaire adapté
- **US-025** : En tant qu'utilisateur, je peux modifier chaque section du devis
- **US-026** : En tant qu'utilisateur, je peux ajouter/supprimer des lignes de prestation
- **US-027** : En tant qu'utilisateur, je peux modifier les prix et quantités
- **US-028** : En tant qu'utilisateur, je vois le total se calculer automatiquement

### 3.4 Export et Historique
- **US-030** : En tant qu'utilisateur, je peux prévisualiser le devis en PDF
- **US-031** : En tant qu'utilisateur, je peux télécharger le PDF
- **US-032** : En tant qu'utilisateur, je peux sauvegarder le devis comme brouillon
- **US-033** : En tant qu'utilisateur, je vois la liste de tous mes devis
- **US-034** : En tant qu'utilisateur, je peux rechercher un devis par client ou date
- **US-035** : En tant qu'utilisateur, je peux dupliquer un devis existant
- **US-036** : En tant qu'utilisateur, je peux supprimer un devis

## 4. Exigences Fonctionnelles

### 4.1 Module d'Authentification
| ID | Exigence | Priorité |
|----|----------|----------|
| REQ-001 | Authentification email/password via Supabase Auth | P0 |
| REQ-002 | Session persistante avec refresh token | P0 |
| REQ-003 | Protection des routes authentifiées | P0 |
| REQ-004 | Email de confirmation à l'inscription | P1 |

### 4.2 Module Profil Entreprise
| ID | Exigence | Priorité |
|----|----------|----------|
| REQ-010 | Formulaire de profil avec validation | P0 |
| REQ-011 | Upload logo (max 2MB, JPG/PNG) | P1 |
| REQ-012 | Stockage logo sur Supabase Storage | P1 |
| REQ-013 | Éditeur de mentions légales | P1 |

### 4.3 Module Génération IA
| ID | Exigence | Priorité |
|----|----------|----------|
| REQ-020 | Analyse de transcription via Claude API | P0 |
| REQ-021 | Détection du secteur d'activité | P0 |
| REQ-022 | Extraction des prestations et quantités | P0 |
| REQ-023 | Génération de descriptions professionnelles | P0 |
| REQ-024 | Estimation des prix selon le secteur | P1 |
| REQ-025 | Streaming de la réponse IA | P2 |

### 4.4 Module Éditeur de Devis
| ID | Exigence | Priorité |
|----|----------|----------|
| REQ-030 | Formulaire d'édition structuré | P0 |
| REQ-031 | Calcul automatique des totaux (HT, TVA, TTC) | P0 |
| REQ-032 | Gestion des taux de TVA multiples | P1 |
| REQ-033 | Sauvegarde automatique (brouillon) | P1 |

### 4.5 Module Export PDF
| ID | Exigence | Priorité |
|----|----------|----------|
| REQ-040 | Génération PDF côté client | P0 |
| REQ-041 | Template PDF professionnel avec logo | P0 |
| REQ-042 | Numérotation automatique des devis | P0 |
| REQ-043 | Stockage PDF sur Supabase Storage | P1 |

## 5. Exigences Non-Fonctionnelles

### 5.1 Performance
- Temps de génération IA < 10 secondes
- Génération PDF < 3 secondes
- Time to First Contentful Paint < 1.5s

### 5.2 Sécurité
- Données utilisateur isolées via RLS Supabase
- Clés API stockées côté serveur uniquement
- HTTPS obligatoire

### 5.3 Accessibilité
- Responsive design (mobile-first)
- Support des gestes tactiles
- Contraste WCAG AA minimum

### 5.4 Scalabilité
- Architecture serverless (Vercel + Supabase)
- Pas de limite d'utilisateurs simultanés

## 6. Secteurs d'Activité Supportés

| Code | Secteur | Vocabulaire Spécifique |
|------|---------|----------------------|
| BTP | BTP / Construction | Travaux, fournitures, main d'œuvre, métré |
| IT | Services Informatiques | Prestation, développement, maintenance, support |
| CONSEIL | Conseil / Consulting | Mission, accompagnement, audit, formation |
| ARTISAN | Artisanat | Réalisation, fabrication, matériaux, pose |
| SERVICES | Services à la personne | Intervention, déplacement, accompagnement |
| AUTRE | Autres | Prestation, service, fourniture |

## 7. Architecture Technique

### 7.1 Stack Frontend
- Next.js 14+ (App Router)
- TypeScript strict
- Tailwind CSS
- shadcn/ui components
- React Hook Form + Zod

### 7.2 Stack Backend
- Next.js API Routes
- Supabase Client
- Anthropic Claude API

### 7.3 Infrastructure
- Hosting : Vercel
- Database : Supabase PostgreSQL
- Storage : Supabase Storage
- Auth : Supabase Auth

## 8. Contraintes et Dépendances

### 8.1 Dépendances Externes
- API Claude Anthropic (limite de rate)
- Supabase (disponibilité 99.9%)

### 8.2 Contraintes Business
- Pas de facturation (hors périmètre)
- Pas d'enregistrement audio (Plaud Note Pro)

## 9. Critères d'Acceptation

### 9.1 MVP (Version 1.0)
- [ ] Authentification fonctionnelle
- [ ] Création de profil entreprise
- [ ] Import transcription et génération devis
- [ ] Édition du devis généré
- [ ] Export PDF
- [ ] Liste des devis

### 9.2 Qualité
- [ ] Couverture de tests > 70%
- [ ] Pas d'erreurs TypeScript
- [ ] Score Lighthouse > 90
