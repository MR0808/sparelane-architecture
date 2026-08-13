# Relational Model (Physical Design)

Implementation-grade relational design for Sparelane. **Not** a Prisma schema or migration set.

Conventions:

- Internal PK: UUID (UUIDv7 proposed) — see [identifier-strategy.md](./identifier-strategy.md)
- Public ID: opaque string with proposed prefix, unique
- Money: integer **minor units** + ISO currency — see [../contracts/money.md](../contracts/money.md)
- Timestamps: `timestamptz` UTC
- Date-only: `date` for bill due dates
- No PAN/CVV columns anywhere
- No plaintext API/webhook secrets after issuance

Tenant enforcement: foreign keys + application checks; PostgreSQL RLS optional later (not required).

---

## users

**Purpose:** Authentication identity subject (may map to external IdP).

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | optional `public_id` |
| Key fields | `email` (unique where used), `status`, IdP subject refs |
| Secrets | Out of scope if provider-managed; no password hashes required in this design if IdP owns auth |
| Sensitive | Confidential |

---

## consumers

**Purpose:** Sparelane consumer business profile (not auth secrets).

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`con_...`) UNIQUE |
| Ownership | `user_id` FK → users (nullable if deferred linkage) |
| Lifecycle | profile fields, soft-delete/anonymisation markers |
| Indexes | `public_id`, `user_id` |

---

## merchants

**Purpose:** Merchant organisation.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`mrc_...`) UNIQUE |
| Fields | `status` (`MerchantStatus`), `business_timezone` (IANA id; see [due-dates.md](../contracts/due-dates.md)) |
| Indexes | `public_id`, `status` |
| Sensitive | Confidential org data |

---

## merchant_memberships

**Purpose:** User ↔ Merchant membership and role category.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Tenant | `merchant_id` NOT NULL |
| FKs | `user_id`, `merchant_id` |
| Unique | `(merchant_id, user_id)` |
| Fields | `role` (conceptual), `status`, timestamps |

---

## merchant_integrations

**Purpose:** Integration configuration (sandbox/live, hosted/widget settings).

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Tenant | `merchant_id` NOT NULL |
| Unique | `(merchant_id, environment)` |
| Fields | `environment`, `status`, hosted config JSON (non-secret) |

---

## api_credentials

**Purpose:** Merchant machine credentials.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`key_...`) UNIQUE; also `key_prefix` for display |
| Tenant | `merchant_id` NOT NULL |
| Fields | `secret_hash` (never plaintext), `scopes[]`, `status`, `expires_at`, `revoked_at`, `last_used_at`, `environment` |
| Indexes | `(merchant_id, status)`, `key_prefix` |
| Sensitive | Restricted |

---

## webhook_endpoints

**Purpose:** Merchant webhook destination config.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`wh_...`) |
| Tenant | `merchant_id` NOT NULL |
| Fields | `url`, `environment`, `status`, `signing_secret_ref` (secrets manager ref; avoid plaintext), `event_types[]` |
| Indexes | `(merchant_id, environment)` |

Portal-managed for MVP API surface (no OpenAPI CRUD required).

---

## merchant_connections

**Purpose:** Consumer ↔ Merchant authorised association + merchant customer reference.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`conn_...`) UNIQUE |
| Tenant | `merchant_id` NOT NULL |
| FKs | `merchant_id`, `consumer_id` |
| Fields | `merchant_customer_reference`, `status` |
| Unique | `(merchant_id, merchant_customer_reference)` |
| Unique | `(merchant_id, consumer_id)` (one active connection per pair — product TBD; enforce active uniqueness) |
| Indexes | `public_id`, `(merchant_id, consumer_id)` |

Not the merchant customer master.

---

## payment_methods

**Purpose:** PSP token reference + safe metadata.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`pm_...`) |
| Ownership | `consumer_id` NOT NULL |
| Fields | `provider`, `provider_token_ref`, `method_type`, `brand`, `last4`, `exp_month`, `exp_year`, `status` |
| Forbidden | PAN, CVV |
| Unique | `(provider, provider_token_ref)` |
| Indexes | `(consumer_id, status)` |
| Sensitive | Confidential–Restricted |

