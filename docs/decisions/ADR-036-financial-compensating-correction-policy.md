---
id: ADR-036
title: Financial Compensating Correction Policy
status: Accepted
date: 2026-08-24
deciders: Architecture
consulted: Product / Security / Privacy / Operations / Accounting
informed: Platform engineering
supersedes: []
related:
  - ADR-004
  - ADR-012
  - ADR-013
  - ADR-014
  - ADR-016
  - ADR-017
  - ADR-020
  - ADR-021
  - ADR-026
  - ADR-027
  - ADR-028
  - ADR-029
  - ADR-032
  - ADR-033
  - ADR-034
  - ADR-035
  - OD-023
  - OD-024
  - OD-026
  - FUN-SET-007
  - FUN-SET-008
  - FIN-INV-07
---

# ADR-036 — Financial Compensating Correction Policy

## Status

**Accepted**

Unblocks platform implementation of **FIN-INV-07** / **FUN-SET-007** / **FUN-SET-008** without inventing general financial-admin editing, PSP refunds, payout reversals, or silent rewrite of payment/settlement history.

Does **not** mark FIN-INV-07 verified, does **not** close MVP acceptance, and does **not** resolve OD-008/009/023/024/025 or live sandbox.

## Context

MVP acceptance requires all FIN-INV-01…10 to pass. FIN-INV-07:

> Ledger correction does not mutate historical entry (compensating only).

[FUN-SET-007](../../requirements/functional/FUN-SET-007.md) / [FUN-SET-008](../../requirements/functional/FUN-SET-008.md) (MVP must) require:

- Historical entries cannot be mutated in place.
- Corrections append compensating journals linked to the original context.
- No silent rewrite of posted amounts.

Platform evidence (Track 1A / Phase I) proves append-only immutability but has **no correction product**. H0–H2 explicitly defer financial corrections ([ADR-032](./ADR-032-platform-admin-authority-read-only-control-plane.md)–[ADR-034](./ADR-034-durable-dead-letter-and-operator-replay-policy.md)). [ADR-004](./ADR-004-double-entry-ledger.md) and [ledger-model](../money/ledger-model.md) already state compensating entries as the only correction mechanism. Platform already reserves `transaction_type = correction` without a workflow.

Refunds / chargebacks / bank adjustments remain deferred ([ADR-026](./ADR-026-collection-ledger-posting-minimal-coa.md), [ADR-027](./ADR-027-settlement-obligation-eligibility-cardinality.md)).

## Options considered

| Option | Description | Verdict |
| --- | --- | --- |
| **A — Minimal explicit compensating journal workflow** | Privileged append-only correction journal; accounting-evidence only | **Selected** |
| **B — Domain payment/settlement correction commands** | Commands that also rewrite operational money-movement state | Rejected for MVP — would invent refund/reversal semantics and silently rewrite history |
| **C — Defer corrections; redefine FIN-INV-07 as immutability-only** | Change MVP requirements to drop correction workflows | Rejected — FUN-SET-008 AC explicitly requires correction workflows; not a legitimate pass shortcut |
| **D — General privileged financial-admin framework** | Arbitrary journal editing, force-balance, H3+ ops suite | Rejected — invents H3+; contradicts H0–H2 deferrals and financial-integrity |

## Decision summary (binding for MVP)

