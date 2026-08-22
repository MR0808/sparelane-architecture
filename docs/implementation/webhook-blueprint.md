# Webhook Implementation Blueprint

## Incoming (provider)

```text
HTTP ingress
→ signature verification
→ timestamp / replay checks
→ persist provider event receipt (idempotent)
→ enqueue / publish trusted internal event
→ fast acknowledgement
```

Invalid signatures: reject + audit/monitor. Never drive payment/settlement from unverified payloads.

Separate from merchant HMAC ([ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md)).

## Outgoing (merchant)

```text
internal domain event
→ ProjectMerchantWebhook (closed catalogue)
→ WebhookEvent (stable evt_ id) + WebhookDelivery per ACTIVE endpoint
→ DeliverMerchantWebhook (HTTP outside TX)
→ HMAC-SHA256 timestamp.rawBody
→ SSRF-safe connect
→ record delivery attempt
→ bounded retry (same event id; ADR-030 schedule)
```

At-least-once; merchants process event IDs idempotently ([ADR-009](../decisions/ADR-009-signed-at-least-once-webhooks.md), [ADR-023](../decisions/ADR-023-curated-external-events.md), [ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md)).
