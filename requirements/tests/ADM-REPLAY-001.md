---
id: ADM-REPLAY-001
title: Only closed replayable types allowed
type: security
status: verified
mvp: true
relatedRequirements:
  - FUN-ADM-008
  - NFR-OPS-006
  - NFR-SEC-011
---

# ADM-REPLAY-001 — Only closed replayable types allowed

## Purpose

Prove operator replay accepts only `admin.webhook.replay` and rejects unknown/generic actions.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Eligible webhook DLQ + `admin.webhook.replay` | `OperatorReplayRequest` created |
| 2 | Generic replay / unknown action | Denied; no transport execution |
| 3 | Notification DLQ replay attempted | Denied |
| 4 | Financial DLQ replay attempted | Denied |

## Implementation status

**Specified** — not verified. Links [ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).
