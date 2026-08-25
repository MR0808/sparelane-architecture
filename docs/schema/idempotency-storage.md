# Idempotency Persistence

Physical requirements for safe retries. Retention periods **TBD**.

---

## Merchant API idempotency — `api_idempotency_keys`

| Field | Notes |
| --- | --- |
| id | Internal PK |
| merchant_id | Tenant |
| operation | e.g. `bills.create` |
| idempotency_key | Client-supplied header |
| request_fingerprint | Hash of canonical request body |
| response_status | HTTP status to replay |
| result_resource_type / result_resource_id | e.g. bill public id |
| response_body_ref | Optional stored response snapshot |
| created_at / expires_at | Retention TBD |

**Unique:** `(merchant_id, operation, idempotency_key)`

Same key + different fingerprint → `idempotency_conflict`.

Same key + same fingerprint → return original result.

---

## Provider event idempotency — `provider_event_receipts`

| Field | Notes |
| --- | --- |
| id | Internal PK |
| provider | PSP / banking partner code |
| provider_event_id | External event id |
| received_at | |
| processing_status | |
| related_aggregate_type / id | Optional |

**Unique:** `(provider, provider_event_id)`

---

## Ledger posting idempotency — `journal_transactions.business_reference`

`business_reference` is a **Sparelane-generated financial posting identity**.

It is **not**:

- a merchant bill/reconciliation reference
- a PSP/provider transaction id

Architectural requirement:

> The same business financial effect must resolve to the same unique ledger-posting identity.

| Field | Notes |
| --- | --- |
| business_reference | UNIQUE; Sparelane-controlled posting key |
| journal transaction | Exactly one row per successful posting key |

Example conceptual form for successful collection (format not mandatory):

```text
payment-collection:<paymentWorkflowId>
```

**Binding MVP format ([ADR-026](../decisions/ADR-026-collection-ledger-posting-minimal-coa.md)):**

```text
payment-collection:{paymentWorkflowPublicId}
```

where `{paymentWorkflowPublicId}` is the Payment Workflow opaque public id (`pay_…`).

**Binding MVP payout format ([ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)):**

```text
settlement-payout:{settlementPublicId}
```

**Binding MVP correction format ([ADR-036](../decisions/ADR-036-financial-compensating-correction-policy.md)):**

```text
ledger-correction:{parPublicId}
```

where `{parPublicId}` is the PrivilegedActionRequest opaque public id (`par_…`). Duplicate execute of the same `par_…` must resolve to the same journal (`already_applied`).

Do not maintain a redundant parallel `ledger_posting_keys` table unless an implementation ADR justifies it; unique `business_reference` is sufficient.
---

## Settlement instruction idempotency

On `settlement_instructions`:

| Field | Notes |
| --- | --- |
| idempotency_key | Internal stable key |
| provider_instruction_ref | Provider reference when known |

**Unique:** `idempotency_key`  
**Unique (nullable):** `(provider, provider_instruction_ref)` when present

Unknown-outcome handling must query before blind resubmit.
