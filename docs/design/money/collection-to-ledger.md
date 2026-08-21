---
id: SEQ-MONEY-001
title: Collection to Ledger
type: sequence
area: money
status: accepted
mvp: true
likec4:
  - collectionToLedger
requirements:
  - FUN-SET-001
  - FUN-SET-005
  - FUN-SET-006
  - FUN-PAY-005
  - BUS-003
adrs:
  - ADR-004
  - ADR-005
  - ADR-013
  - ADR-016
  - ADR-017
  - ADR-026
tests:
  - FIN-INV-01
  - FIN-INV-02
  - FIN-INV-03
  - FIN-INV-04
  - E2E-SET-001
---

# Collection to Ledger

## Purpose

Successful PSP collection becomes Payment Workflow COLLECTED with an atomic outbox write; the Ledger Consumer appends the **ADR-026** collection journal idempotently, then confirms operational `ledger_posting_status = CONFIRMED`. Workflow state and ledger state remain distinct; consistency is eventual until posting is confirmed.

## Preconditions

- Verified provider success event for a collection attempt.
- Operational transaction can commit COLLECTED + outbox atomically.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant WH as Webhook Ingress
    participant Orch as Payment Orchestrator
    participant Att as Payment Attempt Service
    participant PSM as Payment State Machine
    participant ODB as Operational DB
    participant OB as Outbox Publisher
    participant Bus as Event Bus
    participant LC as Ledger Consumer
    participant LDB as Ledger DB

    WH->>Orch: Verified collection success
    Orch->>Att: Mark attempt CAPTURED
    Orch->>PSM: Workflow → COLLECTED
    Orch->>ODB: Commit COLLECTED + PaymentCollected outbox (atomic)
    Note over ODB: ledger_posting_status = PENDING

    OB->>Bus: Publish PaymentCollected
    Bus->>LC: At-least-once delivery
    Note over LC: Reload workflow + Bill (authoritative amount)
    LC->>LDB: Ensure accounts + append collection journal
    Note over LDB: business_reference = payment-collection:{pay_…}<br/>Dr processor clearing / Cr merchant payable
    LC->>ODB: ConfirmLedgerPosting PENDING→CONFIRMED + LedgerPostingConfirmed outbox

    Note over Orch,LDB: Crash after journal before confirm: redelivery already_applied then CONFIRMED
    Note over Orch,LDB: Settlement waits for CONFIRMED — no payout here
```

## Canonical journal (ADR-026)

| Leg | Side | Account | Amount |
| --- | --- | --- | --- |
| 1 | DEBIT | `sys:processor-clearing:{providerCode}:{currency}` | Bill `amount_minor` |
| 2 | CREDIT | `mrc:{merchantPublicId}:payable:{currency}` | Bill `amount_minor` |

## Important invariants

- Exactly one collection journal per successful collection (idempotent `business_reference`).
- Journal exists before `ledger_posting_status = CONFIRMED`.
- Settlement must not SUBMIT until posting CONFIRMED.
- Ledger posting failure leaves workflow `COLLECTED` (not payment FAILED).
- Ledger DB is financial source of truth; Operational DB holds workflow + posting status.
- No distributed transaction across ODB and LDB.

## Failure notes

- Transient ledger write failure → bounded infrastructure retry / recovery (SEQ-OPS-002). Not ADR-025 payment retry.
- Conflicting journal substance for same `business_reference` → integrity failure; remain PENDING; do not mutate journal.
- Do not mark SETTLED from this path.

## Related

LikeC4: `collectionToLedger`. ADR-016 outbox consistency. ADR-026 collection CoA.
