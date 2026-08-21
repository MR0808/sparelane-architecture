---
id: OD-001
title: Exact retry timing, windows, maxima, quiet hours
category: product
blockingStage: development
status: resolved
related:
  - docs/payments/payment-lifecycle.md
  - docs/decisions/ADR-025-payment-retry-timing-budget-and-recovery-window.md
---

# OD-001 — Exact retry timing, windows, maxima, quiet hours

## Decision required

Exact retry timing, windows, maxima, quiet hours.

## Why it matters

Shapes Retry Service configuration

## Blocking stage

`development`

## Status

`resolved`

## Resolution

Resolved by [ADR-025](../ADR-025-payment-retry-timing-budget-and-recovery-window.md) (Accepted):

- Max same-method scheduled retries: **3**
- Delays: **+6h / +24h / +48h** (ordinals 1..3)
- Quiet hours: **none** for MVP
- Recovery cutoff: **dueDate + 7 calendar days** at 09:00 frozen merchant TZ
- Shared RETRYABLE/TECHNICAL business budget; D3 worker retries do not count

Historical OD retained; do not delete.
