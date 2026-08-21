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

Exercise balanced-journal rejection and acceptance for domain append APIs and for ADR-026 collection journals (two equal legs).

## Expected result

- Unbalanced journals never persist
- Collection journals satisfy `sum(DEBIT) = sum(CREDIT)` at Bill `amount_minor`
- Invariant holds; test fails the release if violated

## Implementation status

`specified` — Platform E0 proves balanced-journal mechanics locally; collection posting (E1) not yet implemented. Architecture: ADR-004 + ADR-026. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md).
