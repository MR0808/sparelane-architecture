---
id: FUN-PAY-004
title: Ordered fallback across backup methods
type: functional
area: payments
status: accepted
priority: must
mvp: true
architecture:
  - paymentEngineCore
flows:
  - backupRecovery
  - paymentRecovery
adrs:
  - ADR-002
  - ADR-024
contracts: []
modules:
  - Reliability Engine
tests:
  - E2E-PAY-002
dependsOn:
  - FUN-PAY-003
openDecisions:
  - OD-003
designs:
  - SEQ-PAY-004
---
# FUN-PAY-004 — Ordered fallback across backup methods

## Requirement

On eligible primary failure, Sparelane must attempt ordered backup payment methods according to decline classification and [ADR-024](../../docs/decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md) recovery policy.

## Rationale

Backup recovery is a core reliability behaviour (BUS-005).

## Acceptance Criteria

- Backup order matches consumer-configured priority.
- Ineligible methods are skipped without counting as successful collection.
- After `RETRYABLE` or `NON_RETRYABLE` on the current method, an eligible backup is attempted immediately before any same-method scheduled retry (ADR-024).
- Declines do not globally revoke the stored PaymentMethod.

## Notes

Payment Reliability Engine MVP.
