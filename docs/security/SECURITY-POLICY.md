# Politique de Sécurité - DEAL

## 1. Vue d'ensemble

Ce document décrit les politiques et procédures de sécurité de DEAL, conformes aux exigences SOC 2 Type II.

**Version**: 1.0
**Date**: 2024-01-27
**Responsable**: Équipe Sécurité DEAL

---

## 2. Contrôles d'Accès

### 2.1 Authentification
- **Authentification par email/mot de passe** via Supabase Auth
- **Exigences de mot de passe**:
  - Minimum 8 caractères
  - Au moins une majuscule, une minuscule, un chiffre
- **Sessions**: JWT avec expiration automatique
- **MFA**: Disponible pour tous les comptes (TOTP)

### 2.2 Autorisation
- **Modèle RBAC** (Role-Based Access Control)
- Rôles: `owner`, `admin`, `member`, `viewer`
- Row Level Security (RLS) activé sur toutes les tables Supabase
- Principe du moindre privilège appliqué

### 2.3 Gestion des Sessions
- Tokens JWT signés cryptographiquement
- Révocation automatique après 7 jours d'inactivité
- Déconnexion forcée disponible pour les administrateurs

---

## 3. Protection des Données

### 3.1 Chiffrement
- **En transit**: TLS 1.3 pour toutes les communications
- **Au repos**: Chiffrement AES-256 (Supabase)
- **Clés API**: Stockées hashées (SHA-256)

### 3.2 Données Personnelles (RGPD)
- Collecte minimale des données
- Consentement explicite requis
- Droit d'accès: `/api/user/data-export`
- Droit à l'effacement: `/api/user/delete-account`
- Portabilité: Export JSON complet

### 3.3 Rétention des Données
| Type de données | Durée de rétention |
|-----------------|-------------------|
| Comptes actifs | Illimitée |
| Comptes supprimés | 30 jours (backup) puis effacement |
| Logs d'audit | 2 ans |
| Logs d'erreur | 90 jours |

---

## 4. Sécurité de l'Infrastructure

### 4.1 Hébergement
- **Application**: Vercel (Edge Network mondial)
- **Base de données**: Supabase (PostgreSQL managé)
- **CDN**: Vercel Edge avec WAF intégré

### 4.2 En-têtes de Sécurité HTTP
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: [voir middleware.ts]
```

### 4.3 Protection contre les Attaques
- **Rate Limiting**:
  - 10 req/min général
  - 5 req/min pour l'IA
  - 3 tentatives de connexion puis blocage temporaire
- **CSRF**: Tokens CSRF sur tous les formulaires
- **SQL Injection**: Requêtes paramétrées via Supabase
- **XSS**: Échappement automatique (React) + CSP strict

---

## 5. Surveillance et Audit

### 5.1 Journaux d'Audit
Tous les événements critiques sont enregistrés:
- Connexions/déconnexions
- Création/modification/suppression de devis
- Changements de permissions
- Accès aux données sensibles
- Modifications de profil

### 5.2 Format des Logs
```json
{
  "timestamp": "ISO-8601",
  "user_id": "UUID",
  "action": "string",
  "entity_type": "string",
  "entity_id": "UUID",
  "old_values": {},
  "new_values": {},
  "ip_address": "string",
  "user_agent": "string"
}
```

### 5.3 Alertes
- Tentatives de connexion échouées multiples
- Accès depuis nouveaux appareils/localisations
- Modifications de permissions anormales
- Pics d'utilisation de l'API

---

## 6. Gestion des Incidents

### 6.1 Classification
| Niveau | Description | Temps de réponse |
|--------|-------------|-----------------|
| P1 - Critique | Brèche de données, indisponibilité totale | < 1 heure |
| P2 - Élevé | Vulnérabilité exploitée, dégradation majeure | < 4 heures |
| P3 - Moyen | Vulnérabilité découverte, impact limité | < 24 heures |
| P4 - Faible | Amélioration de sécurité recommandée | < 1 semaine |

### 6.2 Procédure d'Incident
1. **Détection**: Alertes automatiques ou rapport manuel
2. **Triage**: Classification et assignation
3. **Confinement**: Isolation de la menace
4. **Éradication**: Correction de la vulnérabilité
5. **Récupération**: Restauration des services
6. **Post-mortem**: Analyse et amélioration

### 6.3 Notification des Utilisateurs
- Notification dans les 72h pour les brèches affectant les données personnelles (RGPD)
- Communication transparente sur l'impact et les mesures prises

---

## 7. Développement Sécurisé

### 7.1 Pratiques SDLC
- Revue de code obligatoire
- Tests de sécurité automatisés (SAST)
- Analyse des dépendances (npm audit)
- Environnements séparés (dev/staging/prod)

### 7.2 Gestion des Secrets
- Variables d'environnement via Vercel
- Rotation des clés API tous les 90 jours
- Aucun secret dans le code source

### 7.3 Dépendances
- Mise à jour mensuelle des dépendances
- Audit de sécurité npm avant chaque déploiement
- Dépendances minimales

---

## 8. Continuité d'Activité

### 8.1 Sauvegardes
- Sauvegardes automatiques quotidiennes (Supabase)
- Point-in-time recovery jusqu'à 7 jours
- Sauvegardes géo-redondantes

### 8.2 Objectifs de Récupération
- **RTO** (Recovery Time Objective): < 4 heures
- **RPO** (Recovery Point Objective): < 1 heure

### 8.3 Tests de Reprise
- Tests de restauration trimestriels
- Simulation d'incidents semestrielle

---

## 9. Formation et Sensibilisation

### 9.1 Équipe de Développement
- Formation OWASP Top 10 annuelle
- Revue des incidents de sécurité mensuels
- Veille sur les nouvelles vulnérabilités

### 9.2 Utilisateurs Finaux
- Guide de sécurité in-app
- Recommandations de mot de passe fort
- Alertes sur les connexions suspectes

---

## 10. Conformité

### 10.1 Certifications Visées
- [ ] SOC 2 Type I (en cours)
- [ ] SOC 2 Type II (planifié)
- [x] RGPD (conforme)

### 10.2 Audits
- Audit interne trimestriel
- Audit externe annuel (SOC 2)
- Tests de pénétration annuels

---

## 11. Contact Sécurité

Pour signaler une vulnérabilité:
- Email: security@dealofficialapp.com
- Programme de bug bounty: [À venir]

---

## Historique des Révisions

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | 2024-01-27 | Équipe Sécurité | Version initiale |
