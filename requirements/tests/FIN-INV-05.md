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

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — automated in future `sparelane-platform` CI.
