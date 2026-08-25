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
adrs:
  - ADR-035
contracts:
  - docs/operations/runbooks/README.md
modules:
  - Platform Operations
tests:
  - OPS-RUN-001
  - OPS-PILOT-001
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

## Phase I note

[ADR-035](../../docs/decisions/ADR-035-pilot-readiness-local-evidence-policy.md) requires the five architecture runbooks to be Fake-executable and policy-aligned for local Phase I (`OPS-RUN-001`). Platform I0–I3 **PASS** (`npm run test:phase-i`); does **not** mark this NFR `verified`.
