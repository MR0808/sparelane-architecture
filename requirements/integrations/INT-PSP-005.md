---
id: INT-PSP-005
title: Authenticated provider webhooks
type: integration
area: psp
status: accepted
implementationStatus: foundation_implemented
implementationEvidence: sparelane-platform/docs/development/phase-d-requirements.md
priority: must
mvp: true
architecture:
  - trustBoundaries
flows:
  - providerWebhookVerification
adrs:
  - ADR-010
contracts:
  - docs/security/webhook-security.md
modules:
  - PSP adapter
tests:
  - INT-PSP-001
openDecisions:
  - OD-008
designs:
  - SEQ-SEC-002
---
# INT-PSP-005 — Authenticated provider webhooks

## Requirement

The PSP interface must provide signed or otherwise authenticated webhooks for payment outcome updates.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.

## Implementation evidence (Phase D)

`implementationStatus: foundation_implemented` for adapter/FakePSP capability evidence only. Vendor selection OD-008/010 open. Not real-PSP verified. Architecture `status` remains **accepted**. See [phase-d-status](../../docs/implementation/phase-d-status.md).
