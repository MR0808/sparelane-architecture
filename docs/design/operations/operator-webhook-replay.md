---
id: SEQ-OPS-005
title: Operator webhook replay
type: sequence
area: operations
status: accepted
mvp: true
likec4:
  - dlqReplay
requirements:
  - FUN-ADM-008
  - NFR-SEC-011
  - NFR-OPS-006
adrs:
  - ADR-030
  - ADR-033
  - ADR-034
tests:
  - ADM-REPLAY-001
  - ADM-REPLAY-002
  - ADM-REPLAY-004
  - ADM-REPLAY-005
  - ADM-REPLAY-006
  - WH-REPLAY-001
---

# Operator webhook replay

## Purpose

Closed-catalogue merchant webhook replay: single admin + recent MFA + reason creates `OperatorReplayRequest` (`rpl_…`). notification-worker appends a new delivery attempt on the same `WebhookDelivery`, preserving `evt_` and body with a fresh HMAC. No financial handlers. No automatic retry budget restart.

## Preconditions

- Durable DLQ item `OPEN` for `merchant.webhook.delivery`
- Endpoint `ACTIVE`
- Admin has `admin.webhook.replay` and MFA ≤15 minutes

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant Admin as Sparelane Admin
    participant Portal as Admin Portal
    participant BFF as Admin BFF
    participant AuthZ as Authorisation
    participant ODB as Operational DB
    participant Outbox as Transactional Outbox
    participant NW as Notification Worker
    participant Merch as Merchant Endpoint
    participant Aud as Audit Service

    Admin->>Portal: Request webhook replay with reason
    Portal->>BFF: POST /admin/v1/dead-letters/dlq_/replay
    BFF->>AuthZ: Require admin.webhook.replay and fresh MFA
    alt MFA stale or reason invalid or not webhook-eligible
        BFF->>Aud: Audit deny
        BFF-->>Portal: Rejected
    else accepted
        BFF->>ODB: Create OperatorReplayRequest rpl_ execute-once
        BFF->>ODB: DeadLetterItem REPLAY_REQUESTED
        BFF->>Outbox: Enqueue ReplayWebhookDelivery
        BFF->>Aud: Audit replay requested
        BFF-->>Portal: Accepted rpl_
        Outbox->>NW: Deliver ReplayWebhookDelivery
        NW->>ODB: Claim rpl_ executing and DLQ REPLAYING
        NW->>ODB: Load WebhookDelivery Event Endpoint
        alt endpoint not ACTIVE
            NW->>ODB: Fail rpl_ and DLQ REPLAY_FAILED
            NW->>Aud: Audit deny or fail revoked endpoint
        else ACTIVE
            NW->>ODB: Append attempt number max plus one
            NW->>Merch: HTTPS POST same evt_ body fresh HMAC
            alt HTTP 2xx
                NW->>ODB: Delivery SUCCEEDED DLQ RESOLVED rpl_ succeeded
                NW->>Aud: Audit replay succeeded
            else network or non-2xx
                NW->>ODB: Attempt FAILED delivery remains FAILED
                NW->>ODB: rpl_ failed DLQ REPLAY_FAILED then OPEN
                NW->>Aud: Audit replay failed
                Note over NW: No automatic 5-attempt restart
            end
        end
    end
```

## Postconditions

- Same `evt_` and delivery identity preserved
- At-least-once transport; merchant dedupe required
- No Bill / Payment / Settlement / Ledger mutation

## Failure modes

- Concurrent second active `rpl_` for same DLQ denied
- Financial/notification replay paths must not enter this sequence
