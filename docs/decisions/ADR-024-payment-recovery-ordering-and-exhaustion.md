# ADR-024 — Payment Recovery Ordering and Exhaustion Policy

## Status

Accepted

## Context

Platform Phase D4 (Decline Classification + Recovery Decisioning) stopped before implementation because architecture left two recovery questions unresolved:

1. After a **RETRYABLE** (soft) decline on the current method, should Sparelane retry the same method before backups, or walk backups first?
2. When **no eligible method** remains (and/or same-method retry budget is gone), should the workflow move to **ACTION_REQUIRED** or **FAILED**?

`payment-method-selection.md` listed soft-before-backups as TBD. Sequences SEQ-PAY-004 / SEQ-PAY-005 / SEQ-PAY-006 illustrated paths but did not bind a single decision table. D4 cannot invent financial recovery policy.

Numeric retry timings were deferred to D5 / OD-001. This ADR fixes **qualitative** ordering and exhaustion so D4 can implement orchestration decisions. Numeric defaults are now Accepted in [ADR-025](./ADR-025-payment-retry-timing-budget-and-recovery-window.md).

## Options considered (soft decline)

### OPTION A — Retry same method before backups

After RETRYABLE on primary: immediately or via schedule retry the same method; only then walk backups.

| Criterion | Assessment |
| --- | --- |
| Customer success probability | Weaker when a configured backup would succeed now |
| Risk of repeated failing charge | Higher — soft declines often recur short-term |
| Payment speed | Slower when backups are healthy |
| PSP call count | More wasted calls on the soft-declined method |
| Consumer expectations | Backups feel unused |
| Retry scheduling complexity | Higher (schedule before fallback) |
| Backup-card semantics | Undermines backups as immediate resilience |
| SEQ-PAY-004 / Reliability | Conflicts with soft → Rel → backup illustration |
| Operational safety | Worse noise / decline volume |

### OPTION B — Try backups before retrying same method

After RETRYABLE on current method: exclude that method from **immediate** selection; ask Reliability Engine for next eligible; create a new attempt on the backup. Only when **no immediate eligible backup** remains, use same-method scheduled retry if budget remains.

| Criterion | Assessment |
| --- | --- |
| Customer success probability | Stronger — uses configured resilience immediately |
| Risk of repeated failing charge | Lower on soft-declined method while backups exist |
| Payment speed | Faster when backups work |
| PSP call count | Prefer one call per method in the immediate walk |
| Consumer expectations | Matches “try my other card” |
| Retry scheduling complexity | Clear: schedule only after immediate walk has nowhere to go |
| Backup-card semantics | Backups are real resilience mechanisms |
| SEQ-PAY-004 / SEQ-PAY-005 | Aligns (fallback now; schedule when Rel returns none) |
| Operational safety | Better separation of soft vs hard vs technical |

### OPTION C — Leave soft-before-backup “configurable” with no default

Rejected for MVP. D4 needs a binding default. Product may later override via explicit configuration **built on this default**, not instead of one.

## Decision

**Accept OPTION B** as the MVP default recovery ordering, with deterministic ACTION_REQUIRED vs FAILED semantics below.

Provider decline-code catalogues stay outside this ADR (adapter / classification profile → normalised signal → Decline Classification). This ADR binds **orchestration after classification**.

### Binding rules

1. **Decline Classification** returns exactly: `RETRYABLE` | `NON_RETRYABLE` | `TECHNICAL_ERROR` | `UNKNOWN`.
2. **Payment Orchestrator** alone decides next workflow action (ADR-002). Reliability Engine selects methods only. Retry Service schedules **when**, never **whether**.
3. **Immediate fallback walk:** configured `PaymentMethodPriority` order is authoritative. For each declined attempt in the walk, Orchestrator supplies exclusions; Rel returns the next eligible method or none. Each method is attempted **at most once** in the immediate walk of a recovery cycle before any scheduled same-method retry.
4. **No global revocation:** a decline never permanently revokes the consumer’s stored PaymentMethod; exclusions are **workflow-scoped**.
5. **New attempts:** fallback and scheduled retry always create a **new** PaymentAttempt; terminal attempts are immutable history (ADR-003).
6. **Post-hoc classification:** after an attempt is already `DECLINED` or `ERROR` with `decline_classification` null, Orchestrator may attach classification **write-once** (null → value; same value idempotent; conflicting value rejected). Attempt status/provider outcome fields are not rewritten.

