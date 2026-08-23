# Phase G — Notifications & Webhooks

**Status:** Current  
**Owner:** Engineering / Architecture  
**Last Reviewed:** 2026-08-22  
**Related ADRs:** ADR-030, ADR-031 (Accepted); OD-025, OD-034, OD-035, OD-014 remain open  
**Related Views:** Notifications / integrations designs

## Status

**PASS WITH DOCUMENTED NON-BLOCKING RISKS**

Recorded from `sparelane-platform` Phase G exit evidence (G0–G2 + exit gate). This is **local controlled HTTP webhook sink + FakeEmailProvider** verification — **not** production email delivery, **not** production KMS webhook secrets, **not** SMS/preferences/reminders.

## Purpose

Phase G implements:

1. **Merchant webhooks** — closed catalogue, signed delivery, retry, portal endpoint management (ADR-030)
2. **Consumer email notifications** — explicit contacts, 3 payment notification types, Fake email delivery (ADR-031)

Phase G does **NOT** implement:

- real production email vendor (OD-035)
- production recoverable webhook signing secret store / KMS (OD-025)
- Merchant API webhook CRUD (OD-034)
- operator webhook replay (Phase H)
- SMS, preferences, bill due reminders (G3+ engineering slice)
- exactly-once transport or inbox delivery guarantees

## G0–G2 summary (engineering decomposition)

| Slice | Purpose | Platform evidence | Status |
| --- | --- | --- | --- |
| G0 | Webhook contract, projection, HMAC, SSRF, delivery, retry | `phase-g0-traceability.md` | PASS |
| G1 | Portal endpoint management + durable local secrets | `phase-g1-traceability.md` | PASS |
| G2 | Consumer contact + email + 3 payment notifications | `phase-g2-traceability.md` | PASS |
| Exit | Evidence gate | `phase-g-final-status.md` | PASS WITH DOCUMENTED NON-BLOCKING RISKS |
| G3+ | SMS, preferences, reminders | — | **Deferred** |

Canonical Phase G in [build-phases](build-phases.md) is satisfied by **G0+G1+G2** for local evidence. G3+ items are explicitly **not** required for canonical Phase G completion per ADR-031 §22 and build-phases engineering table.

## Capabilities implemented (local)

### Merchant webhooks

| Capability | Notes |
| --- | --- |
| 7-type closed catalogue | ADR-030 |
| Stable `evt_` identity | Per logical external event |
| HMAC-SHA256 exact bytes | Verified fixed vector |
| SSRF controls | Sandbox/production strict |
| Portal endpoint lifecycle | ACTIVE/DISABLED/REVOKED + subscriptions |
| Durable local signing secret | Cross-process worker proof |
| 5-attempt retry | 1m / 5m / 30m / 6h |
| At-least-once | Crash-after-HTTP duplicate tolerated |

### Consumer notifications

| Capability | Notes |
| --- | --- |
| Dedicated contact model | Not auth email |
| Verify → ACTIVE | Session-bound portal verify |
| 3 payment types only | action_required / failed / collected |
| businessReference idempotency | One logical notification |
| Fake email delivery | Local/CI only |
| 5-attempt retry | 2m / 10m / 1h / 6h |
| No contact → SKIPPED | No retroactive send |

## End-to-end proof (local)

Platform: `npm run test:phase-g`, `docs/development/phase-g-test-evidence.md`.

## Hard completeness check (architecture)

| Required for canonical Phase G | Required? | Met locally? |
| --- | --- | --- |
| Merchant webhooks | Yes | Yes (G0/G1) |
| Merchant webhook endpoint management | Yes | Yes (G1 portal) |
| Consumer transactional email (G2 scope) | Yes | Yes (G2) |
| SMS | No (G3+ deferred) | N/A |
| Preferences | No (G3+ deferred) | N/A |
| Bill reminders | No (G3+ deferred) | N/A |
| Operator replay | No (Phase H) | N/A |
| Real vendor | No for local PASS | Fail closed until OD-025/OD-035 |

## Non-blocking risks

| Risk | Classification |
| --- | --- |
| A. OD-025 production webhook secret store | sandbox / production |
| B. OD-035 real email provider | sandbox / production |
| C. Webhook at-least-once duplicate transport | merchant integration |
| D. Email idempotency Fake-only verified | production |
| E. OD-034 Merchant API webhook CRUD | product |
| F. SMS / preferences / reminders deferred | G3+ |
| G. OD-014 retention periods open | compliance |
| H. Verification numeric TTL open; session-bound verify | product |
| I. Prisma/deepmerge advisory | dependency |
| J. In-memory queue/broker local | infrastructure |

## Next canonical phase

**Phase H — Security/Admin Hardening** — H0 decision gate [PASS](phase-h0-admin-decision-gate.md) ([ADR-032](../decisions/ADR-032-platform-admin-authority-read-only-control-plane.md)): read-only admin control plane. Platform H0 **PASS** (see phase-h-status.md). DLQ replay and privileged mutations are **H1+**, not H0.
