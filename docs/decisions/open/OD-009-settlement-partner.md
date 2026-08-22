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

**F2 consequence ([ADR-029](../ADR-029-settlement-finality-reconciliation-payout-accounting.md)):** Fake may prove finality + gross payout journal → SETTLED locally. Sandbox/production live rails still require this OD’s approved partner + adapter. Bank-statement finality is not required for MVP SETTLED under ADR-029.

**Phase F exit:** Platform Phase F PASS is **local Fake only**. This OD remains open and blocks sandbox/pilot/production live settlement money.
