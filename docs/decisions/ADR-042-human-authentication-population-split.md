---
id: ADR-042
title: Human Authentication Population Split (Auth0 Privileged + Better Auth Consumer)
status: Superseded
date: 2026-09-03
supersedes: ADR-041
superseded_by: ADR-043
---

# ADR-042 — Human Authentication Population Split (Auth0 Privileged + Better Auth Consumer)

**Status:** Superseded by [ADR-043](./ADR-043-unified-better-auth-human-authentication.md) (2026-09-03).  
**Historical:** Accepted briefly as Hybrid; greenfield gate selected Better Auth-all. Do not implement Hybrid as target.

**Date:** 2026-09-03  
**Supersedes (historical):** [ADR-041](./ADR-041-mvp-production-identity-provider-selection.md) for human authentication population boundaries and consumer IdP selection.

## Context

ADR-041 selected Auth0 as the single MVP human identity provider for all interactive populations. Platform work already implemented a provider-neutral `AuthenticationProvider` stack with an Auth0 adapter, HTTP-only BFF session, and ADR-033 MFA derivation from Auth0 `amr` + `auth_time`.

Live Auth0 browser evidence exposed real integration complexity (audience grant, PKCE cookie binding, callback/session plumbing). Separately, Sparelane’s product shape is asymmetric:

