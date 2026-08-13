# Merchant Webhook Event Schemas

Conceptual/contract-level payloads for curated merchant events. Names are **proposed**.

Common `data` correlation fields where applicable:

- `billId`, `merchantBillReference`
- `connectionId`, `merchantCustomerReference`
- `paymentId` (payment workflow public id)
- `settlementId`
- `merchantReconciliationReference`
- `amount` (`{ "value": "150.00", "currency": "AUD" }`)

Do not include: provider tokens, secret risk scores, internal ledger accounts, PAN/CVV, API secrets.

---

## bill.accepted

**Purpose:** Bill ingestion acknowledged (not paid).

| Field | Notes |
| --- | --- |
| billId | `bill_...` |
| merchantBillReference | |
| connectionId | |
| amount | |
| dueDate | date-only |
| status | `accepted` |
| acceptedAt | RFC3339 |

---

## payment.preauthorised

**Purpose:** Early method validation succeeded; funds not collected.

| Field | Notes |
| --- | --- |
| paymentId | |
| billId / merchantBillReference | |
| status | `preauthorised` |
| preauthorisedAt | |

---

## payment.action_required

**Purpose:** Consumer/merchant intervention needed.

| Field | Notes |
| --- | --- |
| paymentId | |
| billId / merchantBillReference | |
| status | `action_required` |
| reasonCode | high-level, non-sensitive |
| actionRequiredAt | |

---

## payment.collected

**Purpose:** Consumer funds collected for the bill.

| Field | Notes |
| --- | --- |
| paymentId | |
| billId / merchantBillReference | |
| amount | |
| status | `collected` |
| collectedAt | |

Does **not** mean settled.

---

## payment.failed

**Purpose:** Workflow terminal failure; merchant resumes normal collection.

| Field | Notes |
| --- | --- |
| paymentId | |
| billId / merchantBillReference | |
| status | `failed` |
| failedAt | |
| reasonCode | high-level |

---

## settlement.processing

**Purpose:** Settlement submitted/in progress with partner.

| Field | Notes |
| --- | --- |
| settlementId | |
| amount | |
| status | `processing` |
| merchantReconciliationReference | |
| submittedAt | |

---

## settlement.settled

**Purpose:** Settlement confirmed.

| Field | Notes |
| --- | --- |
| settlementId | |
| amount | |
| status | `settled` |
| merchantReconciliationReference | |
| settledAt | |

---

## settlement.failed

**Purpose:** Settlement failed; collection remains collected.

| Field | Notes |
| --- | --- |
| settlementId | |
| amount | |
| status | `failed` |
| merchantReconciliationReference | |
| failedAt | |
| reasonCode | high-level |
