# Platform checklist — Auth0 AuthenticationProvider (LEGACY — AUTH-B6 removal)

**Status:** Legacy — **not** target architecture after [ADR-043](../decisions/ADR-043-unified-better-auth-human-authentication.md)  
**Do not** expand Auth0 work for MVP. Prefer [better-auth-unified-platform-checklist.md](./better-auth-unified-platform-checklist.md).  
**Historical binding:** ADR-041 / ADR-042 (both superseded)


## Location

- Port: `AuthenticationProvider` / `AuthenticatedSubject` (`@sparelane/security`)
- Composition: `createApiAuthenticationStack` / `createIdentityCompositionStack`
- Adapter e.g. `packages/integrations` or `apps/api/src/identity/auth0-authentication-provider.ts`
- **No** Auth0 SDK types in domain/admin modules

## Must implement

| Item | Notes |
| --- | --- |
| JWT/session verification | Auth0 issuer + audience; reject unverified tokens |
| Subject mapping | `issuer` + `sub` → ExternalIdentity path; email not link key |
| `mfaSatisfiedAt` | Only when `amr` includes `mfa`; value from `auth_time`; else omit (fail closed for privileged) |
| `authenticatedAt` / `methods[]` | From verified claims |
| Admin step-up | Trigger Auth0 MFA step-up when privileged evidence missing/stale; re-derive context |
| Admin MFA enrollment gate | Active PlatformAdminGrant users must have Auth0 MFA |
| Secrets | Client secret / webhook secret via ADR-040 Secrets Manager |
| Env separation | Distinct Auth0 tenants for sandbox vs production |
| Production Fake guard | `assertProductionSafeAuthentication` continues to reject Fake |
| Machine credentials | Unchanged — CompositeRequestAuthenticator human vs machine |
| Conformance | no `mfa=true` body; stale MFA deny; missing amr deny; unlink → UNLINKED_IDENTITY |

## Must not

- Auto-provision Users from Auth0 alone (keep no-auto-provision unless a later ADR)
- Map Auth0 roles/orgs → PlatformAdminGrant or merchant membership
- Allow machine API credentials into `/admin`
- Store Auth0 passwords or raw MFA secrets in Sparelane
- Treat silent refresh as MFA satisfaction
