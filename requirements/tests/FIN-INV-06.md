---
id: FIN-INV-06
title: No blind retry on unknown payout
type: financial-invariant
status: specified
relatedRequirements:
  - FUN-SET-003
  - NFR-REL-005
mvp: true
---

# FIN-INV-06 — No blind retry on unknown payout

## Purpose

Unknown payout outcome cannot trigger blind duplicate submission.

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

`specified` — automated in future `sparelane-platform` CI.
