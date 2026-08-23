# Phase H2 — architecture decision-gate scope

**Status:** PASS — see [phase-h2-admin-decision-gate](./phase-h2-admin-decision-gate.md) and [ADR-034](../decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md)

**Depends on:** H0 PASS, H1 PASS, ADR-032, ADR-033  
**Does not implement platform H2.**

## Chosen scope

**Option A — Durable DLQ + merchant webhook replay** (notification replay deferred; financial replay prohibited).

| Option | Verdict |
| --- | --- |
| A — Durable DLQ + webhook replay | **Accepted** |
| B — + notification replay | Rejected for H2 |
| C — Generic durable DLQ replay | Rejected |
| D — Full operator recovery | Rejected |

## Gate checklist (resolved)

1. Durable DLQ persistence model — **Accepted** (operations-owned `DeadLetterItem`)
2. Closed replayable catalogue — **Accepted** (`admin.webhook.replay` only)
3. Webhook delivery replay semantics — **Accepted** (ADR-034 §9)
4. Notification replay — **Explicitly deferred** (preserve ADR-031)
5. Financial / ledger / settlement replay — **Forbidden**
6. Replay actor identity — **Accepted** (platform admin + capabilities)
7. Dual control / recent MFA — **Accepted** (MFA ≤15m; no dual control for webhook)
8. Concurrency / at-least-once — **Accepted**
9. Reason / audit taxonomy — **Accepted**
10. UI/BFF under `/admin` — **Accepted**
11. Non-goals (grants done; break-glass/impersonation/corrections/lifecycle) — **Confirmed**

## Exit

Architecture H2 decision gate: **PASS**. Platform H2 may proceed per [phase-h2-platform-checklist](./phase-h2-platform-checklist.md). Canonical Phase H remains **in progress**.
