---
id: INT-PSP-001
title: Secure tokenisation capability
type: integration
area: psp
status: accepted
priority: must
mvp: true
architecture:
  - pciBoundaryView
flows:
  - addPaymentMethod
adrs:
  - ADR-001
  - ADR-010
contracts: []
modules:
  - PSP adapter
tests: []
---
# INT-PSP-001 — Secure tokenisation capability

## Requirement

The PSP interface must support secure tokenisation so Sparelane never handles raw PAN/CVV.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.
