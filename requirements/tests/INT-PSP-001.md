---
id: INT-PSP-001
title: Provider webhook verification rejects invalid signature
type: integration
status: specified
relatedRequirements:
  - NFR-SEC-006
  - INT-PSP-005
relatedFlows:
  - providerWebhookVerification
mvp: true
---

# INT-PSP-001 — Provider webhook verification rejects invalid signature

## Purpose

Provider webhook verification rejects invalid signature.

## Preconditions

- Merchant API / webhook fixtures as applicable.

## Scenario

Exercise `providerWebhookVerification`.

## Expected result

Idempotency/signature/retry rules hold.

## Implementation status

`specified`
