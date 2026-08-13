# Webhook Security

Distinguish inbound provider webhooks from outbound merchant webhooks. IP allowlisting may be complementary but is **not** sufficient as the only security mechanism.

Product contract details: [`docs/integrations/webhooks.md`](../integrations/webhooks.md).

## Incoming provider webhooks

Sources: PSP payment webhooks, banking/settlement events (and similar providers).

Before treating an event as trusted:

1. verify provider authenticity / signature
2. validate timestamp / replay window
3. enforce event idempotency
4. only then publish a trusted internal domain event

Invalid signatures or stale/replayed requests are rejected and should be audited/monitored. Unverified payloads must not drive payment or settlement state transitions.

## Outgoing merchant webhooks

Sparelane signs merchant-facing payloads.

Conceptual security fields:

- stable event identifier
- timestamp
- signature
- payload body integrity

Verification protects against:

- payload tampering
- spoofing
- replay / stale delivery outside the accepted window

Additional requirements:

- signing secret rotation capability
- redelivery safety (same event ID; at-least-once)
- merchants process event IDs idempotently

HMAC-SHA256 is a proposed signing approach; final algorithm package TBD if a different standard is required by partners.
