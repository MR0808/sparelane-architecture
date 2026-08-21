---
id: SEQ-OPS-001
title: Payment Provider Timeout
type: sequence
area: operations
status: accepted
mvp: true
likec4:
  - paymentProviderTimeout
requirements:
  - INT-PSP-001
  - NFR-REL-002
  - NFR-REL-004
adrs:
  - ADR-002
  - ADR-017
  - ADR-024
tests:
  - OPS-REC-001
  - INT-PSP-001
---

# Payment Provider Timeout

## Purpose

PSP timeout yields unknown outcome. Do **not** blindly duplicate the payment request; reconcile via provider query or verified webhook before safe workflow continuation ([ADR-024](../../decisions/ADR-024-payment-recovery-ordering-and-exhaustion.md)).

## Preconditions

- Payment Attempt submitted to Card Adapter / PSP.
- Transport timeout or ambiguous non-response.

## Mermaid

```mermaid
sequenceDiagram
    autonumber
    participant W as Payment Worker
    participant Orch as Payment Orchestrator
    participant Card as Card Adapter
    participant PSP as Card Adapter / PSP
    participant ODB as Operational DB
    participant WH as Webhook Ingress
    participant Bus as Event Bus

    W->>Orch: Execute payment attempt
    Orch->>Card: Initiate provider call
    Card->>PSP: Authorise / capture
    PSP--xCard: Timeout / unknown outcome
    Orch->>ODB: Record attempt unknown — no blind duplicate
    Note over Orch: ADR-024 - remain PAYMENT_PENDING - no backup - no FAILED or COLLECTED

    alt Provider query available
        Orch->>PSP: Reconcile via provider query
        PSP-->>Orch: Actual outcome
    else Await verified webhook
        PSP->>WH: Later provider webhook
        WH->>Bus: Verified provider event
        Bus->>Orch: Safe workflow continuation
    end

    Note over Orch,PSP: Never invent a second charge while outcome unknown
```

## Important invariants

- No blind duplicate payment submission.
- Unknown remains unknown until query or verified webhook.
- Idempotent provider keys used where supported.
- Workflow stays `PAYMENT_PENDING` while reconciliation is pending (no new workflow enum).
- After reconcile, apply ADR-024 to the resolved outcome.

## Failure notes

- Prolonged unknown → ops escalation; may move attempt to ERROR only under policy after reconcile.

## Related

LikeC4: `paymentProviderTimeout`. Parallel to SEQ-MONEY-005 for settlement. ADR-024.
