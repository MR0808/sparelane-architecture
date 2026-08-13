---
id: FIN-INV-01
title: No duplicate collection
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-PAY-008
mvp: true
---

# FIN-INV-01 — No duplicate collection

## Purpose

Same payment cannot be collected twice.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — automated in future `sparelane-platform` CI.
