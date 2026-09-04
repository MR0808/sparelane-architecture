---
id: ADR-041
title: MVP Production Identity Provider Selection
status: Superseded
date: 2026-08-25
deciders: Architecture
consulted: Security / Product / Ops
informed: Platform engineering
supersedes: []
superseded_by: ADR-042
related:
  - ADR-012
  - ADR-014
  - ADR-032
  - ADR-033
  - ADR-034
  - ADR-040
  - ADR-042
  - OD-023
  - OD-024
---

# ADR-041 — MVP Production Identity Provider Selection

## Status

**Superseded** by [ADR-042](./ADR-042-human-authentication-population-split.md) (2026-09-03).

Historical record: Accepted 2026-08-25. Selected **Auth0** as the single MVP production/sandbox **human** identity provider for all interactive populations. Reconsideration gate: [auth0-vs-better-auth-reconsideration-gate.md](./auth0-vs-better-auth-reconsideration-gate.md).

**Do not implement new work against ADR-041 as the sole human-IdP binding.** Privileged (merchant user + admin) Auth0 bindings that remain valid are restated in ADR-042. Consumer human authentication is **Better Auth** under ADR-042.

Original acceptance resolved [OD-023](./open/OD-023-identity-provider.md) under ADR-032 / ADR-033. OD-023 remains resolved; binding now ADR-042.

**Research access date:** 2026-08-25 (Auth0 step-up / `amr` / `auth_time` / AU residency docs; WorkOS AuthKit step-up; Clerk/Cognito/Better Auth evaluation; platform identity composition evidence).

## Context

Platform already separates:

1. `AuthenticationProvider` → `AuthenticatedSubject`
2. Identity resolution `(issuer, subject)` → `User` / `Principal`
3. Authorisation (`PlatformAdminGrant`, merchant membership, deny-by-default)

Human auth today: **FakeAuthenticationProvider** / DevAuthenticationProvider (non-production only). Sandbox/production fail closed (`AnonymousAuthenticator` / reject Fake). Merchant **machine** API credentials are Sparelane-owned (hash+pepper) — out of IdP scope.

ADR-033 requires server-derived `PrivilegedAuthenticationContext.mfaSatisfiedAt` with age ≤ **15 minutes**, never client `mfa=true`.

## Decision

### Selected

| Field | Binding |
| --- | --- |
| Production IdP | **Auth0** (Okta Customer Identity Cloud) |
| Role | Human authentication system of record for **credentials / MFA / login sessions** |
| Sparelane role | Remains **authorisation / tenancy / grants** system of record |
| Integration shape | Auth0 OIDC → Sparelane `AuthenticationProvider` adapter → existing identity composition |
| Tenants | Prefer **Australia** public-cloud region for MVP residency posture |
| Auth0 Organizations | **Optional later** — must **not** become Sparelane merchant-tenancy SoT |

### Rejected / not selected

| Candidate | Verdict |
| --- | --- |
| WorkOS AuthKit | Strong `auth_time`/`max_age` step-up; softer explicit MFA proof than Auth0 `amr:mfa` for ADR-033 without extra enrollment policy. Soft non-select for MVP. |
| Clerk | Good Next.js DX; reverification exists; more opinionated user/org model; weaker fit to existing `(issuer,subject)` + no-auto-provision composition without extra constraint work. Soft non-select. |
| AWS Cognito | Aligns with ADR-040 AWS; step-up recent-MFA evidence is more DIY / higher ADR-033 risk. Soft non-select for MVP. |
| Better Auth (+ DIY MFA) | Not used in Sparelane today; would expand owned auth surface (sessions, MFA, recovery) without managed IdP operational controls. **Rejected** as MVP production IdP. |

## Architecture pattern (no rewrite)

```text
Auth0 (login / MFA / session tokens)
  → AuthenticationProvider adapter (verify JWT / session)
  → AuthenticatedSubject { issuer, subject, email?, emailVerified?, authenticatedAt, authenticationMethods?, mfaSatisfiedAt? }
  → ApplicationIdentityResolver (ExternalIdentity link; no auto-provision)
  → Principal (merchant_user | consumer | admin via PlatformAdminGrant)
  → Authoriser
```

| Concern | Owner |
| --- | --- |
| Passwords / social / MFA enrollment | Auth0 |
| Login session / token issuance | Auth0 |
| User application record (`usr_…`) | **Sparelane** |
| External identity ID | Auth0 `sub` linked in Sparelane `ExternalIdentity` |
| Email (authoritative for product) | Sparelane User (Auth0 email is hint / verification signal only; **not** link key) |
| Email verification state | Auth0 as auth signal; Sparelane may mirror for product gates |
| Session transport | Auth0 + app BFF/session bridge — Sparelane does not invent parallel password store |
| MFA enrollment | Auth0 |
| MFA satisfaction evidence | Auth0 claims → mapped into `AuthenticatedSubject.mfaSatisfiedAt` by adapter |
| Platform roles / grants | **Sparelane `PlatformAdminGrant` only** |
| Merchant membership | **Sparelane** |
| Consumer relationships | **Sparelane** |
| Machine API credentials | **Sparelane** (never Auth0) |

