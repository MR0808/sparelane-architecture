---
id: INT-SET-002
title: Settlement status and outcomes
type: integration
area: settlement-partner
status: accepted
priority: must
mvp: true
architecture:
  - settlementCore
  - reconciliationCore
flows:
  - settlementConfirmation
  - unknownSettlementOutcome
adrs:
  - ADR-006
contracts: []
modules:
  - Settlement
  - Reconciliation
tests: []
---
# INT-SET-002 — Settlement status and outcomes

## Requirement

The settlement partner interface must provide status/webhooks sufficient to confirm, fail, or reconcile payouts without blind resubmission.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.
