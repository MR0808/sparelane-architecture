---
id: OD-006
title: Merchant timezone change handling policy
category: product
blockingStage: pilot
status: resolved
related:
  - docs/contracts/due-dates.md
  - docs/decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md
---

# OD-006 — Merchant timezone change handling policy

## Decision required

Merchant timezone change handling policy.

## Why it matters

Prevents silent reschedule of in-flight bills

## Blocking stage

`pilot`

## Status

`resolved`

## Resolution

Resolved by [ADR-025](../ADR-025-payment-retry-timing-budget-and-recovery-window.md) (Accepted):

- Existing `ScheduledJob.scheduledFor` UTC values are **immutable** on merchant timezone change
- Workflow freezes merchant IANA timezone at creation for dueExecutionInstant / cutoffAt
- New bills/workflows use the new merchant timezone
- No silent recalculation of pending financial schedules

Historical OD retained; do not delete.
