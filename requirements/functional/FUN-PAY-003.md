---
id: FUN-PAY-003
title: Use primary payment method first
type: functional
area: payments
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - primaryCardSuccess
adrs:
  - ADR-002
  - ADR-003
contracts: []
modules:
  - Payment Workflows
  - Reliability Engine
tests:
  - E2E-PAY-001
dependsOn:
  - FUN-PAY-001
designs:
  - SEQ-PAY-003
---
# FUN-PAY-003 — Use primary payment method first

## Requirement

Sparelane must evaluate the consumer's eligible primary payment method before ordered backup payment methods for an eligible bill payment workflow.

## Rationale

Primary-first is the default reliability policy for consumer methods.

## Acceptance Criteria

- Primary method is attempted before backups when eligible.
- primaryCardSuccess flow documents the happy path.

## Notes

Payment Reliability Engine MVP.
