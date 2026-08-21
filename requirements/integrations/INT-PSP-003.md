---
id: INT-PSP-003
title: Payment execution
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
  - primaryCardSuccess
  - paymentProviderTimeout
adrs:
  - ADR-002
contracts: []
modules:
  - PSP adapter
tests:
  - E2E-PAY-001
openDecisions:
  - OD-008
---
# INT-PSP-003 — Payment execution

## Requirement

The PSP interface must support payment execution (authorise/capture or equivalent) with clear success/failure outcomes.

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.

## Implementation evidence (Phase D)

`implementationStatus: foundation_implemented` for adapter/FakePSP capability evidence only. Vendor selection OD-008/010 open. Not real-PSP verified. Architecture `status` remains **accepted**. See [phase-d-status](../../docs/implementation/phase-d-status.md).
