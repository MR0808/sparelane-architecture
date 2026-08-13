---
id: INT-API-002
title: Merchant webhook retry
type: integration
status: specified
relatedRequirements:
  - FUN-MER-006
  - NFR-SEC-005
relatedFlows:
  - merchantWebhookRetry
mvp: true
---

# INT-API-002 — Merchant webhook retry

## Purpose

Merchant webhook retry.

## Preconditions

- Merchant API / webhook fixtures as applicable.

## Scenario

Exercise `merchantWebhookRetry`.

## Expected result

Idempotency/signature/retry rules hold.

## Implementation status

`specified`
