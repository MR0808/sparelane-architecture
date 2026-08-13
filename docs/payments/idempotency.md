# Payment Idempotency Model

Sparelane must tolerate duplicate requests and events without collecting funds twice or creating duplicate payment workflows.

Idempotency is separate from event ordering. Events may also arrive late or out of order; handlers must be safe under both duplication and reordering.

## 1. Merchant bill ingestion

### Risk

Duplicate merchant API requests for the same bill could create multiple bills/payment workflows and multiple collection journeys.

### Approach

Bill Validation is responsible for idempotent acceptance before Bill Service persistence.

Conceptual uniqueness inputs (exact schema TBD):

- merchant identity
- merchant bill / invoice reference
- optional client idempotency key
- amount / due date consistency checks as product requires

### Expected behaviour

- First valid submission creates the bill projection and payment workflow.
- Duplicate submission returns the existing bill/workflow outcome without creating a second workflow.
- Conflicting reuse of an idempotency key with different payload is rejected.

## 2. Payment commands

### Risk

Repeated execution of the same payment command could collect funds twice.

Sources include:

- duplicated queue/domain-event delivery
- network timeout followed by client/worker retry
- worker restart after partial progress
- webhook race with a command retry
- merchant or consumer manual retry storms

### Approach

Payment Orchestrator command handling must be idempotent per workflow action.

Conceptual protections:

- stable command/idempotency keys for orchestrator actions
- Payment State Machine rejects illegal re-entry (for example another capture while already `COLLECTED`)
- Payment Attempt Service records provider references so duplicate provider submissions can be detected/reconciled
- adapters should use provider-safe idempotency keys where supported

### Expected behaviour

- Replaying a command after success is a no-op or returns the prior result.
- Replaying a command while an attempt is in flight does not create an uncontrolled second capture.
- Manual "Retry now" creates a deliberate new attempt only when workflow state permits it.

## 3. Provider webhooks

### Risk

Provider events may:

- arrive more than once
- arrive out of order
- be delayed relative to synchronous API responses

### Approach

Webhook Ingress verifies authenticity, then publishes an internal event. Orchestrator / attempt updates must be safely repeatable.

Conceptual protections:

- deduplicate by provider event id / payment reference where available
- apply attempt transitions only if compatible with current attempt state
- ignore stale events that cannot legally change state (for example decline after already `CAPTURED`, subject to dispute/chargeback being out of Phase 2 scope)
- persist raw provider references for audit without storing PAN/CVV

### Expected behaviour

- Duplicate success webhook does not double-ledger collection.
- Out-of-order decline after captured success does not silently rewind `COLLECTED` in Phase 2 payment design.
- Delayed events remain processable after worker restarts.

## Explicit non-goals for Phase 2

- Final database unique-index design
- Specific PSP idempotency header names
- Chargeback/dispute reverse flows
- Settlement instruction idempotency (Phase 3)

## Related docs

- [Payment state machine](payment-state-machine.md)
- [Retry policy](retry-policy.md)
- [Payment lifecycle](payment-lifecycle.md)
- [ADR-003 — Workflow vs Attempt](../decisions/ADR-003-payment-workflow-vs-attempt.md)
