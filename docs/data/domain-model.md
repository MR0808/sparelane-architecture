# Conceptual Domain Model

Major Sparelane business entities and relationships. This is a conceptual model — not a physical database schema, Prisma model or ERD.

## Ownership summary

| Concern | Authoritative party |
| --- | --- |
| Billing / invoice / subscription master | Merchant |
| Sparelane operational workflow state | Sparelane |
| Financial journal movements | Sparelane Financial Ledger |
| Provider-side payment execution / CHD | PSP (external) |

---

## Consumer

Sparelane account holder.

```text
Consumer
    ├── Payment Methods
    ├── Merchant Connections
    ├── Wallet capability (optional)
    └── Bills / Payment Workflows visible to consumer
```

Authentication credentials are **not** part of the Consumer business entity. Identity/authentication remains a separate concern.

Classification: typically Confidential (profile); related secrets Restricted.

---

## Merchant

Participating merchant organisation.

```text
Merchant
    ├── Merchant Users
    ├── Integrations
    ├── API Credentials
    ├── Webhook Endpoints
    ├── Merchant Connections
    ├── Bills (Sparelane-received)
    └── Settlements
```

Merchant remains source of truth for subscription, invoice master, customer account master, product catalogue and merchant accounting ledger. Sparelane stores representation/references sufficient for payment reliability and reconciliation.

---

## Merchant Connection

Authorised association between:

```text
Merchant Customer
↔ Sparelane Consumer
↔ Merchant
```

Preserves merchant-provided customer references for correlation.

This is **not** the merchant's customer master record.

---

## Payment Method

Usable payment-method reference owned by a Consumer.

Conceptual attributes:

- owner Consumer
- provider token/reference
- method type
- masked/display information where permitted
- status
- expiry metadata where permitted
- priority relationship (primary / ordered backups)

**Never** includes raw PAN or CVV.

Provider remains authoritative for the token and PCI data.

---

## Bill

Merchant bill information submitted to Sparelane.

Conceptual attributes:

- Merchant
- Merchant Connection
- merchant bill reference
- amount
- currency
- due date
- reconciliation reference
- ingestion status

**Merchant owns the original bill.** Sparelane owns its received bill record used for payment reliability.

---

## Payment Workflow

Sparelane's overall collection/reliability lifecycle for a Bill.

```text
Bill
    1
    └── Payment Workflow
            1
            └── 1..N Payment Attempts
```

If one Bill may create multiple workflows in future, that requires an explicit future ADR. **MVP cardinality is fixed:**

```text
Bill 1 → 1 Payment Workflow
Payment Workflow 1 → 1..N Payment Attempts
```

See [ADR-003](../decisions/ADR-003-payment-workflow-vs-attempt.md).

Sparelane is authoritative for workflow state. Distinct from Bill ownership and Settlement state.

---

## Payment Attempt

One concrete payment execution attempt within a Payment Workflow.

Conceptual references:

- workflow
- payment method
- PSP/provider
- provider transaction reference
- result
- decline/result classification
- sequence number
- timestamps

Attempts are immutable history records once completed. Never store PAN/CVV.

---

## Settlement

Sparelane merchant settlement obligation/lifecycle for eligible collected funds.

Separate from Payment Workflow. `COLLECTED` is not `SETTLED`.

---

## Journal Transaction / Journal Entry

Financial journal data in the double-entry ledger.

```text
Journal Transaction
    1
    └── 2..N Journal Entries (balanced)
```

See [`docs/money/ledger-model.md`](../money/ledger-model.md). Do not duplicate full accounting design here.

The ledger is authoritative for financial movements; operational workflow state is not.

---

## Webhook Event

Merchant-facing external event contract (curated; not a raw internal domain event).

## Webhook Delivery Attempt

One delivery attempt for a Webhook Event.

```text
Webhook Event
    1
    └── 1..N Delivery Attempts
```

Stable event ID across retries. At-least-once delivery.

---

## Audit Event

Durable security/administrative audit record (actor, action, target, timestamp, context, result, correlation IDs).

Must not contain secrets or raw payment credentials.

---

## Data that must never exist inside Sparelane

- raw PAN
- CVV
- plaintext API secrets after issuance
- merchant's full billing/subscription master as Sparelane SoR