### Soft / RETRYABLE

| Situation | Decision |
| --- | --- |
| RETRYABLE + eligible backup exists | **Try backup immediately** (exclude current method from immediate Rel selection). Create next PaymentAttempt. Workflow remains in an in-flight recovery state (typically `PAYMENT_PENDING`). |
| RETRYABLE + no eligible backup + same-method retry budget remains | **RETRY_PENDING**; hand off to Retry Service (D5) for timing; later Orchestrator creates a **new** attempt on the soft-declined method (or highest-priority still-RETRYABLE method if several soft-declined). |
| RETRYABLE + no eligible backup + no retry budget remains | **ACTION_REQUIRED** (not FAILED). |

Answer for “after RETRYABLE on primary with backup available”: **C — try backup immediately** (not A immediate same-method retry, not B schedule primary first).

### Hard / NON_RETRYABLE

| Situation | Decision |
| --- | --- |
| NON_RETRYABLE + eligible backup | Exclude current method for this workflow; try backup immediately; new PaymentAttempt. |
| NON_RETRYABLE + no eligible backup | **ACTION_REQUIRED** (consumer may add/update/reorder methods). |
| Backup NON_RETRYABLE + another backup eligible | Exclude current; continue immediate walk. |
| Last configured method NON_RETRYABLE | **ACTION_REQUIRED**. |

### TECHNICAL_ERROR (known no-charge)

Distinct from card decline and from UNKNOWN.

| Situation | Decision |
| --- | --- |
| Known no-charge technical / transport failure recorded as attempt `ERROR` + `TECHNICAL_ERROR` | **Do not** jump to backup solely because of infrastructure failure. Prefer **RETRY_PENDING** on the **same** method when retry budget remains; else **ACTION_REQUIRED**. |
| Bounded immediate execution retry before terminal ERROR | May be handled by worker/adapter execution policy (Phase D3); once attempt is terminal `ERROR` with `TECHNICAL_ERROR`, Orchestrator applies the row above. |

### UNKNOWN

| Situation | Decision |
| --- | --- |
| Unknown / ambiguous provider outcome | **Reconciliation required.** No backup. No blind second charge. No `FAILED`. No `COLLECTED`. Workflow remains **`PAYMENT_PENDING`** (existing enum — no new status). Attempt remains non-terminal until reconcile policy concludes (typically stay `SUBMITTED` until known). After reconcile, apply this ADR to the **resolved** outcome. |

### CAPTURED

Authoritative captured attempt → Orchestrator transitions workflow **`COLLECTED`** (D0 intent). Ledger posting is Phase E (`ledgerPostingStatus = PENDING` on collect). No settlement in D4.

### ACTION_REQUIRED vs FAILED

| State | MVP meaning |
| --- | --- |
| **ACTION_REQUIRED** | Automatic recovery cannot usefully continue **now**, but **consumer (or merchant) intervention could restore recoverability** within the recovery window (add/update/reorder method, fund wallet when in scope, Retry Now later). |
| **FAILED** | Terminal. No further automatic **or expected consumer** recovery under MVP policy for this workflow. Control returns to merchant collection. |

**MVP exhaustion rule:**

- Exhaustion of the **immediate method walk** and/or **same-method retry budget** → **`ACTION_REQUIRED`**, not automatic `FAILED`.
- **`FAILED`** requires at least one of:
  - recovery **window / due-date cutoff exhausted** (D5+ cutoff processing; numeric values in [ADR-025](./ADR-025-payment-retry-timing-budget-and-recovery-window.md)),
  - merchant cancellation / superseding bill (product rules),
  - other explicit unrecoverable condition documented by product policy.

