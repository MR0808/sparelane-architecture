---
id: OPS-REC-001
title: Ledger posting recovery
type: operations
status: specified
relatedRequirements:
  - FUN-SET-005
  - NFR-REL-001
relatedFlows:
  - ledgerPostingRecovery
mvp: true
---

# OPS-REC-001 — Ledger posting recovery

## Purpose

Ledger posting recovery via `ledgerPostingRecovery`.

## Preconditions

- Induced failure/poison message as applicable.

## Scenario

Recover via outbox/DLQ replay without duplicate financial effects.

## Expected result

Recovery succeeds; invariants hold.

## Implementation status

`specified`