---

## payment_method_priorities

**Purpose:** Ordered primary/backup preference per consumer.

**Choice:** Separate table (justification: clearer history and multi-method ordering than a single `priority` int on methods alone when methods can be revoked/reordered).

| Aspect | Design |
| --- | --- |
| PK | `id` |
| FKs | `consumer_id`, `payment_method_id` |
| Fields | `position` (1 = primary) |
| Unique | `(consumer_id, position)` |
| Unique | `(consumer_id, payment_method_id)` |

---

## bills

**Purpose:** Sparelane-received merchant bill (not merchant invoice SoR).

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`bill_...`) UNIQUE |
| Tenant | `merchant_id` NOT NULL |
| FKs | `merchant_id`, `merchant_connection_id` |
| Fields | `merchant_bill_reference`, `merchant_reconciliation_reference`, `amount_minor`, `currency`, `due_date`, `ingestion_status` |
| Unique | `(merchant_id, merchant_bill_reference)` |
| Indexes | `public_id`, `(merchant_id, due_date)`, `merchant_connection_id` |
| Note | `ACCEPTED` ≠ collected |

---

## payment_workflows

**Purpose:** Payment reliability lifecycle for a bill.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`pay_...`) UNIQUE |
| Tenant | `merchant_id` NOT NULL (denormalised for tenant isolation) |
| FKs | `bill_id` UNIQUE (**MVP: Bill 1 → 1 Payment Workflow**; multi-workflow requires a future ADR) |
| Fields | `status`, `ledger_posting_status`, `version` (optimistic concurrency), `collected_at`, `failed_at` |
| Indexes | `status`, `(merchant_id, status)`, `ledger_posting_status` where PENDING |

---

## payment_attempts

**Purpose:** Immutable attempt history (1..N per workflow).

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`patt_...`) |
| FKs | `payment_workflow_id`, `payment_method_id` (nullable if method removed), `merchant_id` denormalised |
| Fields | `sequence_number`, `attempt_type`, `status`, `decline_classification`, `amount_minor`, `currency`, `provider`, `provider_transaction_id`, timestamps |
| Unique | `(payment_workflow_id, sequence_number)` |
| Unique (nullable) | `(provider, provider_transaction_id)` |
| Forbidden | PAN, CVV |

---

## wallets

**Purpose:** Optional wallet capability metadata (not financial SoT).

| Aspect | Design |
| --- | --- |
| PK | `id` |
| FK | `consumer_id` UNIQUE |
| Fields | `status`, `currency` |
| Balances | Derived from ledger (materialised cache optional, never SoT) |

---

## wallet_reservations

**Purpose:** Reservation intent before final ledger movement.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| FKs | `wallet_id`, optional `payment_attempt_id` |
| Fields | `amount_minor`, `currency`, `status`, `expires_at` |
| Note | Reservation ≠ final posting |

---

## ledger_accounts

**Purpose:** Logical chart-of-accounts identities.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Fields | `code` UNIQUE, `name`, `account_type`, `currency` (or multi-currency policy TBD), `merchant_id` nullable (for merchant payable), `consumer_id` nullable (wallet liability) |
| Indexes | `code`, `(merchant_id)`, `(consumer_id)` |

---

## journal_transactions

**Purpose:** Balanced business-level journal header (append-only).

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`jt_...`) optional for ops |
| Fields | `business_reference` UNIQUE (**Sparelane-generated financial posting identity**, not a merchant or provider reference), `transaction_type`, `currency`, `posted_at`, `payment_workflow_id` nullable, `settlement_id` nullable, `correlation_id` |
| Mutability | Insert-only; no updates/deletes |
| Idempotency | `business_reference` uniquely identifies one financial effect, e.g. collection posting for a payment workflow (`payment-collection:<paymentWorkflowId>` or equivalent). Merchant reconciliation references and provider transaction IDs remain separate columns/relations. |

---

## journal_entries

