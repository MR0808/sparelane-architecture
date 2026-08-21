---
id: SEQ-PAY-001
title: Bill Ingestion
type: sequence
area: payments
status: accepted
mvp: true
likec4:
  - billIngestion
  - billSubmission
requirements:
  - FUN-BIL-001
  - FUN-BIL-002
  - FUN-MER-003
adrs:
  - ADR-007
  - ADR-008
  - ADR-017
tests:
  - INT-API-001
---

# Bill Ingestion

## Purpose

Show how a merchant bill enters Sparelane: authentication, validation, idempotency, bill persistence, Payment Workflow creation, and outbox publication. Acceptance means the bill is accepted for collection — not that funds are collected.

## Preconditions

- Merchant has a valid API credential with bill-submit scope.
- Consumer–merchant connection exists and is eligible for billing.
- Idempotency key supplied on the submit request.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant MB as Merchant Billing
    participant MBE as Merchant Backend
    participant API as Merchant API
    participant Auth as Merchant API Keys
    participant Val as Bill Validation
    participant BS as Bill Service
    participant ODB as Operational DB
    participant OB as Outbox Publisher

    MB->>MBE: Bill / invoice becomes payable
    MBE->>API: Submit recurring bill + idempotency key
    API->>Auth: Authenticate credential
    Auth-->>API: Merchant context + scopes
    API->>Val: Validate ownership, connection, payload
    Val->>Val: Check idempotency key

    alt New unique key
        Val->>BS: Create bill
        BS->>ODB: Persist bill + Payment Workflow (CREATED / SCHEDULED)
        BS->>OB: Write BillAccepted outbox
        OB-->>BS: Outbox committed atomically
        API-->>MBE: 201 Created (accepted for processing, not collected)
    else Duplicate key (same fingerprint)
        Val->>BS: Load existing bill / workflow
        API-->>MBE: Replay existing accepted result
    end

    Note over API,MBE: accepted != COLLECTED — settlement not started
```

## Important invariants

- Bill accepted does not imply payment collected or merchant settled.
- Duplicate idempotency context with matching fingerprint must not create a second Payment Workflow.
- BillAccepted is published via transactional outbox with the operational write.

## Failure notes

- Auth or scope failure → reject before bill creation.
- Validation failure → reject; no workflow.
- Same key with mismatched fingerprint → conflict (see SEQ-INT-002).

## Related

LikeC4: `billIngestion`, `billSubmission`. ADRs and requirements in frontmatter.