| # | Decision |
| --- | --- |
| 1 | **MVP correction model = Option A** — narrow append-only compensating journal workflow |
| 2 | **Original journals are immutable forever** — no UPDATE/DELETE of `journal_transactions` / `journal_entries` |
| 3 | **Correction = NEW JournalTransaction** with `transaction_type = correction`, independently balanced |
| 4 | **Accounting-evidence only** — must **not** mutate PaymentWorkflow, PaymentAttempt, Settlement, SettlementInstruction, Bill, or outbox financial command state |
| 5 | **No external-money reversal in this workflow** — no PSP refund, chargeback, payout reverse, or bank adjustment APIs |
| 6 | **Initiator:** active platform admin via PrivilegedActionRequest (same dual-control pattern as ADR-033) |
| 7 | **Capability:** `admin.ledger.correct` (deny-by-default; closed catalogue) |
| 8 | **Action:** exactly `admin.ledger.correct` |
| 9 | **Risk class:** **CRITICAL** |
| 10 | **Dual control:** required (OD-026 Option B — **ledger corrections only** narrowed here) |
| 11 | **Recent MFA:** request / approve / execute each ≤ **15 minutes** (ADR-033 `PrivilegedAuthenticationContext`; OD-024 provider remains open) |
| 12 | **Reason:** required 16–500 chars; no secrets/PII dumps |
| 13 | **Target:** source journal by mandatory public id `jt_…` only |
| 14 | **Eligible source types (MVP):** `collection` only |
| 15 | **Eligible source states:** source exists; PaymentWorkflow `ledger_posting_status = CONFIRMED`; Settlement absent **or** Settlement status ∈ {`PENDING`,`ELIGIBLE`,`FAILED`,`CANCELLED`} |
| 16 | **Prohibited sources:** `settlement_payout`; journals already `correction`; any journal when Settlement ∈ {`SUBMITTED`,`PROCESSING`,`SETTLED`}; foreign-tenant journals |
| 17 | **Partial correction:** **allowed**; cumulative compensated amount ≤ original journal economic amount |
| 18 | **Multiple corrections:** **allowed** against the same eligible source until capacity exhausted |
| 19 | **Correction-of-correction:** **NOT SUPPORTED** in MVP |
| 20 | **Idempotency:** one compensating journal per executed PrivilegedActionRequest; `business_reference = ledger-correction:{parPublicId}` |
| 21 | **Link:** compensating journal stores immutable FK `corrects_journal_transaction_id` → source |
| 22 | **Settlement gate:** create/execute instruction MUST refuse when remaining uncompensated collection amount &lt; settlement amount (or remaining = 0) |
| 23 | **Break-glass / impersonation / arbitrary debit-credit UI:** **NOT SUPPORTED** |
| 24 | **FIN-INV-07 VERIFIED_LOCAL_FAKE** only after platform implements this ADR and the executable test contract below |

---

## Ownership and authority

| Aspect | Binding |
| --- | --- |
| Module | Ledger (append) + Admin Control Plane (privileged request lifecycle) |
| API surface | Admin BFF session `POST /admin/v1/…` only — **not** Merchant `/v1`; **not** machine API credentials |
| Who may request | Active `platform_admin` with `admin.ledger.correct` |
| Who may approve | Distinct active `platform_admin` with `admin.ledger.correct` |
| Who may execute | Distinct from neither? — same as ADR-033: requester or approver may execute after approval, with recent MFA; execute applies at most once |
| System-driven auto-correction | **NOT SUPPORTED** in MVP |
| Merchant-initiated correction | **NOT SUPPORTED** in MVP |

### Closed privileged action (MVP addition)

| Action | Capability | Risk | Dual control | Recent MFA |
| --- | --- | --- | --- | --- |
| `admin.ledger.correct` | `admin.ledger.correct` | CRITICAL | Required | Request / approve / execute |

Unknown actions denied. No wildcard. Does **not** reopen H2 financial replay. Does **not** grant `admin.ledger.view` beyond what is required to resolve `jt_…` during the privileged flow (safe projection only: public ids, type, currency, amount, postedAt, link — no secret fields).

### Dual-control matrix (OD-026 — ledger corrections)

Resolves OD-026 **for `admin.ledger.correct` only**. Break-glass remains NOT SUPPORTED.

| Rule | Binding |
| --- | --- |
| Requester ≠ approver | By `user_id` |
| Approvals | Exactly one |
| Expiry | 24h pending → `expired` |
| Fingerprint | Action + target `jt_…` + amount_minor + currency immutable after request |
| Self-approve | Prohibited |

---

## Accounting semantics

### Original journal

