# ADR-025 — Payment Retry Timing, Budget and Recovery Window

Status: Accepted

## Context

Platform Phase D5 (Retry Scheduling, Retry Budget & Recovery Cutoff) stopped correctly because architecture left numeric timing/cutoff decisions open:

- [OD-001](./open/OD-001-retry-timing.md) — retry maxima, delays, quiet hours, window length
- [OD-002](./open/OD-002-due-date-local-clock.md) — merchant-local due-date clock
- [OD-006](./open/OD-006-timezone-change-policy.md) — timezone change vs already-scheduled work

[ADR-024](./ADR-024-payment-recovery-ordering-and-exhaustion.md) remains binding for **qualitative** recovery ordering and ACTION_REQUIRED vs FAILED. This ADR supplies **MVP numeric defaults** and clock/cutoff/Retry Now mechanics so D5 can implement without inventing policy.

## Options considered

### Same-method scheduled retry count

| Option | Assessment |
| --- | --- |
| **A — 2 scheduled retries** | Shorter window; weaker recovery after backup-first already tried other cards |
| **B — 3 scheduled retries** | Common pilot balance; enough same-day + next-day + later attempt without hammering |
| **C — 5+** | Higher cost/annoyance; longer soft-decline noise; unnecessary for MVP |

**Choose B (3).**

### Delay schedules (with count = 3)

| Option | Schedule | Assessment |
| --- | --- | --- |
| **A** | 1h / 6h / 24h | Too aggressive after ADR-024 already walked backups; risk of rapid re-declines |
| **B** | 4h / 24h / 48h | Reasonable spacing; slightly slower same-day recovery |
| **C** | 6h / 24h / 48h | Same-day recovery after soft decline; overnight/next-day; later recovery — fits 7-day window |

**Choose C:** ordinal 1 = **+6h**, ordinal 2 = **+24h**, ordinal 3 = **+48h**.

### RETRYABLE vs TECHNICAL_ERROR budget

| Option | Assessment |
| --- | --- |
| **A — Separate technical budget** | More attempts; harder to reason; can prolong soft/tech loops |
| **B — Unlimited technical until cutoff** | Unsafe / unbounded |
| **C — Shared business budget after D4 RETRY_PENDING; D3 worker retries do not count** | Preserves processing vs business distinction; simple |

**Choose C.**

### Quiet hours

| Option | Assessment |
| --- | --- |
| **A — None for MVP** | Simple; no DST window shifting bugs; ADR-024 already limits aggressiveness |
| **B — Explicit quiet hours** | Needs start/end/shift rules; defer until product evidence |

**Choose A.**

### Due-date local clock (OD-002)

| Option | Assessment |
| --- | --- |
| 09:00 local | Clear business morning capture; rarely DST-gap ambiguous |
| 12:00 / 17:00 | Less recovery room same day; evening may miss banking cycles |
| 23:59 local | End-of-day; awkward DST; confuses “due day” vs “after due” |

**Choose 09:00 merchant-local.**

### Recovery window

| Option | Assessment |
| --- | --- |
| Count-only (no time cutoff) | Conflicts with ADR-024 terminal FAILED trigger |
| 3 calendar days | Tight for 6h/24h/48h schedule + remediation |
| **7 calendar days** | Fits three spaced retries + ACTION_REQUIRED remediation |
| 14+ days | Longer merchant uncertainty |

**Choose dueExecutionInstant + 7 merchant-local calendar days (same 09:00 clock on dueDate+7).**

### Retry Now budget

| Option | Assessment |
| --- | --- |
| **A — Extra free attempts** | Unlimited manual charge risk |
| **B — Separate manual allowance** | Parallel budgets; complexity |
| **C — Accelerates next permitted ordinal; consumes it; cancels ScheduledJob** | Bounded; matches “retry now” intent |

**Choose C.** Retry Now is **in D5 MVP** (SEQ-PAY-007).

### Timezone change (OD-006)

| Option | Assessment |
| --- | --- |
| **A — Keep stored UTC `scheduledFor`; freeze workflow timezone for cutoff** | No silent reschedule |
| **B — Recalculate all pending jobs** | Silent timing moves; unsafe |
| **C — Recalculate only on operator request** | Acceptable later; not MVP default |

**Choose A.**

## Decision

### Binding MVP defaults (architecture defaults)

These are **binding for D5**. Future merchant configurability may override within documented bounds, but MVP ships and tests against these values.

| Parameter | MVP default |
| --- | --- |
| Max same-method **scheduled** retries | **3** |
| Delay ordinal 1 | **+6 hours** elapsed |
| Delay ordinal 2 | **+24 hours** elapsed |
| Delay ordinal 3 | **+48 hours** elapsed |
| Quiet hours | **None** |
| Due execution clock | **09:00** in frozen workflow merchant IANA timezone on `dueDate` |
| Recovery cutoff | **dueDate + 7 calendar days** at **09:00** same frozen timezone |
| RETRYABLE / TECHNICAL_ERROR business budget | **Shared** per method/workflow |
| Retry Now | **In MVP**; consumes next ordinal; no extra budget |

