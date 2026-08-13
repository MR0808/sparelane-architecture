---
id: FUN-MER-006
title: Receive signed webhook
type: functional
area: merchant
status: accepted
priority: must
mvp: true
architecture:
  - merchantIntegration
  - trustBoundaries
flows:
  - merchantWebhookDelivery
  - merchantWebhookRetry
adrs:
  - ADR-009
  - ADR-023
contracts:
  - docs/contracts/webhook-events.md
  - docs/integrations/webhooks.md
modules:
  - Webhooks
tests: []
---
# FUN-MER-006 — Receive signed webhook

## Requirement

Merchants must receive signed webhooks for curated payment and settlement outcome events with at-least-once delivery and retry.

## Rationale

Signed at-least-once delivery (ADR-009) with curated events (ADR-023).

## Acceptance Criteria

- Webhook payloads are signed and verifiable by the merchant.
- Failed deliveries are retried per policy without dropping durable intent.

## Notes

MVP merchant integration scope.
