---
id: FIN-INV-09
title: Idempotent event replay
type: financial-invariant
status: specified
relatedRequirements:
  - NFR-REL-001
mvp: true
---

# FIN-INV-09 — Idempotent event replay

## Purpose

Replay of event is idempotent (no duplicate financial effect).

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — automated in future `sparelane-platform` CI.
