---
id: ADM-AUTH-001
title: Persisted platform-admin grant required
type: security
status: verified
relatedRequirements:
  - FUN-ADM-001
  - FUN-ADM-002
  - NFR-SEC-008
mvp: true
---

# ADM-AUTH-001 — Persisted platform-admin grant required

## Purpose

Prove admin control-plane access requires an active persisted `PlatformAdminGrant`.

## Preconditions

- User with `ExternalIdentity` link
- Test fixture can insert/remove grant row

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | User with active grant | Admin BFF routes return 200 for permitted read capabilities |
| 2 | Same user, grant removed or non-active | Next request denied (403) — no server restart required |
| 3 | User without grant | Denied on admin routes |

## Implementation status

**Verified locally** — `sparelane-platform` `npm run test:phase-h0`. Does **not** claim production MFA/IdP admin readiness (OD-024 open).
