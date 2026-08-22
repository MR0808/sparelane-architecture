---
id: E2E-WEB-001
title: Merchant webhook projection, signing and retry
type: e2e
status: specified
relatedRequirements:
  - FUN-MER-006
  - NFR-SEC-005
  - NFR-REL-003
relatedFlows:
  - merchantWebhookDelivery
  - merchantWebhookRetry
mvp: true
---

# E2E-WEB-001 — Merchant webhook projection, signing and retry

## Purpose

Prove ADR-030 merchant webhook contract locally (Fake/local HTTP sink). Not production HTTPS `product_verified`.

## Preconditions

- Canonical internal events exist (BillAccepted / PaymentCollected / etc.).
- Merchant-owned ACTIVE endpoint; Fake/local sink allowed only in local/test.

## Scenario

1. Unsupported internal event is not published.
2. Supported event projects one `evt_…`; duplicate internal event does not create a second logical event.
3. Envelope matches [webhook-envelope.md](../../docs/contracts/webhook-envelope.md); no internal UUIDs/tokens/PII.
4. HMAC is over the exact body bytes sent; body change changes signature.
5. Merchant A cannot use Merchant B endpoint.
6. SSRF denylist rejects loopback/private/metadata in non-opt-in environments.
7. Transport retry keeps the same event id; fresh timestamp/signature.
8. 2xx succeeds; retryable failure follows 1m/5m/30m/6h bounds; exhaustion FAILED.
9. Delivery failure does not change payment/settlement/ledger state.

## Expected result

Contract and isolation hold. Spec remains `specified` until platform G0/G1 evidence is recorded. Not `product_verified` for live merchant endpoints.

## Implementation status

`specified`
