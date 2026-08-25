---
id: NFR-SEC-012
title: Dual control for ledger compensating corrections
type: non-functional
area: security
status: accepted
implementationStatus: implemented
priority: must
mvp: true
architecture:
  - privilegedAccess
  - trustBoundaries
  - adminPrivilegedAction
  - fundsLedger
adrs:
  - ADR-012
  - ADR-033
  - ADR-036
contracts:
  - docs/security/admin-access.md
  - docs/security/financial-integrity.md
modules:
  - Identity
  - Admin Control Plane
  - Ledger
  - Audit
tests:
  - FIN-INV-07
openDecisions:
  - OD-024
  - OD-026
---
# NFR-SEC-012 — Dual control for ledger compensating corrections

## Requirement

`admin.ledger.correct` requires dual control: requester ≠ approver, both active `platform_admin` with `admin.ledger.correct`, exactly one approval, 24-hour request expiry, and immutable request fingerprint (action + source `jt_…` + amount_minor + currency). Recent MFA (≤15 minutes) is required on request, approve, and execute. Break-glass is NOT SUPPORTED.

## Rationale

[ADR-036](../../docs/decisions/ADR-036-financial-compensating-correction-policy.md) narrows OD-026 for ledger corrections (Option B for this action only). Prevents unilateral financial history compensation.

## Acceptance Criteria

- Self-approve prohibited.
- Capability deny-by-default; unknown privileged actions denied.
- Execute applies at most once per PrivilegedActionRequest; redelivery is idempotent via `ledger-correction:{parPublicId}`.
- Unauthorized principals cannot correct.
- Cross-merchant / foreign `jt_…` rejected.
- Durable audit records actor, action, target, amount, currency, reason, result — no secrets/CHD.

## Notes

`implementationStatus: implemented` — platform Track 1C dual-control + MFA freshness + fingerprint + audit for `admin.ledger.correct` (Fake MFA local). FIN-INV-07 **`VERIFIED_LOCAL_FAKE`**. MFA **provider** remains OD-024 (downstream of OD-023). Break-glass and other privileged mutation dual-control matrices remain open on OD-026.
