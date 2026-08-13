---
id: SEQ-OPS-003
title: DLQ Replay
type: sequence
area: operations
status: accepted
mvp: true
likec4:
  - dlqReplay
requirements:
  - NFR-OPS-004
  - NFR-REL-005
adrs:
  - ADR-012
  - ADR-016
  - ADR-017
tests:
  - OPS-REC-002
---

# DLQ Replay

## Purpose

Failed messages enter DLQ after bounded retries. Operators inspect authoritative state and replay only when safe. Financial side effects must not be blindly repeated. Operator action is audited.

## Preconditions

- Message exhausted bounded retries and is in Dead Letter Queue.
- Admin has privileged access with MFA.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Bus as Event Bus
    participant DLQ as Dead Letter Queue
    participant Admin as Sparelane Admin
    participant Portal as Admin Portal
    participant BFF as Admin BFF
    participant ODB as Operational DB
    participant LDB as Ledger DB
    participant LC as Ledger Consumer
    participant Aud as Audit Service

    Bus->>DLQ: Route failed message after bounded retries
    Admin->>Portal: Investigate DLQ item
    Portal->>BFF: Open DLQ investigation
    BFF->>ODB: Check authoritative workflow / settlement state
    BFF->>LDB: Check ledger posting state when financial

    alt Replay safe
        BFF->>Bus: Replay message
        Bus->>LC: Idempotent processing absorbs duplicates
    else Not safe
        BFF-->>Portal: Hold — do not replay
    end

    BFF->>Aud: Audit operator replay decision
```

## Important invariants

- Inspect Operational DB / Ledger DB before replay.
- Financial consumers remain idempotent.
- Every operator replay is audited (ADR-012).

## Failure notes

- Blind replay of money side effects is forbidden.
- If journal already exists, replay must no-op.

## Related

LikeC4: `dlqReplay`.
