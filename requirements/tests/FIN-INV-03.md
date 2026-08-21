---
id: FIN-INV-03
title: Balanced journal
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-SET-006
mvp: true
---

# FIN-INV-03 — Balanced journal

## Purpose

Journal transaction always balances.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — Not yet testable — requires Phase E balanced journal. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md) Phase D section.
