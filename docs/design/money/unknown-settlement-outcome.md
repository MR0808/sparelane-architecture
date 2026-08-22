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
  - ADR-029
tests:
  - E2E-SET-003
  - FIN-INV-06
---

# Unknown Settlement Outcome

## Purpose

Network timeout after settlement submission leaves external outcome unknown. **Do not resubmit blindly.** Lookup/reconcile with the same instruction identity. Final `SETTLED` only via ADR-029 finality + payout journal.

Binding: [ADR-028](../../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md), [ADR-029](../../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md).

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
    participant Led as Ledger Service

    Inst->>Bank: submitSettlementInstruction (stable idempotency key)
    Bank--xInst: Network timeout — outcome unknown
    Inst->>SW: Persist OUTCOME_UNKNOWN + Settlement SUBMITTED

    critical Do not blind resubmit
        SW->>Bank: lookupSettlementInstruction / ReconcileSettlement (same key)
        Bank-->>SW: pending | settled | failed | not_found | unknown

        alt pending
            SW->>SW: Align ACCEPTED then optional PROCESSING
            Note over SW: No journal - not SETTLED
        else settled + integrity match
            SW->>Led: settlement-payout journal
            SW->>SW: → SETTLED + SettlementSettled
        else failed
            SW->>SW: → FAILED - no payout journal - no resubmit in F2
        else not_found
            SW->>SW: Integrity/ops hold - NO resubmit - NO FAILED-from-not-found
        else unknown
            SW->>SW: Hold - redeliver ReconcileSettlement - alert ops
            Note over SW: Never invent a second payout or new key
        end
    end
```

## Important invariants

- Blind duplicate settlement instructions are forbidden.
- Provider query / reconciliation precedes any resubmit; F2 MVP **never** resubmits from reconcile (including `not_found`).
- Same instruction identity and idempotency key forever for this obligation (MVP).
- Do not mark FAILED merely to enable retry; do not mark SETTLED without ADR-029 evidence + journal.

## Failure notes

- Prolonged unknown → operations escalation; payment remains COLLECTED.
- See also SEQ-OPS-004 for partner outage.

## Related

LikeC4: `unknownSettlementOutcome`. Critical safety path. ADR-028. ADR-029.
