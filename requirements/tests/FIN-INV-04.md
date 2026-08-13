---
id: FIN-INV-04
title: Failed collection not settlement-eligible
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-SET-001
  - BUS-004
mvp: true
---

# FIN-INV-04 — Failed collection not settlement-eligible

## Purpose

Failed collection cannot become settlement eligible.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — automated in future `sparelane-platform` CI.
