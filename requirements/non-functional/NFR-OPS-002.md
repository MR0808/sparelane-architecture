---
id: NFR-OPS-002
title: Alerting for critical failures
type: non-functional
area: operations
status: accepted
implementationStatus: foundation_implemented
implementationEvidence: sparelane-platform/docs/development/phase-a-requirements.md
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

## Implementation evidence (Phase A)

`implementationStatus: foundation_implemented`. Metric names for backlog/failures exist. Hosted alerting/SIEM remains OD-021. Product payment/ledger/webhook alerting is not verified.