- **Consumers** may scale to very large MAU.
- **Merchant users** and **platform administrators** remain comparatively small.
- Auth0’s published B2C pricing is MAU-based; published Essentials tables stop around **50k MAU**; **100k / 1M MAU require CUSTOM_QUOTE** ([Auth0 pricing](https://auth0.com/pricing.md), retrieved 2026-09-03).
- Better Auth is MIT/open-source self-hosted software with **no per-MAU fee**; optional managed infra starts at Pro **$20/mo** ([Better Auth pricing](https://better-auth.com/pricing)).
- ADR-033 privileged MFA (≤15 minutes, server-trusted, fail-closed) is a **hard gate** for administrators (and any merchant flows that later require privileged step-up). Better Auth’s `twoFactor` plugin does **not** expose Auth0-equivalent first-class `amr`/`auth_time`; step-up freshness requires Sparelane-owned MFA timestamp design (material custom security surface).

This gate re-opens the human-auth architecture **excluding sunk Auth0 implementation cost** and asks: *what would we choose designing Sparelane today?*

Gate evidence: [auth0-vs-better-auth-reconsideration-gate.md](./auth0-vs-better-auth-reconsideration-gate.md).

## Decision

**HYBRID_AUTH0_PRIVILEGED_BETTER_AUTH_CONSUMER**

| Population | Production identity provider | MFA / ADR-033 |
| --- | --- | --- |
| Platform administrator | **Auth0** | Mandatory; `amr`+`auth_time` → `mfaSatisfiedAt`; ≤15m; step-up |
| Merchant portal user | **Auth0** | MFA as product/policy requires; same claim mapping when privileged |
| Consumer (portal / hosted flow) | **Better Auth** (self-hosted in Sparelane) | Not used for ADR-033 privileged admin ops; consumer step-up is Sparelane product policy (separate) |

### Invariants (unchanged)

1. Sparelane remains **authorisation SoT**: `MerchantMembership`, consumer↔merchant relationships, `PlatformAdminGrant`, dual control, ledger correction, DLQ replay. Provider roles/orgs must not become business authZ SoT.
2. `AuthenticationProvider` / `AuthenticatedSubject` remain the domain boundary.
3. `ExternalIdentity(issuer, subject)` remains the link from verified provider identity → Sparelane `User`. Distinct issuers per provider population.
4. Production must not use Fake/Dev human auth (existing production guards).
5. Machine Merchant API credentials remain unchanged (not Auth0 / not Better Auth human login).

### Consumer Better Auth bindings (MVP)

| Topic | Binding |
| --- | --- |
| SOFTWARE_LICENSE_COST | $0 (open-source Better Auth) |
| OPERATING_COST | Postgres session/account storage + Sparelane app CPU + transactional email (OD-035) |
| OPTIONAL_MANAGED_SERVICE_COST | Not required for MVP; optional Better Auth infra Pro/Enterprise later |
| Credential strategy | Email + password for MVP; magic-link/OTP optional product enhancement |
| Email verification | Required before payment-method mutation and other sensitive consumer actions (product enforcement) |
| Password reset | Better Auth reset flows + Sparelane email delivery; rate-limited |
| Session | Server-side Better Auth session; **HttpOnly**, **Secure** (prod), **SameSite=Lax** (or stricter if same-site only); fail-closed validation |
| MFA | Not required for MVP consumer; do **not** invent admin-style MFA freshness for consumers |
| Passkeys / social | **Deferred** (product OD / later ADR); do not block MVP |
| Account linking | No automatic link across Auth0 merchant identity and Better Auth consumer identity by email |
| ExternalIdentity | `issuer` = configured Sparelane Better Auth issuer URL; `subject` = Better Auth user id |
| Secrets | Session signing / Better Auth secret via ADR-040 managed secrets |
| Abuse | Rate limits on login/register/reset; lockout/backoff; no client-trusted MFA claims |

### Privileged Auth0 bindings (retained from ADR-041)

| Topic | Binding |
| --- | --- |
| Protocol | Authorization Code + PKCE; Auth0 Universal Login |
| Session | Sparelane BFF HTTP-only session after verified callback |
| MFA evidence | `amr` includes `mfa` (or equivalent MFA AMR); `mfaSatisfiedAt` from `auth_time` only; omit → fail closed for privileged |
| Freshness | ≤ **15 minutes** per ADR-033 |
| Step-up | Auth0 MFA / re-auth; silent refresh must **not** reset MFA age |
| Population MAU | Merchant + admin only — keep Auth0 MAU off the consumer growth curve |

### Explicit non-decisions

- Do **not** rip out existing Auth0 merchant/admin platform work.
- Do **not** implement Better Auth in this architecture track (platform migration is a follow-on).
- Do **not** migrate sandbox Auth0 consumer test users if none are production — **NO_PRODUCTION_USER_MIGRATION_REQUIRED**.
- Enterprise SSO/SAML/SCIM for large merchants remains Auth0 trajectory for privileged humans; consumer Better Auth does not block that.

## Consequences

### Positive

- Avoids Auth0 MAU tax on potentially huge consumer populations while preserving Auth0 for the hard ADR-033 admin MFA path.
- Keeps provider-neutral identity mapping and Sparelane authZ SoT.
- Consumer IdP chosen **before production consumer enrollment**, reducing future migration pain vs enrolling all consumers in Auth0 first.

### Negative / costs

- **Two** human auth systems: dual login UX surfaces, dual session cookies, dual support runbooks, dual incident surfaces.
- New EXTERNAL_IMPLEMENTATION: Better Auth consumer adapter + evidence.
- Auth0 LIVE_EVIDENCE remains mandatory for **merchant/admin MFA**, not for consumer login.
- Operational ownership of consumer passwords/sessions expands into Sparelane (Postgres + email + abuse controls).

### Implementation impact (platform — future work)

| Area | Action |
| --- | --- |
| `AuthenticationProvider` / `AuthenticatedSubject` | **REUSE** |
| `ExternalIdentity` / `User` / memberships / grants | **REUSE** |
| Auth0 adapter + `/auth/login|callback|logout` for merchant/admin | **REUSE** (narrow population) |
| PrivilegedAuthenticationContext / MFA derivation | **REUSE** (Auth0 only) |
| Consumer portal auth | **REPLACE** Auth0 path with Better Auth adapter |
| FakeAuth / tests | **MODIFY** (population-aware fixtures) |
| Auth0 sandbox consumer identities | **REMOVE** from acceptance blockers |

Slices: see [better-auth-consumer-implementation-checklist.md](../implementation/better-auth-consumer-implementation-checklist.md).

## Alternatives Considered

### A — Retain Auth0 for all humans (ADR-041)

Rejected for **long-term unit economics** and **consumer scalability**. Free tier (25k MAU) covers early MVP, but published B2C Essentials pricing ends ~50k MAU; 100k/1M are CUSTOM_QUOTE. Paying Auth0 for every consumer is an avoidable structural cost given Sparelane’s population asymmetry. Security/MFA path is strong; sunk Auth0 work is **not** a selection criterion.

### B — Better Auth for all humans

Rejected on **hard-gate ADR-033 risk** for administrators: no first-class `amr`/`auth_time`; MFA freshness requires significant Sparelane-owned timestamp/step-up design and full credential/MFA custody for the highest-assurance population. Acceptable for consumers; not preferred for platform admin MVP.

### D — Other (e.g. Cognito, Clerk, passwordless-only consumers)

No option was clearly superior to Hybrid for Sparelane’s constraints. Cognito remains rejected for DIY privileged MFA relative to Auth0 (per ADR-041 analysis). Passwordless-only consumers may be a later product ADR, not a reason to keep Auth0 MAU.

## Dependencies / Open Questions

- OD-023 remains **resolved** (architecture selected); content updated to ADR-042 hybrid.
- OD-024 remains **open** for Auth0 MFA adapter evidence / passkey product stance; **not** reopened as vendor selection for admin IdP.
- OD-035 email provider required for Better Auth verification/reset delivery.
- Optional later OD: consumer passkeys / social login; merchant enterprise SSO packaging.

## Related Architecture

- Docs: [authentication.md](../security/authentication.md), [admin-access.md](../security/admin-access.md), [authorisation.md](../security/authorisation.md)
- Gate: [auth0-vs-better-auth-reconsideration-gate.md](./auth0-vs-better-auth-reconsideration-gate.md)
- Checklists: [auth0-authentication-provider-checklist.md](../implementation/auth0-authentication-provider-checklist.md), [better-auth-consumer-implementation-checklist.md](../implementation/better-auth-consumer-implementation-checklist.md)
- Supersedes: ADR-041
- Related: ADR-032, ADR-033, ADR-040
