---
id: ADM-REPLAY-006
title: Concurrent replay collapses to one logical request
type: security
status: specified
mvp: true
relatedRequirements:
  - FUN-ADM-008
---

# ADM-REPLAY-006 — Concurrent replay collapses to one logical request

## Purpose

Prove two concurrent admin replay requests against the same DLQ item do not create two active executions.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | Two concurrent POST replay | At most one active `OperatorReplayRequest`; second denied or no-ops without duplicate claim |
| 2 | Intentional later retry | Requires new `rpl_` after prior terminal outcome |

## Implementation status

**Specified** — not verified. Links [ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).
