# Commands and Events Catalogue

Names are internal implementation vocabulary. External webhook type names remain curated separately ([ADR-023](../decisions/ADR-023-curated-external-events.md)).

## Key commands

| Command | Module | Notes |
| --- | --- | --- |
| `CreateBill` | Bills | Idempotent; creates workflow |
| `StartPaymentWorkflow` | Payment Workflows | Usually implied by CreateBill |
| `PerformPreauthorisation` | Payment Workflows | Where rail supports |
| `ExecutePaymentAttempt` | Payment Workflows / Attempts | Creates attempt + PSP call |
| `SchedulePaymentRetry` | Payment Workflows / Retry Service | ADR-025 timing → ScheduledJob |
| `HandlePaymentRetryDue` | Payment Orchestrator | Reload; budget/cutoff; new attempt + execute cmd |
| `ConsumerRetryNow` | Payment Orchestrator | ADR-025 ordinal consume + cancel job |
| `EvaluateRecoveryCutoff` | Payment Orchestrator / Retry Service | cutoffAt → FAILED when guards clear |
| `ApplyProviderPaymentResult` | Payment Workflows | From verified provider event |
| `PostCollectionLedgerEntry` | Ledger | Idempotent by `business_reference`; MVP legs per ADR-026 |
| `ConfirmLedgerPosting` | Payment Workflows / Ops | PENDING → CONFIRMED after durable journal |
| `CreateSettlement` | Settlement | After `LedgerPostingConfirmed`; 1:1 workflow; initial PENDING ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)) |
| `EvaluateSettlementEligibility` | Settlement | PENDING → ELIGIBLE when merchant/KYB/journal gates pass; else remain PENDING |
| `CreateSettlementInstruction` | Settlement | F1: 1:1 Settlement; amount = Settlement gross ([ADR-028](../decisions/ADR-028-settlement-execution-payout-destination-instruction-idempotency.md)) |
| `ExecuteSettlementInstruction` | Settlement | Provider submit outside TX; idempotency key = instruction business_reference |
| `SubmitSettlementInstruction` | Settlement | Alias/legacy name for execute path — prefer `ExecuteSettlementInstruction` |
| `LookupSettlementInstruction` | Settlement | Unknown-outcome / recovery lookup (same key) |
| `ReconcileSettlement` | Reconciliation / Settlement | F2+; SETTLED only after evidence |
| `DeliverMerchantWebhook` | Webhooks | Signed delivery |
| `NotifyConsumer` | Notifications | Email/SMS |

## Important domain events (internal)

| Event | Meaning |
| --- | --- |
| `BillAccepted` | Bill + workflow persisted |
| `PaymentWorkflowStarted` | Workflow active |
| `PaymentAttemptCreated` | New attempt |
| `PaymentAttemptDeclined` | Declined with classification |
| `PaymentRetryScheduled` | Durable retry job accepted |
| `PaymentRetryDue` | Scheduled retry time reached |
| `PaymentCollected` | Workflow COLLECTED (+ outbox for ledger); trigger for ADR-026 posting |
| `PaymentFailed` | Terminal workflow failure |
| `LedgerPostingConfirmed` | Journal durable + operational CONFIRMED; settlement-worker may create Settlement |
| `SettlementCreated` | Settlement row exists at PENDING (obligation recorded) |
| `SettlementEligible` | PENDING → ELIGIBLE; F1 may create/execute instruction |
| `SettlementInstructionCreated` | Instruction CREATED (not yet provider-accepted) |
| `SettlementSubmitted` | ELIGIBLE → SUBMITTED after provider accepted **or** unknown hold; **not** SETTLED; F1 handoff |
| `SettlementSettled` | Confirmed + reconciled (F2+) |
| `SettlementFailed` | External failure; payment remains COLLECTED |
| `WebhookDeliveryFailed` | Delivery attempt failed / terminal |

Internal names need not equal merchant webhook types (`payment.collected`, etc.).

F1 does **not** emit batch events (`BatchCreated`, etc.).