- Immutable forever (insert-only).
- UPDATE/DELETE of journal headers or entries is a **financial-integrity violation**.

### Compensating journal

| Field | Binding |
| --- | --- |
| `transaction_type` | `correction` |
| `business_reference` | `ledger-correction:{parPublicId}` UNIQUE |
| `currency` | **Must equal** source journal currency |
| `corrects_journal_transaction_id` | Required FK to source journal internal id |
| `payment_workflow_id` | Copy from source when present |
| `settlement_id` | Null for MVP collection corrections |
| `public_id` | `jt_…` (ADR-020) |
| Balance | Independently balances (Σ debit = Σ credit) |

### Debit / credit economics

For a correction of amount `A` (minor units) against a two-leg MVP collection journal (Dr processor-clearing / Cr merchant-payable of amount `S`):

| Leg | Side | Account | Amount |
| --- | --- | --- | --- |
| 1 | CREDIT | same processor-clearing account as source DEBIT | `A` |
| 2 | DEBIT | same merchant-payable account as source CREDIT | `A` |

i.e. **reverse sides**, same accounts, amount `A`.

- `A` must be `> 0`.
- `A` must be ≤ remaining capacity: `S - Σ(prior correction amounts against this source)`.
- Remaining capacity computed from prior compensating journals linked by `corrects_journal_transaction_id` (sum of their balanced amount = sum of DEBIT legs).
- Currency must match; cross-currency correction **forbidden**.

### Partial / multiple / full

- Partial: allowed (`A < remaining`).
- Multiple: allowed until remaining = 0.
- Full: when remaining reaches 0 after a successful append — **no separate correction status row**; state is derived from linked journals.
- Further corrections when remaining = 0 → reject (conflict / validation).
- Compensating a compensation journal → **forbidden** (MVP).

### Over-correction / concurrency

- Execute path MUST lock the source journal row (`SELECT … FOR UPDATE` or equivalent serialisable guard) before computing remaining capacity and appending.
- Concurrent executes against the same source: at most one wins capacity; loser rejects without writing a journal.
- Duplicate execute of the **same** approved `par_…` → idempotent `already_applied` returning the existing compensating journal (by `business_reference`).

### Transaction boundary

Single DB transaction on execute:

1. Validate PrivilegedActionRequest approved + fingerprint + MFA.
2. Lock source journal; re-validate eligibility + remaining capacity.
3. `appendJournal` compensating draft (or already_applied).
4. Append audit success.
5. Mark PrivilegedActionRequest `executed`.

Failed validation → no journal write; request may transition `failed` per ADR-033 execute-fail semantics; original financial history unchanged.

---

## Payment / settlement effects (critical)

| Surface | MVP effect of successful correction |
| --- | --- |
| PaymentWorkflow status | **Unchanged** |
| PaymentAttempt rows | **Unchanged** |
| `ledger_posting_status` | **Unchanged** (remains CONFIRMED) |
| Settlement row status | **Unchanged** by the correction command itself |
| SettlementInstruction | **Unchanged** |
| PSP / settlement provider | **No calls** |

### Settlement interaction (binding gates — not state rewrite)

When evaluating **CreateSettlement** / **CreateSettlementInstruction** / **ExecuteSettlementInstruction**:

- Compute `remaining = collectionJournalAmount - Σ(linked correction amounts)`.
- If `remaining <= 0` → refuse create/execute (conflict); do not invent Settlement cancellation.
- If Settlement amount would exceed `remaining` → refuse.
- Already `SUBMITTED` / `PROCESSING` / `SETTLED` settlements make the **source collection ineligible for new corrections** (see eligibility).

### External-money boundary

| Capability | MVP |
| --- | --- |
| Accounting compensating journal | **In scope** |
| PSP refund / reverse capture | **Out of scope** |
| Settlement payout reverse / clawback | **Out of scope** |
| Bank statement adjustment | **Out of scope** |
| Chargeback workflows | **Out of scope** |

