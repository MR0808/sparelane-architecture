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
| `SubmitSettlementInstruction` | Settlement | Provider idempotency (post-F0) |
| `ReconcileSettlement` | Reconciliation / Settlement | |
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
| `SettlementEligible` | PENDING → ELIGIBLE; domain-ready for later batch/instruction |
| `SettlementSubmitted` | Instruction submitted |
| `SettlementSettled` | Confirmed + reconciled |
| `SettlementFailed` | External failure; payment remains COLLECTED |
| `WebhookDeliveryFailed` | Delivery attempt failed / terminal |

Internal names need not equal merchant webhook types (`payment.collected`, etc.).
