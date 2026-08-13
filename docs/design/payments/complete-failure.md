---
id: SEQ-PAY-006
title: Complete Failure
type: sequence
area: payments
status: accepted
mvp: true
likec4:
  - completeFailure
requirements:
  - FUN-PAY-007
  - FUN-PAY-008
  - FUN-MER-004
adrs:
  - ADR-002
  - ADR-005
  - ADR-009
tests:
  - E2E-PAY-004
  - CON-WEBHOOK-001
---

# Complete Failure

## Purpose

All eligible methods and permitted retries are exhausted. Workflow becomes FAILED; merchant resumes normal collection. No ledger collection posting and no settlement.

## Preconditions

- Reliability Engine reports no eligible methods remain.
- Retry Service reports no permitted retry remains (or recovery window closed).

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Orch as Payment Orchestrator
    participant Rel as Reliability Engine
    participant Retry as Retry Service
    participant PSM as Payment State Machine
    participant Bus as Event Bus
    participant Notif as Notification Service
    participant WHD as Webhook Delivery
    participant MBE as Merchant Backend

    Orch->>Rel: Next eligible method?
    Rel-->>Orch: None remain
    Orch->>Retry: Permitted retry?
    Retry-->>Orch: None remain
    Orch->>PSM: Transition → FAILED
    Orch->>Bus: Publish PaymentFailed

    Note over Orch,PSM: No COLLECTED — no ledger collection journal — no settlement

    Bus->>Notif: Notify consumer (unresolved payment)
    Bus->>WHD: Queue merchant payment.failed webhook
    WHD->>MBE: Deliver signed PaymentFailed
    Note over MBE: Merchant resumes normal collection (SoR unchanged by Sparelane)
```

## Important invariants

- FAILED is terminal for the Payment Workflow; no path to COLLECTED.
- No collection ledger posting; no settlement eligibility.
- Merchant invoice system of record is not rewritten by Sparelane.

## Failure notes

- Webhook delivery may retry (SEQ-INT-004) but must reuse the same event ID.
- Do not invent settlement failure events for never-collected bills.

## Related

LikeC4: `completeFailure`. ADR-005 collection before settlement.
