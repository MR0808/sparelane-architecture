---
id: OD-011
title: Settlement schedule / batching rules
category: payments
blockingStage: non-blocking
status: open
related:
[]
---

# OD-011 — Settlement schedule / batching rules

## Decision required

Settlement schedule / batching rules.

## Why it matters

Settlement worker batching

## Blocking stage

`non-blocking`

## Status

`open`

## Notes

Unresolved item tracked separately from Accepted ADRs. See the [open decisions index](../open-decisions.md).

**Narrowed by [ADR-027](../ADR-027-settlement-obligation-eligibility-cardinality.md):** Settlement itself is **not** the aggregate. `SettlementBatch` is optional **execution** grouping of ELIGIBLE 1:1 Settlements. F0 does not create batches and does not need cadence. This OD remains open for schedule/cutoff/window policy only.
