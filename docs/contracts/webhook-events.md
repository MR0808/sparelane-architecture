# Merchant Webhook Event Schemas

**Binding:** [ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md). Closed MVP catalogue. Names are **not** proposed.

Internal domain events are mapped here; they are **not** published as-is ([ADR-023](../decisions/ADR-023-curated-external-events.md)).

Money objects follow [money.md](./money.md): `{ "value": "150.00", "currency": "AUD" }`.

Common forbidden fields: internal UUIDs, credentials, provider tokens/payloads, payout destination / bank details, PAN/CVV, auth subjects, consumer PII, ledger accounts, stack traces.

---

## Catalogue

| External type | version | Source internal event | Merchant source | `source_identity` |
| --- | --- | --- | --- | --- |
| `bill.accepted` | 1 | `BillAccepted` | Bill merchant | `bill:{billPublicId}` |
| `payment.action_required` | 1 | workflow → `ACTION_REQUIRED` | Workflow/Bill merchant | `pay:{paymentPublicId}:v{workflowVersion}` |
| `payment.collected` | 1 | `PaymentCollected` | Workflow/Bill merchant | `pay:{paymentPublicId}` |
| `payment.failed` | 1 | `PaymentFailed` | Workflow/Bill merchant | `pay:{paymentPublicId}` |
| `settlement.submitted` | 1 | `SettlementSubmitted` | Settlement merchant | `set:{settlementPublicId}` |
| `settlement.settled` | 1 | `SettlementSettled` | Settlement merchant | `set:{settlementPublicId}` |
| `settlement.failed` | 1 | `SettlementFailed` | Settlement merchant | `set:{settlementPublicId}` |

---

## bill.accepted

Bill ingestion acknowledged (not paid).

| Field | Notes |
| --- | --- |
| billId | `bill_...` |
| merchantBillReference | merchant correlation |
| connectionId | `conn_...` |
| amount | money |
| dueDate | date-only |
| status | `accepted` |
| acceptedAt | RFC3339 |

---

## payment.action_required

Consumer/merchant intervention needed.

| Field | Notes |
| --- | --- |
| paymentId | `pay_...` (workflow public id) |
| billId | `bill_...` |
| merchantBillReference | |
| status | `action_required` |
| reasonCode | high-level, non-sensitive |
| actionRequiredAt | RFC3339 |

---

## payment.collected

Consumer funds collected for the bill. Does **not** mean settled.

| Field | Notes |
| --- | --- |
| paymentId | `pay_...` |
| billId | `bill_...` |
| merchantBillReference | |
| amount | money |
| status | `collected` |
| collectedAt | RFC3339 |

---

## payment.failed

Workflow terminal failure; merchant resumes normal collection.

| Field | Notes |
| --- | --- |
| paymentId | `pay_...` |
| billId | `bill_...` |
| merchantBillReference | |
| status | `failed` |
| failedAt | RFC3339 |
| reasonCode | high-level, non-sensitive |

---

## settlement.submitted

Settlement submitted or parked `SUBMITTED` with partner. Does **not** mean `SETTLED`.

| Field | Notes |
| --- | --- |
| settlementId | `set_...` |
| amount | money |
| status | `submitted` |
| merchantReconciliationReference | |
| submittedAt | RFC3339 |

---

## settlement.settled

Settlement confirmed (payout journal exists).

| Field | Notes |
| --- | --- |
| settlementId | `set_...` |
| amount | money |
| status | `settled` |
| merchantReconciliationReference | |
| settledAt | RFC3339 |

---

## settlement.failed

Settlement failed; collection remains collected.

| Field | Notes |
| --- | --- |
| settlementId | `set_...` |
| amount | money |
| status | `failed` |
| merchantReconciliationReference | |
| failedAt | RFC3339 |
| reasonCode | high-level, non-sensitive |
