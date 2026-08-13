---
id: FUN-CON-003
title: Add tokenised payment method
type: functional
area: consumer
status: accepted
priority: must
mvp: true
architecture:
  - experienceApi
  - pciBoundaryView
flows:
  - addPaymentMethod
adrs:
  - ADR-001
  - ADR-010
contracts: []
modules:
  - Payment Methods
  - PSP adapter
tests: []
---
# FUN-CON-003 — Add tokenised payment method

## Requirement

Consumers must be able to add a payment method using PSP tokenisation so Sparelane never handles raw PAN/CVV.

## Rationale

PCI boundary requires tokenisation at the PSP (ADR-001/010).

## Acceptance Criteria

- Sparelane stores only token references and display metadata, never PAN/CVV.
- Add-payment-method flow completes only after PSP tokenisation succeeds.

## Notes

MVP consumer experience scope.
