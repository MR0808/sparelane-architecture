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
| ELIGIBLE | BATCHED, SUBMITTED, FAILED, CANCELLED |
| BATCHED | SUBMITTED, CANCELLED |
| SUBMITTED | PROCESSING, SETTLED, FAILED, RETRY_PENDING |
| PROCESSING | SETTLED, FAILED, RETRY_PENDING |
| FAILED | RETRY_PENDING (if permitted) |
| RETRY_PENDING | SUBMITTED, FAILED, CANCELLED |
| SETTLED / CANCELLED | terminal |

Must not create Settlement unless payment workflow `COLLECTED` and ledger posting `CONFIRMED` ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)).

Initial status: **PENDING**. F0: create PENDING then evaluate → ELIGIBLE or remain PENDING.

`FAILED` may later → `RETRY_PENDING` when business retry/supersession is productised (deferred past Phase F). Merchant/KYB/destination ineligibility must not transition to `FAILED`.

**Phase F MVP:** no automatic business retry / replacement instruction after `FAILED` (hold terminal for that instruction path).

`SETTLED` requires ADR-029 finality + payout journal; ack alone is invalid ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md), [ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)).

**F1 MVP:** skip BATCHED; ELIGIBLE → SUBMITTED on provider `accepted` or on `unknown_outcome` (with instruction `OUTCOME_UNKNOWN` + reconcile hold). ELIGIBLE → FAILED on provider `rejected` acknowledgement ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)). F1 happy-path end = **SUBMITTED**.

**F2 MVP:** `ReconcileSettlement` — `pending` may SUBMITTED→PROCESSING; `settled` → journal then SETTLED (from SUBMITTED or PROCESSING); `failed` → FAILED; `not_found`/`unknown` → hold (no resubmit). No automatic poll cadence.

Must not `SUBMITTED` unless payment workflow `COLLECTED`, ledger posting `CONFIRMED`, and pre-submit gates (merchant, KYB, destination) pass.

---

## ApiCredential

| From | To |
| --- | --- |
| ACTIVE | REVOKED, EXPIRED |
| REVOKED / EXPIRED | terminal (rotation issues a new credential) |

---

## Webhook endpoint

| From | To |
| --- | --- |
| (create after URL validation + secret issuance) | ACTIVE |
| ACTIVE | DISABLED, REVOKED |
| DISABLED | ACTIVE (re-validate URL), REVOKED |
| REVOKED | terminal |

Only `ACTIVE` may receive HTTP delivery.

---

## Webhook logical delivery

| From | To |
| --- | --- |
| PENDING | SUCCEEDED, FAILED, CANCELLED |
| FAILED | SUCCEEDED (operator manual replay success only — [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)) |
| SUCCEEDED / CANCELLED | terminal |

Automatic exhaustion ends at `FAILED`. Manual operator replay may later succeed without creating a new delivery identity. Attempt history retains prior failures.

---

## Webhook delivery attempt

Per attempt row (append-oriented):

| From | To |
| --- | --- |
| PENDING | DELIVERING |
| DELIVERING | SUCCEEDED, RETRY_PENDING, FAILED |
| RETRY_PENDING | DELIVERING |
| SUCCEEDED / FAILED | terminal for that attempt |

Retries reuse the same `webhook_events.public_id`. New attempt row; fresh signature timestamp. Automatic budget max 5 ([ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md)). Manual operator replay appends attempt 6+ without resetting history ([ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)).

---

## DeadLetterItem (H2)

| From | To | Gate |
| --- | --- | --- |
| — | OPEN | Exhaustion persist |
| OPEN | REPLAY_REQUESTED | Accepted webhook `OperatorReplayRequest` |
| REPLAY_REQUESTED | REPLAYING | Worker claim |
| REPLAYING | RESOLVED | Manual webhook 2xx |
| REPLAYING | REPLAY_FAILED | Manual attempt failed |
| REPLAY_FAILED | OPEN | Available for another operator decision |
| REPLAY_FAILED | REPLAY_REQUESTED | New `rpl_` accepted |

No dismiss transition in H2 MVP.

---

## OperatorReplayRequest (H2)

| From | To | Gate |
| --- | --- | --- |
| — | requested | `admin.webhook.replay` + MFA ≤15m + reason + eligible DLQ |
| requested | executing | Worker claim (execute-once) |
| executing | succeeded | Transport 2xx |
| executing | failed | Transport failure / eligibility fail after accept |
| — | denied | Authz/MFA/reason/catalogue rejection (may be audit-only without row) |

Terminal: `succeeded`, `failed`, `denied`.

---

## PrivilegedActionRequest (H1 Option A)

Grant create/revoke only ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)). Status values: `pending` \| `approved` \| `denied` \| `expired` \| `executed` \| `failed` \| `cancelled`.

| From | To | Gate |
| --- | --- | --- |
| — | pending | Request + recent MFA + `admin.grant.manage` + reason + valid `usr_…` |
| pending | approved | One approver ≠ requester + recent MFA + fingerprint match + not expired |
| pending | denied | Eligible deny ≠ requester + recent MFA |
| pending | expired | Clock ≥ `expires_at` |
| approved | executed | Recent MFA + fingerprint match + idempotent grant apply |
| approved | failed | Execute rejected after approval (e.g. last-admin race) |
| approved | cancelled | Optional pre-execute cancel (MVP may omit) |

Terminal: `executed`, `denied`, `expired`, `failed` (and `cancelled` if used).

### PlatformAdminGrant status

| From | To | Gate |
| --- | --- | --- |
| — | active | Bootstrap runbook **or** executed `admin.grant.create` |
| active | revoked | Executed `admin.grant.revoke` (dual control; not last active admin) |
| revoked | active | Executed `admin.grant.create` reactivation |

Only `active` confers `AdminPrincipal`.
