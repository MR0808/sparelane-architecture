---
id: INT-PSP-004
title: Idempotency or safe reconciliation
type: integration
area: psp
status: accepted
implementationStatus: foundation_implemented
implementationEvidence: sparelane-platform/docs/development/phase-d-requirements.md
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - paymentProviderTimeout
adrs:
  - ADR-016
contracts: []
modules:
  - PSP adapter
tests: []
---
# INT-PSP-004 — Idempotency or safe reconciliation

## Requirement

The PSP interface must support idempotent requests and/or provider transaction lookup sufficient to reconcile unknown outcomes safely.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.

## Implementation evidence (Phase D)

`implementationStatus: foundation_implemented` for adapter/FakePSP capability evidence only. Vendor selection OD-008/010 open. Not real-PSP verified. Architecture `status` remains **accepted**. See [phase-d-status](../../docs/implementation/phase-d-status.md).
