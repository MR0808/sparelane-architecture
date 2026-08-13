# Canonical Enums

Enums for physical persistence and contracts. Align with Phase 2–3 state machines unless noted.

## PaymentWorkflowStatus

```text
CREATED
SCHEDULED
PREAUTH_PENDING
PREAUTHORISED
PAYMENT_PENDING
RETRY_PENDING
ACTION_REQUIRED
COLLECTED
FAILED
CANCELLED
```

## PaymentAttemptStatus

```text
CREATED
SUBMITTED
AUTHORISED
DECLINED
ERROR
CANCELLED
CAPTURED
```

## DeclineClassification

Aligned with Decline Classification Service:

```text
RETRYABLE
NON_RETRYABLE
TECHNICAL_ERROR
UNKNOWN
```

## LedgerPostingStatus

Tracks Operational↔Ledger consistency ([ADR-016](../decisions/ADR-016-operational-ledger-consistency.md)):

```text
NOT_REQUIRED
PENDING
CONFIRMED
FAILED
```

Settlement eligibility requires `CONFIRMED` after `COLLECTED`.

## SettlementStatus

```text
PENDING
ELIGIBLE
BATCHED
SUBMITTED
PROCESSING
SETTLED
FAILED
RETRY_PENDING
CANCELLED
```

## BillIngestionStatus

```text
ACCEPTED
REJECTED
CANCELLED
```

(`ACCEPTED` ≠ payment collected.)

## WebhookDeliveryStatus

```text
PENDING
DELIVERING
SUCCEEDED
RETRY_PENDING
FAILED
```

## ApiCredentialStatus

```text
ACTIVE
REVOKED
EXPIRED
```

## MerchantStatus

```text
DRAFT
PENDING_VERIFICATION
SANDBOX_READY
LIVE
SUSPENDED
OFFBOARDED
```

Exact onboarding transitions remain product TBD; these are conceptual persistence values.

## MerchantConnectionStatus

```text
ACTIVE
REVOKED
EXPIRED
```

## PaymentMethodStatus

```text
ACTIVE
INACTIVE
EXPIRED
REVOKED
```

## IntegrationEnvironment

```text
SANDBOX
LIVE
```

## JournalEntrySide

```text
DEBIT
CREDIT
```

Do not proliferate additional enums without a clear domain need.
