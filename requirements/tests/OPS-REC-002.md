---
id: OPS-REC-002
title: DLQ safe replay
type: operations
status: specified
implementationProgress: foundation_prerequisite
relatedRequirements:
  - NFR-REL-004
relatedFlows:
  - dlqReplay
mvp: true
---

# OPS-REC-002 — DLQ safe replay

## Purpose

DLQ safe replay via `dlqReplay`.

## Preconditions

- Induced failure/poison message as applicable.

## Scenario

Recover via outbox/DLQ replay without duplicate financial effects.

## Expected result

Recovery succeeds; invariants hold.

## Implementation status

`specified` — product DLQ replay for financial poison messages is **not** implemented.

Phase A demonstrated in-memory DLQ infrastructure only.
