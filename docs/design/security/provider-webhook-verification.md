---
id: SEQ-SEC-002
title: Provider Webhook Verification
type: sequence
area: security
status: accepted
mvp: true
likec4:
  - providerWebhookVerification
requirements:
  - INT-PSP-003
  - INT-PSP-005
  - NFR-SEC-003
  - NFR-SEC-004
adrs:
  - ADR-010
  - ADR-011
  - ADR-017
tests:
  - INT-PSP-001
  - SEC-AUTH-001
---

# Provider Webhook Verification

## Purpose

Provider webhooks are untrusted until signature, replay, and idempotency checks succeed. Invalid signatures are rejected and audited; only verified events become trusted internal domain events.

## Preconditions

- Provider webhook signing secret available via secrets management.
- Ingress endpoint reachable.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant PSP as Card Adapter / PSP
    participant WH as Webhook Ingress
    participant Sec as Secrets
    participant ODB as Operational DB
    participant Bus as Event Bus
    participant Aud as Audit Service

    PSP->>WH: Deliver signed provider webhook
    WH->>Sec: Load provider verification secret
    WH->>ODB: Validate timestamp / replay + event idempotency

    alt Valid signature and checks
        WH->>Bus: Publish trusted internal event
    else Invalid signature / replay / bad checks
        WH->>Aud: Reject and audit / monitor
        WH-->>PSP: 4xx reject
        Note over WH,Bus: No trusted domain event published
    end
```

## Important invariants

- Unverified webhooks must not mutate payment/settlement state.
- Reject path is audited.
- Idempotent handling of duplicate valid events.

## Failure notes

- Secret rotation must not drop verification (dual-secret window as designed).

## Related

LikeC4: `providerWebhookVerification`.
