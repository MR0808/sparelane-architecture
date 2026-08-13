# Sparelane Architecture Glossary

Concise definitions aligned with the Sparelane LikeC4 model.

## Bill

A merchant-originated payment obligation with amount, due date and reconciliation references that Sparelane uses to drive payment reliability workflows.

## Merchant

A business that remains the system of record for billing and uses Sparelane to improve recurring payment collection and settlement outcomes.

## Consumer

An individual who connects merchants and payment methods so Sparelane can attempt reliable collection of recurring bills.

## Merchant Connection

A consumer-approved link between a consumer Sparelane account and a merchant customer relationship, enabling bill payment workflows without transferring billing ownership.

## Payment Method

A stored means of payment available to Sparelane, represented by a PSP token reference and non-sensitive metadata. Raw PAN and CVV are never stored by Sparelane.

## Primary Payment Method

The first payment method Sparelane attempts for a bill according to the consumer's configured priority.

## Backup Payment Method

An ordered alternative card (or other method) attempted after a primary method fails when fallback is permitted.

## Payment Attempt

An immutable record of a single attempt to collect funds for a Payment Workflow, including provider response and outcome. One Payment Workflow may have many Payment Attempts.

## Payment Workflow

The overall Sparelane collection reliability journey associated with a merchant bill. Distinct from bill ownership, individual payment attempts, and settlement state.

## Soft Decline

A provider decline classified as potentially retryable later or with another strategy, subject to product and provider rules.

## Hard Decline

A provider decline classified as non-retryable for the method within the current recovery workflow (for example invalid method), generally preventing blind reuse of that method.

## Retryable Failure

An attempt outcome that may permit scheduled retry and/or fallback according to Decline Classification and retry policy.

## Terminal Failure

A Payment Workflow outcome where no eligible methods or permitted retries remain. Sparelane stops attempting collection and returns control to the merchant. No settlement eligibility is created.

## Idempotency Key

A client- or system-supplied key used to recognise duplicate requests (especially merchant bill ingestion and payment commands) so Sparelane does not create duplicate workflows or collect funds twice.

## Pre-authorisation

An early payment-method check performed ahead of the bill due date where the payment rail supports it, used to reduce failed collections.

## Capture

The action that collects previously authorised or due consumer funds through the payment provider.

## Retry

A controlled later attempt to collect a bill after a recoverable failure, constrained by retry windows and maximum attempt limits.

## Fallback

Switching from the current payment method to the next ordered backup method or wallet when the current attempt fails and another attempt is appropriate.

## Wallet

Optional Sparelane wallet capability for consumer available/reserved/spent balances that may be used as a payment fallback where enabled and permitted. Custody, safeguarding, licensing and funding rails remain TBD.

## Ledger

Append-only balanced financial record of fund movements, reservations and settlement-related entries. Authoritative financial state; distinct from payment workflow state.

## Journal

The append-only financial record comprising journal transactions and entries in the double-entry ledger.

## Journal Transaction

A balanced financial unit of work containing two or more journal entries where total debits equal total credits per currency.

## Journal Entry

One debit or credit leg within a journal transaction, against a conceptual ledger account, with amount, currency and business references.

## Double-entry Ledger

Sparelane's authoritative financial journal where every transaction balances and posted history is immutable; corrections use compensating entries.

## Merchant Payable

Conceptual liability/balance representing funds owed to a merchant after successful consumer collection and before or during settlement.

## Clearing Account

Conceptual control account used to move value between collection, processor/acquirer, settlement and exception handling. Exact legal characterisation TBD.

## Settlement

Merchant payout lifecycle for collected funds via the banking/settlement partner. Separate from Payment Workflow state; `COLLECTED` is not `SETTLED`.

## Settlement Batch

Optional logical grouping of settlements processed together. Not mandatory for every banking partner.

## Settlement Instruction

External instruction submitted to the banking/settlement partner for a settlement or batch, including provider reference/idempotency.

## Settlement Reconciliation

Matching internal expected settlement versus provider outcome, ledger position and merchant reconciliation references.

## Financial Reconciliation

Matching provider/acquirer/bank financial movements versus Sparelane ledger entries.

## Compensating Entry

A new balanced journal transaction that corrects or offsets a previous posted transaction without mutating historical entries.

## Unknown Outcome

A state where Sparelane has submitted an external instruction (especially settlement) but cannot yet determine whether the partner accepted it, typically after timeout; must query/reconcile before blind resubmit.

## Reconciliation

Matching settlement and ledger outcomes to merchant invoice and reconciliation references, as well as broader payment and financial reconciliation concerns.

## PSP

Payment Service Provider. External PCI-compliant provider used for card tokenisation, authorisation, capture and payment events.

## PayTo

Future Australian account-to-account payment capability using NPP/PayTo infrastructure. Explicitly post-MVP in the architecture.

## Domain Event

An asynchronous internal event used to coordinate payment, retry, settlement, notification and analytics workflows. Domain events do not replace operational databases as systems of record.

## Webhook

A signed asynchronous HTTP callback. Provider webhooks notify Sparelane of payment/settlement status; merchant webhooks notify merchants of Sparelane outcomes.

## Merchant Webhook Event ID

Stable identifier for a merchant-facing webhook notification. Retries redeliver the same event ID; merchants must process event IDs idempotently under at-least-once delivery.

## Merchant API Credential

Server-to-server credential used to authenticate Merchant API requests. The secret is shown once at issuance; Sparelane stores hashes/references only, never plaintext secrets after issuance.

## Idempotency Key

Merchant-supplied request identity for mutating API operations (especially bill submission) that allows safe retries without creating duplicate payment workflows.

## Bill Accepted

Merchant API acknowledgement that a bill was authenticated, authorised, validated and persisted. Does **not** mean payment collected or settlement completed.

## Sandbox / Live

Logical merchant integration environments. Credentials, webhook endpoints and test data are environment-isolated; physical topology separation is TBD.

## Payment Reliability Engine

Sparelane's core differentiator: the logical domain that coordinates payment method selection, pre-authorisation, fallback, retry, capture and payment result processing across supported rails.

## Trust Zone

Logical security boundary (public internet, edge, authenticated application, financial, administrative, or external PCI/banking/KYC). Trust zones are architectural, not necessarily physical network segments.

## Data Classification

Handling categories for Sparelane data: Public, Internal, Confidential, Restricted, and PCI-sensitive external (raw PAN/CVV at the provider).

## Financial Trust Zone

Logical boundary around payment orchestration, payment attempts, double-entry ledger, settlement instruction paths and financial databases treated as highly sensitive.

## Authoritative vs Derived Data

Authoritative data is the system of record for a concern (e.g. Operational DB for workflows, Ledger DB for journals). Derived data (analytics, cached balances) is rebuildable and must not become the sole decision authority for payment, settlement or security.

## Public Identifier

A stable Sparelane reference safe to expose in external contracts when authorised. Possession of an identifier is not authorisation.

## Transactional Outbox

Pattern where an operational state change and an outbox event are committed atomically; an Outbox Processor publishes to the event bus at-least-once for idempotent consumers (used for collection → ledger posting).

## Deployable Unit

A physical runtime package (application/worker/scheduler process) that may host multiple logical LikeC4 services. Logical service ≠ microservice.
