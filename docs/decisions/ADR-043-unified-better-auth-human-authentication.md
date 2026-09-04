---
id: ADR-043
title: Unified Better Auth Human Authentication and Privileged MFA Assurance
status: Accepted
date: 2026-09-03
supersedes: ADR-042
---

# ADR-043 — Unified Better Auth Human Authentication and Privileged MFA Assurance

**Status:** Accepted  
**Date:** 2026-09-03  
**Supersedes:** [ADR-042](./ADR-042-human-authentication-population-split.md) (and transitively replaces ADR-041 as the human-auth target).

## Context

Greenfield rule: *If Sparelane were designed today with zero production users, would we choose Better Auth for all human authentication?*

Facts:

- **NO_PRODUCTION_USER_MIGRATION_REQUIRED** — no launched auth estate; Auth0 sandbox identities are disposable.
- Auth0-all was rejected on consumer MAU economics ([ADR-041 reconsideration](./auth0-vs-better-auth-reconsideration-gate.md)).
- ADR-042 selected Hybrid largely because Better Auth lacked first-class `amr`/`auth_time` for ADR-033.
- Sunk Auth0 implementation effort has **zero** decision weight under this greenfield gate.
- Dual-auth Hybrid complexity is avoidable if Sparelane owns a server-side MFA assurance model equivalent in semantics to Auth0 claim mapping.

Hard gate: ADR-033 privileged ops require `mfaSatisfiedAt` present and `now - mfaSatisfiedAt ≤ 15 minutes`, fail closed, no client-controlled claim.

Better Auth `twoFactor` encrypts TOTP secrets / backup codes with the auth secret, challenges before session issuance on credential sign-in, and does **not** expose Auth0-equivalent `amr`/`auth_time`. Privileged freshness must therefore be a **Sparelane-owned** assurance record written only after a verified MFA challenge.

Gate evidence: [greenfield-better-auth-all-gate.md](./greenfield-better-auth-all-gate.md).

## Decision

**BETTER_AUTH_ALL** — Better Auth is the sole production human authentication system for:

| Population | IdP | MFA |
| --- | --- | --- |
| Consumer | Better Auth | Not ADR-033; optional product step-up later |
| Merchant portal user | Better Auth | Enrollment **required** for `OWNER`/`ADMIN` membership before API-credential UI mutations; TOTP MVP |
| Platform administrator | Better Auth | **Mandatory** MFA enrollment before any admin BFF use; ADR-033 ≤15m for privileged steps |

Auth0 is **removed from the target architecture**. It is not an MVP dependency. Platform must eventually remove Auth0 runtime (AUTH-B6). Do not rip Auth0 in this architecture track.

### Invariants

1. Sparelane remains **authorisation SoT** (`MerchantMembership`, consumer relationships, `PlatformAdminGrant`, dual control, ledger correction, DLQ replay). Better Auth roles/orgs must not become business authZ.
2. `AuthenticationProvider` / `AuthenticatedSubject` remain the domain boundary — core admin/security modules must not import Better Auth types.
3. Keep `ExternalIdentity(issuer, subject)`.
4. Canonical issuer: configured constant e.g. `https://auth.sparelane.internal/better-auth` (env `SPARELANE_AUTH_ISSUER`); subject = Better Auth user id.
5. Production Fake/Dev human auth remains fail-closed (existing guards).
6. Machine Merchant API credentials unchanged.
7. ADR-033 policy unchanged; only the **source** of `mfaSatisfiedAt` changes (Sparelane `AuthenticationAssurance`, not Auth0 JWT claims).

### AuthenticationAssurance (binding — MFA hard gate PASS)

Provider-neutral server record (conceptual; names may match platform types):

```text
AuthenticationAssurance {
  issuer
  subject
  sessionId          // Better Auth session id (or token id) — session-scoped
  authenticatedAt    // session authentication time (UTC)
  mfaSatisfiedAt?    // last successful privileged-qualifying MFA (UTC)
  authenticationMethods[]  // e.g. password, totp — audit labels only
}
```

