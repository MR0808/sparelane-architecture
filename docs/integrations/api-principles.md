# Merchant API Principles

External contract principles for Sparelane merchant machine-to-machine integration.

These principles govern architecture. A later phase will produce the OpenAPI specification.

## API style

Sparelane exposes a **versioned HTTPS JSON API** for merchant backend integration.

Framework, gateway and hosting choices remain TBD.

Do not expose internal Sparelane services (orchestrator, ledger, settlement internals) directly to merchants.

## Resource-oriented design

Prefer business resources such as:

```text
Bills
Connections
Payments
Settlements
Webhooks
```

rather than internal service endpoints.

## Idempotency

Mutating operations capable of creating payment or financial consequences must support safe idempotent retries.

Especially:

- bill submission
- any merchant-triggered retry operations if exposed
- settlement-sensitive mutations if ever exposed

Idempotency behaviour must be:

- consistent across retries
- observable in responses (existing vs newly created)
- conflict-aware when the same key is reused with a different payload

See [ADR-008](../decisions/ADR-008-idempotent-merchant-api.md).

## Correlation identifiers

Merchants must be able to correlate:

```text
Merchant Bill Reference
Sparelane Bill ID
Payment Workflow ID
Settlement ID
Merchant Reconciliation Reference
```

Prefer public identifiers over raw internal database IDs.

See [merchant-identifiers.md](merchant-identifiers.md).

## Error categories

Conceptual categories (not an exhaustive code catalogue):

```text
validation
authentication
authorisation
conflict
not found
rate limit
temporary service failure
idempotency conflict
```

## Rate limiting

Merchant API requests are subject to merchant-scoped rate limiting for:

- abuse protection
- accidental retry loops
- optional stricter limits on expensive operations

Exact numeric limits are TBD.

Responses should support standard rate-limit signalling such as `Retry-After` where appropriate.

## Environments

Logical isolation between:

```text
Sandbox
Live
```

Credentials, webhook endpoints and test data must not cross environments. Physical topology separation is TBD.
