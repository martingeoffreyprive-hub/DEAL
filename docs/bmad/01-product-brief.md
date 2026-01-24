# QuoteVoice - Product Brief

## Vision
Application web mobile permettant aux professionnels de générer automatiquement des devis et offres commerciales personnalisés à partir de transcriptions vocales, avec validation humaine avant export PDF.

## Problème Résolu
Les professionnels perdent du temps à rédiger manuellement des devis après chaque rendez-vous client. QuoteVoice automatise ce processus en transformant les notes vocales (via Plaud Note Pro) en documents commerciaux professionnels.

## Proposition de Valeur
- Gain de temps : de la transcription au devis en quelques minutes
- Qualité professionnelle : vocabulaire technique adapté par secteur
- Contrôle humain : validation et modification avant export
- Simplicité : copier-coller de la transcription

## Utilisateurs Cibles
- Artisans et entrepreneurs du BTP
- Consultants IT et freelances
- Prestataires de services
- TPE/PME multi-secteurs

## Fonctionnalités Clés
1. Import de transcription (copier-coller)
2. Analyse IA et détection automatique du secteur
3. Génération de devis structuré avec vocabulaire adapté
4. Éditeur WYSIWYG pour modifications
5. Prévisualisation et export PDF professionnel
6. Gestion du profil entreprise

## Hors Périmètre
- Facturation (uniquement avant-vente)
- Enregistrement audio (géré par Plaud Note Pro)
- Signature électronique
- Paiement en ligne

## Métriques de Succès
- Temps de création d'un devis < 5 minutes
- Taux d'adoption > 80% après onboarding
- Satisfaction utilisateur > 4.5/5

## Contraintes Techniques
- Stack : Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- Backend : Supabase (auth, database, storage)
- IA : API Claude Anthropic
- PDF : @react-pdf/renderer
