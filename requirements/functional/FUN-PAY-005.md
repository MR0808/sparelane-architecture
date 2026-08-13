---
id: FUN-PAY-005
title: Classify declines for retry policy
type: functional
area: payments
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - paymentRecovery
  - scheduledRetry
adrs:
  - ADR-002
contracts: []
modules:
  - Reliability Engine
tests: []
dependsOn: []
---
# FUN-PAY-005 — Classify declines for retry policy

## Requirement

Sparelane must classify payment declines/failures to decide soft retry, hard fail, or method fallback.

## Rationale

Classification prevents blind retries and guides fallback.

## Acceptance Criteria

- Decline classes are persisted on attempts.
- Retry/fallback decisions are driven by classification policy.

## Notes

Payment Reliability Engine MVP.
