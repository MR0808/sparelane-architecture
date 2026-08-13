---
id: SEQ-MONEY-005
title: Unknown Settlement Outcome
type: sequence
area: money
status: accepted
mvp: false
likec4:
  - unknownSettlementOutcome
requirements:
  - FUN-SET-003
  - NFR-REL-005
  - INT-SET-001
adrs:
  - ADR-006
  - ADR-017
tests:
  - E2E-SET-003
  - FIN-INV-06
---

# Unknown Settlement Outcome

## Purpose

Network timeout after settlement submission leaves external outcome unknown. **Do not resubmit blindly.** Query/reconcile before any safe retry.

## Preconditions

- Settlement Instruction was submitted (or submit call timed out mid-flight).
- Local state may be SUBMITTED / PROCESSING / unknown.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Inst as Settlement Instruction Service
    participant Bank as Banking / Settlement Partner
    participant SS as Settlement Service
    participant Rec as Settlement Reconciliation

    Inst->>Bank: Submit settlement instruction
    Bank--xInst: Network timeout — outcome unknown
    Inst->>SS: Report unknown external outcome

    critical Do not blind resubmit
        SS->>Rec: Query / reconcile with provider first
        Rec->>Bank: Determine actual external state
        Bank-->>Rec: Accepted | Not found | Failed | Still processing

        alt Already accepted / processing / settled
            Rec-->>SS: Adopt provider truth — no second instruction
            SS->>SS: Align local state (PROCESSING / SETTLED path)
        else Definitively not accepted
            Rec-->>SS: Safe bounded retry permitted
            SS->>Inst: Retry with same idempotency key / policy
        else Still unknown
            Rec-->>SS: Hold — re-query — alert ops
            Note over SS: Never invent a second payout
        end
    end
```

## Important invariants

- Blind duplicate settlement instructions are forbidden.
- Provider query / reconciliation precedes any resubmit.
- Prefer idempotent instruction keys when partner supports them.

## Failure notes

- Prolonged unknown → operations escalation; payment remains COLLECTED.
- See also SEQ-OPS-004 for partner outage.

## Related

LikeC4: `unknownSettlementOutcome`. Critical safety path.
