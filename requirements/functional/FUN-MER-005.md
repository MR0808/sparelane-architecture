---
id: FUN-MER-005
title: Retrieve payment status
type: functional
area: merchant
status: accepted
priority: must
mvp: true
architecture:
  - merchantIntegration
  - paymentEngineCore
flows:
  - paymentLifecycle
adrs:
  - ADR-003
  - ADR-020
contracts:
  - contracts/openapi.yaml
modules:
  - Payment Workflows
  - Merchant Integrations
tests: []
---
# FUN-MER-005 — Retrieve payment status

## Requirement

Merchants must be able to retrieve payment status for a bill/payment using opaque public identifiers.

## Rationale

Polling complements webhooks for reconciliation.

## Acceptance Criteria

- GET payment endpoints return current workflow-level outcome suitable for merchants.
- Identifiers follow opaque public ID strategy (ADR-020).

## Notes

MVP merchant integration scope.
