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
  - FUN-PAY-005
  - BUS-003
adrs:
  - ADR-004
  - ADR-005
  - ADR-013
  - ADR-016
  - ADR-017
tests:
  - FIN-INV-01
  - FIN-INV-04
  - E2E-SET-001
---

# Collection to Ledger

## Purpose

Successful PSP collection becomes Payment Workflow COLLECTED with an atomic outbox write; the Ledger Consumer posts an idempotent journal. Workflow state and ledger state remain distinct; consistency is eventual until posting is confirmed.

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
    Orch->>ODB: Commit COLLECTED + outbox (atomic)
    Note over ODB: ledger_posting_status = PENDING

    OB->>Bus: Publish collection posting event
    Bus->>LC: At-least-once delivery
    LC->>LDB: Append immutable journal (idempotent key)
    LC->>ODB: Confirm financial posting (CONFIRMED)

    Note over Orch,LDB: Eventual consistency until CONFIRMED — settlement waits
```

## Important invariants

- Exactly one collection journal per successful collection (idempotent consumer).
- Settlement must not SUBMIT until posting CONFIRMED.
- Ledger DB is financial source of truth; Operational DB holds workflow + posting status.

## Failure notes

- Transient ledger write failure → bounded retry / recovery (SEQ-OPS-002).
- Do not mark SETTLED from this path.

## Related

LikeC4: `collectionToLedger`. ADR-016 outbox consistency.
