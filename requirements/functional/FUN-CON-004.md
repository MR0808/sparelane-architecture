---
id: FUN-CON-004
title: Set primary and backup payment method priority
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
  - ADR-002
contracts: []
modules:
  - Payment Methods
  - Reliability Engine
tests: []
openDecisions:
  - OD-003
---
# FUN-CON-004 — Set primary and backup payment method priority

## Requirement

Consumers must be able to designate a primary payment method and an ordered list of backup methods.

## Rationale

Orchestration depends on a clear evaluation order (see FUN-PAY-003/004).

## Acceptance Criteria

- Exactly one eligible primary can be active for a consumer payment context as modelled.
- Backup order is persisted and used by the Reliability Engine.

## Notes

MVP consumer experience scope.
