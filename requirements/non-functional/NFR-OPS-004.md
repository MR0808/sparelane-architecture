---
id: NFR-OPS-004
title: Operable runbooks
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
  - docs/operations/runbooks/README.md
modules:
  - Platform Operations
tests: []
---
# NFR-OPS-004 — Operable runbooks

## Requirement

Operators must have runbooks for provider outages, DLQ replay, ledger lag, and webhook backlog.

## Rationale

Operations readiness for MVP architecture.

## Acceptance Criteria

- Corresponding operations docs exist and are linked.
- Alerting/runbook coverage reviewed in ops readiness.

## Notes

Do not invent numeric SLOs still marked TBD.
