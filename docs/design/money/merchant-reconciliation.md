---
id: SEQ-MONEY-006
title: Merchant Reconciliation
type: sequence
area: money
status: accepted
mvp: false
likec4:
  - merchantReconciliationFlow
requirements:
  - FUN-SET-005
  - FUN-MER-006
  - BUS-005
adrs:
  - ADR-007
  - ADR-006
  - ADR-009
tests:
  - E2E-SET-002
  - FIN-INV-09
---

# Merchant Reconciliation

## Purpose

Confirmed settlement is matched to Sparelane settlement and merchant invoice/reconciliation references, then reported. Sparelane does **not** change the merchant invoice system of record.

## Preconditions

- Settlement confirmed (SETTLED path).
- Merchant reconciliation / invoice reference available on the original bill or settlement record.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant SS as Settlement Service
    participant Rec as Settlement Reconciliation
    participant MRS as Merchant Reconciliation Service
    participant ODB as Operational DB
    participant Bus as Event Bus
    participant WHD as Webhook Delivery
    participant MBE as Merchant Backend
    participant Fin as Merchant Finance / ERP

    SS->>Rec: Settlement confirmed
    Rec->>MRS: Match merchant invoice / recon reference
    MRS->>ODB: Persist Sparelane reconciliation record
    Bus->>WHD: Queue settlement / reconciliation status
    WHD->>MBE: Deliver signed webhook / report
    MBE->>Fin: Merchant updates own finance SoR

    Note over MRS,Fin: Sparelane does not mutate merchant invoice SoR
```

## Important invariants

- Merchant billing/invoice remains merchant SoR (ADR-007).
- Sparelane stores its own reconciliation projection only.
- Webhooks are at-least-once; merchant must key on event ID.

## Failure notes

- Unmatched reference → ops exception; do not invent merchant invoice updates.

## Related

LikeC4: `merchantReconciliationFlow`.
