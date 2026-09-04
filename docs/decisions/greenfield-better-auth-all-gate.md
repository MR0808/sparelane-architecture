---
id: GATE-AUTH-GREENFIELD-BA-ALL
title: Greenfield Better Auth-all reconsideration
status: Complete
date: 2026-09-03
outcome: BETTER_AUTH_ALL
binding: ADR-043
---

# Greenfield Better Auth-all gate

**Outcome:** **BETTER_AUTH_ALL** — [ADR-043](./ADR-043-unified-better-auth-human-authentication.md)  
**Supersedes target:** [ADR-042](./ADR-042-human-authentication-population-split.md)  
**Sunk Auth0 cost weight:** **0**  
**Production migration:** **NO_PRODUCTION_USER_MIGRATION_REQUIRED**

Sources: Better Auth docs (2FA, email/password, database, security, SSO/SCIM) retrieved 2026-09-03; platform RO `AuthenticationProvider` / `AuthenticatedSubject` / Auth0 adapter / `assertRecentPrivilegedAuthentication`.

## Greenfield framing

With zero production users, prefer a single self-hosted Better Auth stack **if** ADR-033 MFA freshness can be bound with server-owned evidence. Sparelane-owned `AuthenticationAssurance` is that evidence — semantic equivalent of Auth0 `amr`+`auth_time` → `mfaSatisfiedAt`, without vendor MAU or dual IdPs.

## Hard gate — MFA

| Requirement | Result |
| --- | --- |
| Admin MFA mandatory | PASS — enrollment gate before admin BFF |
| ≤15m freshness | PASS — Sparelane `mfaSatisfiedAt` + existing assert |
| Server-side step-up | PASS — TOTP verify → write assurance |
| Fail-closed | PASS — missing assurance denies privileged |
| No client forge | PASS — DB-only write path |
| Refresh must not extend MFA | PASS — refresh forbidden from mutating assurance |
| Backup codes ≠ privileged MFA | PASS — bound |
| Tenant / authZ separation | PASS — Sparelane SoT unchanged |

**Hard gate: PASS** (with bound AuthenticationAssurance — not left to implementer invention).

## Greenfield scorecard (Better Auth-all vs Hybrid only)

Weights: Security assurance 30%, Long-term control 15%, Unit economics 15%, Architecture simplicity 15%, Operational responsibility 15%, Enterprise trajectory 10%.

| Criterion | Better Auth-all | Hybrid |
| --- | ---: | ---: |
| Security assurance | 8 | 9 |
| Long-term control | 9 | 6 |
| Unit economics | 9 | 8 |
| Architecture simplicity | 9 | 4 |
| Operational responsibility | 5 | 6 |
| Enterprise trajectory | 7 | 9 |
| **Weighted** | **7.90** | **7.20** |

Selected: **Better Auth-all**.

## Threat model deltas (self-hosted auth)

| Threat | Control |
| --- | --- |
| Credential DB breach | scrypt hashes; ADR-040 secret; DB access control; breach runbook |
| MFA secret compromise | BA encrypts TOTP/backup with auth secret; secret rotation; no logs |
| Password reset takeover | Single-use token; rate limit; revoke sessions; MFA still required for privileged |
| Session theft | HttpOnly Secure cookies; revoke; short admin absolute TTL |
| MFA timestamp forgery | Only server write after verified TOTP; no client fields |
| Unsafe account linking | No social MVP; no email-only auto-link |
| Privilege via auth metadata | Roles/orgs ignored for PlatformAdminGrant |
| Enumeration / stuffing | Generic responses + rate limits |

Full bindings and implementation slices: ADR-043 + [better-auth-unified-platform-checklist.md](../implementation/better-auth-unified-platform-checklist.md).
