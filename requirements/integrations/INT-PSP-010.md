---
id: INT-PSP-010
title: PayTo rail support
type: integration
area: psp
status: deferred
priority: could
mvp: false
architecture:
  - paymentEngineExtended
flows: []
adrs: []
contracts: []
modules:
  - PSP adapter
tests: []
---
# INT-PSP-010 — PayTo rail support

## Requirement

Future PayTo (or equivalent account-to-account) rail support may be added after MVP card rails.

## Rationale

PayTo is tagged future in the architecture model; not MVP.

## Acceptance Criteria

- Not required for MVP.
- Introduction requires updated ADRs/flows and provider interface requirements.

## Notes

status: deferred; mvp: false.

## Implementation evidence (Phase D)

`implementationStatus: foundation_implemented` for adapter/FakePSP capability evidence only. Vendor selection OD-008/010 open. Not real-PSP verified. Architecture `status` remains **accepted**. See [phase-d-status](../../docs/implementation/phase-d-status.md).
