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

Settlement cannot be submitted twice for same instruction identity.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.
- Default verified Fake payout destination.

## Scenario

Exercise under success, replay, restart, and concurrency:

**Prerequisite (ADR-027 / F0):** at most one Settlement domain obligation per confirmed PaymentWorkflow — necessary but **not sufficient**.

**This invariant (ADR-028 / F1):**

- One SettlementInstruction per Settlement (`settlement_id` unique)
- Provider idempotency key = `settlement-instruction:{settlementPublicId}`
- Duplicate execute / concurrent workers / crash-after-accepted → one logical Fake transfer
- Technical retry reuses same instruction and key (no new instruction)
- Provider accepted ≠ SETTLED

**Verification boundary:** F1 proves **local Fake** exactly-once semantics. Real-bank exactly-once remains partner + production controls after OD-009.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — Architecture policy frozen (ADR-028). Platform F1 not yet implemented. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md).