This keeps D4 free of numeric timings while preserving SEQ-PAY-006 as the true terminal path when Retry Service (or cutoff processor) reports **no permitted retry remains inside the recovery window** and Rel reports **no eligible methods**.

### Recovery exhausted (definitions)

**Automatic recovery exhausted (→ ACTION_REQUIRED):**

- no eligible unused method remains for the immediate walk, **and**
- no allowed same-method scheduled retry remains (retry budget exhausted or not applicable), **and**
- no reconciliation is pending for an unknown attempt

**Terminal recovery exhausted (→ FAILED):**

- automatic recovery exhausted **as above**, **and**
- recovery window / cutoff closed (or other FAILED trigger above)

### Decision table (implementation source for D4 / D5)

| Attempt outcome | Classification | Backup eligible now? | Same-method retry budget? | Reconciliation pending? | Orchestrator next action | Workflow state | Create next attempt now? | Scheduler (D5)? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAPTURED | — | — | — | no | Collect | `COLLECTED` | no | no |
| DECLINED | RETRYABLE | yes | — | no | Try backup | remain recoverable (`PAYMENT_PENDING`) | yes (backup) | no |
| DECLINED | RETRYABLE | no | yes | no | Retry later (same method) | `RETRY_PENDING` | no | yes |
| DECLINED | RETRYABLE | no | no | no | Require action | `ACTION_REQUIRED` | no | no |
| DECLINED | NON_RETRYABLE | yes | — | no | Try backup | remain recoverable (`PAYMENT_PENDING`) | yes (backup) | no |
| DECLINED | NON_RETRYABLE | no | — | no | Require action | `ACTION_REQUIRED` | no | no |
| ERROR | TECHNICAL_ERROR | — (do not use backup for tech alone) | yes | no | Retry later (same method) | `RETRY_PENDING` | no | yes |
| ERROR | TECHNICAL_ERROR | — | no | no | Require action | `ACTION_REQUIRED` | no | no |
| Unknown / non-terminal | UNKNOWN | no | no | **yes** | Reconcile only | remain `PAYMENT_PENDING` | no | no |
| Immediate walk complete; only soft methods left for later | RETRYABLE history | no | yes | no | Retry later | `RETRY_PENDING` | no | yes |
| Automatic recovery exhausted | — | no | no | no | Require action | `ACTION_REQUIRED` | no | no |
| Recovery window closed | — | no | no | no | Fail workflow | `FAILED` | no | no |

### Late provider results

- Never initiate another charge while an attempt outcome is UNKNOWN / reconciliation pending.
- Terminal `COLLECTED` / `FAILED` / `CANCELLED` must not be silently overwritten by stale recovery decisions.
- Late success after `FAILED` (or conflicting CAPTURED after terminal failure) is a **financial-integrity / reconciliation** condition — not an automatic transition to `COLLECTED`. Compensation/refund flows are out of scope for D4.

### Responsibility split

| Concern | Owner |
| --- | --- |
| Classify outcome | Decline Classification |
| Select next eligible method | Reliability Engine (exclusions supplied by Orchestrator) |
| Decide collect / backup / retry-later / action / fail / reconcile | Payment Orchestrator (this ADR) |
| When to fire scheduled retry | Retry Service (D5; [ADR-025](./ADR-025-payment-retry-timing-budget-and-recovery-window.md) numbers) |
| Execute PSP | Adapters via execution path (D3) — not D4 |

## Consequences

### Positive

- D4 unblocked with a single MVP default.
- Backups are used as immediate resilience.
- Soft-declined methods are not hammered while backups exist.
- Technical failures do not unnecessarily switch customer method.
- UNKNOWN remains fail-safe.
- ACTION_REQUIRED preserves consumer remediation before terminal FAILED.
- Numeric timings deferred historically to OD-001; now Accepted in ADR-025.

### Negative / tradeoffs

- Soft-declined primary is not retried immediately even if it might succeed seconds later; backup may be charged first (acceptable MVP tradeoff).
- Technical errors do not opportunistically use a healthy backup (may delay collection; safer semantics).
- FAILED is rarer in D4 paths; cutoff processing must be implemented later or workflows linger in ACTION_REQUIRED.

