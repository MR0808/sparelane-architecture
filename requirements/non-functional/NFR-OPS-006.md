---
id: NFR-OPS-006
title: Operable closed-catalogue DLQ replay
type: non-functional
area: operations
status: accepted
implementationStatus: designed
priority: must
mvp: true
architecture:
  - dlqReplay
adrs:
  - ADR-034
contracts:
  - docs/operations/dead-letter-handling.md
modules:
  - Operations
  - Admin Control Plane
tests:
  - ADM-REPLAY-001
  - WH-REPLAY-001
designs:
  - SEQ-OPS-005
---
# NFR-OPS-006 — Operable closed-catalogue DLQ replay

## Requirement

Operators must have an admin runbook path to inspect durable DLQ items and request webhook replay only through the closed H2 catalogue, with clear prohibition messaging for non-replayable financial work.

## Rationale

ADR-034 operational tooling slice for Phase H without generic recovery.

## Acceptance Criteria

- Admin UI distinguishes replayable vs prohibited items.
- Runbook docs distinguish automatic retries, manual webhook replay, and domain reconciliation.
- No generic “replay any queue message” control.
