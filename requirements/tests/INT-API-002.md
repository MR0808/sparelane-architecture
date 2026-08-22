---
id: INT-API-002
title: Merchant webhook retry
type: integration
status: specified
relatedRequirements:
  - FUN-MER-006
  - NFR-SEC-005
  - NFR-REL-003
relatedFlows:
  - merchantWebhookRetry
mvp: true
---

# INT-API-002 — Merchant webhook retry

## Purpose

Retryable merchant webhook delivery uses the same `evt_…`, ADR-030 schedule, and does not mutate financial state.

## Preconditions

- Local webhook sink / Fake HTTP.

## Scenario

Timeout or 5xx → bounded retry of the same event ID → 2xx or exhaustion FAILED.

## Expected result

Idempotency/signature/retry rules hold.

## Implementation status

`specified`
