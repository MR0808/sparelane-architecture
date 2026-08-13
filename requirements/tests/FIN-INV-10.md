---
id: FIN-INV-10
title: Safe worker restart
type: financial-invariant
status: specified
relatedRequirements:
  - NFR-REL-002
mvp: true
---

# FIN-INV-10 — Safe worker restart

## Purpose

Worker restart cannot create duplicate financial effect.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — automated in future `sparelane-platform` CI.
