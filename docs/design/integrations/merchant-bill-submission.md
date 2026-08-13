---
id: SEQ-INT-001
title: Merchant Bill Submission
type: sequence
area: integrations
status: accepted
mvp: true
likec4:
  - billSubmission
requirements:
  - FUN-BIL-001
  - FUN-MER-003
  - FUN-BIL-002
adrs:
  - ADR-007
  - ADR-008
  - ADR-017
tests:
  - INT-API-001
  - E2E-PAY-001
---

# Merchant Bill Submission

## Purpose

Merchant submits a recurring bill via Merchant API. Acknowledgement means bill accepted, not payment collected. Async payment reliability begins after acceptance.

## Preconditions

- Valid merchant API credential and bill scope.
- Eligible consumer connection.
- Idempotency key on request.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant MB as Merchant Billing
    participant MBE as Merchant Backend
    participant API as Merchant API
    participant Keys as Merchant API Keys
    participant Val as Bill Validation
    participant BS as Bill Service
    participant ODB as Operational DB
    participant Bus as Event Bus

    MB->>MBE: Bill becomes payable
    MBE->>API: Submit bill + idempotency key
    API->>Keys: Validate merchant API credential
    API->>Val: Validate payload, connection, idempotency
    Val->>BS: Create bill when unique
    BS->>ODB: Persist bill + Payment Workflow
    API-->>MBE: Acknowledge bill accepted (not collected)
    BS->>Bus: BillCreated — async payment lifecycle begins

    Note over API,MBE: accepted != COLLECTED
```

## Important invariants

- Merchant remains billing SoR; Sparelane holds a projection for collection.
- Acceptance starts reliability workflow asynchronously.

## Failure notes

- Auth/validation failures return before persistence.
- Duplicates handled in SEQ-INT-002.

## Related

LikeC4: `billSubmission`. Also SEQ-PAY-001.
