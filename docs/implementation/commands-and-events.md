# Commands and Events Catalogue

Names are internal implementation vocabulary. External webhook type names remain curated separately ([ADR-023](../decisions/ADR-023-curated-external-events.md)).

## Key commands

| Command | Module | Notes |
| --- | --- | --- |
| `CreateBill` | Bills | Idempotent; creates workflow |
| `StartPaymentWorkflow` | Payment Workflows | Usually implied by CreateBill |
| `PerformPreauthorisation` | Payment Workflows | Where rail supports |
| `ExecutePaymentAttempt` | Payment Workflows / Attempts | Creates attempt + PSP call |
| `SchedulePaymentRetry` | Payment Workflows | Retry Service timing |
| `ApplyProviderPaymentResult` | Payment Workflows | From verified provider event |
| `PostCollectionLedgerEntry` | Ledger | Idempotent by business_reference |
| `ConfirmLedgerPosting` | Payment Workflows / Ops | Marks posting confirmed |
| `CreateSettlement` | Settlement | After ledger confirmation |
| `SubmitSettlementInstruction` | Settlement | Provider idempotency |
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
| `PaymentCollected` | Workflow COLLECTED (+ outbox for ledger) |
| `PaymentFailed` | Terminal workflow failure |
| `LedgerPostingConfirmed` | Journal posted; settlement may become eligible |
| `SettlementEligible` | Payable verified |
| `SettlementSubmitted` | Instruction submitted |
| `SettlementSettled` | Confirmed + reconciled |
| `SettlementFailed` | Failed; payment remains COLLECTED |
| `WebhookDeliveryFailed` | Delivery attempt failed / terminal |

Internal names need not equal merchant webhook types (`payment.collected`, etc.).
