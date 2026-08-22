---
id: OD-031
title: Webhook retry schedule / attempt bounds
category: api
blockingStage: development
status: resolved
related:
  - docs/decisions/ADR-009-signed-at-least-once-webhooks.md
  - docs/decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md
---

# OD-031 — Webhook retry schedule / attempt bounds

## Decision required

Webhook retry schedule / attempt bounds.

## Why it matters

Delivery worker

## Blocking stage

`development`

## Status

`resolved`

## Resolution

Resolved by [ADR-030](../ADR-030-merchant-webhook-contract-signing-and-delivery.md) (Accepted):

- Max attempts: **5** (attempt 1 immediate)
- Delays after failures 1–4: **1 minute / 5 minutes / 30 minutes / 6 hours**
- Jitter: **none** for MVP
- Retry-After: honour on **429** and **503** only, capped at 6 hours
- Exhaustion: logical delivery **FAILED**; do not auto-disable endpoint
- Independent of payment retry (ADR-025)

Historical OD retained; do not delete.
