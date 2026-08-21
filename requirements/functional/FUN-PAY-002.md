---
id: FUN-PAY-002
title: Pre-authorise where supported
type: functional
area: payments
status: accepted
implementationStatus: foundation_implemented
implementationEvidence: sparelane-platform/docs/development/phase-d-requirements.md
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
  - Reliability Engine
  - PSP adapter
tests: []
dependsOn: []
designs:
  - SEQ-PAY-002
---
# FUN-PAY-002 — Pre-authorise where supported

## Requirement

Where the payment rail and PSP support it, Sparelane must be able to pre-authorise before capture as part of the payment attempt.

## Rationale

Pre-authorisation reduces failed captures and supports reliability policy.

## Acceptance Criteria

- Pre-authorisation attempts are recorded as payment attempts under the workflow.
- Unsupported rails skip pre-authorisation without blocking the workflow model.

## Notes

Payment Reliability Engine MVP.

## Implementation evidence (Phase D)

`implementationStatus: foundation_implemented`. Adapter/FSM preauth hooks exist; collection path uses single-step capture. Not product preauth journey. Architecture `status` remains **accepted**. See [phase-d-status](../../docs/implementation/phase-d-status.md).