Operators must treat this as **books correction**, not customer refund or bank reclaim.

---

## Audit / security / observability

### Audit (ADR-012)

Durable audit on request, approve, deny, execute success, execute fail — include:

- actor `usr_…`
- action `admin.ledger.correct`
- target `jt_…` (source)
- resulting compensating `jt_…` when created
- amount_minor + currency
- reason
- PrivilegedActionRequest `par_…`
- **No** account secrets, provider payloads, or CHD

### Security events

Emit `financialIntegrityViolation` (or deny taxonomy) on:

- attempted UPDATE/DELETE of journals
- cross-tenant correction attempt
- over-correction attempt
- correction against prohibited source state

### Observability

- Metric: ledger correction append outcome (`created` \| `already_applied` \| `rejected`)
- Alert category: Tier-1 financial integrity (catalogue only; thresholds TBD)

### Privacy / data minimisation

- Public-id targeting only
- Reason text must not contain secrets/PAN/tokens
- Admin projections omit provider destination refs and signing secrets

---

## Failure / restart semantics

| Case | Expected |
| --- | --- |
| Validation fail before append | No journal; original unchanged |
| Crash after journal before request `executed` | Redelivery finds `business_reference`; `already_applied`; mark executed |
| Crash before journal | Retry execute; at most one journal |
| Worker restart | Same as ADR-017 at-least-once + idempotent effect |

---

## FIN-INV-07 executable test contract (platform)

Platform MUST implement automated tests proving:

1. Source journal cannot be updated.
2. Source journal cannot be deleted.
3. Correction creates a distinct append-only journal (`transaction_type = correction`).
4. Compensating journal references source via `corrects_journal_transaction_id`.
5. Compensating journal balances.
6. Debit/credit sides reverse source collection legs for amount `A`.
7. Duplicate execute of same `par_…` is idempotent (one journal).
8. Concurrent corrections cannot over-correct (remaining capacity).
9. Cross-merchant / foreign `jt_…` cannot correct.
10. Unauthorized principal cannot correct.
11. Audit evidence emitted for execute success.
12. PaymentWorkflow / Settlement statuses unchanged by correction.
13. Failed correction leaves original history unchanged.
14. Partial corrections: cumulative ≤ original; further beyond remaining rejected.
15. Restart/redelivery cannot create duplicate compensation for same `par_…`.
16. Correction blocked when Settlement is SUBMITTED/PROCESSING/SETTLED.
17. Settlement instruction create/execute blocked when remaining collection capacity is 0.

### `VERIFIED_LOCAL_FAKE` definition

FIN-INV-07 may be classified **VERIFIED_LOCAL_FAKE** only when the above pass under local Fake/admin composition (ADR-035 Fake MFA acceptable for local). Still **not** `product_verified` / live-provider verified.

---

## Explicit non-goals

- General journal editor / force-balance
- Merchant API corrections
- Notification or financial outbox replay via this path
- H3+ admin suite (impersonation, break-glass, PII search)
- Fee/refund/chargeback/wallet CoA
- Redefining FIN-INV-07 as immutability-only

## Consequences

- Platform must implement Option A before FIN-INV-07 can leave `NOT_TESTABLE_IN_LOCAL_FAKE`.
- OD-026 narrowed for ledger corrections (dual-control required).
- OD-023/024 still block **production** MFA satisfaction; local Fake evidence remains valid for local verification.
- Relational model gains `corrects_journal_transaction_id` + `transaction_type` includes `correction`.
- MVP acceptance remains blocked until implementation evidence exists **and** external blockers close.

## References

- [FIN-INV-07](../../requirements/tests/FIN-INV-07.md)
- [FUN-SET-007](../../requirements/functional/FUN-SET-007.md) / [FUN-SET-008](../../requirements/functional/FUN-SET-008.md)
- [financial-integrity](../security/financial-integrity.md)
- [ledger-model](../money/ledger-model.md)
- Design: [SEQ-LEDGER-001](../design/money/ledger-compensating-correction.md)
