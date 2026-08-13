---
id: FUN-CON-006
title: Consumer Retry Now
type: functional
area: consumer
status: accepted
priority: must
mvp: true
architecture:
  - experienceApi
  - paymentEngineCore
flows:
  - consumerRetryNow
adrs:
  - ADR-002
  - ADR-003
contracts: []
modules:
  - Payment Workflows
  - Reliability Engine
tests: []
---
# FUN-CON-006 — Consumer Retry Now

## Requirement

Consumers must be able to trigger an immediate eligible retry (Retry Now) when the payment workflow allows it.

## Rationale

Manual retry complements scheduled retries without bypassing eligibility or duplicate-collection guards.

## Acceptance Criteria

- Retry Now is rejected when the workflow is not in a retry-eligible state.
- Retry Now cannot create a duplicate successful collection for the same bill workflow.

## Notes

MVP consumer experience scope.