**Purpose:** 2..N debit/credit lines.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| FKs | `journal_transaction_id`, `ledger_account_id` |
| Fields | `side` (DEBIT/CREDIT), `amount_minor` CHECK (> 0), `currency` |
| Mutability | Insert-only |
| Balance | `SUM(debit)=SUM(credit)` enforced in Ledger Service (DB aggregate constraint impractical cross-row); optional deferred verification job |

---

## settlements

**Purpose:** Merchant settlement obligation lifecycle.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`set_...`) UNIQUE |
| Tenant | `merchant_id` NOT NULL |
| FKs | `payment_workflow_id` (or payable grouping TBD), `settlement_batch_id` nullable |
| Fields | `status`, `amount_minor`, `currency`, `merchant_reconciliation_reference`, `submitted_at`, `settled_at` |
| Indexes | `(merchant_id, status)`, `public_id` |
| Gate | Create/advance past ELIGIBLE only when source collection ledger posting CONFIRMED |

---

## settlement_batches

**Purpose:** Optional grouping.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`sbatch_...`) |
| Fields | `status`, `scheduled_for`, timestamps |

---

## settlement_instructions

**Purpose:** External partner instruction.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`sinstr_...`) |
| FKs | `settlement_id` and/or `settlement_batch_id` |
| Fields | `idempotency_key` UNIQUE, `provider`, `provider_instruction_ref`, `status`, `submitted_at` |
| Unique (nullable) | `(provider, provider_instruction_ref)` |

---

## webhook_events

**Purpose:** Stable merchant-facing event contract instance.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Public | `public_id` (`evt_...`) UNIQUE — stable across delivery retries |
| Tenant | `merchant_id` NOT NULL |
| Fields | `type`, `payload` (curated JSON), `schema_version`, `created_at` |
| Indexes | `(merchant_id, created_at)` |

Not a raw dump of internal domain events.

---

## webhook_delivery_attempts

**Purpose:** 1..N delivery attempts per webhook event.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| FKs | `webhook_event_id`, `webhook_endpoint_id` |
| Fields | `attempt_number`, `status`, `http_status`, `next_retry_at`, `error_class`, timestamps |
| Unique | `(webhook_event_id, attempt_number)` |
| Note | Avoid storing full merchant response bodies unless required |

---

## audit_events

**Purpose:** Append-only security/admin audit.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Fields | `actor_type`, `actor_id`, `action`, `target_type`, `target_id`, `result`, `context` (JSON minimised), `correlation_id`, `occurred_at` |
| Forbidden | secrets, tokens, PAN, CVV |
| Mutability | Insert-only |

---

## outbox_events

**Purpose:** Transactional outbox in Operational DB.

| Aspect | Design |
| --- | --- |
| PK | `id` |
| Fields | `aggregate_type`, `aggregate_id`, `event_type`, `payload` (bounded), `schema_version`, `correlation_id`, `causation_id`, `occurred_at`, `published_at`, `attempt_count` |
| Indexes | partial index on `published_at IS NULL` ordered by `occurred_at` |
| Cleanup | Retention TBD |

Payload must not become an arbitrary dumping ground — versioned, typed events only.

---

## api_idempotency_keys / provider_event_receipts

See [idempotency-storage.md](./idempotency-storage.md).

---

## Critical constraints (summary)

1. `(merchant_id, merchant_bill_reference)` UNIQUE on bills  
2. `(merchant_id, operation, idempotency_key)` UNIQUE on API idempotency  
3. `(payment_workflow_id, sequence_number)` UNIQUE on attempts  
4. `journal_transactions.business_reference` UNIQUE  
5. `settlement_instructions.idempotency_key` UNIQUE  
6. `(provider, provider_event_id)` UNIQUE on provider receipts  
7. No PAN/CVV columns; `api_credentials.secret_hash` only  
8. Settlement progression gated on ledger posting confirmation  

---

## Merchant tenancy

Tables with explicit `merchant_id`: merchants’ children as listed above; denormalise onto workflows/attempts/settlements for isolation queries.

Enforcement candidates:

- FK structure (required)
- application tenant checks (required)
- PostgreSQL RLS (optional future)
