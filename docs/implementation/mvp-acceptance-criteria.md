# MVP Acceptance Criteria

Objective criteria for MVP readiness. All financial invariant tests must pass.

These criteria are **not** satisfied by Phase A–F alone. Phase A is platform foundation only ([phase-a-status](phase-a-status.md)). Phase B is merchant/consumer core only — **no money movement** ([phase-b-status](phase-b-status.md)). Phase C is bill ingestion only — **no money movement** ([phase-c-status](phase-c-status.md)). Phase D is payment reliability / FakePSP collection only ([phase-d-status](phase-d-status.md)). Phase E posts collection journals locally (ADR-026). Phase F settles merchants locally with **FakeSettlementProvider** only ([phase-f-status](phase-f-status.md)) — **not** real-provider / real-bank / fee-net / production money.

## Phase B prerequisite evidence (not MVP pass)

Phase B provides **local implementation evidence** for some prerequisites below. Overall MVP acceptance is **not** met.

| Criterion area | Phase B evidence | Still missing |
| --- | --- | --- |
| Merchant exists / onboarding foundation | Partial — tenant + membership; no KYB/credentials | Sandbox/live credentials; full onboarding |
| Consumer exists | Partial — explicit profile + portal auth | Production IdP |
| Connection exists | Partial — explicit ACTIVE/REVOKED | Bill presentation |
| Tokenised methods without CHD | Partial — token refs + PCI guards; fake PSP | Hosted tokenisation; live PSP |
| Cross-tenant isolation | Local product tests (B6) | Full MVP security suite |
| Payment / ledger / settlement / webhooks | — | Entire sections below |

## Phase C prerequisite evidence (not MVP pass)

Phase C provides **local implementation evidence** for Merchant API bill acceptance. Overall MVP acceptance remains **not** met.

| Criterion area | Phase C evidence | Still missing |
| --- | --- | --- |
| Merchant machine credentials | Implemented — DB-backed API keys (C0) | Production KMS (OD-025); sandbox/live issuance UX polish |
| Idempotent bill via Merchant API | Implemented — POST `/v1/bills` 201 + replay (C2/C4) | Retention TTL (OD-030) |
| Duplicate key returns original bill | Implemented — FUN-MER-004 slice | — |
| Persisted Bill + 1:1 workflow | Implemented (C1) | Payment execution (Phase D) |
| Payment / ledger / settlement / signed webhooks | — | Phase D+ |

## Phase D prerequisite evidence (not MVP pass)

Phase D provides **local FakePSP implementation evidence** for payment reliability. Overall MVP acceptance remains **not** met.

| Criterion area | Phase D evidence | Still missing |
| --- | --- | --- |
| Primary method success E2E | Local FakePSP — E2E-PAY-001 path | Real PSP sandbox / live |
| Backup after soft decline | Local FakePSP — E2E-PAY-002 / ADR-024 | OD-003 cardinality; real PSP |
| Scheduled retry per policy | Local — ADR-025 | Real PSP timing confirmation |
| Complete failure terminal | Local cutoff → FAILED | Merchant/consumer notification delivery |
| Consumer Retry Now | Command + portal route; worker E2E | Thicker portal HTTP E2E; real PSP |
| Ledger / settlement / signed webhooks | COLLECTED → ledgerPostingStatus PENDING only | Phase E / F / G |

## Merchant

- Merchant can be onboarded
- Merchant receives sandbox and live-ready credential issuance flows
- Merchant can submit an **idempotent** bill via Merchant API
- Duplicate bill with same idempotency key returns the original accepted bill

## Consumer

- Consumer can connect to a merchant
- Consumer can hold primary and backup payment methods (token references only)
- No raw PAN/CVV stored in Sparelane systems

## Payment

- Primary method success path works end-to-end — **local FakePSP evidence** (Phase D); not real-PSP verified
- Backup fallback after soft decline works — **local FakePSP evidence** (Phase D)
- Scheduled retry works per configured policy — **local evidence** (ADR-025 / Phase D)
- Complete failure terminal state is correct and observable — **local evidence** (cutoff); notifications not delivered
- Consumer **Retry Now** can restart eligible workflows safely — **local evidence** (Phase D)

## Ledger

- Exactly one balanced financial journal posting per successful collection — **not implemented** (Phase E; COLLECTED leaves PENDING)
- Settlement eligibility requires posting confirmation — **not implemented**

## Settlement

- Collected funds can settle to merchant after ledger confirmation
- Settlement failure is retryable without reversing COLLECTED payment
- Unknown payout outcome does not trigger blind duplicate submission

## Integration

- Merchant webhooks are signed
- Delivery is at-least-once with stable event IDs
- Merchants can process deliveries idempotently

## Security

- Cross-merchant tenant isolation holds under automated tests
- Privileged admin actions are audited
- Secrets are not in source control; runtime secrets via managed pattern
- PCI boundary: CHD only at external PSP

## Operations

- Monitoring/alerting for Tier-1 financial paths
- DLQ exists with audited replay procedure
- Provider outage runbooks exercised (payment timeout, settlement outage, ledger posting recovery)
