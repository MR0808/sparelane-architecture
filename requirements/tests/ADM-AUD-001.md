---
id: ADM-AUD-001
title: Audit append-only admin view
type: security
status: verified
relatedRequirements:
  - FUN-ADM-004
  - NFR-SEC-007
mvp: true
---

# ADM-AUD-001 — Audit append-only admin view

## Purpose

Admin audit access is read-only; audit store cannot be mutated via admin APIs.

## Preconditions

- Platform admin with `admin.audit.view`
- Existing audit rows in store

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Paginated audit query | 200; safe fields only |
| 2 | Attempt audit update/delete via admin API | Routes absent or 405/404 |
| 3 | Filters | action, target type, time range, correlation/request ID — no arbitrary metadata grep |
| 4 | Redaction | No secrets in audit response payloads |

## Implementation status

**Verified locally** — `sparelane-platform` `npm run test:phase-h0`. Does **not** claim production MFA/IdP admin readiness (OD-024 open).
