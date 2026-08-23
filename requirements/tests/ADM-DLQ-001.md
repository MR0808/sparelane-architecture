---
id: ADM-DLQ-001
title: Exhausted supported work creates one durable DLQ item
type: operations
status: verified
mvp: true
relatedRequirements:
  - FUN-ADM-007
  - NFR-REL-006
relatedFlows:
  - dlqReplay
---

# ADM-DLQ-001 — Exhausted supported work creates one durable DLQ item

## Purpose

Prove webhook automatic delivery exhaustion persists exactly one durable `DeadLetterItem` for the logical delivery identity.

## Preconditions

- Merchant webhook delivery exhausted automatic attempts → `FAILED`
- Platform H2 DLQ persistence enabled

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | First exhaustion | One `DeadLetterItem` `OPEN` with `work_type=merchant.webhook.delivery`, `dlq_…`, typed replay reference |
| 2 | Handler redelivery of same exhaustion | Still one row for `(work_type, source_identity)` — no duplicate active logical items |

## Implementation status

**Specified** — not verified. Links [ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).