### Retry ordinal (implementable from history)

Budget is **per `PaymentMethod` per `PaymentWorkflow`**.

**Qualifying terminal attempts** for method `M`:

- `status ∈ {DECLINED, ERROR}`
- `declineClassification ∈ {RETRYABLE, TECHNICAL_ERROR}`
- `paymentMethodId = M`

**Does not count:**

- `NON_RETRYABLE` / `UNKNOWN`
- `CAPTURED` / `CANCELLED`
- Backup methods’ attempts (each method has its own budget)
- D3 / WorkerRuntime bounded processing retries that never produced a terminal ERROR attempt
- Immediate backup-walk attempts on **other** methods

**Ordinal definition:**

```text
nextScheduledOrdinal(M) = count(qualifyingTerminalAttempts for M)
```

- After the **initial** soft/tech decline on `M`, count = 1 → next scheduled retry is **ordinal 1**
- After that scheduled retry also ends RETRYABLE/TECHNICAL, count = 2 → next is **ordinal 2**
- Allowed ordinals: **1..3**. If `nextScheduledOrdinal > 3` → budget exhausted for `M`

Initial attempt is **not** itself a “scheduled retry”; it is the trigger that may enter `RETRY_PENDING` when ADR-024 says so.

**NON_RETRYABLE** on `M` → scheduled retry budget for `M` is **0** for this workflow (no RETRY_PENDING on that method).

**Backup methods:** if a backup later soft/tech declines with no further immediate backup, that backup method gets its **own** 1..3 scheduled budget.

### Delay clock basis and base instant

- Delays are **elapsed durations** (not merchant wall-clock slots).
- `scheduledFor = priorQualifyingAttempt.completedAt + delay(nextScheduledOrdinal)`
- Prefer `completedAt`; if null, use recovery-decision time (`now` when scheduling).
- **Do not** base delay on previous `scheduledFor` alone (avoids drifting future schedule when jobs run late).
- Late dispatcher: due handler **rechecks cutoff**; does **not** grant extra ordinals.

### Due execution vs cutoff (do not conflate)

| Instant | Definition | Meaning |
| --- | --- | --- |
| **dueExecutionInstant** | `dueDate` @ **09:00** frozen merchant IANA TZ → UTC | Initial collection / due-date action target |
| **cutoffAt** | `(dueDate + 7 calendar days)` @ **09:00** same frozen TZ → UTC | Terminal recovery window end |

Cutoff is **not** “N hours after last retry”. It is fixed from the bill due date + frozen timezone.

### Frozen timezone

At PaymentWorkflow creation (Bill accept), capture **`businessTimezone`** used for this workflow (snapshot of merchant IANA id at that time).

- All dueExecutionInstant / cutoffAt conversions for **this** workflow use the **frozen** timezone.
- Merchant later changing `merchants.business_timezone` does **not** move existing `ScheduledJob.scheduledFor` UTC values and does **not** recompute this workflow’s cutoff.
- **New** bills/workflows use the new timezone.

### DST / IANA conversion

- Always convert via IANA timezone rules (no fixed offsets).
- Prefer libraries that implement the IANA TZDB.
- If local civil time does not exist (spring forward gap): use the **next valid** local instant after the gap.
- If local civil time is ambiguous (fall back overlap): use the **earlier** offset (typically standard time).
- Chosen 09:00 rarely hits gaps in common AU zones; rules still apply globally.

### Cutoff state transitions

When `now >= cutoffAt`, and workflow is not already `COLLECTED` / `FAILED` / `CANCELLED`:

| Guard | Behaviour |
| --- | --- |
| Any attempt outcome is **UNKNOWN** / reconciliation pending (typically non-terminal `SUBMITTED` after unknown provider outcome) | **Do not** `FAILED`. Remain current recoverable state (usually `PAYMENT_PENDING`). No new charge. Operational reconciliation required. |
| Any attempt **in flight** (`CREATED` / `SUBMITTED` / `AUTHORISED`) | **Do not** `FAILED` yet. No new attempt. Re-evaluate when attempt becomes terminal. |
| Workflow `RETRY_PENDING` and guards clear | → **`FAILED`** (D0 `markFailed`); `PaymentFailed` once |
| Workflow `ACTION_REQUIRED` and guards clear | → **`FAILED`**; `PaymentFailed` once |
| Workflow `PAYMENT_PENDING` with no in-flight / unknown and guards clear | → **`FAILED`** (stale idle past cutoff) |

Cutoff processor / due handler must not race a legitimate in-flight charge into terminal failure.

### Recovery window non-reset

None of the following **extend** `cutoffAt`:

- adding/updating payment methods
- priority changes
- Retry Now
- scheduled retries
- technical errors
- ACTION_REQUIRED remediation

Remediation may restore recoverability **inside** the original window only.

### Retry Now (MVP)

**In scope for D5.**

