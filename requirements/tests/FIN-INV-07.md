---
id: FIN-INV-07
title: Compensating corrections only
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-SET-007
  - FUN-SET-008
mvp: true
---

# FIN-INV-07 — Compensating corrections only

## Purpose

Ledger correction does not mutate historical entry.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — Not yet testable — Phase E ledger corrections. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md) Phase D section.
