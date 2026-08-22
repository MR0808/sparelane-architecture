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
  - ADR-030
contracts:
  - docs/contracts/webhook-events.md
  - docs/contracts/webhook-envelope.md
  - docs/contracts/webhook-signing.md
  - docs/integrations/webhooks.md
modules:
  - Webhooks
tests:
  - INT-API-002
  - CON-WEBHOOK-001
  - E2E-WEB-001
designs:
  - SEQ-INT-003
  - SEQ-INT-004
---
# FUN-MER-006 — Receive signed webhook

## Requirement

Merchants must receive signed webhooks for curated payment and settlement outcome events with at-least-once delivery and retry.

## Rationale

Signed at-least-once delivery (ADR-009) with curated events (ADR-023).

## Acceptance Criteria

- Only the closed ADR-030 catalogue is published (internal events are not dumped).
- Webhook payloads are HMAC-SHA256 signed over the exact body bytes sent.
- Failed deliveries retry per ADR-030 without dropping durable intent or mutating financial state.
- Event `id` is stable across retries; merchants can dedupe on it.
- Outbound URLs obey SSRF policy.

## Notes

MVP merchant integration scope. Consumer notifications are not this requirement (OD-005). Endpoint Merchant API CRUD is OD-034.
