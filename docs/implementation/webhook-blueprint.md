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

## Outgoing (merchant)

```text
internal domain event
→ curated webhook event (stable evt_ id)
→ delivery worker
→ sign (timestamp + event id)
→ deliver
→ record delivery attempt
→ bounded retry (same event id)
```

At-least-once; merchants process event IDs idempotently ([ADR-009](../decisions/ADR-009-signed-at-least-once-webhooks.md), [ADR-023](../decisions/ADR-023-curated-external-events.md)).