**Do not** treat Auth0 roles/permissions/organizations as Sparelane admin capability, merchant access, financial authority, or dual-control authority.

## ADR-033 MFA binding (hard)

### Requirements preserved

- Privileged request / approve / execute require recent MFA
- Age ≤ 15 minutes
- Server-derived only
- Fail closed when evidence missing/stale
- No client assertion `mfa=true`

### Auth0 evidence mapping

| Sparelane field | Auth0 source (adapter-normalised) |
| --- | --- |
| `authenticatedAt` | Token `auth_time` if present, else `iat` of verified ID/access token used for the request |
| `mfaSatisfiedAt` | **Only** when ID token (or verified equivalent) includes `amr` containing **`mfa`** (or documented Auth0 MFA AMR equivalents). Value = `auth_time` from that MFA-satisfied authentication event. |
| `methods[]` | Normalised from `amr` / Auth0 MFA method metadata (e.g. `otp`, `webauthn`) — never secrets |

### Step-up for privileged admin

Before privileged admin steps (or when MFA evidence is missing/stale):

1. Application **fails closed** (deny) if current subject lacks fresh MFA evidence.
2. Admin UI/BFF initiates Auth0 **step-up** with `acr_values` requesting multi-factor (Auth0 documented MFA ACR) and/or `max_age` ≤ **900** seconds as needed to obtain a new token with `amr` including `mfa` and fresh `auth_time`.
3. Adapter re-derives `PrivilegedAuthenticationContext` from the new server-verified subject.
4. `assertRecentPrivilegedAuthentication` unchanged.

### Platform-admin MFA enrollment

All users with active `PlatformAdminGrant` **must** have Auth0 MFA enrolled before production privileged mutations. Missing enrollment → fail closed (cannot satisfy `amr:mfa`).

### Explicit non-bindings

- Silent refresh alone must **not** refresh `mfaSatisfiedAt`.
- Password-only re-entry without MFA **does not** satisfy ADR-033 for privileged admin.
- Auth0 Actions/Rules must not inject forged MFA claims without actual MFA challenge.

## Surfaces

| Surface | Auth |
| --- | --- |
| Merchant portal users | Auth0 human login → Sparelane membership |
| Consumer portal users | Auth0 human login → Sparelane consumer link |
| Platform admin | Auth0 human login + MFA + Sparelane grant |
| Merchant API (`/v1`) | Sparelane machine credentials only |
| Admin BFF (`/admin/v1`) | Human session only — no machine credentials |

## Session / lifecycle

- Email verification, password reset, account disable at Auth0 for authentication disablement
- Sparelane `User.status` / membership / grant revoke remain authoritative for **application** access
- Prefer Auth0 log/stream webhooks for lifecycle signals (disable, MFA enrollment changes) as acceleration — Sparelane must still enforce grants/membership locally
- Session revocation: Auth0 session revoke + Sparelane deny on unresolved/disabled User

## Environments

| Env | Binding |
| --- | --- |
| local / test | FakeAuthenticationProvider (unchanged) |
| sandbox | Real Auth0 tenant (separate from production) + test users |
| production | Production Auth0 tenant (AU region preferred) |

## Secrets (ADR-040)

Low-cardinality Secrets Manager entries, e.g.:

- Auth0 client secret(s)
- Auth0 Management API credentials if used (least privilege)
- Auth0 log/webhook signing secret if used

No Auth0 secrets in source. Compatible with ADR-040.

## Local/test strategy

`FakeAuthenticationProvider` remains the automated-test / local human auth path (`nonProductionOnly`). Production/sandbox continue to reject Fake via `assertProductionSafeAuthentication`.

## OD-024 consequence

| Item | Result |
| --- | --- |
| MFA vendor for admin privileged path | **Auth0** (this ADR) |
| How `mfaSatisfiedAt` is produced | **Bound above** |
| Implementation | **EXTERNAL_IMPLEMENTATION** (adapter + step-up UX) |
| Consumer MFA/passkey product beyond admin | Deferred / still product-open under OD-024 as narrowed |

OD-024 remains **open but narrowed** (vendor path selected; implementation not done) — same pattern as historically narrowed ODs.

## Consequences

### Positive

- OD-023 closed; last EXTERNAL_VENDOR_DECISION cleared
- ADR-033 preserved with concrete claim mapping
- No rewrite of identity composition / grants / machine auth
- Fake tests remain valid

### Negative / follow-ups

- Auth0 AuthenticationProvider adapter = EXTERNAL_IMPLEMENTATION
- Admin step-up UX = EXTERNAL_IMPLEMENTATION
- Auth0 commercial/plan sizing TBD operationally
- Vendor lock-in accepted for human auth; Sparelane authZ remains portable
- Managed secrets (ADR-040) should land before live Auth0 client secrets in sandbox/production

## Alternatives considered

1. **STOP** — rejected; Auth0 satisfies ADR-033 without weakening policy.
2. **WorkOS first** — deferred; Auth0 MFA claim evidence clearer for MVP privileged admin.
3. **Cognito for AWS alignment** — deferred; higher step-up implementation risk.
4. **Better Auth self-hosted** — rejected for MVP production IdP.
5. **Replace Sparelane User/Grant with IdP RBAC** — rejected; violates admin boundary.
