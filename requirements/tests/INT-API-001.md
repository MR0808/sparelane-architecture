---
id: INT-API-001
title: Duplicate bill submission idempotent
type: integration
status: specified
relatedRequirements:
  - FUN-MER-004
  - FUN-MER-003
relatedFlows:
  - duplicateBillSubmission
mvp: true
---

# INT-API-001 — Duplicate bill submission idempotent

## Purpose

Duplicate bill submission idempotent.

## Preconditions

- Merchant API / webhook fixtures as applicable.

## Scenario

Exercise `duplicateBillSubmission`.

## Expected result

Idempotency/signature/retry rules hold.

## Implementation status

`specified` — architecture acceptance remains specified.

**Local Phase C evidence** (not product-verified): `sparelane-platform` C2/C4 suites and live `test:scenario:phase-c` exercise duplicate key replay, conflict, and concurrent same-key safety. See [phase-c-status](../../docs/implementation/phase-c-status.md).
