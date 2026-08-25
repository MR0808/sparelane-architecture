# MVP Acceptance Criteria

Objective criteria for MVP readiness. **All financial invariant tests must pass.**

**MVP acceptance gate (2026-08-25, Track 1F):** **NOT ACCEPTED — EXTERNAL BLOCKERS** — see [mvp-acceptance-gap-plan](./mvp-acceptance-gap-plan.md) (**4 independent blockers**: OD-008, OD-009, OD-023, OD-025). Platform evidence: `sparelane-platform/docs/development/mvp-acceptance-evidence.md`. FIN-INV-01…10 all **`VERIFIED_LOCAL_FAKE`** (FIN-INV-07 via Track 1C + 1E); **not** `product_verified`. No local implementation/validation blockers remain.

These criteria are **not** satisfied by Phase A–I local Fake evidence alone. Phases A–I prove local implementation; MVP acceptance additionally requires closed product gaps and (where criteria demand) live/external evidence. Phase F settles merchants locally with **FakeSettlementProvider** only — **not** real-provider / real-bank / production money.

## Phase B prerequisite evidence (not MVP pass)

Phase B provides **local implementation evidence** for some prerequisites below. Overall MVP acceptance is **not** met.

| Criterion area | Phase B evidence | Still missing |
| --- | --- | --- |
| Merchant exists / onboarding foundation | Partial — tenant + membership; no KYB | Full KYB/live approval (process) |
| Consumer exists | Partial — explicit profile + portal auth | Production IdP (OD-023) |
| Connection exists | Partial — explicit ACTIVE/REVOKED | — |
| Tokenised methods without CHD | Partial — token refs + PCI guards; fake PSP | Hosted tokenisation; live PSP (OD-008) |
| Cross-tenant isolation | Local product tests (B6) | Full live security suite |
| Payment / ledger / settlement / webhooks | — | Entire sections below |

## Phase C prerequisite evidence (not MVP pass)

Phase C provides **local implementation evidence** for Merchant API bill acceptance. Overall MVP acceptance remains **not** met.

| Criterion area | Phase C evidence | Still missing |
| --- | --- | --- |
| Merchant machine credentials | Implemented — create / list / revoke; one-time secret; hash+pepper (C0) | Production KMS for pepper (OD-025); live environment against real providers |
| Idempotent bill via Merchant API | Implemented — POST `/v1/bills` 201 + replay (C2/C4) | Retention TTL (OD-030) |
| Duplicate key returns original bill | Implemented — FUN-MER-004 slice | — |
| Persisted Bill + 1:1 workflow | Implemented (C1) | — |
| Payment / ledger / settlement / signed webhooks | Phase D–G local Fake | Live providers |

## Phase D prerequisite evidence (not MVP pass)

Phase D provides **local FakePSP implementation evidence** for payment reliability. Overall MVP acceptance remains **not** met.

| Criterion area | Phase D evidence | Still missing |
| --- | --- | --- |
| Primary method success E2E | Local FakePSP — E2E-PAY-001 path | Real PSP sandbox / live (OD-008) |
| Backup after soft decline | Local FakePSP — E2E-PAY-002 / ADR-024 | OD-003 cardinality; real PSP |
| Scheduled retry per policy | Local — ADR-025 | Real PSP timing confirmation |
| Complete failure terminal | Local cutoff → FAILED | Production email OD-035 (pilot) |
| Consumer Retry Now | Command + portal route; worker E2E | Real PSP |
| Ledger / settlement / signed webhooks | COLLECTED → ledgerPostingStatus PENDING only | Phase E / F / G |

## Merchant

- Merchant can be onboarded (tenant foundation)
- Merchant can obtain Merchant API credentials (create/list/revoke; hash+pepper) — **local implemented**; production secret storage is OD-025
- Merchant can submit an **idempotent** bill via Merchant API
- Duplicate bill with same idempotency key returns the original accepted bill
- Merchant can retrieve payment status via `GET /v1/payments/{paymentId}` — **FUN-MER-005 implemented** (Track 1A)

## Consumer

- Consumer can connect to a merchant
- Consumer can hold primary and backup payment methods (token references only)
- No raw PAN/CVV stored in Sparelane systems

## Payment

- Primary method success path works end-to-end — **local FakePSP evidence** (Phase D); not real-PSP verified
- Backup fallback after soft decline works — **local FakePSP evidence** (Phase D)
- Scheduled retry works per configured policy — **local evidence** (ADR-025 / Phase D)
- Complete failure terminal state is correct and observable — **local evidence** (cutoff + G2 consumer notification on Fake email)
- Consumer **Retry Now** can restart eligible workflows safely — **local evidence** (Phase D)

## Ledger

- Exactly one balanced financial journal posting per successful collection — **local evidence** (Phase E1 + I1; Fake posting)
- Settlement eligibility requires posting confirmation — **local evidence** (Phase F0/F + I1 journey)
- Compensating corrections append-only (no historical mutation) — **FIN-INV-07 `VERIFIED_LOCAL_FAKE`** (Track 1C + Track 1E from-zero ×2 + post-zero regression); not `product_verified`

## Settlement

- Collected funds can settle to merchant after ledger confirmation — **local Fake**
- Settlement failure is retryable without reversing COLLECTED payment — **local Fake**
- Unknown payout outcome does not trigger blind duplicate submission — **local Fake**

## Integration

- Merchant webhooks are signed
- Delivery is at-least-once with stable event IDs
- Merchants can process deliveries idempotently

## Security

- Cross-merchant tenant isolation holds under automated tests — **local Fake** (FIN-INV-08)
- Privileged admin actions are audited — **local** (H1 + Track 1C correction)
- Secrets are not in source control; runtime secrets via managed pattern — **local env**; managed KMS = OD-025
- PCI boundary: CHD only at external PSP

## Operations

- Monitoring/alerting for Tier-1 financial paths — **architecture categories bound**; production thresholds TBD; Phase I local catalogue **PASS**
- DLQ exists with audited replay procedure — **local H2 + I0 runbook evidence**
- Provider outage runbooks exercised — **Phase I Fake-executable alignment PASS**

**Phase I local (ADR-035) PASS WITH DOCUMENTED NON-BLOCKING RISKS** — does **not** close overall MVP acceptance.

**MVP gate (2026-08-25, Track 1F): NOT ACCEPTED — EXTERNAL BLOCKERS** — **0** local blockers; **4** external vendor decisions (OD-008/009/023/025). Live sandbox E2E is **LIVE_EVIDENCE** after those. See [mvp-acceptance-gap-plan](./mvp-acceptance-gap-plan.md).
