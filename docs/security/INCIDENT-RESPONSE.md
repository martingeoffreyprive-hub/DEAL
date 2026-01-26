# Procédure de Réponse aux Incidents - QuoteVoice

## 1. Objectif

Ce document définit la procédure de réponse aux incidents de sécurité pour QuoteVoice, conformément aux exigences SOC 2 et RGPD.

---

## 2. Équipe de Réponse aux Incidents (IRT)

### 2.1 Rôles et Responsabilités

| Rôle | Responsabilité |
|------|----------------|
| **Incident Manager** | Coordination globale, communication |
| **Tech Lead** | Investigation technique, correction |
| **DevOps** | Infrastructure, logs, restauration |
| **Legal/DPO** | Conformité RGPD, notifications |
| **Communication** | Relations publiques, clients |

### 2.2 Escalade

```
Niveau 1: Tech Lead → analyse initiale (< 30 min)
    ↓
Niveau 2: + Incident Manager → coordination (< 1h)
    ↓
Niveau 3: + Direction → décisions critiques (P1/P2)
```

---

## 3. Classification des Incidents

### 3.1 Niveaux de Sévérité

#### P1 - Critique
- Brèche de données confirmée
- Compromission de système
- Indisponibilité totale
- **Réponse**: Immédiate, 24/7

#### P2 - Élevé
- Vulnérabilité activement exploitée
- Dégradation majeure des services
- Accès non autorisé détecté
- **Réponse**: < 4 heures

#### P3 - Moyen
- Vulnérabilité découverte (non exploitée)
- Anomalie de sécurité
- Impact limité
- **Réponse**: < 24 heures

#### P4 - Faible
- Recommandation de sécurité
- Amélioration préventive
- **Réponse**: Planifiée

---

## 4. Phases de Réponse

### Phase 1: Détection et Signalement

**Durée cible**: < 15 minutes

1. **Sources de détection**:
   - Alertes automatiques (logs, monitoring)
   - Signalement utilisateur
   - Rapport externe (bug bounty)
   - Audit de sécurité

2. **Actions immédiates**:
   - [ ] Créer un ticket d'incident
   - [ ] Notifier l'équipe IRT via Slack #security-incidents
   - [ ] Documenter l'heure de détection
   - [ ] Préserver les preuves (ne pas modifier les logs)

3. **Template de signalement**:
   ```
   INCIDENT: [Titre bref]
   Détecté: [Date/Heure]
   Signalé par: [Nom]
   Sévérité estimée: [P1-P4]
   Description: [Détails]
   Systèmes affectés: [Liste]
   Impact utilisateurs: [Oui/Non - Estimation]
   ```

### Phase 2: Triage et Analyse

**Durée cible**: < 1 heure (P1/P2)

1. **Questions clés**:
   - Quel est le vecteur d'attaque ?
   - Quelles données sont potentiellement compromises ?
   - Combien d'utilisateurs sont affectés ?
   - L'attaque est-elle en cours ?

2. **Actions**:
   - [ ] Confirmer la classification
   - [ ] Identifier l'étendue de l'impact
   - [ ] Collecter les logs pertinents
   - [ ] Identifier la cause racine potentielle

3. **Outils d'investigation**:
   - Supabase Dashboard (logs BDD)
   - Vercel Logs (application)
   - Table `audit_logs` (actions utilisateurs)
   - Upstash (rate limiting logs)

### Phase 3: Confinement

**Objectif**: Limiter l'impact immédiat

1. **Confinement à court terme**:
   - [ ] Bloquer les IPs suspectes
   - [ ] Révoquer les sessions compromises
   - [ ] Désactiver les fonctionnalités vulnérables
   - [ ] Activer le mode maintenance si nécessaire

2. **Actions par type d'incident**:

   **Compromission de compte**:
   ```sql
   -- Révoquer toutes les sessions de l'utilisateur
   DELETE FROM auth.sessions WHERE user_id = 'xxx';
   -- Forcer le changement de mot de passe
   UPDATE auth.users SET password_reset_required = true WHERE id = 'xxx';
   ```

   **API compromise**:
   ```bash
   # Révoquer toutes les clés API
   # Régénérer les secrets Supabase
   # Mettre à jour les variables d'environnement Vercel
   ```

   **Injection/XSS**:
   ```bash
   # Déployer un hotfix immédiat
   # Activer des règles WAF supplémentaires
   ```

### Phase 4: Éradication

**Objectif**: Éliminer la menace

1. **Actions**:
   - [ ] Corriger la vulnérabilité (patch)
   - [ ] Supprimer les accès malveillants
   - [ ] Nettoyer les données compromises
   - [ ] Mettre à jour les dépendances vulnérables

