---
id: ADM-REPLAY-003
title: Financial work replay prohibited
type: security
status: specified
mvp: true
relatedRequirements:
  - FUN-ADM-008
  - NFR-SEC-011
---

# ADM-REPLAY-003 — Financial work replay prohibited

## Purpose

Prove financial dead-letter items cannot be force-replayed via H2 operator replay.

## Scenarios

| # | Scenario | Expected |
| --- | --- | --- |
| 1 | POST replay on `financial.work` DLQ | Denied; security/audit evidence; no payment/settlement/ledger command |

## Implementation status

**Specified** — not verified. Links [ADR-034](../../docs/decisions/ADR-034-durable-dead-letter-and-operator-replay-policy.md).
