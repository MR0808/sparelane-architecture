---
id: NFR-OPS-001
title: Correlated logs and traces
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
  - docs/operations/observability.md
modules:
  - Platform Operations
tests: []
---
# NFR-OPS-001 — Correlated logs and traces

## Requirement

Operational logs/traces for a payment or settlement journey must be correlatable by workflow/request identifiers.

## Rationale

Operations readiness for MVP architecture.

## Acceptance Criteria

- Corresponding operations docs exist and are linked.
- Alerting/runbook coverage reviewed in ops readiness.

## Notes

Do not invent numeric SLOs still marked TBD.
