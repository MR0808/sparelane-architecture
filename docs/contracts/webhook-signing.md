# Merchant Webhook Signing

**Binding:** [ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md).

Merchants verify that a POST came from Sparelane and that the body was not altered.

## Headers

| Header | Example |
| --- | --- |
| `Sparelane-Event-Id` | `evt_01HXYZ...` |
| `Sparelane-Event-Type` | `payment.collected` |
| `Sparelane-Timestamp` | `1755840000` |
| `Sparelane-Signature` | 64-character lowercase hex HMAC-SHA256 |

`Sparelane-Event-Id` must equal JSON body field `id`.

## Signing input

Let `t` be the integer Unix **seconds** from `Sparelane-Timestamp`.

Let `rawBody` be the **exact** HTTP request body bytes (UTF-8 JSON as received).

```text
signing_input = ascii_digits(t) + "." + rawBody
```

Example if `t = 1755840000` and body is `{"id":"evt_1",...}`:

```text
1755840000.{"id":"evt_1",...}
```

There is no newline between the dot and the body.

## Algorithm

1. HMAC-SHA256(key = endpoint signing secret bytes, message = `signing_input`)
2. Encode digest as **lowercase hex** (64 characters)
3. Compare to `Sparelane-Signature` using a constant-time equality check

The signing secret displayed at endpoint creation is `whsec_` + Base64(32 random bytes). Implementation **must** decode that display form to the raw 32 bytes before HMAC. Implementations must not HMAC the `whsec_` string as if it were the key unless they first strip the prefix and Base64-decode.

## Replay guidance

Reject if `|now_unix_seconds - t| > 300`.

This is merchant-side verification guidance. Sparelane still redelivers with a **fresh** timestamp on each attempt.

## Pseudocode (language-neutral)

```
t        ← parse integer header Sparelane-Timestamp
body     ← raw request body bytes
expected ← hex_lower(hmac_sha256(secret_bytes, utf8(t) || "." || body))
if not constant_time_equal(expected, header Sparelane-Signature): reject
if abs(now_seconds - t) > 300: reject
if header Sparelane-Event-Id ≠ json(body).id: reject
process event idempotently by json(body).id
```

## Body vs signature

Serialize once. Sign those bytes. Send those bytes. Do not JSON-encode twice with different spacing or key order.