2. **Validation**:
   - [ ] Tests de sécurité sur le correctif
   - [ ] Revue de code par un pair
   - [ ] Scan de vulnérabilité

### Phase 5: Récupération

**Objectif**: Restaurer les services normaux

1. **Étapes de restauration**:
   - [ ] Déployer les correctifs en production
   - [ ] Restaurer les données si nécessaire (backup)
   - [ ] Réactiver les fonctionnalités désactivées
   - [ ] Surveiller activement les anomalies

2. **Vérifications post-restauration**:
   - [ ] Tests fonctionnels complets
   - [ ] Vérification des logs (pas de récurrence)
   - [ ] Monitoring renforcé pendant 48h

### Phase 6: Post-Incident

**Durée**: Dans les 5 jours suivant la résolution

1. **Post-mortem**:
   - [ ] Réunion de débriefing
   - [ ] Chronologie complète de l'incident
   - [ ] Analyse des causes racines (5 Whys)
   - [ ] Identification des améliorations

2. **Documentation**:
   ```markdown
   ## Post-Mortem: [Titre de l'incident]

   ### Résumé
   - Date:
   - Durée:
   - Impact:
   - Sévérité:

   ### Chronologie
   - HH:MM - Événement

   ### Cause racine
   [Description]

   ### Ce qui a bien fonctionné
   - Point 1

   ### Ce qui peut être amélioré
   - Point 1

   ### Actions correctives
   - [ ] Action 1 (Responsable, Deadline)
   ```

---

## 5. Communication

### 5.1 Communication Interne

| Sévérité | Qui notifier | Comment |
|----------|--------------|---------|
| P1 | Toute l'équipe + Direction | Appel + Slack |
| P2 | IRT + Tech Lead | Slack #security |
| P3 | IRT | Slack #security |
| P4 | Tech Lead | Ticket |

### 5.2 Communication Externe (RGPD)

**Notification obligatoire si**:
- Données personnelles compromises
- Risque élevé pour les droits des personnes

**Délais**:
- CNIL: 72 heures
- Utilisateurs affectés: Sans délai excessif

**Template de notification utilisateur**:
```
Objet: Notification de sécurité importante - QuoteVoice

Cher utilisateur,

Nous vous informons qu'un incident de sécurité a été détecté le [DATE].

**Ce qui s'est passé:**
[Description factuelle]

**Données potentiellement affectées:**
[Liste des types de données]

**Ce que nous avons fait:**
[Mesures prises]

**Ce que vous devez faire:**
[Recommandations: changer mot de passe, etc.]

**Pour plus d'informations:**
[Contact support]

Nous nous excusons pour cet incident et restons à votre disposition.

L'équipe QuoteVoice
```

---

## 6. Contacts d'Urgence

### 6.1 Internes
- Incident Manager: [Nom] - [Téléphone]
- Tech Lead: [Nom] - [Téléphone]
- DPO: [Nom] - [Téléphone]

### 6.2 Externes
- Supabase Support: support@supabase.io
- Vercel Support: https://vercel.com/support
- CNIL: https://www.cnil.fr/fr/notifier-une-violation

---

## 7. Outils et Accès d'Urgence

### 7.1 Accès Nécessaires
- [ ] Supabase Dashboard (admin)
- [ ] Vercel Dashboard (admin)
- [ ] GitHub (merge sans review en urgence)
- [ ] Upstash Dashboard

### 7.2 Runbooks

**Bloquer une IP**:
```typescript
// middleware.ts - ajouter temporairement
const blockedIPs = ['x.x.x.x'];
if (blockedIPs.includes(request.ip)) {
  return new Response('Blocked', { status: 403 });
}
```

**Mode maintenance**:
```bash
# Vercel - rediriger tout vers une page de maintenance
vercel env add MAINTENANCE_MODE true
```

**Révocation de masse des sessions**:
```sql
-- Supabase SQL Editor
TRUNCATE auth.sessions;
-- OU pour un utilisateur spécifique
DELETE FROM auth.sessions WHERE user_id = 'UUID';
```

---

## 8. Tests et Exercices

### 8.1 Exercices Planifiés
- **Trimestriel**: Simulation d'incident P3
- **Semestriel**: Simulation d'incident P1/P2
- **Annuel**: Test de reprise d'activité complet

### 8.2 Métriques à Suivre
- MTTD (Mean Time to Detect)
- MTTR (Mean Time to Respond)
- MTTC (Mean Time to Contain)
- Nombre d'incidents par sévérité

---

## Historique des Révisions

| Version | Date | Auteur | Modifications |
|---------|------|--------|---------------|
| 1.0 | 2024-01-27 | Équipe Sécurité | Version initiale |