**Storage mechanism (selected):** **B — dedicated Sparelane `AuthenticationAssurance` persistence** (Postgres), keyed by `(sessionId)` uniquely, with `(issuer, subject)` denormalised. Not cookie; not client-writable; not Better Auth session extension fields (avoids accidental refresh coupling).

| Event | Effect on `mfaSatisfiedAt` |
| --- | --- |
| Password-only login | **Must not** set |
| Successful TOTP verify (login or step-up) | Set/update to server `now()` |
| Successful WebAuthn/passkey (when enabled) | Set/update (post-MVP) |
| Backup-code verify | **Must not** set for privileged assurance (recovery only) |
| Session refresh / cookie renew / `updateAge` | **Must not** mutate |
| `trustDevice` / remembered device | **Must not** set or extend |
| Password reset / MFA disable / MFA reset / session revoke | Clear assurance for affected session(s); revoke sessions as bound below |
| Wall clock alone / “MFA enabled” flag | **Never** sufficient |

Adapter maps assurance → `AuthenticatedSubject.mfaSatisfiedAt` for `derivePrivilegedAuthenticationContext` / `assertRecentPrivilegedAuthentication`.

### Step-up flow

```text
valid Better Auth session
→ privileged op requested
→ load AuthenticationAssurance for this sessionId
→ missing/stale mfaSatisfiedAt → require TOTP challenge (no client boolean)
→ server verifies TOTP via Better Auth
→ server writes mfaSatisfiedAt = now() for this sessionId only
→ re-check ≤15m
→ execute privileged op
```

Other sessions of the same user **do not** inherit this session’s `mfaSatisfiedAt`.

### MFA methods (MVP)

| Method | Privileged `mfaSatisfiedAt`? | Notes |
| --- | --- | --- |
| TOTP (authenticator app) | **Yes** | MVP primary |
| Backup codes | **No** | Account recovery only; after use require TOTP re-enrollment or fresh TOTP before privileged |
| Passkeys / WebAuthn | Post-MVP | Preferred future admin path; optional later |
| Email OTP | **No** for privileged | Not phishing-resistant enough for ADR-033 |

`skipVerificationOnEnable: false` (default) — MFA not enabled until TOTP verified.

### Admin recovery (hard boundary)

- Lost authenticator / exhausted backups: recovery via dual-control privileged action (catalogue extension `admin.mfa.reset` or equivalent) — requester ≠ approver; recent MFA of **approver**; audited.
- Recovery **clears** MFA enrollment + all sessions + all AuthenticationAssurance for target; **does not** create/modify `PlatformAdminGrant`.
- Target must re-enroll MFA before any admin BFF privileged or even read admin access that requires MFA-enrolled principal.
- No support operator may silently disable MFA and retain privileged authority.
- Break-glass: still **NOT SUPPORTED** (ADR-033).

### Password / reset / verification

| Topic | Binding |
| --- | --- |
| Hashing | Better Auth default **scrypt** (Node native; OWASP-acceptable). Custom Argon2id optional later — document if changed. |
| Min length | **12** for all humans MVP (stricter than BA default 8) |
| Reset | Single-use token; expiry ≤1h; generic responses; **`revokeSessionsOnPasswordReset: true`**; clear AuthenticationAssurance for all user sessions |
| After privileged-user password reset | Require MFA still enrolled; clear `mfaSatisfiedAt`; step-up before privileged ops |
| Email verification | Required before consumer payment-method mutations; required before merchant portal activation; required before admin eligibility / grant targeting usability |
| Auth email ≠ notification contact | ADR-031 preserved — no silent copy |

### Enumeration / rate limits

- Sign-up / forgot-password / resend-verification: generic success responses where Better Auth supports enumeration protection; enable `requireEmailVerification` patterns that avoid existence leaks.
- Platform/API rate limits on auth endpoints (login, reset, MFA verify, signup) — no unlimited auth. Better Auth attempt limits + Sparelane edge/API quotas.

