---
id: INT-PSP-006
title: Provider transaction lookup
type: integration
area: psp
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - paymentProviderTimeout
adrs: []
contracts: []
modules:
  - PSP adapter
tests: []
---
# INT-PSP-006 — Provider transaction lookup

## Requirement

The PSP interface must allow Sparelane to look up provider transaction status to resolve unknown outcomes.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.
