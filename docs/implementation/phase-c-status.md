# Phase C — Bill Ingestion

**Status:** Current  
**Owner:** Engineering / Architecture  
**Last Reviewed:** 2026-08-21  
**Related ADRs:** ADR-007, ADR-008, ADR-003, ADR-016, ADR-017, ADR-020–022  
**Related Views:** `05 Integrations / merchantIntegration`, bill ingestion / bill submission flows

## Status

**PASS WITH DOCUMENTED NON-BLOCKING RISKS**

Recorded from `sparelane-platform` Phase C exit evidence (C0–C5). This is **bill ingestion** implementation status, not MVP product acceptance and **not** payment execution.

## Purpose

Phase C implements Merchant API bill acceptance: authenticate a merchant system, accept an idempotent Bill, create exactly one PaymentWorkflow, write `BillAccepted` to the transactional outbox, and allow safe merchant-scoped retrieval.

**Phase C does NOT move money.**

Phase C does **NOT** implement:

- payment method selection or Reliability Engine runtime
- pre-authorisation or PSP payment execution
- PaymentAttempt creation
- ledger posting or wallet financial behaviour
- settlement or reconciliation
- signed merchant webhooks (product delivery)
- due-date payment scheduling (FUN-BIL-002)

## C0–C5 summary (engineering decomposition)

These are **platform engineering sub-phases** decomposing canonical Phase C. They are **not** additional canonical architecture phases.

| Phase | Purpose | Implementation evidence (platform) | Status |
| --- | --- | --- | --- |
| C0 | Merchant API credentials & machine auth | `docs/development/merchant-api-credentials.md`, HMAC credential, `bill-submit` | PASS |
| C1 | Bill domain & persistence | `createBill`; Bill ACCEPTED + PaymentWorkflow CREATED + BillAccepted outbox | PASS |
| C2 | POST `/v1/bills` + idempotency | OpenAPI 201; claim/fingerprint/complete; 409 conflict | PASS |
| C3 | GET `/v1/bills/{billId}` | Merchant-scoped BillPublicView; no invented `bills.read` | PASS |
| C4 | Integration, security & concurrency gate | `tests/e2e/phase-c/`; no-money-movement gate | PASS |
| C5 | Exit gate & architecture evidence | `docs/development/phase-c-exit-gate.md` | PASS |

Canonical Phase C remains [build-phases](build-phases.md) — **Bill Ingestion**.

## Capabilities implemented

| Capability | Notes |
| --- | --- |
| Merchant API key auth | DB-backed credential; hash-only secret |
| `bill-submit` on POST | Required for CreateBill |
| POST Bill | OpenAPI **201** Bill accepted |
| Idempotency | Merchant + operation + key; replay / conflict |
| Bill + 1:1 workflow | DB unique `PaymentWorkflow.billId` |
| BillAccepted outbox | Same Operational DB transaction |
| GET Bill | Authenticated `merchant_machine`; historical read vs write eligibility |
| No money movement | No attempts / PSP / ledger / wallet / settlement |

## Integration proof (no money movement)

Merchant API credential → `merchant_machine` → ACTIVE connection → `POST /v1/bills` → idempotency claim → Bill ACCEPTED + PaymentWorkflow CREATED + BillAccepted → 201 → replay → GET same Bill.

Also proven: cross-tenant denial, concurrent same-key safety, duplicate merchant reference conflict, rollback, suspended historical GET vs blocked POST.

Platform evidence: `sparelane-platform/tests/e2e/phase-c/`, `sparelane-platform/docs/development/phase-c-traceability.md`.

## Status semantics (formal)

| Entity | Initial status | Means | Does not mean |
| --- | --- | --- | --- |
| Bill | ACCEPTED | Accepted for Sparelane processing | Payment started or collected |
| PaymentWorkflow | CREATED | Workflow record exists | Orchestration executed |
| ledgerPostingStatus | NOT_REQUIRED | No ledger action at ingest | Ledger never needed later |

## Merchant / connection / scope policy

| Concern | Behaviour |
| --- | --- |
| POST eligibility | Merchant not suspended/offboarded; connection ACTIVE; `bill-submit` |
| GET eligibility | Authenticated merchant_machine + tenant ownership; **no** `bills.read` invented |
| Historical GET | Allowed after connection REVOKED/EXPIRED or merchant SUSPENDED |
| Concurrent same-key loser | May receive **503** `temporarily_unavailable`; retry with **same** Idempotency-Key |

## Explicitly NOT implemented

Payment attempts, Reliability Engine, PSP execute/preauth, ledger, wallet, settlement, reconciliation, FUN-BIL-002 scheduling.

## Architecture drift resolved in C5

| Topic | Resolution |
| --- | --- |
| HTTP 201 vs design 202 | **OpenAPI 201** is SoT; SEQ-PAY-001 updated |
| BillAccepted vs BillCreated | Canonical internal event **BillAccepted**; designs + LikeC4 updated |
| SEQ-INT-002 test id | Corrected to INT-API-001 |

## Non-blocking risks

| Risk | Local | Sandbox | Pilot | Production |
| --- | --- | --- | --- | --- |
| A. Prisma CLI deepmerge-ts advisory | OK | OK | Track | Track |
| B. In-memory API rate limiting | OK | Topology-dependent | Decision needed | Hardening required (OD-029) |
| C. Idempotency in-progress 503 | Documented | Documented | Document client retry | Same |
| D. Idempotency retention TTL | Open OD-030 | Open | Decide | Decide |
| E. PrismaPg/raw-session hygiene | Tests mitigated | Monitor workers | Monitor | Monitor |
| F. API_CREDENTIAL_PEPPER / KMS | Dev pepper | Secrets product | OD-025 | OD-025 |
| G. Production topology / broker | Soft | Soft OD-017 | Partial | Required |
| H. No formal `bills.read` scope | Convention documented | Same | Confirm / OD if needed | Confirm |

## Open decisions (unchanged by C5 alone)

- **OD-030** — idempotency retention TTL (not resolved by implementation choice)
- **OD-029** — numeric / distributed rate limits
- **OD-002 / OD-006** — due-date clock / timezone (scheduling Phase D+)
- **OD-018** — outbox poll vs CDC
- **OD-017** — broker

## Requirements evidence (architecture)

Conservative `implementationStatus: implemented` (architecture `status` remains `accepted`) for:

- FUN-BIL-001
- FUN-MER-003
- FUN-MER-004

FUN-BIL-002, FIN-INV-*, E2E-PAY-* remain **not** Phase C verified.

## Next phase

[Phase D — Payment Reliability Engine](build-phases.md) is **NOT STARTED**. Delivers: workflow state machine, attempts, reliability engine, retry scheduler, PSP adapter interface (+ fake). Depends on Phase C.

## Platform evidence (do not copy)

- `sparelane-platform/docs/development/phase-c-exit-gate.md`
- `sparelane-platform/docs/development/phase-c-traceability.md`
- `sparelane-platform/docs/development/phase-c-requirements.md`
- `sparelane-platform/docs/development/phase-c-test-evidence.md`
- `sparelane-platform/docs/development/database-session-safety.md`
- `sparelane-platform/tests/e2e/phase-c/`
