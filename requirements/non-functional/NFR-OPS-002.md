---
id: NFR-OPS-002
title: Alerting for critical failures
type: non-functional
area: operations
status: accepted
priority: must
mvp: true
architecture:
  - productionDeployment
flows: []
adrs:
  - ADR-019
contracts:
  - docs/operations/alerting.md
modules:
  - Platform Operations
tests: []
---
# NFR-OPS-002 — Alerting for critical failures

## Requirement

Critical payment, ledger, settlement, and webhook backlog conditions must be alertable.

## Rationale

Operations readiness for MVP architecture.

## Acceptance Criteria

- Corresponding operations docs exist and are linked.
- Alerting/runbook coverage reviewed in ops readiness.

## Notes

Do not invent numeric SLOs still marked TBD.
