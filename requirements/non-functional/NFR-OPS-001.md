---
id: NFR-OPS-001
title: Correlated logs and traces
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

## Implementation evidence (Phase A)

`implementationStatus: foundation_implemented`. Request/correlation IDs and traces exist for the synthetic foundation path, not a product payment journey.
