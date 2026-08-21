---
id: FIN-INV-02
title: One collection one ledger posting
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-SET-005
mvp: true
---

# FIN-INV-02 — One collection one ledger posting

## Purpose

One successful collection yields exactly one ledger posting.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — Not yet testable — requires Phase E ledger posting. See [financial-invariant-tests](../../docs/implementation/financial-invariant-tests.md) Phase D section.
