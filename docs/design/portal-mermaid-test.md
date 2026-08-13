# Portal Mermaid Test

Temporary design page to prove Mermaid rendering in the custom architecture portal.

Detailed Mermaid diagrams **supplement** LikeC4 model-driven views; they do not replace them.

## Sequence diagram

Bill submission and payment request handoff:

```mermaid
sequenceDiagram
    participant M as Merchant
    participant S as Sparelane
    participant P as PSP

    M->>S: Submit bill
    S-->>M: Bill accepted
    S->>P: Payment request
    P-->>S: Payment result
```

## State diagram

Simplified Payment Workflow states (illustrative — authoritative state machine is in LikeC4 and `docs/payments/`):

```mermaid
stateDiagram-v2
    [*] --> Scheduled
    Scheduled --> InProgress: due / retry now
    InProgress --> Collected: success
    InProgress --> SoftDeclined: soft decline
    SoftDeclined --> InProgress: backup / retry
    InProgress --> Failed: hard decline / exhausted
    Collected --> [*]
    Failed --> [*]
```
