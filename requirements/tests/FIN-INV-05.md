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

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

**Prerequisite (ADR-027 / F0):** at most one Settlement domain obligation per confirmed PaymentWorkflow — necessary but **not sufficient** for this invariant.

**This invariant (F1+):** instruction idempotency key / provider submit exactly-once semantics.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — Not yet testable for instruction submit — settlement instruction Phase F1+. Domain obligation uniqueness is F0. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md).
