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
  - ADR-028
tests:
  - E2E-SET-003
  - FIN-INV-06
---

# Unknown Settlement Outcome

## Purpose

Network timeout after settlement submission leaves external outcome unknown. **Do not resubmit blindly.** Query/reconcile before any safe retry.

Binding: [ADR-028](../../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md).

## Preconditions

- Settlement Instruction was submitted (or submit call timed out mid-flight).
- Local representation: Settlement **SUBMITTED** + instruction **OUTCOME_UNKNOWN** + `reconciliation_required`.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Inst as Settlement Instruction
    participant Bank as SettlementProvider
    participant SW as settlement-worker
    participant Rec as Settlement Reconciliation

    Inst->>Bank: submitSettlementInstruction (stable idempotency key)
    Bank--xInst: Network timeout — outcome unknown
    Inst->>SW: Persist OUTCOME_UNKNOWN + Settlement SUBMITTED

    critical Do not blind resubmit
        SW->>Rec: Lookup / reconcile with provider first
        Rec->>Bank: lookupSettlementInstruction(same key / provider ref)
        Bank-->>Rec: Accepted | Not found | Failed | Still processing | Still unknown

        alt Already accepted / processing
            Rec-->>SW: Adopt provider truth — no second instruction
            SW->>SW: Align instruction ACCEPTED then optional PROCESSING
            Note over SW: Still not SETTLED (F2+ reconciliation)
        else Definitively not accepted
            Rec-->>SW: Safe bounded retry permitted (same key)
            SW->>Inst: Retry same SettlementInstruction
        else Still unknown
            Rec-->>SW: Hold — re-query — alert ops
            Note over SW: Never invent a second payout / new key
        end
    end
```

## Important invariants

- Blind duplicate settlement instructions are forbidden.
- Provider query / reconciliation precedes any resubmit.
- Same instruction identity and idempotency key forever for this obligation (MVP).
- Do not mark FAILED merely to enable retry; do not mark SETTLED.

## Failure notes

- Prolonged unknown → operations escalation; payment remains COLLECTED.
- See also SEQ-OPS-004 for partner outage.

## Related

LikeC4: `unknownSettlementOutcome`. Critical safety path. ADR-028.
