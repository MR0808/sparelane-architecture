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
  - NFR-REL-001
  - NFR-REL-005
adrs:
  - ADR-004
  - ADR-016
  - ADR-017
tests:
  - FIN-INV-04
  - OPS-REC-001
---

# Ledger Posting Recovery

## Purpose

Transactional outbox path: COLLECTED commits with outbox; Ledger Consumer retries idempotently until **exactly one** journal exists; settlement becomes eligible only after posting confirmation.

## Preconditions

- Operational commit of COLLECTED + outbox succeeded.
- Ledger write may fail transiently after event publish.

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

    Orch->>ODB: Commit COLLECTED + outbox atomically
    OB->>ODB: Read unpublished outbox row
    OB->>Bus: Publish collection posting event
    Bus->>LC: Ledger consumer receives event
    LC->>LDB: Ledger write fails transiently
    Bus->>LC: Bounded message retry
    LC->>LDB: Idempotency check — exactly one journal
    LC->>ODB: Mark financial posting CONFIRMED
    Bus->>SS: Settlement eligible after confirmation
```

## Important invariants

- Exactly one journal posting per collection (idempotent key).
- Settlement eligibility only after CONFIRMED.
- At-least-once messaging must not create duplicate journals.

## Failure notes

- Exhausted retries → DLQ (SEQ-OPS-003); inspect before replay.

## Related

LikeC4: `ledgerPostingRecovery`. ADR-016.
