---
id: FUN-MER-007
title: Retrieve settlement status
type: functional
area: merchant
status: accepted
priority: must
mvp: true
architecture:
  - settlementCore
  - merchantIntegration
flows:
  - merchantSettlement
  - merchantReconciliationFlow
adrs:
  - ADR-006
  - ADR-005
contracts:
  - contracts/openapi.yaml
modules:
  - Settlement
  - Merchant Integrations
tests: []
---
# FUN-MER-007 — Retrieve settlement status

## Requirement

Merchants must be able to retrieve settlement status for settlement-eligible collections.

## Rationale

Settlement visibility is required for merchant finance operations.

## Acceptance Criteria

- Settlement status API returns lifecycle state distinct from payment workflow state.
- Merchants cannot observe another tenant settlement data.

## Notes

MVP merchant integration scope.
