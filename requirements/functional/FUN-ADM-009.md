---
id: FUN-ADM-009
title: Compensating ledger correction (privileged)
type: functional
area: admin
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - adminPrivilegedAction
  - fundsLedger
  - privilegedAccess
flows:
  - adminPrivilegedAction
adrs:
  - ADR-004
  - ADR-012
  - ADR-033
  - ADR-036
contracts:
  - docs/security/admin-access.md
  - docs/money/ledger-model.md
modules:
  - Admin Control Plane
  - Ledger
  - Audit
tests:
  - FIN-INV-07
designs:
  - SEQ-MONEY-007
openDecisions:
  - OD-024
---
# FUN-ADM-009 — Compensating ledger correction (privileged)

## Requirement

Platform admins with `admin.ledger.correct` may request, approve, and execute exactly one closed privileged action — `admin.ledger.correct` — that appends a balanced compensating journal linked to an eligible collection journal, under dual control, recent MFA, and mandatory reason. The action must not mutate payment or settlement operational state and must not call external money-movement providers.

## Rationale

[ADR-036](../../docs/decisions/ADR-036-financial-compensating-correction-policy.md) binds FUN-SET-007/008 and FIN-INV-07 without inventing general financial-admin editing or refunds.

## Acceptance Criteria

- Closed catalogue action: `admin.ledger.correct` only (CRITICAL risk).
- Capability: `admin.ledger.correct` (deny-by-default).
- Dual control: requester ≠ approver; both active `platform_admin` with capability; 24h expiry; fingerprint immutability (action + `jt_…` + amount_minor + currency).
- Recent MFA ≤15 minutes on request, approve, and execute ([OD-024](../../docs/decisions/open/OD-024-mfa-passkey.md) provider still open; Fake MFA allowed for local evidence).
- Reason required 16–500 chars; no secrets/CHD.
- Target: source journal by public id `jt_…` only.
- Eligible sources: `collection` journals with CONFIRMED posting; Settlement absent or PENDING/ELIGIBLE/FAILED/CANCELLED.
- Prohibited: `settlement_payout` sources; correction-of-correction; Settlement SUBMITTED/PROCESSING/SETTLED; cross-tenant targets.
- Execute appends new balanced `correction` journal; `business_reference = ledger-correction:{par_…}`; FK `corrects_journal_transaction_id`.
- Debit/credit reverse source collection legs for amount `A`; partial + multiple corrections allowed until remaining capacity exhausted; over-correction rejected under source-row lock.
- Duplicate execute of same `par_…` is idempotent (`already_applied`).
- PaymentWorkflow / PaymentAttempt / Settlement / SettlementInstruction statuses unchanged.
- No PSP refund, payout reverse, or bank adjustment.
- Durable audit on request/approve/deny/execute success/fail.
- No break-glass, impersonation, force-balance, or arbitrary debit/credit UI.

## Notes

`implementationStatus: implemented` — platform Track 1C: `admin.ledger.correct` CRITICAL dual-control + MFA ≤15m + reason 16–500 + `jt_…` targeting. FIN-INV-07 **`VERIFIED_LOCAL_FAKE`** (Track 1E). Not generic financial administration. Production MFA provider remains OD-024 (downstream of OD-023).
