---
id: WH-REPLAY-001
title: Webhook operator replay preserves evt and refreshes signature
type: operations
status: specified
mvp: true
relatedRequirements:
  - FUN-ADM-008
  - NFR-OPS-006
relatedFlows:
  - dlqReplay
---

# WH-REPLAY-001 — Webhook operator replay preserves evt and refreshes signature

## Purpose

Prove manual webhook replay sends the same `evt_` and body with a fresh timestamp/HMAC, appends attempt 6+, requires ACTIVE endpoint, and does not restart automatic retry budget on failure.

## Preconditions

- Exhausted FAILED delivery with durable DLQ
- Endpoint ACTIVE
- Admin with `admin.webhook.replay` + fresh MFA + reason

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Happy path 2xx | Same `evt_`/body; fresh signature; attempt ≥6; delivery SUCCEEDED; DLQ RESOLVED |
| 2 | Endpoint DISABLED/REVOKED | Replay denied; endpoint not reactivated |
| 3 | Manual attempt non-2xx | Attempt recorded; no automatic 5-retry schedule; DLQ REPLAY_FAILED/OPEN |
| 4 | Subscription no longer includes type | Replay still permitted if endpoint ACTIVE (historical delivery) |

## Implementation status

**Specified** — not verified. Links [ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md), [ADR-030](../../docs/decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md).
