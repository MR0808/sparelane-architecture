---
id: OPS-REC-002
title: DLQ safe replay
type: operations
status: specified
implementationProgress: foundation_prerequisite
relatedRequirements:
  - NFR-REL-004
  - NFR-REL-006
  - FUN-ADM-008
relatedFlows:
  - dlqReplay
mvp: true
---

# OPS-REC-002 — DLQ safe replay

## Purpose

Durable DLQ evidence and closed-catalogue webhook replay without duplicate financial effects ([ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)).

## Preconditions

- Supported work exhausted into durable `DeadLetterItem` as applicable.

## Scenario

Inspect DLQ; for webhook-eligible items only, request operator replay preserving `evt_`. Financial DLQ items remain non-replayable via generic operator replay.

## Expected result

Webhook replay (when eligible) preserves invariants; financial work is never blind-replayed; DLQ survives restart.

## Implementation status

`specified` — architecture H2 gate PASS; platform H2 not implemented.

Phase A demonstrated in-memory DLQ infrastructure only.
