# Story 1.5: Rebranding QuoteVoice vers DEAL

Status: ready-for-dev

## Story

As a **utilisateur**,
I want **voir le branding DEAL partout dans l'application**,
so that **avoir une experience de marque coherente et professionnelle**.

## Acceptance Criteria

1. **AC1**: README.md mis a jour
   - Nom "DEAL" partout
   - Description mise a jour
   - Liens corrects

2. **AC2**: package.json name = "deal"
   - Champ "name" mis a jour
   - Champ "description" si present

3. **AC3**: Tous les "QuoteVoice" remplaces
   - Code source
   - Documentation
   - Fichiers de configuration
   - Base de donnees (commentaires)

4. **AC4**: Metadata SEO mis a jour
   - Title, description
   - Open Graph

## Tasks / Subtasks

- [ ] **Task 1: Fichiers racine** (AC: #1, #2)
  - [ ] README.md
  - [ ] package.json
  - [ ] .env.example

- [ ] **Task 2: Code source /src** (AC: #3)
  - [ ] locale-context.tsx
  - [ ] command-palette.tsx
  - [ ] OrganizationContext.tsx
  - [ ] privacy/page.tsx
  - [ ] admin/layout.tsx
  - [ ] API routes (data-export, gdpr/*)

- [ ] **Task 3: Documentation /docs** (AC: #3)
  - [ ] bmad/*.md (4 fichiers)
  - [ ] security/*.md (2 fichiers)
  - [ ] generated/index.md

- [ ] **Task 4: Base de donnees /supabase** (AC: #3)
  - [ ] schema.sql
  - [ ] migrations/*.sql (5 fichiers)
  - [ ] FULL_MIGRATION.sql

- [ ] **Task 5: Hooks et utilitaires** (AC: #3)
  - [ ] use-locale.ts

- [ ] **Task 6: Verification finale** (AC: #3)
  - [ ] Grep pour confirmer 0 occurrences

## Dev Notes

### Fichiers Contenant "QuoteVoice" (33 fichiers)

**Priorite HAUTE (visibles utilisateur):**
```
README.md                                    # Description projet
package.json                                 # Nom package
.env.example                                 # Documentation
src/contexts/locale-context.tsx              # Textes UI
src/components/command-palette/command-palette.tsx
src/app/(dashboard)/settings/privacy/page.tsx
src/app/(admin)/layout.tsx
```

**Priorite MOYENNE (documentation):**
```
docs/bmad/01-product-brief.md
docs/bmad/02-prd.md
docs/bmad/03-architecture.md
docs/bmad/04-epics-and-stories.md
docs/security/INCIDENT-RESPONSE.md
docs/security/SECURITY-POLICY.md
docs/generated/index.md
SESSION-NOTES.md
```

**Priorite BASSE (technique):**
```
supabase/schema.sql
supabase/FULL_MIGRATION.sql
supabase/migration-v2.sql
supabase/migration-subscriptions.sql
supabase/migration-locale.sql
supabase/migrations/20240127_performance_indexes.sql
src/hooks/use-locale.ts
src/contexts/OrganizationContext.tsx
src/app/api/user/data-export/route.ts
src/app/api/gdpr/delete/route.ts
src/app/api/gdpr/export/route.ts
```

**Deja traites (stories/plans):**
```
_bmad-output/* (fichiers generes)
docs/project-scan-report.json
docs/generated/DEAL-Production-Action-Plan.md
```

### Remplacements a Effectuer

| Ancien | Nouveau |
|--------|---------|
| QuoteVoice | DEAL |
| quotevoice | deal |
| Quote Voice | DEAL |
| quote-voice | deal |

### Commande de Verification

```bash
# Rechercher toutes les occurrences restantes
grep -ri "quotevoice\|quote.voice" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json" --include="*.sql" .

# Exclure node_modules et .git
grep -ri "quotevoice" . --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".git"
```

### Fichiers a NE PAS Modifier

- `node_modules/` - Dependances
- `.git/` - Historique git
- `package-lock.json` - Auto-genere (sera regenere)

### Metadata SEO (src/app/layout.tsx)

Verifier/mettre a jour:
```typescript
export const metadata: Metadata = {
  title: "DEAL - Devis Professionnels",
  description: "Application de devis professionnels pour artisans",
  // ...
};
```

### Project Structure Notes

Fichiers principaux a modifier:
```
/
├── README.md              # MODIFIER
├── package.json           # MODIFIER
├── .env.example           # MODIFIER
├── docs/
│   ├── bmad/*.md          # MODIFIER (4)
│   └── security/*.md      # MODIFIER (2)
├── src/
│   ├── app/layout.tsx     # VERIFIER metadata
│   ├── contexts/*.tsx     # MODIFIER (2)
│   ├── components/        # MODIFIER (1)
│   └── hooks/*.ts         # MODIFIER (1)
└── supabase/
    ├── schema.sql         # MODIFIER
    └── migrations/*.sql   # MODIFIER (4)
```

### References

- [Source: grep QuoteVoice] - 33 fichiers identifies
- [Source: package.json:2] - name: "quotevoice"
- [Source: README.md] - Documentation principale

## Technical Requirements

- Aucune nouvelle dependance
- Regenerer package-lock.json apres modification

## Testing Requirements

| Test Type | Requirement |
|-----------|-------------|
| Manual | Grep final = 0 occurrences |
| Manual | npm install fonctionne |
| Manual | Build passe |
| Visual | UI affiche "DEAL" partout |

## Definition of Done

- [ ] README.md mis a jour
- [ ] package.json name = "deal"
- [ ] .env.example mis a jour
- [ ] Tous fichiers src/ mis a jour
- [ ] Tous fichiers docs/ mis a jour
- [ ] Tous fichiers supabase/ mis a jour
- [ ] grep "quotevoice" = 0 resultats
- [ ] npm run build passe
- [ ] Code review passe

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Estimated Effort

~1-2 heures (beaucoup de fichiers)

### Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Casser des imports | Medium | Low | Build test |
| Oublier des fichiers | Low | Medium | Grep final |
| Casser les migrations SQL | Low | Very Low | Commentaires seulement |

### Dependencies

- Peut etre fait en parallele avec autres stories

---

*Story creee le 2026-01-28*
*Epic 1: Fondations & Securite*
*Sprint 1*
