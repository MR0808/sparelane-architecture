# Implementation Modules

Modules map to approved logical boundaries. Each exposes an explicit API even when co-deployed.

| Module | Responsibility | Owned entities (conceptual) | Accepts | Emits | May call | Must not |
| --- | --- | --- | --- | --- | --- | --- |
| **Identity** | Authn sessions, MFA hooks, credential verification | users, sessions (or IdP refs) | Login/session commands | Auth security audit events | Secrets, IdP adapter | Payment/ledger/settlement |
| **Consumers** | Consumer profiles | consumers | Profile CRUD | ConsumerUpdated | Identity | Ledger writes; settlement |
| **Merchants** | Merchant org, memberships, timezone | merchants, memberships | Onboarding/config | MerchantUpdated | KYC adapter, Object storage | Payment attempt mutation |
| **Merchant Integrations** | Integration config, API keys metadata, webhook endpoints | integrations, api_credentials, webhook_endpoints | ConfigureIntegration, IssueCredential | CredentialIssued/Revoked | Secrets, Audit | Workflow internals; ledger |
| **Bills** | Bill ingestion/idempotency | bills | CreateBill | BillAccepted | Connections, Outbox | Direct PSP calls; ledger |
| **Payment Workflows** | Workflow state machine / orchestration entry | payment_workflows | Start/advance workflow | Workflow state events | Attempts, Reliability, Risk, Outbox | Settlement provider; ledger writes (posts via outbox) |
| **Payment Attempts** | Immutable attempt history | payment_attempts | Create/update attempt result | AttemptCreated/Completed | Payment Methods, PSP adapter | Settlement; merchant billing SoR |
| **Reliability Engine** | Next eligible method selection | (reads priorities) | SelectNextMethod | — (query) | Payment Methods | Execute payments; write ledger |
| **Payment Methods** | Token refs + priority | payment_methods, priorities | AddMethod, Reorder | MethodAdded | PSP tokenisation adapter | Store PAN/CVV |
| **Wallet** | Optional wallet metadata/reservations | wallets, reservations | Reserve/release | Wallet events | Ledger (posts via ledger module) | Direct journal mutation; CHD |
| **Ledger** | Sole financial journal writer | ledger_accounts, journal_* | PostCollection, PostSettlement, Compensate | LedgerPostingConfirmed | Operational confirmation update | Payment attempt mutation; PSP |
| **Settlement** | Settlement lifecycle; F0: create PENDING + evaluate ELIGIBLE ([ADR-027](../decisions/ADR-027-settlement-obligation-eligibility-cardinality.md)) | settlements, batches, instructions | CreateSettlement, EvaluateSettlementEligibility, Submit/Reconcile (later) | SettlementCreated, SettlementEligible, Settlement* | Ledger (read obligation), Merchant/KYB port, Outbox; later Settlement adapter | Mutate payment attempts; reverse COLLECTED on partner outage; invent fee netting in F0 |
| **Reconciliation** | Match settlement/ledger/merchant refs | reconciliation records | ReconcileSettlement | ReconciliationMatched/Mismatch | Ledger, Settlement | Create payments |
| **Webhooks** | Curated outbound merchant events | webhook_events, delivery_attempts | DeliverWebhook | DeliverySucceeded/Failed | Integrations, Secrets (signing) | Internal event bus dump to merchants |
| **Notifications** | Email/SMS | notification prefs/templates | NotifyConsumer | NotificationQueued | Email/SMS adapters | Financial state mutation |
| **Risk** | Risk/fraud checks | risk decisions (minimal) | EvaluatePaymentRisk | RiskEvaluated | Fraud signals | Bypass authz; execute rails |
| **Audit** | Append-only audit | audit_events | RecordAudit | — | Audit DB | Log secrets/CHD |
| **Outbox / Events** | Transactional outbox + publish | outbox_events | Enqueue (same TX), Publish | Domain events on bus | Operational DB, Event Bus | Business decisions from publish alone |
