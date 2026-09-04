# Platform checklist — Unified Better Auth (ADR-043)

**Status:** Architecture-binding (no code in this track)  
**Binding:** [ADR-043](../decisions/ADR-043-unified-better-auth-human-authentication.md)  
**Gate:** [greenfield-better-auth-all-gate.md](../decisions/greenfield-better-auth-all-gate.md)  
**Do not:** invent MFA freshness semantics; use Auth0 for new work; mark MFA production-verified without evidence.

## Location

- Adapter: `BetterAuthAuthenticationProvider` implements `AuthenticationProvider` (`@sparelane/security`)
- Composition only in apps/BFF — **no** Better Auth imports in domain/admin/money packages
- Schema: Better Auth tables in dedicated prefix/schema; Sparelane `AuthenticationAssurance` table; `ExternalIdentity` link
- Tests: `BETTER-AUTH-PRIV-001` + recovery specs in architecture `tests/` / platform suites

## Implementation slices

| Slice | Intent |
| --- | --- |
| **AUTH-B0** | Foundation: Better Auth config, Prisma/DB schema, ADR-040 secrets, `SPARELANE_AUTH_ISSUER`, Fake production guard, EmailProvider hooks stub |
| **AUTH-B1** | Consumer + merchant email/password sign-up/sign-in/sign-out → session → AuthenticatedSubject + ExternalIdentity |
| **AUTH-B2** | Email verification, password reset (`revokeSessionsOnPasswordReset`), enumeration-safe responses, rate limits, CSRF/cookie policy |
| **AUTH-B3** | TOTP enrollment; `AuthenticationAssurance` persistence; map to `mfaSatisfiedAt`; backup codes recovery-only |
| **AUTH-B4** | Privileged step-up UX + ADR-033 assert wiring for grant/ledger/DLQ privileged paths |
| **AUTH-B5** | Boundary evidence: consumer ⊄ admin; merchant ⊄ admin without grant; MFA enrollment gates |
| **AUTH-B6** | Remove Auth0 runtime/config/deps/docs/scripts; dispose Auth0 ExternalIdentity test rows via reseed |
| **AUTH-B7** | Local/sandbox evidence pack + regressions (Stripe evidence unchanged) |
| **AUTH-B-EXIT** | Auth acceptance gate: BETTER_AUTH_* evidence recorded; OD-024 still not falsely product_verified until evidence complete |

## Must implement (non-negotiable)

1. `AuthenticationAssurance` row per Better Auth `sessionId`; write `mfaSatisfiedAt` **only** after successful TOTP (or later passkey).
2. Session refresh / trustDevice / backup codes / password-only login **never** set privileged `mfaSatisfiedAt`.
3. Privileged ops call existing `assertRecentPrivilegedAuthentication` (≤15m).
4. Password min length 12; scrypt default OK; revoke-all on password reset.
5. Admin/merchant OWNER|ADMIN MFA enrollment gates as ADR-043.
6. Dual-control path for admin MFA reset (no silent MFA removal + retained privilege).
7. Production rejects Fake auth.
8. Auth email ≠ notification contact (ADR-031).

## Must not

- Import Better Auth into `@sparelane/admin` domain logic
- Map Better Auth organization roles → PlatformAdminGrant / MerchantMembership
- Trust query/body `mfa=true`
- Leave Auth0 as required MVP evidence
- Commit secrets, TOTP seeds, or session tokens to git

## Acceptance evidence classes

| Class | Meaning |
| --- | --- |
| BETTER_AUTH_IMPLEMENTATION | Code slices AUTH-B0–B5 present |
| BETTER_AUTH_SECURITY_EVIDENCE | Session/reset/enumeration/rate-limit tests pass |
| BETTER_AUTH_PRIVILEGED_MFA_EVIDENCE | BETTER-AUTH-PRIV-001 scenarios pass |

Auth0 LIVE browser/MFA evidence is **not** mandatory after ADR-043.