### Must / must not

**Must**

- Implement the decision table above in Orchestrator recovery decisioning.
- Persist classification before recovery decisions that depend on it.
- Create new PaymentAttempts for backups; use D0 intents for workflow transitions.
- Keep D2 selection pure (exclusions/policy context from Orchestrator).

**Must not**

- Call PSP from Decline Classification or recovery decisioning alone.
- Create `ScheduledJob` in D4 (D5).
- Post ledger / settle / mutate wallet in D4.
- Globally revoke PaymentMethod on decline.
- Blind-retry or backup while UNKNOWN.
- Auto-`FAILED` solely because the immediate walk and retry budget are exhausted.

## Alternatives Considered

1. **OPTION A (same-method before backups)** — rejected; weaker use of backups; conflicts with SEQ-PAY-004 intent; higher repeated soft-decline risk.
2. **Auto-FAILED when no backup** — rejected; denies consumer remediation; conflates temporary exhaustion with terminal window close.
3. **Configurable soft-before-backup with no default** — rejected; D4 cannot ship without a default.
4. **TECHNICAL_ERROR → backup first** — rejected; conflates infrastructure with method failure.
5. **New workflow status for UNKNOWN** — rejected; remain `PAYMENT_PENDING` + reconciliation flag/result.

## Dependencies / Open Questions

- **OD-001 / OD-002 / OD-006** — **resolved by [ADR-025](./ADR-025-payment-retry-timing-budget-and-recovery-window.md)** (timings, due clock, cutoff, timezone freeze, Retry Now budget).
- **OD-003** — backup cardinality / wallet ordering (still open; ordered preference required; caps TBD).
- Provider-specific decline code maps — adapter profiles, not this ADR.

## Related Architecture

- LikeC4 views: `backupRecovery`, `scheduledRetry`, `completeFailure`, `paymentEngineCore`, `paymentProviderTimeout`
- Docs: [payment-method-selection](../payments/payment-method-selection.md), [retry-policy](../payments/retry-policy.md), [payment-lifecycle](../payments/payment-lifecycle.md), [payment-state-machine](../payments/payment-state-machine.md)
- Designs: SEQ-PAY-004, SEQ-PAY-005, SEQ-PAY-006, SEQ-OPS-001
- ADRs: ADR-002 (orchestrator), ADR-003 (workflow vs attempt), ADR-017 (at-least-once)
- Supersedes / clarifies: soft-before-backup TBD in payment-method-selection; ambiguous ACTION_REQUIRED vs FAILED prose in selection/retry docs
- Requirements: FUN-PAY-004, FUN-PAY-005, FUN-PAY-006, FUN-PAY-007

## D4 implementation consequences

Platform D4 should implement (architecture mandate; not done in this repo):

1. Decline Classification service (normalised inputs only).
2. Narrow PaymentAttempt API: write-once `decline_classification` attach on `DECLINED` / `ERROR`.
3. Payment Orchestrator `handlePaymentAttemptResult` (reload authoritative attempt + workflow + history).
4. Discriminated `RecoveryDecision` (`collected` | `try_backup` | `retry_later` | `action_required` | `failed` | `reconciliation_required`).
5. D2 selection with Orchestrator-built exclusions.
6. D1 `createPaymentAttempt` when decision is `try_backup` (do not auto-execute PSP in D4).
7. D0 intents: `mark_collected`, `mark_retry_pending`, `require_action`, `mark_failed` (failed mainly for cutoff/cancel paths).
8. No ScheduledJob, ledger, settlement, wallet mutation, or public recovery HTTP in D4.

## D5 boundary

D5 owns: retry count/configuration, retry timing, `scheduledFor`, ScheduledJob, resuming `RETRY_PENDING`, due-date/cutoff → possible `FAILED`, and consumer Retry Now — all per [ADR-025](./ADR-025-payment-retry-timing-budget-and-recovery-window.md).
