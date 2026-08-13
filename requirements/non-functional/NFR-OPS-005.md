---
id: NFR-OPS-005
title: Financial workload isolation
type: non-functional
area: operations
status: accepted
priority: must
mvp: true
architecture:
  - resilienceIsolation
  - runtimeProcessing
flows: []
adrs:
  - ADR-019
contracts:
  - docs/operations/resilience-patterns.md
modules:
  - payment/settlement workers
tests: []
---
# NFR-OPS-005 — Financial workload isolation

## Requirement

Notification or non-financial workload failures must not block payment and settlement processing paths.

## Rationale

Operations readiness for MVP architecture.

## Acceptance Criteria

- Corresponding operations docs exist and are linked.
- Alerting/runbook coverage reviewed in ops readiness.

## Notes

Do not invent numeric SLOs still marked TBD.
