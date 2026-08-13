---
id: INT-SET-001
title: Settlement instruction submission
type: integration
area: settlement-partner
status: accepted
priority: must
mvp: true
architecture:
  - settlementCore
flows:
  - merchantSettlement
adrs:
  - ADR-006
contracts: []
modules:
  - Settlement
tests: []
---
# INT-SET-001 — Settlement instruction submission

## Requirement

The settlement partner interface must accept settlement instructions idempotently and return acknowledgements.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.
