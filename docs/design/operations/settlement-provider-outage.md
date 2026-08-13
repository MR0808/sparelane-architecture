---
id: SEQ-OPS-004
title: Settlement Provider Outage
type: sequence
area: operations
status: accepted
mvp: false
likec4:
  - settlementProviderOutage
requirements:
  - FUN-SET-007
  - NFR-REL-002
  - INT-SET-001
adrs:
  - ADR-005
  - ADR-006
tests:
  - E2E-SET-003
  - OPS-REC-001
---

# Settlement Provider Outage

## Purpose

Settlement partner unavailability keeps settlement pending/retryable. Consumer payment remains COLLECTED. No payment reversal because the settlement rail is down.

## Preconditions

- Settlement eligible and instruction attempted.
- Banking / settlement partner unavailable or timing out.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant SS as Settlement Service
    participant Inst as Settlement Instruction Service
    participant Bank as Banking / Settlement Partner
    participant ODB as Operational DB
    participant Sch as Platform Scheduler
    participant Bus as Event Bus
    participant PSM as Payment State Machine

    SS->>Inst: Eligible settlement instruction
    Inst->>Bank: Submit settlement instruction
    Bank--xInst: Provider unavailable / timeout
    SS->>ODB: Settlement → RETRY_PENDING / backoff
    Sch->>Bus: Queue bounded settlement retry later
    Bus->>SS: Retry settlement later

    Note over PSM,ODB: Payment remains COLLECTED — no reversal
```

## Important invariants

- Payment Workflow stays COLLECTED.
- No consumer payment reversal due to settlement rail outage.
- Bounded settlement retries only; unknown mid-submit still follows SEQ-MONEY-005.

## Failure notes

- Prolonged outage → ops alert; unpaid settlement remains merchant-side settlement issue, not uncollect.

## Related

LikeC4: `settlementProviderOutage`. STATE-MONEY-001 RETRY_PENDING.
