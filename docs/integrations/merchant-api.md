# Merchant API — Conceptual Resources

Conceptual merchant-facing resources. This is **not** an OpenAPI specification.

## Merchant

Organisation and integration context for a merchant.

Includes commercial settings, environment (sandbox/live) and integration status.

## Connection

Authorised relationship between a merchant customer and a Sparelane consumer.

Created via hosted flow / widget consent. Merchants receive a Sparelane connection reference for later bill submission.

## Bill

Merchant recurring bill submitted to Sparelane for payment reliability.

Conceptual fields:

- merchant reference / merchant bill reference
- consumer/connection reference
- amount
- currency
- due date
- invoice/bill reference
- reconciliation reference
- optional idempotency key

Sparelane stores the projection required for payment reliability. The merchant remains system of record for the original invoice/subscription.

## Payment

Read-oriented merchant representation of payment reliability status for a bill.

Merchants should see workflow-level outcomes such as:

- accepted / scheduled
- action required
- collected
- failed

They should not need Payment Attempt internals unless product deliberately exposes them for support/debug.

## Settlement

Merchant-visible settlement status and reconciliation information for collected funds.

`bill accepted` and `payment collected` are not the same as `settlement settled`.

## Bill ingestion lifecycle

```text
Merchant
→ submit bill
→ authenticate
→ authorise
→ validate
→ idempotency check
→ verify connection
→ persist
→ acknowledge
→ async payment lifecycle begins
```

### Acknowledgement meaning

API acknowledgement means:

```text
bill accepted
```

It does **not** mean:

```text
payment successful
```

or:

```text
merchant settled
```

Payment collection and settlement continue asynchronously and are communicated via status APIs and webhooks.
