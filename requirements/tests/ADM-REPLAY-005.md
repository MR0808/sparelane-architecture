---
id: ADM-REPLAY-005
title: Reason required for webhook replay
type: security
status: specified
mvp: true
relatedRequirements:
  - FUN-ADM-008
  - NFR-SEC-011
---

# ADM-REPLAY-005 — Reason required for webhook replay

## Purpose

Prove mandatory reason 16–500 chars on OperatorReplayRequest.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Reason 16–500 | Accepted |
| 2 | Missing / too short / too long | Rejected |

## Implementation status

**Specified** — not verified. Links [ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).
