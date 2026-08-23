---
id: NFR-SEC-011
title: Authorised operator replay with recent MFA
type: non-functional
area: security
status: accepted
implementationStatus: designed
priority: must
mvp: true
architecture:
  - privilegedAccess
  - dlqReplay
adrs:
  - ADR-033
  - ADR-034
contracts:
  - docs/security/admin-access.md
  - docs/security/audit.md
modules:
  - Identity
  - Admin Control Plane
tests:
  - ADM-REPLAY-003
  - ADM-REPLAY-004
  - ADM-REPLAY-005
openDecisions:
  - OD-023
  - OD-024
---
# NFR-SEC-011 — Authorised operator replay with recent MFA

## Requirement

H2 operator webhook replay must require capability `admin.webhook.replay`, recent MFA via `PrivilegedAuthenticationContext` (max age 15 minutes), and a compliant reason (16–500 chars). Prohibited replay types must be denied with audit/security evidence.

## Rationale

ADR-034 reuses ADR-033 freshness without inventing a second MFA policy; closed catalogue prevents financial bypass.

## Acceptance Criteria

- Stale/missing MFA rejects replay request.
- Missing/invalid reason rejects replay request.
- Financial and notification replay actions denied.
- Unauthorised callers cannot create `OperatorReplayRequest`.

## Notes

Provider MFA implementation remains OD-024; local/test doubles may evidence policy only.
