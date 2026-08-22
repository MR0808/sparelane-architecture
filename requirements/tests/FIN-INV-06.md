---
id: FIN-INV-06
title: No blind retry on unknown payout
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-SET-003
  - NFR-REL-005
mvp: true
---

# FIN-INV-06 — No blind retry on unknown payout

## Purpose

Unknown payout outcome cannot trigger blind duplicate submission. Reconcile `not_found` / `unknown` / `pending` must not resubmit or mark SETTLED.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise under success, replay, and restart:

**Collection prerequisite:** UNKNOWN collection outcome blocks alternate charges (Phase D local evidence).

**Settlement (ADR-028 / ADR-029):**

- Submit `unknown_outcome` → SUBMITTED + OUTCOME_UNKNOWN + reconcile hold
- `ReconcileSettlement` / lookup uses same instruction identity and provider key
- Outcomes `unknown`, `not_found`, `pending` → no new instruction, no new key, no provider switch, no SETTLED, no payout journal
- `not_found` is integrity/ops hold — not automatic FAILED and not automatic resubmit

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — Architecture policy frozen (ADR-028, ADR-029). See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md).
