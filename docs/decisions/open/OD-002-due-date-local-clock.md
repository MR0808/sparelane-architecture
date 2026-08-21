---
id: OD-002
title: Exact due-date local capture clock time
category: product
blockingStage: pilot
status: resolved
related:
  - docs/contracts/due-dates.md
  - docs/decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md
---

# OD-002 — Exact due-date local capture clock time

## Decision required

Exact due-date local capture clock time.

## Why it matters

Converts date-only due dates to UTC schedule instants

## Blocking stage

`pilot`

## Status

`resolved`

## Resolution

Resolved by [ADR-025](../ADR-025-payment-retry-timing-budget-and-recovery-window.md) (Accepted):

- Due execution clock: **09:00** merchant-local (frozen workflow IANA timezone) on `dueDate`
- Distinct from recovery **cutoffAt** = dueDate + 7 calendar days @ 09:00 same timezone
- DST / nonexistent / ambiguous local times: IANA rules (next valid after gap; earlier offset on overlap)

Historical OD retained; do not delete.
