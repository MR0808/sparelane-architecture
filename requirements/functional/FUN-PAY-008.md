---
id: FUN-PAY-008
title: No duplicate collection
type: functional
area: payments
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
  - fundsLedger
flows:
  - collectionToLedger
  - paymentProviderTimeout
adrs:
  - ADR-003
  - ADR-016
contracts: []
modules:
  - Payment Workflows
  - Ledger
tests:
  - FIN-INV-01
  - FIN-INV-02
dependsOn: []
---
# FUN-PAY-008 — No duplicate collection

## Requirement

Sparelane must prevent duplicate successful collection for the same payment workflow/bill payment context.

## Rationale

Financial safety: same payment cannot be collected twice (FIN-INV-01).

## Acceptance Criteria

- Concurrent attempts cannot produce two successful collections for one workflow.
- Provider timeouts are reconciled without blind double capture.

## Notes

Payment Reliability Engine MVP.