**Budget:** Option C — executes the **next already-permitted** scheduled ordinal for the selected method (or initiates attempt when budget remains). Consumes that ordinal. Cancels/supersedes pending same-method `ScheduledJob` for that logical retry. **Does not** grant attempts beyond max 3.

**Eligible states:**

- `RETRY_PENDING` (window open; budget remains; no UNKNOWN; no in-flight)
- `ACTION_REQUIRED` (window open; ≥1 eligible method via Rel; no UNKNOWN; no in-flight)

**Not eligible:** `COLLECTED`, `FAILED`, `CANCELLED`, UNKNOWN/reconciliation pending, attempt in flight.

**Method selection on Retry Now:** Reliability Engine / Orchestrator selects eligible method under ADR-024 (not blind re-hit of NON_RETRYABLE-only history). New methods have their own fresh per-method budget.

**Idempotency:** consumer idempotency key + D1 one-in-flight + job cancellation must yield exactly one attempt vs scheduled-due race.

### Canonical policy table (D5 source)

| Trigger | Backup now? | nextOrdinal ≤ 3? | Window open? | Orchestrator / Retry Service | Workflow | ScheduledJob? | Retry Now? | Next attempt method |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CAPTURED | — | — | — | Collect | COLLECTED | no | no | — |
| RETRYABLE + backup | yes | — | yes | Backup attempt (ADR-024) | PAYMENT_PENDING | no | — | backup |
| RETRYABLE + no backup | no | yes | yes | RETRY_PENDING + schedule ordinal | RETRY_PENDING | yes | yes | same method |
| RETRYABLE + no backup | no | no | yes | ACTION_REQUIRED | ACTION_REQUIRED | no | if other eligible method | Rel |
| NON_RETRYABLE + backup | yes | — | yes | Backup | PAYMENT_PENDING | no | — | backup |
| NON_RETRYABLE + no backup | no | — | yes | ACTION_REQUIRED | ACTION_REQUIRED | no | if eligible method | Rel |
| TECHNICAL_ERROR | — (no backup for tech alone) | yes | yes | RETRY_PENDING + schedule | RETRY_PENDING | yes | yes | same method |
| TECHNICAL_ERROR | — | no | yes | ACTION_REQUIRED | ACTION_REQUIRED | no | if eligible | Rel |
| UNKNOWN | — | — | — | Reconcile only | stay PAYMENT_PENDING | **no** | **no** | none |
| PaymentRetryDue | — | recheck | yes | PAYMENT_PENDING + new attempt + ExecutePaymentAttempt cmd | PAYMENT_PENDING | handled | — | same method scheduled |
| PaymentRetryDue | — | — | no (cutoff) | FAILED if guards clear | FAILED | no new attempt | no | — |
| Cutoff tick | — | — | no | FAILED if guards clear | FAILED | cancel pending | no | — |
| Retry Now | Rel | consumes ordinal | yes | cancel job; create attempt; execute cmd | PAYMENT_PENDING | cancel/supersede | — | selected eligible |

## Consequences

### Positive

- D5 unblocked with exact numbers, clock, cutoff, Retry Now, timezone rules.
- Bounded retries; no quiet-hours complexity in MVP.
- UNKNOWN and in-flight outrank cutoff (financial safety).
- Timezone changes cannot silently move stored schedules or frozen cutoffs.

### Negative / tradeoffs

- 09:00 / 7-day / 3-retry defaults may need later product tuning (config bounds allowed).
- Shared soft/tech budget may exhaust after mixed failures on one method.
- Frozen timezone requires workflow/bill snapshot of IANA id at create.

### Must / must not

**Must**

- Implement production `RetryBudgetPolicy` from this ADR (replace qualitative D4 placeholder).
- Schedule `PaymentRetryDue` with durable `ScheduledJob` and stable logical identity `(workflow, method, ordinal)`.
- Recheck budget + cutoff on due / Retry Now / cutoff processing.
- Emit at most one `PaymentFailed` per workflow FAILED transition.

**Must not**

- Invent different delays/counts without superseding this ADR.
- Call PSP from Retry Service / scheduler handler.
- Post ledger / settle / mutate wallet in D5.
- Mark FAILED while UNKNOWN reconciliation pending or attempt in flight.
- Let Retry Now create unbounded attempts.
- Silently reschedule existing jobs on merchant timezone change.

## Dependencies / Open Questions

- Resolves **OD-001**, **OD-002**, **OD-006** for MVP payment retry/cutoff.
- Merchant-configurable overrides (beyond defaults) remain future product work; if added, enforce bounds: max retries 1–5; delays positive and non-decreasing; window 1–30 calendar days; clock hour 0–23.
- OD-003 backup cardinality remains open (unrelated).

## Related Architecture

- Docs: [retry-policy.md](../payments/retry-policy.md), [due-dates.md](../contracts/due-dates.md), [payment-lifecycle.md](../payments/payment-lifecycle.md), [scheduling.md](../operations/scheduling.md)
- Designs: SEQ-PAY-005, SEQ-PAY-006, SEQ-PAY-007
- ADRs: ADR-002, ADR-003, ADR-017, ADR-024
- Platform phase: D5
