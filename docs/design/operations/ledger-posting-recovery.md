---
id: SEQ-OPS-002
title: Ledger Posting Recovery
type: sequence
area: operations
status: accepted
mvp: true
likec4:
  - ledgerPostingRecovery
requirements:
  - FUN-SET-001
  - FUN-SET-005
  - NFR-REL-001
  - NFR-REL-005
adrs:
  - ADR-004
  - ADR-016
  - ADR-017
  - ADR-026
tests:
  - FIN-INV-02
  - FIN-INV-04
  - OPS-REC-001
---

# Ledger Posting Recovery

## Purpose

Transactional outbox path: COLLECTED commits with `PaymentCollected` outbox; Ledger Consumer retries idempotently until **exactly one** ADR-026 collection journal exists; operational `ledger_posting_status` becomes **CONFIRMED**; settlement becomes eligible only after that confirmation.

## Preconditions

- Operational commit of COLLECTED + outbox succeeded.
- Ledger write may fail transiently after event publish.
- Crash may occur after ledger append before operational CONFIRMED.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Orch as Payment Orchestrator
    participant ODB as Operational DB
    participant OB as Outbox Publisher
    participant Bus as Event Bus
    participant LC as Ledger Consumer
    participant LDB as Ledger DB
    participant SS as Settlement Service

    Orch->>ODB: Commit COLLECTED + PaymentCollected outbox
    Note over ODB: ledger_posting_status = PENDING
    OB->>ODB: Read unpublished outbox row
    OB->>Bus: Publish PaymentCollected
    Bus->>LC: Ledger consumer receives event
    LC->>LDB: Ledger write fails transiently
    Note over ODB: Workflow remains COLLECTED / PENDING
    Bus->>LC: Bounded infrastructure retry (not ADR-025)
    LC->>LDB: Idempotent append — business_reference unique
    Note over LDB: Exactly one collection journal
    LC->>ODB: ConfirmLedgerPosting → CONFIRMED + LedgerPostingConfirmed
    Bus->>SS: Settlement eligible after confirmation
```

## Important invariants

- Exactly one journal posting per collection (`payment-collection:{pay_…}`).
- Journal exists before CONFIRMED.
- Conflicting substance for same reference → integrity failure; remain PENDING.
- Settlement eligibility only after CONFIRMED.
- At-least-once messaging must not create duplicate journals.
- Ledger failure does not change PaymentWorkflow.status away from COLLECTED.

## Failure notes

- Exhausted retries → DLQ (SEQ-OPS-003); inspect before replay.

## Related

LikeC4: `ledgerPostingRecovery`. ADR-016. ADR-026.
