---
id: SEQ-DATA-001
title: Successful Payment Data Path
type: sequence
area: data
status: accepted
mvp: true
likec4: []
requirements:
  - FUN-PAY-005
  - FUN-SET-001
  - BUS-003
adrs:
  - ADR-004
  - ADR-013
  - ADR-015
  - ADR-016
tests:
  - FIN-INV-01
  - FIN-INV-04
  - FIN-INV-10
---

# Successful Payment Data Path

## Purpose

Authoritative vs derived stores for a successful collection: operational bill/workflow/attempt, ledger journal (financial SoT), settlement lifecycle, then analytics for reporting.

## Preconditions

- Collection attempt succeeded (CAPTURED → workflow COLLECTED).

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant BS as Bill Service
    participant Orch as Payment Orchestrator
    participant Att as Payment Attempt Service
    participant ODB as Operational DB
    participant OB as Outbox Publisher
    participant LC as Ledger Consumer
    participant LDB as Ledger DB
    participant SS as Settlement Service
    participant An as Analytics Store
    participant Rep as Merchant Reporting

    BS->>ODB: Bill record (Sparelane-received)
    Orch->>ODB: Payment Workflow
    Att->>ODB: Payment Attempt + PSP provider reference
    Orch->>ODB: COLLECTED + outbox (atomic)
    OB->>LC: Collection posting command
    LC->>LDB: Immutable journal (financial SoT)
    LC->>ODB: Confirm financial posting
    SS->>ODB: Settlement lifecycle (after posting confirmed)
    Note over An,Rep: Derived — not transactional SoT
    Orch-->>An: Derived analytics event
    An->>Rep: Merchant reporting (lagging, non-authoritative)
```

## Important invariants

- Ledger DB = financial source of truth.
- Operational DB = workflow / attempt / posting status SoT for operations.
- Analytics is not transactional SoT (ADR-015).

## Failure notes

- Analytics lag or loss must not affect money correctness.

## Related

LikeC4 dynamic view `successfulPaymentDataPath`.
