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
  - ADR-026
  - ADR-028
  - ADR-029
tests:
  - E2E-SET-002
  - FIN-INV-05
  - FIN-INV-06
---

# Settlement Confirmation

## Purpose

After F1 `SUBMITTED`, settlement-worker reconciles provider finality (verified webhook and/or lookup). On canonical `settled`, appends the ADR-029 payout journal, then marks Settlement `SETTLED` and emits `SettlementSettled`. Merchant notification remains curated webhook (later Phase G).

Binding: [ADR-029](../../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md).

## Preconditions

- Settlement is SUBMITTED or PROCESSING.
- SettlementInstruction exists (ACCEPTED or OUTCOME_UNKNOWN).
- Provider confirmation is signature-verified when webhook-sourced.
- Expected amount/currency/destination available for integrity match.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Bank as SettlementProvider
    participant WH as Webhook Ingress
    participant Bus as Event Bus
    participant SW as settlement-worker
    participant Led as Ledger Service

    Note over Bus,SW: Trigger A — SettlementSubmitted enqueues ReconcileSettlement
    Bus->>SW: SettlementSubmitted / ReconcileSettlement
    SW->>Bank: lookupSettlementInstruction (same key - never submit)

    Note over Bank,WH: Trigger B — verified webhook (optional parallel channel)
    Bank->>WH: Settlement finality event
    WH->>Bus: Verified settlement event
    Bus->>SW: ReconcileSettlement

    alt pending
        SW->>SW: Remain SUBMITTED or → PROCESSING
        Note over SW: No journal - no SETTLED
    else settled + integrity match
        SW->>Led: appendJournal settlement-payout:{settlementPublicId}
        Note over Led: Dr payable / Cr settlement-clearing (gross)
        SW->>SW: Verify journal substance
        SW->>SW: → SETTLED + SettlementSettled outbox
    else failed
        SW->>SW: → FAILED + SettlementFailed
        Note over SW: No payout discharge journal
    else not_found or unknown
        SW->>SW: Hold with reconciliation_required - no resubmit
    else integrity mismatch / conflict
        SW->>SW: Financial-integrity hold - no SETTLED
    end
```

### Crash after journal before SETTLED

```mermaid
sequenceDiagram
    participant SW as settlement-worker
    participant Led as Ledger Service
    SW->>Led: payout journal commits
    Note over SW: Process dies
    SW->>Led: replay same business_reference → already_applied
    SW->>SW: → SETTLED + SettlementSettled
```

## Important invariants

- SETTLED only after finality `settled` + durable payout journal.
- First network ack alone must not mark SETTLED.
- Reconciliation never calls submit.
- Merchant notification is curated webhook (ADR-023 / ADR-009) — Phase G delivery.

## Failure notes

- Reconciliation mismatch → do not invent SETTLED; escalate.
- Consumer payment remains COLLECTED regardless.
- `not_found` is not automatic FAILED and not resubmit.

## Related

LikeC4: `settlementConfirmation`. SEQ-MONEY-006 for merchant recon. ADR-029.
