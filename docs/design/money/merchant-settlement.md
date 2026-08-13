---
id: SEQ-MONEY-002
title: Merchant Settlement
type: sequence
area: money
status: accepted
mvp: false
likec4:
  - merchantSettlement
requirements:
  - FUN-SET-001
  - FUN-SET-002
  - FUN-SET-003
  - INT-SET-001
adrs:
  - ADR-005
  - ADR-006
  - ADR-004
tests:
  - E2E-SET-001
  - FIN-INV-05
---

# Merchant Settlement

## Purpose

Eligible payable funds move through Settlement Service (optional batching) to the banking partner. Partner acknowledgement is **not** SETTLED.

## Preconditions

- Payment Workflow is COLLECTED.
- Ledger posting status is CONFIRMED.
- Merchant payable balance is eligible.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Bus as Event Bus
    participant SS as Settlement Service
    participant Bal as Balance Service
    participant Led as Ledger Service
    participant Batch as Settlement Batch Service
    participant Inst as Settlement Instruction Service
    participant Bank as Banking / Settlement Partner

    Bus->>SS: Settlement eligible (posting confirmed)
    SS->>Bal: Read eligible merchant payable
    SS->>Led: Verify payable against ledger
    SS->>SS: PENDING → ELIGIBLE

    opt Batching applies
        SS->>Batch: Group into Settlement Batch
        Batch-->>SS: BATCHED
    end

    SS->>Inst: Request settlement instruction
    Inst->>Bank: Submit settlement instruction
    SS->>SS: → SUBMITTED
    Bank-->>Inst: Ack receipt / processing
    SS->>SS: → PROCESSING
    SS->>Bus: Publish SUBMITTED / PROCESSING

    Note over SS,Bank: Acknowledgement != SETTLED
```

## Important invariants

- Must not SUBMIT unless workflow COLLECTED and ledger posting CONFIRMED.
- Ack / PROCESSING is not terminal SETTLED.
- Settlement lifecycle is separate from Payment Workflow (ADR-006).

## Failure notes

- Partner unavailable → RETRY_PENDING / outage path (SEQ-OPS-004).
- Unknown outcome after submit → SEQ-MONEY-005 (do not blind resubmit).

## Related

LikeC4: `merchantSettlement`. STATE-MONEY-001.
