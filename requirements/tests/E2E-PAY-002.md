---
id: E2E-PAY-002
title: Backup payment success
type: e2e
status: specified
relatedRequirements:
  - FUN-PAY-004
  - FUN-PAY-005
  - BUS-005
relatedFlows:
  - backupRecovery
relatedAdrs:
  - ADR-024
mvp: true
---

# E2E-PAY-002 — Backup payment success

## Purpose

Primary fails with classifiable decline; ordered backup succeeds (ADR-024 backup-before-soft-retry).

## Preconditions

- Merchant and consumer fixtures connected; bill eligible for payment.
- At least one eligible backup method configured.
- Fake PSP returns scripted outcomes.

## Scenario matrix (must be provable by D4+)

| Case | Scripted primary | Expected |
| --- | --- | --- |
| Soft decline + backup | RETRYABLE decline | Classify RETRYABLE; exclude primary from immediate walk; create attempt #2 on backup; no ScheduledJob yet for soft-before-backup |
| Hard decline + backup | NON_RETRYABLE decline | Classify NON_RETRYABLE; workflow-scoped exclude primary; attempt #2 on backup; PaymentMethod remains stored/ACTIVE |
| Soft decline + no backup + budget | RETRYABLE; no backup | `RETRY_PENDING`; no backup attempt; scheduler is D5 |
| Soft decline + no backup + no budget | RETRYABLE; no backup; budget exhausted | `ACTION_REQUIRED` |
| Hard decline + no backup | NON_RETRYABLE; no backup | `ACTION_REQUIRED` |
| Technical known no-charge | TECHNICAL_ERROR | `RETRY_PENDING` same method; do not jump to backup solely for tech |
| Unknown outcome | UNKNOWN / timeout | Remain `PAYMENT_PENDING`; reconciliation-required; no backup; no FAILED/COLLECTED |
| CAPTURED | success | Workflow `COLLECTED`; PaymentCollected once; no ledger in D4 |

Drive the `backupRecovery` happy path end-to-end for soft/hard + backup success.

## Expected result

Workflow and attempt states match [ADR-024](../../docs/decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md); merchant/consumer outcomes consistent. Duplicate result handlers remain idempotent. Late results must not overwrite terminal `COLLECTED`.

## Implementation status

`specified`
