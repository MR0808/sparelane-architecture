---
id: NFR-OPS-003
title: Restore testing
type: non-functional
area: operations
status: accepted
priority: must
mvp: true
architecture:
  - productionDeployment
flows: []
adrs: []
contracts:
  - docs/operations/disaster-recovery.md
modules:
  - Platform Operations
tests: []
---
# NFR-OPS-003 — Restore testing

## Requirement

Backup restore procedures for critical stores must be tested on a defined cadence (exact cadence TBD).

## Rationale

Operations readiness for MVP architecture.

## Acceptance Criteria

- Corresponding operations docs exist and are linked.
- Alerting/runbook coverage reviewed in ops readiness.

## Notes

Do not invent numeric SLOs still marked TBD.
