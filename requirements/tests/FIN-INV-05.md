---
id: FIN-INV-05
title: No duplicate settlement submission
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-SET-002
mvp: true
---

# FIN-INV-05 — No duplicate settlement submission

## Purpose

Settlement cannot be submitted twice for same instruction identity; F2 reconciliation cannot create a second transfer, second payout journal, or second SETTLED.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.
- Default verified Fake payout destination.

## Scenario

Exercise under success, replay, restart, and concurrency:

**Prerequisite (ADR-027 / F0):** at most one Settlement domain obligation per confirmed PaymentWorkflow — necessary but **not sufficient**.

**F1 (ADR-028):**

- One SettlementInstruction per Settlement (`settlement_id` unique)
- Provider idempotency key = `settlement-instruction:{settlementPublicId}`
- Duplicate execute / concurrent workers / crash-after-accepted → one logical Fake transfer
- Technical retry reuses same instruction and key (no new instruction)
- Provider accepted ≠ SETTLED

**F2 (ADR-029):**

- Duplicate / concurrent `ReconcileSettlement` with finality `settled` → one payout journal `settlement-payout:{settlementPublicId}` → one SETTLED → one `SettlementSettled`
- Reconcile/lookup never increments Fake transfer count / never calls submit
- Crash after journal before SETTLED recovers to one journal + SETTLED

**Verification boundary:** Local Fake exactly-once semantics. Real-bank exactly-once remains partner + production controls after OD-009.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — Architecture policy frozen (ADR-028, ADR-029). Platform F2 not yet implemented. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md).
