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

Persisted on `PaymentAttempt.decline_classification`. May be set on the transition into `DECLINED` / `ERROR`, or attached **write-once** afterwards when null ([ADR-024](../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)): null → value; same value idempotent; conflicting value rejected. Does not rewrite attempt status or provider outcome fields.

## LedgerPostingStatus

Tracks Operational↔Ledger consistency ([ADR-016](../decisions/ADR-016-operational-ledger-consistency.md)):

```text
NOT_REQUIRED
PENDING
CONFIRMED
FAILED
```

Canonical confirmation value is **`CONFIRMED`** (do not introduce a parallel `POSTED` status).

On successful collection: COLLECTED sets `PENDING`; after durable ADR-026 journal, `ConfirmLedgerPosting` moves `PENDING` → `CONFIRMED` and emits `LedgerPostingConfirmed`.

Settlement creation/eligibility requires `CONFIRMED` after `COLLECTED` ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)).
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

Semantics (binding MVP):

| Status | Meaning |
| --- | --- |
| PENDING | Obligation recorded; eligibility not yet satisfied (not bank-pending) |
| ELIGIBLE | Domain-ready for instruction; F1 may submit after destination/KYB recheck ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)) |
| BATCHED | Future optional grouping only — **not used in F1** |
| SUBMITTED | Provider accepted instruction **or** unknown outcome held for lookup — **not** SETTLED |
| PROCESSING | Partner async in-progress after SUBMITTED (optional F1 Fake lookup; not SETTLED) |
| SETTLED | Terminal happy path; requires reconciliation (not ack alone) — **F2+** |
| FAILED | External execution / definitive negative recon — **recoverable** via `RETRY_PENDING` when permitted; **not** merchant temporary ineligibility or pre-submit gate failure |
| RETRY_PENDING | Bounded external retry scheduled |
| CANCELLED | Terminal; product cancel triggers deferred beyond F0 |

Merchant/KYB/destination pre-submit blocks → remain `PENDING` (eligibility) or `ELIGIBLE` (execution hold), never auto-`FAILED`.

## SettlementInstructionStatus

```text
CREATED
ACCEPTED
REJECTED
TECHNICAL_ERROR
OUTCOME_UNKNOWN
```

| Status | Meaning |
| --- | --- |
| CREATED | Instruction persisted; provider not yet successfully accepted |
| ACCEPTED | Provider accepted/created transfer instruction |
| REJECTED | Provider explicit business rejection |
| TECHNICAL_ERROR | Known no-send technical failure (retry same key) |
| OUTCOME_UNKNOWN | Submit may have succeeded; reconcile/lookup required — **no** blind resubmit |

## MerchantPayoutDestinationStatus

```text
UNVERIFIED
ACTIVE
INACTIVE
REVOKED
```

Submit-eligible only when `ACTIVE` and `verified_at` is set ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)).

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

Settlement eligibility by status ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)):

| Status | Settlement eligible? |
| --- | --- |
| DRAFT | No |
| PENDING_VERIFICATION | No |
| SANDBOX_READY | Sandbox/local only |
| LIVE | Yes (status gate; KYB still required) |
| SUSPENDED | No — remain PENDING |
| OFFBOARDED | No — remain PENDING / review; do not erase payable |

Separate capability **`APPROVED_FOR_SETTLEMENT`** (KYB) is also required; do not infer from status alone.

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
