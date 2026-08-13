/**
 * Generate requirements/tests/*.md baseline catalogue.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'requirements', 'tests')
fs.mkdirSync(outDir, { recursive: true })

function write(meta, body) {
  const lines = ['---']
  for (const [k, v] of Object.entries(meta)) {
    if (Array.isArray(v)) {
      if (!v.length) lines.push(`${k}: []`)
      else {
        lines.push(`${k}:`)
        for (const i of v) lines.push(`  - ${i}`)
      }
    } else if (typeof v === 'boolean') lines.push(`${k}: ${v}`)
    else lines.push(`${k}: ${v}`)
  }
  lines.push('---', '', `# ${meta.id} — ${meta.title}`, '', body.trim(), '')
  fs.writeFileSync(path.join(outDir, `${meta.id}.md`), lines.join('\n'), 'utf8')
}

const fin = [
  ['FIN-INV-01', 'No duplicate collection', ['FUN-PAY-008'], 'Same payment cannot be collected twice.'],
  ['FIN-INV-02', 'One collection one ledger posting', ['FUN-SET-005'], 'One successful collection yields exactly one ledger posting.'],
  ['FIN-INV-03', 'Balanced journal', ['FUN-SET-006'], 'Journal transaction always balances.'],
  ['FIN-INV-04', 'Failed collection not settlement-eligible', ['FUN-SET-001', 'BUS-004'], 'Failed collection cannot become settlement eligible.'],
  ['FIN-INV-05', 'No duplicate settlement submission', ['FUN-SET-002'], 'Settlement cannot be submitted twice for same instruction identity.'],
  ['FIN-INV-06', 'No blind retry on unknown payout', ['FUN-SET-003', 'NFR-REL-005'], 'Unknown payout outcome cannot trigger blind duplicate submission.'],
  ['FIN-INV-07', 'Compensating corrections only', ['FUN-SET-007', 'FUN-SET-008'], 'Ledger correction does not mutate historical entry.'],
  ['FIN-INV-08', 'Cross-merchant settlement isolation', ['NFR-SEC-001'], 'Merchant A can never settle against Merchant B data.'],
  ['FIN-INV-09', 'Idempotent event replay', ['NFR-REL-001'], 'Replay of event is idempotent (no duplicate financial effect).'],
  ['FIN-INV-10', 'Safe worker restart', ['NFR-REL-002'], 'Worker restart cannot create duplicate financial effect.'],
]

for (const [id, title, reqs, purpose] of fin) {
  write(
    {
      id,
      title,
      type: 'financial-invariant',
      status: 'specified',
      relatedRequirements: reqs,
      mvp: true,
    },
    `## Purpose

${purpose}

## Preconditions

- Deterministic fixtures and fake provider adapters available.
- Isolated ledger/operational stores for the test.

## Scenario

Exercise the invariant under success, replay, and restart conditions as applicable.

## Expected result

Invariant holds; test fails the release if violated.

## Implementation status

\`specified\` — automated in future \`sparelane-platform\` CI.`,
  )
}

const e2ePay = [
  ['E2E-PAY-001', 'Primary payment success', ['FUN-PAY-001', 'FUN-PAY-003'], 'primaryCardSuccess', 'Bill pays successfully via primary method.'],
  ['E2E-PAY-002', 'Backup payment success', ['FUN-PAY-004', 'BUS-005'], 'backupRecovery', 'Primary fails; ordered backup succeeds.'],
  ['E2E-PAY-003', 'Scheduled retry', ['FUN-PAY-006'], 'scheduledRetry', 'Eligible failure schedules a bounded retry.'],
  ['E2E-PAY-004', 'Complete failure', ['FUN-PAY-007', 'BUS-003'], 'completeFailure', 'All methods/retries exhausted → terminal failure.'],
  ['E2E-PAY-005', 'Consumer Retry Now', ['FUN-CON-006'], 'consumerRetryNow', 'Eligible Retry Now creates a new attempt without duplicate collection.'],
]

for (const [id, title, reqs, flow, purpose] of e2ePay) {
  write(
    {
      id,
      title,
      type: 'e2e',
      status: 'specified',
      relatedRequirements: reqs,
      relatedFlows: [flow],
      mvp: true,
    },
    `## Purpose

${purpose}

## Preconditions

- Merchant and consumer fixtures connected; bill eligible for payment.
- Fake PSP returns scripted outcomes.

## Scenario

Drive the \`${flow}\` dynamic flow end-to-end.

## Expected result

Workflow and attempt states match architecture; merchant/consumer outcomes consistent.

## Implementation status

\`specified\``,
  )
}

const e2eSet = [
  ['E2E-SET-001', 'Successful settlement', ['FUN-SET-001', 'FUN-SET-002'], 'merchantSettlement'],
  ['E2E-SET-002', 'Settlement failure', ['FUN-SET-004'], 'settlementFailure'],
  ['E2E-SET-003', 'Unknown settlement outcome', ['FUN-SET-003', 'NFR-REL-005'], 'unknownSettlementOutcome'],
]

for (const [id, title, reqs, flow] of e2eSet) {
  write(
    {
      id,
      title,
      type: 'e2e',
      status: 'specified',
      relatedRequirements: reqs,
      relatedFlows: [flow],
      mvp: true,
    },
    `## Purpose

Verify settlement lifecycle path \`${flow}\`.

## Preconditions

- Collected funds posted to ledger where required.
- Fake settlement partner scripted.

## Scenario

Execute settlement path for ${title.toLowerCase()}.

## Expected result

Settlement state machine and reconciliation behaviour match ADRs.

## Implementation status

\`specified\``,
  )
}

const intSpecs = [
  ['INT-API-001', 'Duplicate bill submission idempotent', ['FUN-MER-004', 'FUN-MER-003'], 'duplicateBillSubmission'],
  ['INT-API-002', 'Merchant webhook retry', ['FUN-MER-006', 'NFR-SEC-005'], 'merchantWebhookRetry'],
  ['INT-PSP-001', 'Provider webhook verification rejects invalid signature', ['NFR-SEC-006', 'INT-PSP-005'], 'providerWebhookVerification'],
]

for (const [id, title, reqs, flow] of intSpecs) {
  write(
    {
      id,
      title,
      type: 'integration',
      status: 'specified',
      relatedRequirements: reqs,
      relatedFlows: [flow],
      mvp: true,
    },
    `## Purpose

${title}.

## Preconditions

- Merchant API / webhook fixtures as applicable.

## Scenario

Exercise \`${flow}\`.

## Expected result

Idempotency/signature/retry rules hold.

## Implementation status

\`specified\``,
  )
}

const sec = [
  ['SEC-TEN-001', 'Cross-merchant access denial', ['NFR-SEC-001', 'FIN-INV-08'], 'Merchant A cannot read/mutate Merchant B resources.'],
  ['SEC-AUTH-001', 'Invalid merchant API credential rejected', ['FUN-MER-001', 'NFR-SEC-003'], 'Invalid credentials cannot call Merchant API.'],
]

for (const [id, title, reqs, purpose] of sec) {
  write(
    {
      id,
      title,
      type: 'security',
      status: 'specified',
      relatedRequirements: reqs,
      mvp: true,
    },
    `## Purpose

${purpose}

## Preconditions

- Two merchant tenants; valid and invalid credentials.

## Scenario

Attempt cross-tenant or invalid-auth access.

## Expected result

Denied with no data leakage.

## Implementation status

\`specified\``,
  )
}

const ops = [
  ['OPS-REC-001', 'Ledger posting recovery', ['FUN-SET-005', 'NFR-REL-001'], 'ledgerPostingRecovery'],
  ['OPS-REC-002', 'DLQ safe replay', ['NFR-REL-004'], 'dlqReplay'],
]

for (const [id, title, reqs, flow] of ops) {
  write(
    {
      id,
      title,
      type: 'operations',
      status: 'specified',
      relatedRequirements: reqs,
      relatedFlows: [flow],
      mvp: true,
    },
    `## Purpose

${title} via \`${flow}\`.

## Preconditions

- Induced failure/poison message as applicable.

## Scenario

Recover via outbox/DLQ replay without duplicate financial effects.

## Expected result

Recovery succeeds; invariants hold.

## Implementation status

\`specified\``,
  )
}

const con = [
  ['CON-API-001', 'Merchant API OpenAPI contract smoke', ['FUN-MER-003', 'FUN-MER-005'], 'Contract shapes for bill/payment endpoints remain valid.'],
  ['CON-WEBHOOK-001', 'Signed webhook envelope shape', ['FUN-MER-006', 'NFR-SEC-005'], 'Webhook envelope and signature headers match contracts.'],
]

for (const [id, title, reqs, purpose] of con) {
  write(
    {
      id,
      title,
      type: 'contract',
      status: 'specified',
      relatedRequirements: reqs,
      mvp: true,
    },
    `## Purpose

${purpose}

## Preconditions

- OpenAPI and webhook contract docs current.

## Scenario

Validate request/response/webhook shapes against contracts.

## Expected result

No contract drift for MVP surfaces.

## Implementation status

\`specified\``,
  )
}

fs.writeFileSync(
  path.join(outDir, 'README.md'),
  `# Test catalogue

Architecture-repo **test specifications** (not executable product tests).

Stable IDs are referenced from requirement \`tests:\` frontmatter.

| Prefix | Meaning |
| --- | --- |
| \`FIN-INV-###\` | Financial invariants |
| \`E2E-PAY-###\` | End-to-end payment |
| \`E2E-SET-###\` | End-to-end settlement |
| \`INT-API-###\` / \`INT-PSP-###\` | Integration |
| \`SEC-TEN-###\` / \`SEC-AUTH-###\` | Security |
| \`OPS-REC-###\` | Operations recovery |
| \`CON-API-###\` / \`CON-WEBHOOK-###\` | Contracts |

Portal: \`/tests\` and \`/tests/:id\`.

See also [../test-catalog.md](../test-catalog.md) for the FIN-INV mapping summary.
`,
  'utf8',
)

const count = fs.readdirSync(outDir).filter((f) => f.endsWith('.md') && f !== 'README.md').length
console.log(`Wrote ${count} test specs`)
