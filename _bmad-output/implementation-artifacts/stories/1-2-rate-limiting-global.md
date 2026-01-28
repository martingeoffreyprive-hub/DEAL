# Story 1.2: Rate Limiting Global

Status: ready-for-dev

## Story

As a **developpeur backend**,
I want **implementer le rate limiting sur tous les endpoints API**,
so that **proteger l'application contre les abus et attaques DDoS**.

## Acceptance Criteria

1. **AC1**: Rate limiting applique sur tous les endpoints `/api/*`
   - Tous les 25 endpoints doivent avoir un rate limiter
   - Utiliser le middleware existant `src/lib/rate-limit.ts`

2. **AC2**: Limites appropriees par type d'endpoint
   - Standard: 100 req/min (general)
   - IA: 10 req/min (ai)
   - Auth: 5 req/15min (auth)
   - API publique: 100 req/min (api)

3. **AC3**: Headers X-RateLimit-* retournes
   - `X-RateLimit-Limit`
   - `X-RateLimit-Remaining`
   - `X-RateLimit-Reset`
   - `Retry-After` (sur 429)

4. **AC4**: Tests de rate limiting passes
   - Test unitaire du middleware
   - Test d'integration sur un endpoint

## Tasks / Subtasks

- [ ] **Task 1: Audit des endpoints sans rate limiting** (AC: #1)
  - [ ] Lister tous les endpoints (25 total)
  - [ ] Identifier le type de rate limiter approprie pour chacun

- [ ] **Task 2: Creer un middleware Next.js** (AC: #1, #3)
  - [ ] Creer `src/middleware.ts` ou etendre l'existant
  - [ ] Appliquer rate limiting automatique sur `/api/*`
  - [ ] Exclure les webhooks (Stripe) du rate limiting

- [ ] **Task 3: Appliquer rate limiting par endpoint** (AC: #2)
  - [ ] Endpoints IA: `ai-assistant`, `generate` -> type "ai"
  - [ ] Endpoints Auth: voir `src/lib/api/auth.ts` -> type "auth"
  - [ ] Endpoints API v1: `v1/quotes/*` -> type "api"
  - [ ] Autres endpoints -> type "general"

- [ ] **Task 4: Tests** (AC: #4)
  - [ ] Test unitaire pour `checkRateLimit`
  - [ ] Test d'integration sur `/api/quotes`

## Dev Notes

### Etat Actuel

**Implementation existante** dans `src/lib/rate-limit.ts` (181 lignes):
- 4 rate limiters configures: `general`, `ai`, `auth`, `api`
- Fonctions utilitaires: `checkRateLimit`, `rateLimitedResponse`, `getClientIP`, `addRateLimitHeaders`
- Utilise `@upstash/ratelimit` + `@upstash/redis`
- Fail-open si Redis non configure (dev mode)

**Endpoint avec rate limiting** (1/25):
- `src/app/api/ai-assistant/route.ts` ✅

**Endpoints SANS rate limiting** (24/25):
```
src/app/api/generate/route.ts                 -> ai (CRITIQUE: generation IA)
src/app/api/stripe/webhook/route.ts           -> EXCLURE (webhook)
src/app/api/stripe/checkout/route.ts          -> general
src/app/api/stripe/portal/route.ts            -> general
src/app/api/gdpr/export/route.ts              -> general
src/app/api/gdpr/delete/route.ts              -> general
src/app/api/v1/quotes/route.ts                -> api (public API)
src/app/api/v1/quotes/[id]/route.ts           -> api (public API)
src/app/api/user/data-export/route.ts         -> general
src/app/api/user/delete-account/route.ts      -> general
src/app/api/admin/stats/route.ts              -> general
src/app/api/analytics/vitals/route.ts         -> EXCLURE (analytics)
src/app/api/quotes/[id]/pdf/route.ts          -> general
src/app/api/workflows/route.ts                -> general
src/app/api/hitl/route.ts                     -> general
src/app/api/invoices/route.ts                 -> general
src/app/api/invoices/[id]/peppol/route.ts     -> general
src/app/api/widget/quote-request/route.ts     -> api (widget public)
src/app/api/referral/route.ts                 -> general
src/app/api/referral/stats/route.ts           -> general
src/app/api/referral/invite/route.ts          -> general
src/app/api/tokens/route.ts                   -> general
src/app/api/api-keys/route.ts                 -> general
src/app/api/leads/route.ts                    -> general
```

### Strategie d'Implementation

**Option 1: Middleware Next.js (RECOMMANDE)**
```typescript
// src/middleware.ts
import { checkRateLimit, rateLimitedResponse, getClientIP } from '@/lib/rate-limit';
import { NextResponse, type NextRequest } from 'next/server';

// Mapping des routes vers les types de rate limiter
const ROUTE_LIMITS: Record<string, 'general' | 'ai' | 'auth' | 'api'> = {
  '/api/generate': 'ai',
  '/api/ai-assistant': 'ai',
  '/api/v1': 'api',
  '/api/widget': 'api',
};

const EXCLUDED_ROUTES = [
  '/api/stripe/webhook',
  '/api/analytics/vitals',
];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip excluded routes
  if (EXCLUDED_ROUTES.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  // Only apply to API routes
  if (!path.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Determine rate limiter type
  let limiterType: 'general' | 'ai' | 'auth' | 'api' = 'general';
  for (const [route, type] of Object.entries(ROUTE_LIMITS)) {
    if (path.startsWith(route)) {
      limiterType = type;
      break;
    }
  }

  // Get identifier (user ID from cookie or IP)
  const identifier = getClientIP(request);

  const result = await checkRateLimit(identifier, limiterType);

  if (!result.success) {
    return rateLimitedResponse(result);
  }

  // Add headers to successful response
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.reset.toString());

  return response;
}

export const config = {
  matcher: '/api/:path*',
};
```

**Option 2: HOC par endpoint (Plus granulaire)**
```typescript
// src/lib/api/with-rate-limit.ts
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  type: RateLimiterType = 'general'
) {
  return async (req: NextRequest) => {
    const ip = getClientIP(req);
    const result = await checkRateLimit(ip, type);

    if (!result.success) {
      return rateLimitedResponse(result);
    }

    const response = await handler(req);
    return addRateLimitHeaders(response, result);
  };
}
```

### Variables d'Environnement Requises

```env
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx
```

### Configuration des Limites (Actuelles)

| Type | Limite | Fenetre | Usage |
|------|--------|---------|-------|
| general | 10 req | 1 min | Standard |
| ai | 5 req | 1 min | IA (couteux) |
| auth | 5 req | 15 min | Login/Register |
| api | 100 req | 1 min | API publique |

**Note**: Les limites `general` sont conservatrices (10/min). Considerer augmenter a 100/min pour production.

### Project Structure Notes

```
src/
├── middleware.ts              # A CREER ou ETENDRE
├── lib/
│   └── rate-limit.ts          # EXISTANT - Utilitaires RL
└── app/api/
    ├── ai-assistant/route.ts  # UTILISE DEJA RL
    ├── generate/route.ts      # A AJOUTER: type "ai"
    ├── v1/quotes/             # A AJOUTER: type "api"
    └── ...                    # A AJOUTER: type "general"
```

### References

- [Source: src/lib/rate-limit.ts] - Implementation existante
- [Source: src/app/api/ai-assistant/route.ts:220-226] - Exemple d'usage
- [Source: package.json] - @upstash/ratelimit ^2.0.0, @upstash/redis ^1.28.0
- [Upstash Ratelimit Docs](https://upstash.com/docs/redis/sdks/ratelimit-ts/overview)

## Technical Requirements

- **Runtime**: Node.js 18+
- **Framework**: Next.js 14.2.35 (App Router)
- **Dependencies**: @upstash/ratelimit, @upstash/redis (deja installees)
- **Env vars**: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

## Testing Requirements

| Test Type | Requirement |
|-----------|-------------|
| Unit Tests | Test checkRateLimit avec mock Redis |
| Integration | Test endpoint avec rate limit actif |
| Manual | Verifier headers X-RateLimit-* |

## Definition of Done

- [ ] Middleware Next.js cree/etendu avec rate limiting
- [ ] Tous les endpoints API proteges (sauf webhooks)
- [ ] Headers X-RateLimit-* retournes sur toutes les reponses
- [ ] Tests unitaires pour rate-limit.ts
- [ ] Documentation des limites mise a jour
- [ ] Code review passe

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Completion Notes List

- Implementation existante solide dans rate-limit.ts
- 24 endpoints sur 25 n'ont pas de rate limiting
- Recommandation: utiliser middleware Next.js pour coverage globale
- Attention: exclure webhooks Stripe du rate limiting

### Estimated Effort

~2-3 heures

### Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Redis non configure en prod | High | Medium | Verifier env vars Vercel |
| Limites trop restrictives | Medium | Low | Monitorer et ajuster |
| Webhook Stripe bloque | High | Low | Exclure explicitement |

### Dependencies

- Variables env Upstash configurees
- Aucune dependance sur d'autres stories

---

*Story creee le 2026-01-28*
*Epic 1: Fondations & Securite*
*Sprint 1*
