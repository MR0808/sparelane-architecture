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

`specified`
