# State Transition Enforcement

Legal transitions are enforced in **domain logic** (state machines / services), not by arbitrary direct database updates from APIs or admin UI.

Physical columns store current status; transitions update status only through authorised domain paths and produce audit/outbox events where required.

---

## Payment Workflow

| From | To |
| --- | --- |
| CREATED | SCHEDULED, CANCELLED |
| SCHEDULED | PREAUTH_PENDING, PAYMENT_PENDING, CANCELLED |
| PREAUTH_PENDING | PREAUTHORISED, RETRY_PENDING, ACTION_REQUIRED, PAYMENT_PENDING, FAILED, CANCELLED |
| PREAUTHORISED | PAYMENT_PENDING, CANCELLED |
| PAYMENT_PENDING | COLLECTED, RETRY_PENDING, ACTION_REQUIRED, FAILED, CANCELLED |
| RETRY_PENDING | PAYMENT_PENDING, ACTION_REQUIRED, FAILED, CANCELLED |
| ACTION_REQUIRED | PAYMENT_PENDING, RETRY_PENDING, FAILED, CANCELLED |
| COLLECTED | (terminal for payment workflow) |
| FAILED | (terminal) |
| CANCELLED | (terminal) |

Invalid examples: `FAILED→COLLECTED`, `CREATED→COLLECTED`, `COLLECTED→PAYMENT_PENDING`, PREAUTHORISED→COLLECTED.

On `COLLECTED`, set `ledger_posting_status = PENDING` (outbox path). Settlement eligibility requires `ledger_posting_status = CONFIRMED`.

---

## Payment Attempt

Typical paths (not every attempt uses every state):

| From | To |
| --- | --- |
| CREATED | SUBMITTED, CANCELLED |
| SUBMITTED | AUTHORISED, DECLINED, ERROR, CAPTURED, CANCELLED |
| AUTHORISED | CAPTURED, CANCELLED, DECLINED, ERROR |
| DECLINED / ERROR / CAPTURED / CANCELLED | terminal for that attempt |

Retries create a **new** attempt row; do not mutate a terminal attempt into success.

---

## Settlement

| From | To |
| --- | --- |
| PENDING | ELIGIBLE, CANCELLED |
| ELIGIBLE | BATCHED, SUBMITTED, CANCELLED |
| BATCHED | SUBMITTED, CANCELLED |
| SUBMITTED | PROCESSING, FAILED, RETRY_PENDING |
| PROCESSING | SETTLED, FAILED, RETRY_PENDING |
| FAILED | RETRY_PENDING (if permitted) |
| RETRY_PENDING | SUBMITTED, FAILED, CANCELLED |
| SETTLED / CANCELLED | terminal |

Must not create Settlement unless payment workflow `COLLECTED` and ledger posting `CONFIRMED` ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)).

Initial status: **PENDING**. F0: create PENDING then evaluate → ELIGIBLE or remain PENDING.

`FAILED` is **not** terminal (may → `RETRY_PENDING`). Merchant/KYB/destination ineligibility must not transition to `FAILED`.

`SETTLED` requires reconciliation evidence; ack alone is invalid ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)).

**F1 MVP:** skip BATCHED; ELIGIBLE → SUBMITTED on provider `accepted` or on `unknown_outcome` (with instruction `OUTCOME_UNKNOWN` + reconcile hold). F1 happy-path end = **SUBMITTED**. PROCESSING optional via later lookup; SETTLED is F2+.

Must not `SUBMITTED` unless payment workflow `COLLECTED`, ledger posting `CONFIRMED`, and pre-submit gates (merchant, KYB, destination) pass.

---

## ApiCredential

| From | To |
| --- | --- |
| ACTIVE | REVOKED, EXPIRED |
| REVOKED / EXPIRED | terminal (rotation issues a new credential) |

---

## Webhook Delivery Attempt

Per delivery attempt row (append-oriented):

| From | To |
| --- | --- |
| PENDING | DELIVERING |
| DELIVERING | SUCCEEDED, RETRY_PENDING, FAILED |
| RETRY_PENDING | DELIVERING |
| SUCCEEDED / FAILED | terminal for that attempt |

Event-level aggregate status may summarise latest attempt. Retries reuse the same `webhook_events.id` / public event ID.
