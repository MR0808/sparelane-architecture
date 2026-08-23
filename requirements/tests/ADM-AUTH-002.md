---
id: ADM-AUTH-002
title: Merchant admin denied admin control plane
type: security
status: verified
relatedRequirements:
  - FUN-ADM-002
  - NFR-SEC-008
mvp: true
---

# ADM-AUTH-002 — Merchant admin denied admin control plane

## Purpose

Merchant organisation admin must not access platform admin routes.

## Preconditions

- Merchant owner/admin membership without `PlatformAdminGrant`

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Merchant admin session hits `/admin/v1/*` | 403 authorisation denied |
| 2 | Merchant admin session hits `/admin` UI | Redirect/deny per portal guard — not admin shell |
| 3 | No platform admin grant implied by merchant role | Static identity composition test |

## Implementation status

**Verified locally** — `sparelane-platform` `npm run test:phase-h0`. Does **not** claim production MFA/IdP admin readiness (OD-024 open).
