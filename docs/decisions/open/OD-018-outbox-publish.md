---
id: OD-018
title: Outbox publish mechanism (polling vs CDC)
category: infrastructure
blockingStage: development
status: open
related:
  - docs/decisions/ADR-016-operational-ledger-consistency.md
---

# OD-018 — Outbox publish mechanism (polling vs CDC)

## Decision required

Outbox publish mechanism (polling vs CDC).

## Why it matters

Outbox Processor implementation

## Blocking stage

`development`

## Status

`open`

## Notes

Unresolved item tracked separately from Accepted ADRs. See the [open decisions index](../open-decisions.md).

Phase A implemented a **polling** outbox publisher as local foundation evidence. That does not select polling vs CDC for production. Status remains `open`.
