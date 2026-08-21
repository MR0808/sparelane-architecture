---
id: OD-009
title: Settlement / banking partner
category: payments
blockingStage: sandbox
status: open
related:
  - docs/decisions/ADR-006-separate-settlement-lifecycle.md
---

# OD-009 — Settlement / banking partner

## Decision required

Settlement / banking partner.

## Why it matters

Payout rails, confirmation events

## Blocking stage

`sandbox`

## Status

`open`

## Notes

Unresolved item tracked separately from Accepted ADRs. See the [open decisions index](../open-decisions.md).

**F1 consequence ([ADR-028](../ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)):** local/CI uses **FakeSettlementProvider** only to prove execution semantics. This OD remains open for real partner selection. Production live money must fail closed without an approved configured provider — no silent Fake fallback.
