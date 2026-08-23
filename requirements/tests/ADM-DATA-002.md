---
id: ADM-DATA-002
title: Consumer exact public ID lookup only
type: security
status: verified
relatedRequirements:
  - FUN-ADM-003
  - NFR-PRIV-005
mvp: true
---

# ADM-DATA-002 — Consumer exact public ID lookup only

## Purpose

H0 consumer admin lookup must not support PII search.

## Preconditions

- Platform admin with grant
- Consumers with known email/contact values in DB

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Lookup by exact `con_…` public ID | 200 with safe bounded fields |
| 2 | Lookup/search by email | Rejected — route absent or 404/400 |
| 3 | Lookup by auth subject | Rejected |
| 4 | Response | No contact email, no auth email |

## Implementation status

**Verified locally** — `sparelane-platform` `npm run test:phase-h0`. Does **not** claim production MFA/IdP admin readiness (OD-024 open).
