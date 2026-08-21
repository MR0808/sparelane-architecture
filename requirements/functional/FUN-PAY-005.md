---
id: FUN-PAY-005
title: Classify declines for retry policy
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
  - paymentRecovery
  - scheduledRetry
adrs:
  - ADR-002
  - ADR-024
contracts: []
modules:
  - Reliability Engine
tests: []
dependsOn: []
---
# FUN-PAY-005 — Classify declines for retry policy

## Requirement

Sparelane must classify payment declines/failures to decide soft retry, hard fail, or method fallback.

## Rationale

Classification prevents blind retries and guides fallback.

## Acceptance Criteria

- Decline classes are persisted on attempts (`RETRYABLE` | `NON_RETRYABLE` | `TECHNICAL_ERROR` | `UNKNOWN`).
- Retry/fallback decisions are driven by classification policy ([ADR-024](../../docs/decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)).
- Classification may be attached write-once after the attempt is already `DECLINED`/`ERROR` with null classification.
- Decline Classification does not call the Retry Service or PSP.

## Notes

Payment Reliability Engine MVP.

## Implementation evidence (Phase D)

`implementationStatus: implemented` for bounded decline classification on attempts (FakePSP local). Architecture `status` remains **accepted**. See [phase-d-status](../../docs/implementation/phase-d-status.md).
