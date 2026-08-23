---
id: ADM-DATA-001
title: Admin read model safe projection
type: security
status: verified
relatedRequirements:
  - FUN-ADM-003
  - NFR-PRIV-005
mvp: true
---

# ADM-DATA-001 — Admin read model safe projection

## Purpose

Admin read responses must not leak secrets or forbidden fields.

## Preconditions

- Platform admin with grant
- Fixture objects with secrets/tokens populated in DB

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Merchant lookup | No `secretHash`, webhook signing secret, bank ref |
| 2 | Payment workflow lookup | No provider token or raw provider payload |
| 3 | Settlement lookup | No payout destination ref |
| 4 | Response body scan | No auth subject, session token, DB URL patterns |

## Implementation status

**Verified locally** — `sparelane-platform` `npm run test:phase-h0`. Does **not** claim production MFA/IdP admin readiness (OD-024 open).
