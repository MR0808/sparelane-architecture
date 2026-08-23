---
id: ADM-DLQ-002
title: Durable DLQ survives restart and minimises sensitive data
type: operations
status: specified
mvp: true
relatedRequirements:
  - FUN-ADM-007
  - NFR-REL-006
  - NFR-PRIV-006
relatedFlows:
  - dlqReplay
---

# ADM-DLQ-002 — Durable DLQ survives restart and minimises sensitive data

## Purpose

Prove DLQ evidence is durable across process restart and admin views exclude secrets/PII dumps.

## Preconditions

- At least one persisted `DeadLetterItem`
- Admin with `admin.dlq.view`

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Restart workers/API | DLQ row still present with same `dlq_…` |
| 2 | Admin list/detail | Safe metadata only — no signing secret, email, provider token, bank ref, raw PSP payload |

## Implementation status

**Specified** — not verified. Links [ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).
