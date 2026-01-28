# Story 1.4: Configuration CORS Production

Status: ready-for-dev

## Story

As a **developpeur backend**,
I want **configurer CORS correctement pour la production**,
so that **securiser les requetes cross-origin et prevenir les attaques CSRF**.

## Acceptance Criteria

1. **AC1**: Whitelist des domaines autorises
   - Seuls les domaines DEAL autorises
   - Pas de fallback vers `*` en production

2. **AC2**: Headers CORS configures correctement
   - Access-Control-Allow-Origin restrictif
   - Access-Control-Allow-Credentials si necessaire
   - Preflight cache optimise

3. **AC3**: Tests depuis domaines non autorises
   - Requete depuis domaine non autorise = bloquee
   - Widget public fonctionne toujours

## Tasks / Subtasks

- [ ] **Task 1: Configurer whitelist domaines** (AC: #1)
  - [ ] Creer variable env `CORS_ALLOWED_ORIGINS`
  - [ ] Liste: dealofficialapp.com, localhost:3000 (dev)
  - [ ] Supprimer fallback `|| '*'`

- [ ] **Task 2: Mettre a jour middleware.ts** (AC: #2)
  - [ ] Valider origin contre whitelist
  - [ ] Retourner 403 si origin non autorise
  - [ ] Garder exception pour widget public

- [ ] **Task 3: Mettre a jour widget CORS** (AC: #3)
  - [ ] Widget doit rester accessible (API key validation)
  - [ ] Documenter le comportement

- [ ] **Task 4: Tests** (AC: #3)
  - [ ] Test requete depuis origin autorise
  - [ ] Test requete depuis origin non autorise

## Dev Notes

### Configuration CORS Actuelle

**middleware.ts:185-189** - CORS global:
```typescript
response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
response.headers.set('Access-Control-Max-Age', '86400');
```

**PROBLEME**: `|| '*'` permet toutes les origines si `NEXT_PUBLIC_APP_URL` n'est pas definie.

**widget/quote-request/route.ts:13-16** - Widget public:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",  // Intentionnel pour widget embed
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
};
```

**NOTE**: Le widget DOIT rester `*` car il est embed sur des sites clients.

### Solution Recommandee

```typescript
// src/lib/cors.ts
const ALLOWED_ORIGINS = [
  'https://www.dealofficialapp.com',
  'https://dealofficialapp.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000'] : []),
];

// Vercel preview URLs
if (process.env.VERCEL_URL) {
  ALLOWED_ORIGINS.push(`https://${process.env.VERCEL_URL}`);
}

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed =>
    origin === allowed || origin.endsWith('.vercel.app')
  );
}

export function getCORSHeaders(origin: string | null) {
  if (!isAllowedOrigin(origin)) {
    return null; // Block request
  }
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}
```

**middleware.ts mise a jour:**
```typescript
import { isAllowedOrigin, getCORSHeaders } from '@/lib/cors';

// Dans la section API routes
if (isApiRoute) {
  const origin = request.headers.get('origin');

  // Exception: widget public (validate par API key)
  if (pathname.startsWith('/api/widget/')) {
    // Garder CORS permissif pour widget
    response.headers.set('Access-Control-Allow-Origin', '*');
  } else {
    const corsHeaders = getCORSHeaders(origin);
    if (!corsHeaders && origin) {
      return new NextResponse('CORS not allowed', { status: 403 });
    }
    if (corsHeaders) {
      Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
  }
}
```

### Domaines a Autoriser

| Domaine | Environnement | Notes |
|---------|---------------|-------|
| `https://www.dealofficialapp.com` | Production | Principal |
| `https://dealofficialapp.com` | Production | Sans www |
| `https://*.vercel.app` | Preview | Deployments Vercel |
| `http://localhost:3000` | Development | Dev local |

### Endpoints Speciaux

| Endpoint | CORS | Raison |
|----------|------|--------|
| `/api/widget/*` | `*` (tous) | Widget embed sur sites clients |
| `/api/analytics/vitals` | `*` (tous) | Metriques web vitals |
| `/api/stripe/webhook` | N/A | Webhook Stripe (pas de browser) |

### Project Structure Notes

```
src/
├── lib/
│   └── cors.ts              # A CREER
├── middleware.ts            # A MODIFIER
└── app/api/
    ├── widget/              # Garder CORS permissif
    └── analytics/vitals/    # Garder CORS permissif
```

### References

- [Source: src/middleware.ts:185-189] - CORS actuel
- [Source: src/app/api/widget/quote-request/route.ts:13-16] - Widget CORS
- [MDN CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

## Technical Requirements

- Aucune nouvelle dependance
- Variables env: `CORS_ALLOWED_ORIGINS` (optionnel)

## Testing Requirements

| Test Type | Requirement |
|-----------|-------------|
| Manual | Test depuis localhost |
| Manual | Test depuis domaine non autorise |
| Integration | Widget fonctionne depuis site externe |

## Definition of Done

- [ ] Whitelist domaines implementee
- [ ] Fallback `*` supprime (sauf widget)
- [ ] Middleware mis a jour
- [ ] Widget toujours fonctionnel
- [ ] Tests CORS passes
- [ ] Code review passe

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Estimated Effort

~1 heure

### Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Widget casse | High | Low | Tester embed externe |
| Vercel preview bloque | Medium | Medium | Ajouter *.vercel.app |

---

*Story creee le 2026-01-28*
*Epic 1: Fondations & Securite*
*Sprint 1*