### Session model

| Topic | Binding |
| --- | --- |
| Persistence | Server-side Better Auth session (DB) — **not** JWT-only |
| Cookie | HttpOnly; Secure in sandbox/prod; SameSite=Lax (or Strict if same-site only) |
| Absolute lifetime | Bound in implementation config (e.g. 7d consumer; shorter for admin portal sessions recommended ≤12h absolute) |
| Idle timeout | Recommended; config-bound |
| Rotation | On privilege elevation / password change |
| Revocation | Single session + revoke-all; password change; MFA reset; admin recovery |
| CSRF | No GET mutations; Origin checks + SameSite; follow Better Auth / Next BFF conventions |

Session validity ≠ MFA freshness (days vs 15 minutes).

### Social login / linking

- MVP: **none**
- No automatic link by email match across methods
- Future linking only with verified email + explicit policy ADR

### Enterprise SSO trajectory

Better Auth SSO plugin (OIDC/SAML) and SCIM plugin exist; maturity evolving. **Not an MVP blocker.** Sparelane must still map SSO subjects via ExternalIdentity and keep MerchantMembership SoT — never trust IdP roles as platform admin. Classify: **B — future adapter/plugin work**, not architectural incompatibility.

### Data ownership

- Better Auth tables (`user`, `session`, `account`, `verification`, two-factor fields) in dedicated schema/prefix — auth identity only.
- Sparelane `User` / memberships / grants remain domain SoT.
- Link only through ExternalIdentity.
- `AuthenticationAssurance` is Sparelane security table.

### Secrets / MFA material / email

- Better Auth `secret` + cookie signing via ADR-040 managed secrets (sandbox/prod fail closed).
- TOTP secrets/backup codes: Better Auth encrypts with auth secret — treat auth secret as HIGH; rotate via ADR-040; never log.
- Email transport: Sparelane `EmailProvider` (OD-035 may remain open for vendor).

### Auth0 removal target (eventual AUTH-B6)

Remove: `packages/adapter-auth0`, AUTH0_* env, Auth0 callback/PKCE/JWKS, operator scripts, Auth0 evidence tooling, Auth0 deps/docs. Staged — not one mega-PR required.

### Routes (target)

Prefer Better Auth / Next conventions under `/api/auth/*` plus product UX:

`/auth/sign-in`, `/auth/sign-up`, `/auth/sign-out`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/mfa`, `/auth/mfa/step-up`

Auth0 `/auth/callback` removed after AUTH-B6.

## Consequences

### Positive

- Single human auth stack; predictable marginal cost; full control; greenfield-clean.
- ADR-033 satisfied with explicit Sparelane assurance (clearer than opaque vendor claims).
- Auth0 out of MVP critical path.

### Negative

- Sparelane owns credential/MFA/session incident response.
- Must implement and test AuthenticationAssurance rigorously (BETTER-AUTH-PRIV-001).
- Enterprise SSO is future work on Better Auth plugins, not Auth0 orgs.

## Alternatives Considered

### Retain Hybrid (ADR-042)

Rejected under greenfield: dual systems add ops/DX cost without production Auth0 estate to preserve; MFA assurance can be owned cleanly in Sparelane.

### Auth0-all

Already rejected on consumer MAU economics.

## Dependencies / Open Questions

- OD-023 resolved → Better Auth-all (this ADR).
- OD-024 open for implementation/evidence (TOTP enrollment UX, passkey product later).
- OD-035 email vendor for verification/reset mail.
- Catalogue action `admin.mfa.reset` dual-control details may refine under OD-026 without blocking AUTH-B0.

## Related Architecture

- [greenfield-better-auth-all-gate.md](./greenfield-better-auth-all-gate.md)
- [better-auth-unified-platform-checklist.md](../implementation/better-auth-unified-platform-checklist.md)
- [authentication.md](../security/authentication.md), [admin-access.md](../security/admin-access.md)
- ADR-032, ADR-033, ADR-040
- Supersedes: ADR-042
