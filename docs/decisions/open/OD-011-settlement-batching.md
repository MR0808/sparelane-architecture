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

**Narrowed by [ADR-027](../ADR-027-settlement-obligation-eligibility-cardinality.md):** Settlement itself is **not** the aggregate. `SettlementBatch` is optional **execution** grouping of ELIGIBLE 1:1 Settlements. F0 does not create batches and does not need cadence.

**Further narrowed by [ADR-028](../ADR-028-settlement-execution-payout-destination-instruction-idempotency.md):** MVP F1 uses **no execution batching** (1 Settlement → 1 SettlementInstruction). Cadence is **not** required for F1. This OD remains open for **future production-scale** batch schedule/cutoff/window/grouping policy only — not falsely resolved.

**Phase F exit:** Platform proves 1:1 instruction path without `SettlementBatch`. Table may remain in schema for future use. Cadence/aggregation still open — not resolved by Phase F PASS.
