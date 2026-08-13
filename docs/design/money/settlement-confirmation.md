---
id: SEQ-MONEY-003
title: Settlement Confirmation
type: sequence
area: money
status: accepted
mvp: false
likec4:
  - settlementConfirmation
requirements:
  - FUN-SET-004
  - FUN-SET-005
  - FUN-MER-006
  - INT-SET-002
adrs:
  - ADR-004
  - ADR-006
  - ADR-009
tests:
  - E2E-SET-002
  - FIN-INV-06
---

# Settlement Confirmation

## Purpose

Banking partner confirms settlement; reconciliation matches expected vs provider vs ledger; settlement becomes SETTLED; merchant is notified.

## Preconditions

- Settlement is SUBMITTED or PROCESSING.
- Provider confirmation event is signature-verified.
- Expected amount and ledger position are available for match.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Bank as Banking / Settlement Partner
    participant WH as Webhook Ingress
    participant Bus as Event Bus
    participant SS as Settlement Service
    participant Rec as Settlement Reconciliation
    participant Led as Ledger Service
    participant WHD as Webhook Delivery
    participant MBE as Merchant Backend

    Bank->>WH: Settlement confirmation
    WH->>Bus: Verified settlement event
    Bus->>SS: Apply provider confirmation
    SS->>Rec: Reconcile expected vs provider outcome
    Rec->>Led: Verify ledger position
    alt Match
        SS->>Led: Post settlement journal entries
        SS->>SS: → SETTLED
        SS->>Bus: SettlementCompleted / SETTLED
        Bus->>WHD: Queue merchant settlement webhook
        WHD->>MBE: Deliver settlement status
    else Mismatch
        SS->>SS: Hold / FAILED for ops (do not force SETTLED)
    end
```

## Important invariants

- SETTLED only after confirmation + reconciliation match.
- First network ack alone must not mark SETTLED.
- Merchant notification is curated webhook (ADR-023 / ADR-009).

## Failure notes

- Reconciliation mismatch → do not invent SETTLED; escalate.
- Consumer payment remains COLLECTED regardless.

## Related

LikeC4: `settlementConfirmation`. SEQ-MONEY-006 for merchant recon.
