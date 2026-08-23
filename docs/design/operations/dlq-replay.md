---
id: SEQ-OPS-003
title: Durable DLQ creation and inspection
type: sequence
area: operations
status: accepted
mvp: true
likec4:
  - dlqReplay
requirements:
  - NFR-REL-004
  - NFR-REL-006
  - FUN-ADM-007
adrs:
  - ADR-017
  - ADR-034
tests:
  - ADM-DLQ-001
  - ADM-DLQ-002
  - OPS-REC-002
---

# Durable DLQ creation and inspection

## Purpose

After bounded automatic retries exhaust, operations persists a durable `DeadLetterItem`. Admins inspect safe metadata. Financial items are inspect-only. Webhook items may later enter closed replay (SEQ-OPS-005). Blind financial replay is prohibited.

## Preconditions

- Async work exhausted automatic handling
- Admin has `admin.dlq.view` for inspection

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant W as Worker
    participant ODB as Operational DB
    participant Admin as Sparelane Admin
    participant Portal as Admin Portal
    participant BFF as Admin BFF
    participant Aud as Audit Service

    W->>ODB: Persist exhaustion outcome on authoritative domain row
    W->>ODB: Create or update DeadLetterItem OPEN dlq_
    Note over W,ODB: Pointer reference only - no secret payload dump
    Admin->>Portal: Open /admin/dlq
    Portal->>BFF: GET /admin/v1/dead-letters
    BFF->>ODB: List safe DLQ metadata
    BFF-->>Portal: work type, source ids, status, eligibility
    alt financial or notification work
        Note over Portal: Manual replay prohibited - domain recovery only
    else merchant.webhook.delivery
        Note over Portal: Eligible for closed webhook replay SEQ-OPS-005
    end
    BFF->>Aud: Optional read audit if required by policy
```

## Postconditions

- Durable DLQ evidence exists and survives restart
- No financial command executed from inspection
- No raw secrets exposed in admin views

## Failure modes

- Duplicate exhaustion redelivery must not create a second logical `(work_type, source_identity)` row
- Missing capability denies list/detail
