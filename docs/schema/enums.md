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
| PROCESSING | Partner async in-progress after SUBMITTED; F2 `pending` reconcile ([ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)) |
| SETTLED | Terminal happy path; ADR-029 finality `settled` + payout journal — **not** ack alone |
| FAILED | External execution / definitive reconcile `failed` — **recoverable** via `RETRY_PENDING` when permitted later; **not** merchant temporary ineligibility, pre-submit gate failure, or reconcile `not_found` alone |
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

## SettlementReconcileOutcome

Provider-neutral finality taxonomy ([ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)):

```text
pending
settled
failed
not_found
unknown
```

Distinct from F1 submit taxonomy (`accepted` \| `rejected` \| `technical_error` \| `unknown_outcome`).

## SettlementReconcileSource

```text
lookup
webhook
```

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

## WebhookEndpointStatus

```text
ACTIVE
DISABLED
REVOKED
```

No `PENDING_VERIFICATION` in MVP ([ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md)).

## WebhookDeliveryStatus

Logical delivery (event + endpoint):

```text
PENDING
SUCCEEDED
FAILED
CANCELLED
```

`CANCELLED` = endpoint not `ACTIVE` at attempt time (no HTTP).

## WebhookAttemptStatus

Per transport attempt row (append-oriented):

```text
PENDING
DELIVERING
SUCCEEDED
RETRY_PENDING
FAILED
```

(Historical name `WebhookDeliveryStatus` on attempts is replaced by `WebhookAttemptStatus` to avoid colliding with logical delivery status.)

## ConsumerNotificationChannel

G2 MVP:

```text
EMAIL
```

(SMS reserved for G3+.)

## ConsumerNotificationContactStatus

```text
PENDING
ACTIVE
INACTIVE
REVOKED
```

## ConsumerNotificationStatus

Logical notification intent:

```text
PENDING
SENT
FAILED
SKIPPED
```

`SENT` = provider `accepted` (handed off), not inbox delivery.

## ConsumerNotificationAttemptStatus

```text
PENDING
DELIVERING
SUCCEEDED
RETRY_PENDING
FAILED
```

## ConsumerNotificationType

Closed G2 catalogue ([ADR-031](../decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md)):

```text
payment.action_required
payment.failed
payment.collected
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

## PlatformAdminGrantStatus

H1 lifecycle ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)). Only `active` confers platform admin. H0 used `active` only; H1 adds `revoked`.

```text
active
revoked
```

## PrivilegedActionType

Closed H1 catalogue ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)). Unknown actions denied.

```text
admin.grant.create
admin.grant.revoke
```

## PrivilegedActionRequestStatus

PrivilegedActionRequest lifecycle ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)):

```text
pending
approved
denied
expired
executed
failed
cancelled
```

`cancelled` is optional pre-execute cancel; not required for MVP if unused.

## DeadLetterWorkType

Closed work-type catalogue for durable DLQ ([ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)):

```text
merchant.webhook.delivery
consumer.notification.delivery
financial.work
```

Only `merchant.webhook.delivery` is manually replayable in H2.

## DeadLetterStatus

```text
OPEN
REPLAY_REQUESTED
REPLAYING
RESOLVED
REPLAY_FAILED
```

## OperatorReplayAction

Closed H2 replay catalogue:

```text
admin.webhook.replay
```

## OperatorReplayRequestStatus

```text
requested
executing
succeeded
failed
denied
```

## JournalEntrySide

```text
DEBIT
CREDIT
```

Do not proliferate additional enums without a clear domain need.
