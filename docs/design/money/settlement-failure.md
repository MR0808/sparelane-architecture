---
id: SEQ-MONEY-004
title: Settlement Failure
type: sequence
area: money
status: accepted
mvp: false
likec4:
  - settlementFailure
requirements:
  - FUN-SET-006
  - FUN-SET-007
  - BUS-004
adrs:
  - ADR-005
  - ADR-006
  - ADR-028
  - ADR-029
tests:
  - E2E-SET-002
  - FIN-INV-06
---

# Settlement Failure

## Purpose

Provider reports definitive settlement failure (submit `rejected` or reconcile `failed`). Consumer collection remains COLLECTED. Merchant payable remains undischarged. F2 does **not** invent replacement instructions or `RETRY_PENDING` business recovery.

## Preconditions

- Settlement was SUBMITTED or PROCESSING (or ELIGIBLE on F1 reject path).
- Verified provider failure or definitive reconcile outcome `failed`.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Bank as SettlementProvider
    participant WH as Webhook Ingress
    participant Bus as Event Bus
    participant SW as settlement-worker
    participant Led as Ledger Service
    participant Alert as Alerting
    participant PSM as Payment State Machine

    Bank->>WH: Settlement failure finality
    WH->>Bus: Verified settlement failure
    Bus->>SW: ReconcileSettlement → failed
    SW->>SW: SUBMITTED/PROCESSING → FAILED + SettlementFailed
    Note over Led: No settlement-payout discharge journal
    SW->>Alert: Escalate if unresolved / ops policy

    Note over PSM: Payment Workflow remains COLLECTED — no reversal
    Note over SW: F2 stops — RETRY_PENDING / replacement instruction deferred
```

## Important invariants

- Consumer payment stays COLLECTED.
- Do not reverse collection merely for settlement failure.
- Do not post ADR-029 payout journal on failure.
- FAILED → RETRY_PENDING only in a later phase when product rules permit (not F2).

## Failure notes

- Exhausted settlement retries (later) remain FAILED for ops handling.
- No Payment Workflow transition to FAILED from settlement failure.
- Reconcile `not_found` is **not** this path (integrity hold — ADR-029).

## Related

LikeC4: `settlementFailure`. ADR-005 / ADR-006 / ADR-029.
