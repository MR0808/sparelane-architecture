---
id: ADM-REPLAY-002
title: Replay preserves business and event identity
type: security
status: specified
mvp: true
relatedRequirements:
  - FUN-ADM-008
---

# ADM-REPLAY-002 — Replay preserves business and event identity

## Purpose

Prove webhook manual replay reuses the same `evt_` and `WebhookDelivery` (no new logical event).

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Successful operator replay | Same `evt_`, same delivery row, new attempt row, immutable body |

## Implementation status

**Specified** — not verified. Links [ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).
