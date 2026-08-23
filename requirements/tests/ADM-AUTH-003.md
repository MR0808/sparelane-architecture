---
id: ADM-AUTH-003
title: No environment-based admin authority
type: security
status: verified
relatedRequirements:
  - FUN-ADM-001
  - NFR-SEC-008
mvp: true
---

# ADM-AUTH-003 — No environment-based admin authority

## Purpose

Environment configuration must not create platform-admin authority.

## Preconditions

- Config/static analysis over platform identity composition

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Scan for `ENV_ADMIN`, email allowlist, domain allowlist admin grants | None in production composition |
| 2 | Fake/dev admin identity | Only under existing local/test environment gates |
| 3 | Production smoke | Admin routes fail closed without persisted grant |

## Implementation status

**Verified locally** — `sparelane-platform` `npm run test:phase-h0`. Does **not** claim production MFA/IdP admin readiness (OD-024 open).
