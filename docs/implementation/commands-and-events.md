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
| `LookupSettlementInstruction` | Settlement | Provider port used by unknown recovery and inside `ReconcileSettlement` (same key; never submit) |
| `ReconcileSettlement` | Settlement | F2: finality → optional PROCESSING / payout journal + SETTLED / FAILED / hold ([ADR-029](../decisions/ADR-029-settlement-finality-reconciliation-payout-accounting.md)) |
| `ProjectMerchantWebhook` | Webhooks | Idempotent curated projection; closed catalogue ([ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md)) |
| `DeliverMerchantWebhook` | Webhooks | Signed HTTP outside TX; same `evt_` on retry |
| `AddConsumerNotificationContact` | Notifications | Portal: add email → `PENDING` ([ADR-031](../decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md)) |
| `VerifyConsumerNotificationContact` | Notifications | Verification → `ACTIVE` |
| `SetDefaultConsumerNotificationContact` | Notifications | Explicit default per channel |
| `DisableConsumerNotificationContact` / `RevokeConsumerNotificationContact` | Notifications | Lifecycle |
| `ProjectConsumerNotification` | Notifications | Idempotent closed mapping → intent row |
| `DeliverConsumerNotification` | Notifications | EmailProvider call outside TX |
| `NotifyConsumer` | Notifications | **Legacy alias** — prefer Project + Deliver |

## Admin read queries (H0 — no mutations)

Internal BFF vocabulary for `/admin/v1/*`. All require active `PlatformAdminGrant` + closed read capability ([ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md)).

| Query | Capability | Notes |
| --- | --- | --- |
| `GetAdminOperationalSnapshot` | `admin.dashboard.view` | DB readiness, outbox backlog, scheduler lag, high-level error metrics — not public `/health` |
| `GetAdminMerchantByPublicId` | `admin.merchant.view` | Exact `mrc_…` only |
| `GetAdminConsumerByPublicId` | `admin.consumer.view` | Exact `con_…` only — no email search |
| `GetAdminBillByPublicId` | `admin.bill.view` | Exact bill public ID |
| `GetAdminPaymentWorkflowByPublicId` | `admin.payment.view` | Safe operational projection |
| `GetAdminSettlementByPublicId` | `admin.settlement.view` | No payout destination ref |
| `QueryAdminAuditEvents` | `admin.audit.view` | Paginated read-only |
| `QueryAdminSecurityEvents` | `admin.security_event.view` | Paginated read-only |

No H0 commands for grant changes, suspensions, replays, or financial corrections.

## Admin privileged commands (H1 Option A — grant management only)

Session BFF `POST /admin/v1/*` only. Require active `PlatformAdminGrant` + `admin.grant.manage` + recent MFA + dual-control workflow ([ADR-033](../decisions/ADR-033-privileged-admin-grant-management-and-approval.md)).

| Command | Notes |
| --- | --- |
| `RequestPrivilegedAction` | Create `PrivilegedActionRequest` for `admin.grant.create` \| `admin.grant.revoke`; reason + fingerprint; → `pending` |
| `ApprovePrivilegedAction` | Approver ≠ requester; recent MFA; → `approved` or `denied` |
| `ExecutePrivilegedAction` | Apply grant create/revoke once; recent MFA; → `executed` or `failed` |
| `CancelPrivilegedAction` | Optional MVP; cancel `approved` pre-execute if product implements |

No H1 commands for merchant suspend, user disable, DLQ/webhook/notification/financial replay, or financial corrections.

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
| `SettlementSubmitted` | ELIGIBLE → SUBMITTED after provider accepted **or** unknown hold; **not** SETTLED; enqueues F2 `ReconcileSettlement` |
| `SettlementSettled` | SUBMITTED/PROCESSING → SETTLED after ADR-029 finality + payout journal; outbox with transition |
| `SettlementFailed` | External failure (F1 reject or F2 reconcile `failed`); payment remains COLLECTED |
| `MerchantWebhookProjected` | WebhookEvent persisted; deliveries may be created |
| `WebhookDelivered` | Logical delivery SUCCEEDED (2xx) |
| `WebhookDeliveryFailed` | Attempt failed / delivery exhausted FAILED |
| `WebhookDeliveryCancelled` | Endpoint not ACTIVE; no HTTP |
| `ConsumerNotificationContactAdded` | Contact row created |
| `ConsumerNotificationContactVerified` | Contact ACTIVE |
| `ConsumerNotificationProjected` | Intent persisted |
| `ConsumerNotificationDelivered` | Provider accepted email |
| `ConsumerNotificationDeliveryFailed` | Exhausted / rejected |
| `ConsumerNotificationSkipped` | No ACTIVE destination |
| `NotificationQueued` | **Legacy** — prefer explicit consumer notification events |

Internal names need not equal merchant webhook types (`payment.collected`, etc.). Closed merchant catalogue: [ADR-030](../decisions/ADR-030-merchant-webhook-contract-signing-and-delivery.md). Consumer notifications: [ADR-031](../decisions/ADR-031-consumer-notification-contact-channel-and-delivery-policy.md).

F1 does **not** emit batch events (`BatchCreated`, etc.).
