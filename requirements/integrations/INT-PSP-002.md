---
id: INT-PSP-002
title: Pre-authorisation where required
type: integration
area: psp
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - preAuthorisation
adrs:
  - ADR-002
contracts: []
modules:
  - PSP adapter
tests: []
---
# INT-PSP-002 — Pre-authorisation where required

## Requirement

The PSP interface must support pre-authorisation/capture patterns where Sparelane payment policy requires them.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.
