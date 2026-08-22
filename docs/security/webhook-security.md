# Webhook Security

Distinguish inbound provider webhooks from outbound merchant webhooks. IP allowlisting may be complementary but is **not** sufficient as the only security mechanism.

Product contract: [`docs/integrations/webhooks.md`](../integrations/webhooks.md). Binding: [ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md).

## Incoming provider webhooks

Sources: PSP payment webhooks, banking/settlement events (and similar providers).

Before treating an event as trusted:

1. verify provider authenticity / signature
2. validate timestamp / replay window
3. enforce event idempotency
4. only then publish a trusted internal domain event

Invalid signatures or stale/replayed requests are rejected and should be audited/monitored. Unverified payloads must not drive payment or settlement state transitions.

This path uses **provider** credentials and `ProviderEventReceipt`. It does **not** use merchant HMAC headers.

## Outgoing merchant webhooks

Sparelane signs merchant-facing payloads with **HMAC-SHA256** ([webhook-signing.md](../contracts/webhook-signing.md)).

Security fields:

- stable event identifier (`evt_…`)
- Unix-seconds timestamp header
- hex HMAC over `timestamp.rawBody`
- payload body integrity (exact bytes signed = bytes sent)

Verification protects against tampering, spoofing, and replay outside ±300 seconds (merchant guidance).

Additional requirements:

- signing secret shown once; recoverable via secrets reference (not a hash)
- redelivery safety (same event ID; at-least-once)
- merchants process event IDs idempotently
- outbound URL SSRF denylist (ADR-030) before connect
- no redirects
- HTTPS only in sandbox/production

Ordinary merchant `5xx` is not a security incident. Blocked private/metadata destinations **are** a security signal.
