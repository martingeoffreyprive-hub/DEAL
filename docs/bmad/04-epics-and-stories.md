# QuoteVoice - Epics & Stories

## Epic 1 : Authentification et Gestion de Compte

### Story 1.1 : Inscription Utilisateur
**En tant que** nouvel utilisateur
**Je veux** créer un compte avec mon email et mot de passe
**Afin de** pouvoir utiliser l'application

**Critères d'acceptation :**
- [ ] Formulaire avec email, mot de passe, confirmation
- [ ] Validation email format valide
- [ ] Mot de passe minimum 8 caractères
- [ ] Message d'erreur si email déjà utilisé
- [ ] Redirection vers dashboard après inscription

### Story 1.2 : Connexion Utilisateur
**En tant qu'** utilisateur inscrit
**Je veux** me connecter à mon compte
**Afin d'** accéder à mes devis

**Critères d'acceptation :**
- [ ] Formulaire email/mot de passe
- [ ] Message d'erreur si identifiants invalides
- [ ] Option "Rester connecté"
- [ ] Redirection vers dashboard après connexion

### Story 1.3 : Déconnexion
**En tant qu'** utilisateur connecté
**Je veux** me déconnecter
**Afin de** sécuriser mon compte

**Critères d'acceptation :**
- [ ] Bouton de déconnexion visible
- [ ] Confirmation de déconnexion
- [ ] Redirection vers page de connexion

### Story 1.4 : Réinitialisation Mot de Passe
**En tant qu'** utilisateur
**Je veux** réinitialiser mon mot de passe
**Afin de** récupérer l'accès à mon compte

**Critères d'acceptation :**
- [ ] Lien "Mot de passe oublié"
- [ ] Envoi d'email de réinitialisation
- [ ] Formulaire de nouveau mot de passe
- [ ] Confirmation du changement

---

## Epic 2 : Profil Entreprise

### Story 2.1 : Configuration Profil
**En tant qu'** utilisateur
**Je veux** configurer les informations de mon entreprise
**Afin qu'** elles apparaissent sur mes devis

**Critères d'acceptation :**
- [ ] Champs : nom entreprise, SIRET, adresse, téléphone, email
- [ ] Validation des formats (SIRET, téléphone)
- [ ] Sauvegarde persistante
- [ ] Message de confirmation

### Story 2.2 : Upload Logo
**En tant qu'** utilisateur
**Je veux** uploader le logo de mon entreprise
**Afin qu'** il apparaisse sur mes devis PDF

**Critères d'acceptation :**
- [ ] Bouton d'upload avec prévisualisation
- [ ] Formats acceptés : JPG, PNG
- [ ] Taille maximum : 2MB
- [ ] Recadrage optionnel
- [ ] Suppression du logo possible

### Story 2.3 : Mentions Légales
**En tant qu'** utilisateur
**Je veux** définir mes mentions légales par défaut
**Afin qu'** elles soient automatiquement ajoutées aux devis

**Critères d'acceptation :**
- [ ] Éditeur de texte enrichi
- [ ] Templates suggérés par secteur
- [ ] Sauvegarde persistante

### Story 2.4 : Secteur par Défaut
**En tant qu'** utilisateur
**Je veux** choisir mon secteur d'activité principal
**Afin d'** optimiser la détection automatique

**Critères d'acceptation :**
- [ ] Liste déroulante des secteurs
- [ ] Secteur utilisé comme suggestion par défaut

---

## Epic 3 : Génération de Devis par IA

### Story 3.1 : Import Transcription
**En tant qu'** utilisateur
**Je veux** coller une transcription texte
**Afin de** générer un devis automatiquement

**Critères d'acceptation :**
- [ ] Zone de texte large avec placeholder explicatif
- [ ] Support copier-coller
- [ ] Support markdown basique
- [ ] Compteur de caractères

### Story 3.2 : Analyse IA
**En tant qu'** utilisateur
**Je veux** voir l'IA analyser ma transcription
**Afin de** comprendre le traitement en cours

**Critères d'acceptation :**
- [ ] Indicateur de chargement animé
- [ ] Temps estimé affiché
- [ ] Possibilité d'annuler

### Story 3.3 : Détection de Secteur
**En tant qu'** utilisateur
**Je veux** voir le secteur détecté automatiquement
**Afin de** vérifier la pertinence de l'analyse

**Critères d'acceptation :**
- [ ] Badge affichant le secteur détecté
- [ ] Confiance de détection (pourcentage)
- [ ] Possibilité de corriger manuellement

### Story 3.4 : Génération du Devis
**En tant qu'** utilisateur
**Je veux** recevoir un devis structuré
**Afin de** le valider et le modifier si nécessaire

**Critères d'acceptation :**
- [ ] Extraction des informations client
- [ ] Liste des prestations avec descriptions
- [ ] Quantités et unités appropriées
- [ ] Prix estimés réalistes
- [ ] Notes et conditions extraites

---

## Epic 4 : Édition de Devis

### Story 4.1 : Modification Client
**En tant qu'** utilisateur
**Je veux** modifier les informations du client
**Afin de** corriger ou compléter les données

**Critères d'acceptation :**
- [ ] Champs éditables : nom, email, adresse, téléphone
- [ ] Validation des formats
- [ ] Sauvegarde automatique

### Story 4.2 : Gestion des Prestations
**En tant qu'** utilisateur
**Je veux** ajouter, modifier ou supprimer des lignes
**Afin d'** ajuster le contenu du devis

**Critères d'acceptation :**
- [ ] Bouton "Ajouter une ligne"
- [ ] Édition inline de chaque champ
- [ ] Bouton de suppression par ligne
- [ ] Réorganisation par drag & drop

