---
id: SEQ-INT-002
title: Duplicate Bill Submission
type: sequence
area: integrations
status: accepted
mvp: true
likec4:
  - duplicateBillSubmission
requirements:
  - FUN-BIL-002
  - FUN-MER-003
adrs:
  - ADR-008
  - ADR-017
tests:
  - INT-API-001
---

# Duplicate Bill Submission

## Purpose

Merchant safely retries after uncertainty (e.g. response lost). Same idempotency key + matching fingerprint returns the existing result. Mismatched fingerprint is a conflict.

## Preconditions

- Prior successful accept for the same merchant + idempotency key (fingerprint match case).
- Or a retry with same key but different body (conflict case).

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant MBE as Merchant Backend
    participant API as Merchant API
    participant Keys as Merchant API Keys
    participant Val as Bill Validation
    participant BS as Bill Service

    MBE->>API: Submit bill (first) — accepted
    Note over MBE: Response lost / timeout — merchant retries

    MBE->>API: Retry same request + same idempotency key
    API->>Keys: Authenticate
    API->>Val: Detect existing idempotency context

    alt Fingerprint match
        Val->>BS: Load existing bill / workflow
        API-->>MBE: Replay existing accepted result
        Note over BS: No duplicate Payment Workflow
    else Fingerprint mismatch
        Val-->>API: Conflict — key reused with different payload
        API-->>MBE: 409 Conflict
    end
```

## Important invariants

- Same key + same fingerprint → idempotent replay; one workflow.
- Same key + different fingerprint → reject; do not silently overwrite.

## Failure notes

- Merchant must not mint a new key for a true retry of the same logical submit.

## Related

LikeC4: `duplicateBillSubmission`. ADR-008.
