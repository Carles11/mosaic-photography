# Feature: Auth

> Supabase Auth with magic links, email/password, and client-side guards.

## Files

| File | Role |
|---|---|
| `src/lib/auth/auth-guards.ts` | **Single source of truth** for route lists + guard helpers |
| `src/lib/auth/auth-helpers.ts` | Auth utility functions |
| `src/context/AuthSessionContext.tsx` | Client auth state via Supabase `onAuthStateChange` |
| `src/hooks/useAuth.ts` | `{ user, session, loading }` — use this in components |
| `src/hooks/useAuthGuard.ts` | Client-side route protection hook |
| `src/hooks/useLoginAndCloseModal.ts` | Helper: login → close current modal |
| `src/components/auth/guards/ProtectedRoute.tsx` | Wraps protected pages |
| `src/components/auth/guards/PublicRoute.tsx` | Redirects authenticated users away from auth pages |
| `src/middleware.ts` | Lightweight cookie check, theme header, bot cookie |
| `src/lib/supabaseClient.ts` | Browser Supabase singleton |
| `src/lib/supabaseServerClient.ts` | Server Supabase client |

---

## Route Classification

Defined in `src/lib/auth/auth-guards.ts`. **Always update this file** when changing route protection:

```typescript
PROTECTED_ROUTES = ["/profile", "/profile/*", "/photo-curations"]
AUTH_ROUTES     = ["/auth/login", "/auth/signup", "/auth/forgot-password"]
PUBLIC_ROUTES   = ["/", "/auth/*", "/faq", "/legal"]
```

Helper functions: `isProtectedRoute(path)` · `isAuthRoute(path)` · `isPublicRoute(path)`

---

## Auth Flow

**Magic link (preferred):**
```
/auth/magic-link → user enters email → Supabase sends link → /auth/verify-email
```

**Email + password:**
```
/auth/login or /auth/signup → Supabase → AuthSessionContext updates
```

**Password reset:**
```
/auth/forgot-password → email → /auth/password-reset
```

**Email change confirmation:** `/auth/confirm-email-change`

---

## Client Auth State

`AuthSessionContext` is the source of truth:
- Subscribes to `supabase.auth.onAuthStateChange`
- Exposes `{ user, session, loading }`
- Access via `useAuth()` hook from `src/hooks/useAuth.ts`

**Do not read auth state from cookies or middleware in client components.** Use `useAuth()`.

---

## Middleware Auth

`src/middleware.ts` does **minimal** auth work (Edge Runtime):
- Sets `x-theme` header from cookie (for SSR theme)
- Sets `skip_age_modal=1` cookie for bots (allows AI crawlers to skip age gate)
- Checks auth cookies for lightweight redirect (auth pages → home if logged in)
- Does **NOT** block protected routes — client guards do that

Matcher excludes: `_next/static`, `_next/image`, `favicon.ico`, image files.

---

## Protecting a New Route

1. Add path to `PROTECTED_ROUTES` in `src/lib/auth/auth-guards.ts`
2. Wrap the page client component with `<ProtectedRoute>`:
   ```tsx
   export default function MyProtectedPage() {
     return (
       <ProtectedRoute>
         <MyPageContent />
       </ProtectedRoute>
     );
   }
   ```
3. No changes needed in middleware for basic protection.

---

## Auth Pages SEO

`src/app/auth/layout.tsx` exports:
```typescript
export const metadata = { robots: { index: false, follow: false } }
```
All auth sub-routes inherit this. **Do not remove or override this.**

---

## Supabase Clients

| Client | File | When to use |
|---|---|---|
| Browser | `src/lib/supabaseClient.ts` | Client components, contexts |
| Server | `src/lib/supabaseServerClient.ts` | Server components, SSR utils |
| Service role | scripts only via env | Build scripts, migrations |

Never expose `SUPABASE_SERVICE_ROLE_KEY` in client-side code.