### Story 4.3 : Calcul des Totaux
**En tant qu'** utilisateur
**Je veux** voir les totaux se calculer automatiquement
**Afin de** connaître le montant final en temps réel

**Critères d'acceptation :**
- [ ] Total HT = somme des lignes
- [ ] TVA calculée selon le taux
- [ ] Total TTC = HT + TVA
- [ ] Mise à jour instantanée

### Story 4.4 : Modification du Taux TVA
**En tant qu'** utilisateur
**Je veux** modifier le taux de TVA
**Afin d'** appliquer le bon taux selon la prestation

**Critères d'acceptation :**
- [ ] Sélection du taux : 0%, 5.5%, 10%, 20%
- [ ] Recalcul automatique
- [ ] Taux par défaut : 20%

### Story 4.5 : Notes et Conditions
**En tant qu'** utilisateur
**Je veux** ajouter des notes au devis
**Afin de** préciser les conditions particulières

**Critères d'acceptation :**
- [ ] Zone de texte libre
- [ ] Durée de validité du devis
- [ ] Conditions de paiement

---

## Epic 5 : Export et Stockage

### Story 5.1 : Prévisualisation PDF
**En tant qu'** utilisateur
**Je veux** prévisualiser le devis en PDF
**Afin de** vérifier le rendu avant export

**Critères d'acceptation :**
- [ ] Aperçu en temps réel
- [ ] Zoom disponible
- [ ] Navigation multi-pages si nécessaire

### Story 5.2 : Téléchargement PDF
**En tant qu'** utilisateur
**Je veux** télécharger le devis en PDF
**Afin de** l'envoyer au client

**Critères d'acceptation :**
- [ ] Bouton "Télécharger PDF"
- [ ] Nom de fichier : DEVIS-{numero}-{client}.pdf
- [ ] Logo entreprise inclus
- [ ] Mentions légales en bas de page

### Story 5.3 : Numérotation Automatique
**En tant qu'** utilisateur
**Je veux** que mes devis soient numérotés automatiquement
**Afin de** suivre une séquence cohérente

**Critères d'acceptation :**
- [ ] Format : YYYY-MM-XXXX
- [ ] Incrémentation automatique
- [ ] Unicité garantie

### Story 5.4 : Sauvegarde Brouillon
**En tant qu'** utilisateur
**Je veux** sauvegarder un devis comme brouillon
**Afin de** le reprendre plus tard

**Critères d'acceptation :**
- [ ] Sauvegarde automatique toutes les 30 secondes
- [ ] Bouton "Sauvegarder"
- [ ] Status "brouillon" visible

---

## Epic 6 : Gestion des Devis

### Story 6.1 : Liste des Devis
**En tant qu'** utilisateur
**Je veux** voir la liste de tous mes devis
**Afin d'** avoir une vue d'ensemble

**Critères d'acceptation :**
- [ ] Tableau avec colonnes : numéro, client, date, montant, status
- [ ] Tri par date (plus récent en premier)
- [ ] Pagination si > 20 devis

### Story 6.2 : Recherche de Devis
**En tant qu'** utilisateur
**Je veux** rechercher un devis
**Afin de** le retrouver rapidement

**Critères d'acceptation :**
- [ ] Barre de recherche
- [ ] Recherche par nom client, numéro
- [ ] Résultats instantanés (debounce)

### Story 6.3 : Filtrage par Status
**En tant qu'** utilisateur
**Je veux** filtrer les devis par status
**Afin de** voir uniquement ceux qui m'intéressent

**Critères d'acceptation :**
- [ ] Filtres : Tous, Brouillons, Finalisés, Archivés
- [ ] Compteurs par catégorie

### Story 6.4 : Duplication de Devis
**En tant qu'** utilisateur
**Je veux** dupliquer un devis existant
**Afin de** créer un nouveau devis similaire

**Critères d'acceptation :**
- [ ] Bouton "Dupliquer"
- [ ] Nouveau numéro attribué
- [ ] Copie de toutes les lignes
- [ ] Status = brouillon

### Story 6.5 : Suppression de Devis
**En tant qu'** utilisateur
**Je veux** supprimer un devis
**Afin de** nettoyer ma liste

**Critères d'acceptation :**
- [ ] Confirmation avant suppression
- [ ] Suppression définitive
- [ ] Message de confirmation

---

## Epic 7 : Dashboard

### Story 7.1 : Vue d'Ensemble
**En tant qu'** utilisateur
**Je veux** voir un résumé de mon activité
**Afin d'** avoir une vue rapide de mes devis

**Critères d'acceptation :**
- [ ] Nombre de devis ce mois
- [ ] Montant total des devis
- [ ] Devis récents (5 derniers)
- [ ] Accès rapide à "Nouveau devis"

### Story 7.2 : Statistiques
**En tant qu'** utilisateur
**Je veux** voir des statistiques
**Afin de** suivre mon activité commerciale

**Critères d'acceptation :**
- [ ] Graphique devis par mois
- [ ] Répartition par secteur
- [ ] Montant moyen des devis

---

## Priorités de Développement

### Sprint 1 - Fondations
1. Epic 1 : Authentification (toutes les stories)
2. Epic 2 : Profil Entreprise (2.1, 2.4)

### Sprint 2 - Core Feature
3. Epic 3 : Génération IA (toutes les stories)
4. Epic 4 : Édition (4.1, 4.2, 4.3)

### Sprint 3 - Export & Gestion
5. Epic 5 : Export (toutes les stories)
6. Epic 4 : Édition (4.4, 4.5)
7. Epic 6 : Gestion (6.1, 6.2, 6.5)

### Sprint 4 - Finitions
8. Epic 2 : Profil (2.2, 2.3)
9. Epic 6 : Gestion (6.3, 6.4)
10. Epic 7 : Dashboard (toutes les stories)
