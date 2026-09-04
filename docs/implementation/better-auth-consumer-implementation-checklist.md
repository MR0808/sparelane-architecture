# Platform checklist — Better Auth consumer AuthenticationProvider (SUPERSEDED)

**Status:** Superseded by [better-auth-unified-platform-checklist.md](./better-auth-unified-platform-checklist.md) ([ADR-043](../decisions/ADR-043-unified-better-auth-human-authentication.md) Better Auth-all).  
**Do not** implement consumer-only Hybrid slices; use AUTH-B* unified slices.

## Location (suggested)

- Port: existing `AuthenticationProvider` / `AuthenticatedSubject` (`@sparelane/security`)
- Adapter: e.g. `BetterAuthConsumerAuthenticationProvider`
- Composition: wire **by portal population** (consumer routes ≠ merchant/admin Auth0 BFF)
- Better Auth tables: isolated schema/prefix; map to Sparelane `User` only via `ExternalIdentity`
- **No** Better Auth types in domain/admin/money modules

## Implementation slices

| Slice | Intent | Depends on |
| --- | --- | --- |
| **AUTH-C0** | Better Auth foundation: config, secret via ADR-040, Prisma/Postgres adapter, production Fake guard, issuer URL | Secrets; OD-035 email for verification mail |
| **AUTH-C1** | Consumer register/login/logout/session cookie → `AuthenticatedSubject` + ExternalIdentity link | AUTH-C0 |
| **AUTH-C2** | Email verification + password reset + rate limits/lockout | AUTH-C1, email provider |
| **AUTH-C3** | Consumer portal routes cut over from Auth0 (if any) / Fake to Better Auth; merchant/admin Auth0 untouched | AUTH-C2 |
| **AUTH-C4** | Automated tests + local evidence pack; FakeAuth remains for non-prod tests | AUTH-C3 |
| **AUTH-C-EXIT** | LIVE/LOCAL_EXTERNAL consumer auth evidence for MVP acceptance (not Auth0 consumer) | AUTH-C4 |

Do **not** implement admin MFA freshness on Better Auth in these slices.

## Must implement

| Item | Notes |
| --- | --- |
| Session validation | Fail closed; HttpOnly cookie; reject tampered/missing session |
| Subject mapping | Better Auth user id → `ExternalIdentity(issuer, subject)`; email not sole link key |
| No auto PlatformAdminGrant / membership | Unchanged |
| Population isolation | Consumer session must not unlock `/admin` or merchant privileged Auth0 session |
| Production guards | Reject Fake human auth in production |
| Audit | Login success/failure, reset, verification events (no secrets in logs) |

## Must not

- Use Better Auth for platform admin or replace Auth0 privileged MFA
- Map Better Auth roles → Sparelane authZ
- Treat session age as MFA satisfaction for any privileged admin path
- Require finishing Auth0 **consumer** browser evidence for MVP
- Store Auth0 passwords in Sparelane or Better Auth MFA secrets for admins

## Acceptance evidence (consumer)

Replace Auth0-consumer LIVE_EVIDENCE with:

1. Register + verify + login + logout (local or sandbox)
2. Password reset happy path
3. Fail closed: invalid session denied
4. ExternalIdentity issuer/subject stable across sessions
5. Cross-check: Auth0 merchant session still works independently
