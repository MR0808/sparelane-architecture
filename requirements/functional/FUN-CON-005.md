---
id: FUN-CON-005
title: View bill and payment state
type: functional
area: consumer
status: accepted
priority: must
mvp: true
architecture:
  - experienceApi
  - paymentEngineCore
flows:
  - paymentLifecycle
adrs:
  - ADR-003
contracts: []
modules:
  - Experience
  - Payment Workflows
tests: []
---
# FUN-CON-005 — View bill and payment state

## Requirement

Consumers must be able to view current bill presentation and payment workflow state for connected merchants.

## Rationale

Transparency supports Retry Now and reduces support load.

## Acceptance Criteria

- Consumer UI shows non-sensitive payment/bill state consistent with workflow model.
- States distinguish in-progress, collected, and failed outcomes.

## Notes

MVP consumer experience scope.
