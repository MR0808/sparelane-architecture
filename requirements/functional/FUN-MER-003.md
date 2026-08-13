---
id: FUN-MER-003
title: Submit bill
type: functional
area: merchant
status: accepted
priority: must
mvp: true
architecture:
  - merchantIntegration
  - paymentEngineCore
flows:
  - billSubmission
  - billIngestion
adrs:
  - ADR-007
  - ADR-008
contracts:
  - contracts/openapi.yaml
modules:
  - Bills
  - Merchant Integrations
tests: []
designs:
  - SEQ-PAY-001
  - SEQ-INT-001
---
# FUN-MER-003 — Submit bill

## Requirement

Merchants must be able to submit bill events that create or update Sparelane bill records used for payment orchestration.

## Rationale

Bill submission is the entry point for payment reliability workflows.

## Acceptance Criteria

- POST /bills (or equivalent) accepts a well-formed bill submission.
- Successful submission makes the bill eligible for payment workflow creation per policy.

## Notes

MVP merchant integration scope.
