---
title: Mermaid Engineering Design Catalogue
status: accepted
---

# Mermaid Engineering Design Catalogue

**LikeC4 is the architecture source of truth** (structure, containers, dynamic views). **Mermaid diagrams here supplement detailed behaviour** (sequences, legal state transitions) and must stay aligned with LikeC4 views and approved state machines in `docs/schema/`, `docs/payments/`, and `docs/money/`.

Do not invent requirement, test, view, or ADR IDs — frontmatter on each design file is canonical for traceability.

---

## Payments

| ID | Title | Status | LikeC4 views |
| --- | --- | --- | --- |
| [SEQ-PAY-001](payments/bill-ingestion.md) | Bill Ingestion | accepted | `billIngestion`, `billSubmission` |
| [SEQ-PAY-002](payments/preauthorisation.md) | Pre-authorisation | accepted | `preAuthorisation` |
| [SEQ-PAY-003](payments/primary-card-success.md) | Primary Card Success | accepted | `primaryCardSuccess`, `paymentLifecycle` |
| [SEQ-PAY-004](payments/backup-recovery.md) | Backup Recovery | accepted | `backupRecovery` |
| [SEQ-PAY-005](payments/scheduled-retry.md) | Scheduled Retry | accepted | `scheduledRetry` |
| [SEQ-PAY-006](payments/complete-failure.md) | Complete Failure | accepted | `completeFailure` |
| [SEQ-PAY-007](payments/consumer-retry-now.md) | Consumer Retry Now | accepted | `consumerRetryNow` |

## Money Movement

| ID | Title | Status | LikeC4 views |
| --- | --- | --- | --- |
| [SEQ-MONEY-001](money/collection-to-ledger.md) | Collection to Ledger | accepted | `collectionToLedger` |
| [SEQ-MONEY-002](money/merchant-settlement.md) | Merchant Settlement | accepted | `merchantSettlement` |
| [SEQ-MONEY-003](money/settlement-confirmation.md) | Settlement Confirmation | accepted | `settlementConfirmation` |
| [SEQ-MONEY-004](money/settlement-failure.md) | Settlement Failure | accepted | `settlementFailure` |
| [SEQ-MONEY-005](money/unknown-settlement-outcome.md) | Unknown Settlement Outcome | accepted | `unknownSettlementOutcome` |
| [SEQ-MONEY-006](money/merchant-reconciliation.md) | Merchant Reconciliation | accepted | `merchantReconciliationFlow` |

## Integrations

| ID | Title | Status | LikeC4 views |
| --- | --- | --- | --- |
| [SEQ-INT-001](integrations/merchant-bill-submission.md) | Merchant Bill Submission | accepted | `billSubmission` |
| [SEQ-INT-002](integrations/duplicate-bill-submission.md) | Duplicate Bill Submission | accepted | `duplicateBillSubmission` |
| [SEQ-INT-003](integrations/merchant-webhook-delivery.md) | Merchant Webhook Delivery | accepted | `merchantWebhookDelivery` |
| [SEQ-INT-004](integrations/merchant-webhook-retry.md) | Merchant Webhook Retry | accepted | `merchantWebhookRetry` |

## Security

| ID | Title | Status | LikeC4 views |
| --- | --- | --- | --- |
| [SEQ-SEC-001](security/add-tokenised-card.md) | Add Tokenised Card | accepted | — |
| [SEQ-SEC-002](security/provider-webhook-verification.md) | Provider Webhook Verification | accepted | `providerWebhookVerification` |
| [SEQ-SEC-003](security/merchant-api-authentication.md) | Merchant API Authentication | accepted | — |
| [SEQ-SEC-004](security/admin-privileged-action.md) | Admin Privileged Action | accepted | — |
| [SEQ-SEC-005](security/admin-read-only-control-plane.md) | Admin Read-Only Control Plane | accepted | — |
| [SEQ-SEC-006](security/admin-grant-dual-control.md) | Admin Grant Dual-Control | accepted | — |

## Data

| ID | Title | Status | LikeC4 views |
| --- | --- | --- | --- |
| [SEQ-DATA-001](data/successful-payment-data-path.md) | Successful Payment Data Path | accepted | — |
| [SEQ-DATA-002](data/consumer-deletion.md) | Consumer Deletion | accepted | — |
| [SEQ-DATA-003](data/merchant-offboarding.md) | Merchant Offboarding | accepted | — |

## Operations

| ID | Title | Status | LikeC4 views |
| --- | --- | --- | --- |
| [SEQ-OPS-001](operations/payment-provider-timeout.md) | Payment Provider Timeout | accepted | `paymentProviderTimeout` |
| [SEQ-OPS-002](operations/ledger-posting-recovery.md) | Ledger Posting Recovery | accepted | `ledgerPostingRecovery` |
| [SEQ-OPS-003](operations/dlq-replay.md) | DLQ Replay | accepted | `dlqReplay` |
| [SEQ-OPS-004](operations/settlement-provider-outage.md) | Settlement Provider Outage | accepted | `settlementProviderOutage` |

## State Models

| ID | Title | Status | LikeC4 views |
| --- | --- | --- | --- |
| [STATE-PAY-001](payments/payment-workflow-state.md) | Payment Workflow State Machine | accepted | `paymentLifecycle` |
| [STATE-PAY-002](payments/payment-attempt-state.md) | Payment Attempt State Machine | accepted | `paymentLifecycle`, `primaryCardSuccess` |
| [STATE-MONEY-001](money/settlement-state.md) | Settlement State Machine | accepted | `merchantSettlement`, `settlementConfirmation`, `settlementFailure` |

---

## Portal regression

| ID | Title | Status | Notes |
| --- | --- | --- | --- |
| [PORTAL-MERMAID-TEST](portal-mermaid-test.md) | Portal Mermaid Rendering Test | portal-test | Rendering fixture only — not primary design |
