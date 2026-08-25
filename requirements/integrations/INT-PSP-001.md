---
id: INT-PSP-001
title: Secure tokenisation capability
type: integration
area: psp
status: accepted
implementationStatus: foundation_implemented
implementationEvidence: sparelane-platform/docs/development/phase-d-requirements.md
priority: must
mvp: true
architecture:
  - pciBoundaryView
flows:
  - addPaymentMethod
adrs:
  - ADR-001
  - ADR-010
  - ADR-037
  - ADR-038
contracts: []
modules:
  - PSP adapter
tests: []
openDecisions:
  - OD-010
---
# INT-PSP-001 — Secure tokenisation capability

## Requirement

The PSP interface must support secure tokenisation so Sparelane never handles raw PAN/CVV.

Under [ADR-037](../../docs/decisions/ADR-037-collection-funds-flow-merchant-of-record.md) and [ADR-038](../../docs/decisions/ADR-038-mvp-payment-service-provider-selection.md): Stripe Elements/SetupIntent on the **platform**; store platform `pm_…`; clone to connected account (`acct_…`) for direct charges.

## Rationale

Defines required provider interface capabilities. Vendor selected: Stripe Connect (ADR-038).

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.
- Cross-merchant reuse uses official Stripe PaymentMethod cloning without Sparelane storing PAN/CVV.

## Notes

Adapter + LIVE_EVIDENCE pending. OD-010 settlement half still open (OD-009).

## Implementation evidence (Phase D)

`implementationStatus: foundation_implemented` for adapter/FakePSP capability evidence only. Not real-Stripe verified. Architecture `status` remains **accepted**. See [phase-d-status](../../docs/implementation/phase-d-status.md).
