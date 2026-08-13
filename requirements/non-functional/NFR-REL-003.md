---
id: NFR-REL-003
title: Bounded retry
type: non-functional
area: reliability
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
  - productionDeployment
flows:
  - scheduledRetry
adrs:
  - ADR-017
contracts:
  - docs/operations/resilience-patterns.md
modules:
  - Workers
  - Reliability Engine
tests: []
---
# NFR-REL-003 — Bounded retry

## Requirement

Retries for payment, webhook, and settlement operations must be bounded by policy (count/time/jitter as configured).

## Rationale

Reliability patterns from ADR-016/017 and financial invariants.

## Acceptance Criteria

- Behaviour is covered by financial invariant tests and/or resilience docs.
- Runbooks exist for operator response where applicable.

## Notes

Numerical SLOs remain TBD where not yet decided.
