---
id: FUN-PAY-001
title: Create one payment workflow per bill
type: functional
area: payments
status: accepted
implementationStatus: implemented
implementationEvidence: sparelane-platform/docs/development/phase-d-requirements.md
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - paymentLifecycle
  - billIngestion
adrs:
  - ADR-003
contracts: []
modules:
  - Payment Workflows
tests:
  - FIN-INV-01
  - E2E-PAY-001
dependsOn: []
openDecisions:
  - OD-007
designs:
  - STATE-PAY-001
  - SEQ-PAY-003
---
# FUN-PAY-001 — Create one payment workflow per bill

## Requirement

Sparelane must create exactly one payment workflow per eligible bill payment context.

## Rationale

ADR-003: workflow vs attempt separation; one bill → one workflow.

## Acceptance Criteria

- A bill does not receive concurrent duplicate workflows for the same payment context.
- Multiple attempts may exist under a single workflow.

## Notes

Payment Reliability Engine MVP.

## Implementation evidence (Phase D)

`implementationStatus: implemented` for the Phase D workflow orchestration slice (with Phase C create). Local FakePSP product path. Architecture `status` remains **accepted**. See [phase-d-status](../../docs/implementation/phase-d-status.md).
