---
id: PORTAL-MERMAID-TEST
title: Portal Mermaid Rendering Test
type: sequence
area: portal
status: portal-test
mvp: false
likec4: []
requirements: []
adrs: []
tests: []
renderingTest: true
---

# Portal Mermaid Rendering Test

Portal regression fixture to prove Mermaid rendering in the custom architecture portal. **Not** a primary engineering design artefact.

Detailed Mermaid diagrams in `docs/design/` supplement LikeC4 model-driven views; they do not replace them. LikeC4 remains the architecture source of truth.

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

Simplified Payment Workflow states (illustrative — authoritative state machine is in LikeC4 and `docs/design/payments/payment-workflow-state.md`):

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
