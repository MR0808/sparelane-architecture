---
id: FUN-PAY-007
title: Complete failure terminal state
type: functional
area: payments
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - completeFailure
adrs:
  - ADR-003
contracts: []
modules:
  - Payment Workflows
tests: []
dependsOn: []
---
# FUN-PAY-007 — Complete failure terminal state

## Requirement

When all eligible methods and retries are exhausted, the payment workflow must reach a complete-failure terminal state and surface outcomes to merchants/consumers.

## Rationale

Terminal failure is required for honest outcomes (BUS-003).

## Acceptance Criteria

- Complete failure is distinct from in-progress and collected states.
- Merchants can observe failure via API/webhooks.

## Notes

Payment Reliability Engine MVP.
