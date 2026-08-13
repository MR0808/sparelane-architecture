/**
 * One-shot generator for Portal Phase 2 initial requirements.
 * Safe to re-run: overwrites known generated files only.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const reqRoot = path.join(root, 'requirements')

function frontmatter(meta) {
  const lines = ['---']
  for (const [k, v] of Object.entries(meta)) {
    if (v === undefined) continue
    if (Array.isArray(v)) {
      if (v.length === 0) {
        lines.push(`${k}: []`)
      } else {
        lines.push(`${k}:`)
        for (const item of v) lines.push(`  - ${item}`)
      }
    } else if (typeof v === 'boolean') {
      lines.push(`${k}: ${v}`)
    } else {
      lines.push(`${k}: ${v}`)
    }
  }
  lines.push('---', '')
  return lines.join('\n')
}

function writeReq(dir, meta, body) {
  const folder = path.join(reqRoot, dir)
  fs.mkdirSync(folder, { recursive: true })
  const file = path.join(folder, `${meta.id}.md`)
  const title = `# ${meta.id} — ${meta.title}`
  fs.writeFileSync(file, frontmatter(meta) + title + '\n\n' + body.trim() + '\n', 'utf8')
  return meta.id
}

const ids = []

function add(dir, meta, body) {
  ids.push(writeReq(dir, meta, body))
}

// ── Business ──────────────────────────────────────────────
add(
  'business',
  {
    id: 'BUS-001',
    title: 'Improve reliability of recurring bill payments',
    type: 'business',
    area: 'business',
    status: 'accepted',
    priority: 'must',
    mvp: true,
    architecture: ['architectureMap', 'paymentEngineCore'],
    flows: ['paymentLifecycle'],
    adrs: ['ADR-002'],
    contracts: [],
    modules: ['Payment Workflows', 'Reliability Engine'],
    tests: [],
  },
  `## Requirement

Sparelane must improve the reliability of recurring bill payment collection for connected consumers and merchants through orchestrated attempts, retries, and backup payment methods.

## Rationale

Reliability of collection is the core product value; merchants remain the billing system of record while Sparelane orchestrates payment outcomes.

## Acceptance Criteria

- Architecture and MVP acceptance criteria describe orchestrated collection with retries and backup methods.
- Payment Reliability Engine is modelled as the owner of payment workflow state.

## Notes

Does not imply guaranteed payment success.`,
)

add(
  'business',
  {
    id: 'BUS-002',
    title: 'Merchants retain existing billing systems',
    type: 'business',
    area: 'business',
    status: 'accepted',
    priority: 'must',
    mvp: true,
    architecture: ['merchantIntegration', 'architectureMap'],
    flows: ['billSubmission'],
    adrs: ['ADR-007'],
    contracts: ['contracts/openapi.yaml'],
    modules: ['Bills', 'Merchant Integrations'],
    tests: [],
  },
  `## Requirement

Merchants must remain the system of record for billing. Sparelane must not replace merchant billing systems.

## Rationale

ADR-007: Sparelane ingests bill events and orchestrates payment; it does not become the billing SoR.

## Acceptance Criteria

- Merchants submit bills via Merchant API (or equivalent integration).
- Sparelane stores payment/settlement state, not the merchant's authoritative bill catalog as SoR.

## Notes

See merchant onboarding and Merchant API docs.`,
)

add(
  'business',
  {
    id: 'BUS-003',
    title: 'Sparelane does not guarantee payment',
    type: 'business',
    area: 'business',
    status: 'accepted',
    priority: 'must',
    mvp: true,
    architecture: ['paymentEngineCore'],
    flows: ['completeFailure'],
    adrs: ['ADR-002', 'ADR-003'],
    contracts: [],
    modules: ['Payment Workflows', 'Reliability Engine'],
    tests: [],
  },
  `## Requirement

Sparelane must not represent or operate as a guarantor of payment success. Collection may fail after all eligible methods and retries are exhausted.

## Rationale

Reliability orchestration improves outcomes; it does not underwrite consumer payment ability.

## Acceptance Criteria

- Complete-failure flows and merchant-facing outcomes distinguish failure from success.
- Product and partner materials must not claim guaranteed collection.

## Notes

Related: BUS-001 improves reliability without guaranteeing success.`,
)

add(
  'business',
  {
    id: 'BUS-004',
    title: 'Settle merchants only after consumer funds are collected',
    type: 'business',
    area: 'business',
    status: 'accepted',
    priority: 'must',
    mvp: true,
    architecture: ['settlementCore', 'fundsLedger'],
    flows: ['collectionToLedger', 'merchantSettlement'],
    adrs: ['ADR-005', 'ADR-006'],
    contracts: ['contracts/openapi.yaml'],
    modules: ['Settlement', 'Ledger'],
    tests: ['FIN-INV-04'],
  },
  `## Requirement

Merchants must become settlement-eligible only after consumer funds are successfully collected and financially posted per ledger rules. Sparelane must not advance funds awaiting collection.

## Rationale

ADR-005/006 separate payment workflow success from settlement lifecycle and require collection before settlement.

## Acceptance Criteria

- Failed collection cannot become settlement eligible (FIN-INV-04).
- Settlement state machine gates on ledger confirmation.

## Notes

Does not define settlement rail vendor.`,
)

add(
  'business',
  {
    id: 'BUS-005',
    title: 'Support consumer fallback payment methods',
    type: 'business',
    area: 'business',
    status: 'accepted',
    priority: 'must',
    mvp: true,
    architecture: ['paymentEngineCore', 'experienceApi'],
    flows: ['backupRecovery', 'addPaymentMethod'],
    adrs: ['ADR-001', 'ADR-002'],
    contracts: [],
    modules: ['Payment Methods', 'Reliability Engine'],
    tests: [],
    related: ['FUN-PAY-004', 'FUN-CON-004'],
  },
  `## Requirement

Sparelane must support ordered consumer backup payment methods when the primary method fails according to decline/retry policy.

## Rationale

Fallback methods are a primary reliability lever for recurring bills.

## Acceptance Criteria

- Consumers can maintain primary and ordered backup methods.
- Payment orchestration evaluates backups after eligible primary failure per policy.

## Notes

Tokenisation remains with the PSP (ADR-001).`,
)

add(
  'business',
  {
    id: 'BUS-006',
    title: 'Provide merchants payment and settlement outcomes',
    type: 'business',
    area: 'business',
    status: 'accepted',
    priority: 'must',
    mvp: true,
    architecture: ['merchantIntegration', 'settlementCore'],
    flows: ['merchantWebhookDelivery', 'merchantReconciliationFlow'],
    adrs: ['ADR-009', 'ADR-023'],
    contracts: ['contracts/openapi.yaml', 'docs/contracts/webhook-events.md'],
    modules: ['Webhooks', 'Settlement', 'Merchant Integrations'],
    tests: [],
  },
  `## Requirement

Sparelane must provide merchants with authoritative payment and settlement outcomes via API retrieval and signed webhook delivery of curated events.

## Rationale

Merchants need reliable outcome visibility without receiving raw internal state dumps (ADR-023).

## Acceptance Criteria

- Merchants can retrieve payment and settlement status via Merchant API.
- Signed webhooks deliver curated outcome events with at-least-once delivery semantics.

## Notes

Event catalog lives in contracts docs.`,
)

// ── Consumer functional ───────────────────────────────────
const consumer = [
  [
    'FUN-CON-001',
    'Consumer account and authentication',
    ['experienceApi', 'privilegedAccess'],
    ['merchantConnection'],
    ['ADR-012'],
    [],
    ['Experience', 'Identity'],
    `Consumers must authenticate to Sparelane consumer experiences before managing connections, payment methods, or initiating Retry Now.`,
    `Distinct consumer identity is required for tenant-safe access to consumer-scoped data.`,
    [
      'Unauthenticated consumers cannot mutate payment methods or connections.',
      'Authenticated sessions are scoped to the consumer identity.',
    ],
  ],
  [
    'FUN-CON-002',
    'Connect to a merchant',
    ['experienceApi', 'merchantIntegration'],
    ['merchantConnection'],
    ['ADR-007'],
    [],
    ['Experience', 'Merchant Integrations'],
    `Consumers must be able to establish a connection to a participating merchant so bills and payment orchestration can proceed.`,
    `Connection is the link between consumer identity and merchant billing relationship.`,
    [
      'A successful connection associates consumer and merchant for subsequent bill presentation.',
      'Connection state is visible to the consumer experience.',
    ],
  ],
  [
    'FUN-CON-003',
    'Add tokenised payment method',
    ['experienceApi', 'pciBoundaryView'],
    ['addPaymentMethod'],
    ['ADR-001', 'ADR-010'],
    [],
    ['Payment Methods', 'PSP adapter'],
    `Consumers must be able to add a payment method using PSP tokenisation so Sparelane never handles raw PAN/CVV.`,
    `PCI boundary requires tokenisation at the PSP (ADR-001/010).`,
    [
      'Sparelane stores only token references and display metadata, never PAN/CVV.',
      'Add-payment-method flow completes only after PSP tokenisation succeeds.',
    ],
  ],
  [
    'FUN-CON-004',
    'Set primary and backup payment method priority',
    ['experienceApi', 'paymentEngineCore'],
    ['paymentLifecycle'],
    ['ADR-002'],
    [],
    ['Payment Methods', 'Reliability Engine'],
    `Consumers must be able to designate a primary payment method and an ordered list of backup methods.`,
    `Orchestration depends on a clear evaluation order (see FUN-PAY-003/004).`,
    [
      'Exactly one eligible primary can be active for a consumer payment context as modelled.',
      'Backup order is persisted and used by the Reliability Engine.',
    ],
  ],
  [
    'FUN-CON-005',
    'View bill and payment state',
    ['experienceApi', 'paymentEngineCore'],
    ['paymentLifecycle'],
    ['ADR-003'],
    [],
    ['Experience', 'Payment Workflows'],
    `Consumers must be able to view current bill presentation and payment workflow state for connected merchants.`,
    `Transparency supports Retry Now and reduces support load.`,
    [
      'Consumer UI shows non-sensitive payment/bill state consistent with workflow model.',
      'States distinguish in-progress, collected, and failed outcomes.',
    ],
  ],
  [
    'FUN-CON-006',
    'Consumer Retry Now',
    ['experienceApi', 'paymentEngineCore'],
    ['consumerRetryNow'],
    ['ADR-002', 'ADR-003'],
    [],
    ['Payment Workflows', 'Reliability Engine'],
    `Consumers must be able to trigger an immediate eligible retry (Retry Now) when the payment workflow allows it.`,
    `Manual retry complements scheduled retries without bypassing eligibility or duplicate-collection guards.`,
    [
      'Retry Now is rejected when the workflow is not in a retry-eligible state.',
      'Retry Now cannot create a duplicate successful collection for the same bill workflow.',
    ],
  ],
]

for (const [id, title, architecture, flows, adrs, contracts, modules, req, rationale, ac] of consumer) {
  add(
    'functional',
    {
      id,
      title,
      type: 'functional',
      area: 'consumer',
      status: 'accepted',
      priority: 'must',
      mvp: true,
      architecture,
      flows,
      adrs,
      contracts,
      modules,
      tests: [],
    },
    `## Requirement

${req}

## Rationale

${rationale}

## Acceptance Criteria

${ac.map((a) => `- ${a}`).join('\n')}

## Notes

MVP consumer experience scope.`,
  )
}

// ── Merchant functional ───────────────────────────────────
const merchant = [
  [
    'FUN-MER-001',
    'Onboard merchant',
    ['merchantIntegration'],
    [],
    ['ADR-007'],
    ['docs/integrations/merchant-onboarding.md'],
    ['Merchant Integrations'],
    `Sparelane must support merchant onboarding so a merchant can participate in bill submission, webhooks, and settlement.`,
    `Onboarding establishes tenant identity and integration configuration.`,
    ['Onboarded merchants receive credentials/config needed for Merchant API access.', 'Merchant tenant boundaries are established at onboarding.'],
  ],
  [
    'FUN-MER-002',
    'Configure merchant integration',
    ['merchantIntegration'],
    [],
    ['ADR-008', 'ADR-009'],
    ['docs/integrations/merchant-api.md'],
    ['Merchant Integrations', 'Webhooks'],
    `Merchants must be able to configure integration settings required for API access and webhook delivery endpoints.`,
    `Configuration is prerequisite to reliable bill ingestion and outcome delivery.`,
    ['Webhook endpoint and signing configuration can be set for the merchant.', 'API credentials are merchant-scoped.'],
  ],
  [
    'FUN-MER-003',
    'Submit bill',
    ['merchantIntegration', 'paymentEngineCore'],
    ['billSubmission', 'billIngestion'],
    ['ADR-007', 'ADR-008'],
    ['contracts/openapi.yaml'],
    ['Bills', 'Merchant Integrations'],
    `Merchants must be able to submit bill events that create or update Sparelane bill records used for payment orchestration.`,
    `Bill submission is the entry point for payment reliability workflows.`,
    ['POST /bills (or equivalent) accepts a well-formed bill submission.', 'Successful submission makes the bill eligible for payment workflow creation per policy.'],
  ],
  [
    'FUN-MER-004',
    'Safely retry duplicate bill request',
    ['merchantIntegration'],
    ['duplicateBillSubmission'],
    ['ADR-008'],
    ['contracts/openapi.yaml'],
    ['Bills', 'API layer'],
    `Merchants must be able to safely retry bill submission requests without creating duplicate bills or duplicate payment workflows.`,
    `Idempotent Merchant API (ADR-008) is required for at-least-once client retries.`,
    ['Duplicate submission with the same idempotency key returns the original result without creating a second bill/workflow.', 'Non-idempotent conflicting payloads are rejected safely.'],
  ],
  [
    'FUN-MER-005',
    'Retrieve payment status',
    ['merchantIntegration', 'paymentEngineCore'],
    ['paymentLifecycle'],
    ['ADR-003', 'ADR-020'],
    ['contracts/openapi.yaml'],
    ['Payment Workflows', 'Merchant Integrations'],
    `Merchants must be able to retrieve payment status for a bill/payment using opaque public identifiers.`,
    `Polling complements webhooks for reconciliation.`,
    ['GET payment endpoints return current workflow-level outcome suitable for merchants.', 'Identifiers follow opaque public ID strategy (ADR-020).'],
  ],
  [
    'FUN-MER-006',
    'Receive signed webhook',
    ['merchantIntegration', 'trustBoundaries'],
    ['merchantWebhookDelivery', 'merchantWebhookRetry'],
    ['ADR-009', 'ADR-023'],
    ['docs/contracts/webhook-events.md', 'docs/integrations/webhooks.md'],
    ['Webhooks'],
    `Merchants must receive signed webhooks for curated payment and settlement outcome events with at-least-once delivery and retry.`,
    `Signed at-least-once delivery (ADR-009) with curated events (ADR-023).`,
    ['Webhook payloads are signed and verifiable by the merchant.', 'Failed deliveries are retried per policy without dropping durable intent.'],
  ],
  [
    'FUN-MER-007',
    'Retrieve settlement status',
    ['settlementCore', 'merchantIntegration'],
    ['merchantSettlement', 'merchantReconciliationFlow'],
    ['ADR-006', 'ADR-005'],
    ['contracts/openapi.yaml'],
    ['Settlement', 'Merchant Integrations'],
    `Merchants must be able to retrieve settlement status for settlement-eligible collections.`,
    `Settlement visibility is required for merchant finance operations.`,
    ['Settlement status API returns lifecycle state distinct from payment workflow state.', 'Merchants cannot observe another tenant settlement data.'],
  ],
]

for (const [id, title, architecture, flows, adrs, contracts, modules, req, rationale, ac] of merchant) {
  add(
    'functional',
    {
      id,
      title,
      type: 'functional',
      area: 'merchant',
      status: 'accepted',
      priority: 'must',
      mvp: true,
      architecture,
      flows,
      adrs,
      contracts,
      modules,
      tests: [],
    },
    `## Requirement

${req}

## Rationale

${rationale}

## Acceptance Criteria

${ac.map((a) => `- ${a}`).join('\n')}

## Notes

MVP merchant integration scope.`,
  )
}

// ── Bills ─────────────────────────────────────────────────
add(
  'functional',
  {
    id: 'FUN-BIL-001',
    title: 'Ingest merchant bill events',
    type: 'functional',
    area: 'bills',
    status: 'accepted',
    priority: 'must',
    mvp: true,
    architecture: ['paymentEngineCore', 'merchantIntegration'],
    flows: ['billIngestion', 'billSubmission'],
    adrs: ['ADR-007'],
    contracts: ['contracts/openapi.yaml'],
    modules: ['Bills'],
    tests: [],
  },
  `## Requirement

Sparelane must ingest merchant bill events into operational bill records that drive payment scheduling and orchestration.

## Rationale

Bill Management owns ingestion and scheduling against due dates.

## Acceptance Criteria

- Ingested bills are durable in the operational store.
- Invalid bill payloads are rejected without partial orchestration side effects.

## Notes

Merchants remain billing SoR (BUS-002).`,
)

add(
  'functional',
  {
    id: 'FUN-BIL-002',
    title: 'Schedule payment actions against due dates',
    type: 'functional',
    area: 'bills',
    status: 'accepted',
    priority: 'must',
    mvp: true,
    architecture: ['paymentEngineCore'],
    flows: ['billIngestion', 'scheduledRetry'],
    adrs: ['ADR-002'],
    contracts: [],
    modules: ['Bills', 'Reliability Engine'],
    tests: [],
  },
  `## Requirement

Sparelane must schedule payment reliability actions relative to bill due dates according to configured policy.

## Rationale

Due-date-aware scheduling is required for recurring bill reliability.

## Acceptance Criteria

- Eligible bills produce scheduled payment actions before/at due policy windows.
- Scheduling respects workflow state and does not double-schedule conflicting collections.

## Notes

Exact schedule knobs may remain open decisions.`,
)

// ── Payments ──────────────────────────────────────────────
const payments = [
  [
    'FUN-PAY-001',
    'Create one payment workflow per bill',
    ['paymentEngineCore'],
    ['paymentLifecycle', 'billIngestion'],
    ['ADR-003'],
    [],
    ['Payment Workflows'],
    ['FIN-INV-01'],
    `Sparelane must create exactly one payment workflow per eligible bill payment context.`,
    `ADR-003: workflow vs attempt separation; one bill → one workflow.`,
    ['A bill does not receive concurrent duplicate workflows for the same payment context.', 'Multiple attempts may exist under a single workflow.'],
  ],
  [
    'FUN-PAY-002',
    'Pre-authorise where supported',
    ['paymentEngineCore'],
    ['preAuthorisation'],
    ['ADR-002'],
    [],
    ['Reliability Engine', 'PSP adapter'],
    [],
    `Where the payment rail and PSP support it, Sparelane must be able to pre-authorise before capture as part of the payment attempt.`,
    `Pre-authorisation reduces failed captures and supports reliability policy.`,
    ['Pre-authorisation attempts are recorded as payment attempts under the workflow.', 'Unsupported rails skip pre-authorisation without blocking the workflow model.'],
  ],
  [
    'FUN-PAY-003',
    'Use primary payment method first',
    ['paymentEngineCore'],
    ['primaryCardSuccess'],
    ['ADR-002', 'ADR-003'],
    [],
    ['Payment Workflows', 'Reliability Engine'],
    [],
    `Sparelane must evaluate the consumer's eligible primary payment method before ordered backup payment methods for an eligible bill payment workflow.`,
    `Primary-first is the default reliability policy for consumer methods.`,
    ['Primary method is attempted before backups when eligible.', 'primaryCardSuccess flow documents the happy path.'],
  ],
  [
    'FUN-PAY-004',
    'Ordered fallback across backup methods',
    ['paymentEngineCore'],
    ['backupRecovery', 'paymentRecovery'],
    ['ADR-002'],
    [],
    ['Reliability Engine'],
    [],
    `On eligible primary failure, Sparelane must attempt ordered backup payment methods according to decline classification and policy.`,
    `Backup recovery is a core reliability behaviour (BUS-005).`,
    ['Backup order matches consumer-configured priority.', 'Ineligible methods are skipped without counting as successful collection.'],
  ],
  [
    'FUN-PAY-005',
    'Classify declines for retry policy',
    ['paymentEngineCore'],
    ['paymentRecovery', 'scheduledRetry'],
    ['ADR-002'],
    [],
    ['Reliability Engine'],
    [],
    `Sparelane must classify payment declines/failures to decide soft retry, hard fail, or method fallback.`,
    `Classification prevents blind retries and guides fallback.`,
    ['Decline classes are persisted on attempts.', 'Retry/fallback decisions are driven by classification policy.'],
  ],
  [
    'FUN-PAY-006',
    'Scheduled retry',
    ['paymentEngineCore'],
    ['scheduledRetry'],
    ['ADR-002', 'ADR-017'],
    [],
    ['Reliability Engine', 'Workers'],
    [],
    `Sparelane must support scheduled retries for retry-eligible payment failures within bounded policy.`,
    `Scheduled retries complement Retry Now and fallback.`,
    ['Retries are bounded (see NFR-REL-003).', 'Scheduled retry does not bypass duplicate-collection protections.'],
  ],
  [
    'FUN-PAY-007',
    'Complete failure terminal state',
    ['paymentEngineCore'],
    ['completeFailure'],
    ['ADR-003'],
    [],
    ['Payment Workflows'],
    [],
    `When all eligible methods and retries are exhausted, the payment workflow must reach a complete-failure terminal state and surface outcomes to merchants/consumers.`,
    `Terminal failure is required for honest outcomes (BUS-003).`,
    ['Complete failure is distinct from in-progress and collected states.', 'Merchants can observe failure via API/webhooks.'],
  ],
  [
    'FUN-PAY-008',
    'No duplicate collection',
    ['paymentEngineCore', 'fundsLedger'],
    ['collectionToLedger', 'paymentProviderTimeout'],
    ['ADR-003', 'ADR-016'],
    [],
    ['Payment Workflows', 'Ledger'],
    ['FIN-INV-01', 'FIN-INV-02'],
    `Sparelane must prevent duplicate successful collection for the same payment workflow/bill payment context.`,
    `Financial safety: same payment cannot be collected twice (FIN-INV-01).`,
    ['Concurrent attempts cannot produce two successful collections for one workflow.', 'Provider timeouts are reconciled without blind double capture.'],
  ],
]

for (const [id, title, architecture, flows, adrs, contracts, modules, tests, req, rationale, ac] of payments) {
  add(
    'functional',
    {
      id,
      title,
      type: 'functional',
      area: 'payments',
      status: 'accepted',
      priority: 'must',
      mvp: true,
      architecture,
      flows,
      adrs,
      contracts,
      modules,
      tests,
      dependsOn: id === 'FUN-PAY-004' ? ['FUN-PAY-003'] : id === 'FUN-PAY-003' ? ['FUN-PAY-001'] : [],
    },
    `## Requirement

${req}

## Rationale

${rationale}

## Acceptance Criteria

${ac.map((a) => `- ${a}`).join('\n')}

## Notes

Payment Reliability Engine MVP.`,
  )
}

// ── Ledger + Settlement (FUN-SET) ─────────────────────────
const settlement = [
  [
    'FUN-SET-001',
    'Ledger confirmation before settlement eligibility',
    ['settlementCore', 'fundsLedger'],
    ['collectionToLedger', 'merchantSettlement'],
    ['ADR-005', 'ADR-004'],
    [],
    ['Settlement', 'Ledger'],
    ['FIN-INV-04'],
    `A collection becomes settlement-eligible only after successful ledger posting confirmation.`,
    `Collection before settlement (ADR-005).`,
    ['No settlement eligibility without ledger confirmation.', 'Failed collection cannot become settlement eligible.'],
  ],
  [
    'FUN-SET-002',
    'Submit settlement idempotently',
    ['settlementCore'],
    ['merchantSettlement', 'settlementConfirmation'],
    ['ADR-006'],
    ['contracts/openapi.yaml'],
    ['Settlement'],
    ['FIN-INV-05'],
    `Settlement instructions must be submitted idempotently so the same instruction identity cannot be paid out twice.`,
    `FIN-INV-05: settlement cannot be submitted twice for the same instruction identity.`,
    ['Replay of settlement submission is idempotent.', 'Duplicate settlement instruction is rejected or returns original outcome.'],
  ],
  [
    'FUN-SET-003',
    'Handle unknown payout outcomes safely',
    ['settlementCore'],
    ['unknownSettlementOutcome', 'settlementFailure'],
    ['ADR-006'],
    [],
    ['Settlement', 'Reconciliation'],
    ['FIN-INV-06'],
    `When settlement payout outcome is unknown, Sparelane must not blindly resubmit; it must reconcile via provider lookup/status before further action.`,
    `FIN-INV-06 and NFR-REL-005.`,
    ['Unknown outcomes enter a safe holding/reconcile path.', 'No automatic duplicate settlement submission on timeout alone.'],
  ],
  [
    'FUN-SET-004',
    'Reconcile settlements',
    ['reconciliationCore', 'settlementCore'],
    ['merchantReconciliationFlow', 'settlementConfirmation'],
    ['ADR-006'],
    [],
    ['Reconciliation', 'Settlement'],
    [],
    `Sparelane must support reconciliation of settlement instructions against provider outcomes and ledger postings.`,
    `Reconciliation closes the money-movement loop for merchants and operators.`,
    ['Reconciliation can match settlement instruction to provider confirmation or failure.', 'Discrepancies are operable via runbooks.'],
  ],
  [
    'FUN-SET-005',
    'Exactly one ledger posting per successful collection',
    ['fundsLedger'],
    ['collectionToLedger', 'ledgerPostingRecovery'],
    ['ADR-004', 'ADR-016'],
    [],
    ['Ledger'],
    ['FIN-INV-02'],
    `Each successful collection must produce exactly one financial ledger posting (journal) for that collection.`,
    `FIN-INV-02; outbox/consistency patterns (ADR-016).`,
    ['Replay does not create a second financial posting for the same collection.', 'Posting recovery is idempotent.'],
  ],
  [
    'FUN-SET-006',
    'Balanced journal entries',
    ['fundsLedger'],
    ['collectionToLedger'],
    ['ADR-004', 'ADR-021'],
    ['docs/contracts/money.md'],
    ['Ledger'],
    ['FIN-INV-03'],
    `Every journal transaction must balance (sum of debits equals sum of credits) in minor units.`,
    `Double-entry ledger (ADR-004).`,
    ['Unbalanced journals are rejected.', 'Money representation follows ADR-021.'],
  ],
  [
    'FUN-SET-007',
    'Immutable ledger entries',
    ['fundsLedger'],
    ['ledgerPostingRecovery'],
    ['ADR-004'],
    [],
    ['Ledger'],
    ['FIN-INV-07'],
    `Posted ledger entries must be immutable; corrections use compensating entries only.`,
    `FIN-INV-07.`,
    ['Historical entries cannot be mutated in place.', 'Corrections append compensating journals.'],
  ],
  [
    'FUN-SET-008',
    'Compensating corrections only',
    ['fundsLedger'],
    ['ledgerPostingRecovery'],
    ['ADR-004'],
    [],
    ['Ledger'],
    ['FIN-INV-07'],
    `Ledger corrections must be applied only via compensating journals that preserve auditability.`,
    `Supports immutability while allowing error remediation.`,
    ['Correction workflows create compensating entries linked to the original context.', 'No silent rewrite of posted amounts.'],
  ],
]

for (const [id, title, architecture, flows, adrs, contracts, modules, tests, req, rationale, ac] of settlement) {
  add(
    'functional',
    {
      id,
      title,
      type: 'functional',
      area: id.startsWith('FUN-SET-00') && Number(id.slice(-3)) <= 4 ? 'settlement' : 'ledger',
      status: 'accepted',
      priority: 'must',
      mvp: true,
      architecture,
      flows,
      adrs,
      contracts,
      modules,
      tests,
    },
    `## Requirement

${req}

## Rationale

${rationale}

## Acceptance Criteria

${ac.map((a) => `- ${a}`).join('\n')}

## Notes

Money movement MVP.`,
  )
}

add(
  'functional',
  {
    id: 'FUN-WAL-001',
    title: 'Optional consumer wallet capability',
    type: 'functional',
    area: 'wallet',
    status: 'deferred',
    priority: 'could',
    mvp: false,
    architecture: ['fundsLedger'],
    flows: [],
    adrs: ['ADR-004'],
    contracts: [],
    modules: ['Wallet'],
    tests: [],
  },
  `## Requirement

Sparelane may provide an optional wallet capability in a future release, subject to licensing and custody open decisions.

## Rationale

Wallet is modelled as future/optional; not MVP.

## Acceptance Criteria

- Wallet is not required for MVP payment reliability.
- Any future wallet go-live requires resolved open decisions and additional ADRs if custody model changes architecture.

## Notes

status: deferred; mvp: false.`,
)

// ── NFR Security (also under security/) ───────────────────
const nfrSec = [
  ['NFR-SEC-001', 'Merchant tenant isolation', ['trustBoundaries', 'dataArchitecture'], [], ['ADR-014'], ['docs/data/tenant-isolation.md'], ['All merchant-scoped modules'], ['FIN-INV-08'], 'Sparelane must enforce merchant tenant isolation so one merchant cannot read or mutate another merchant\'s data.', 'ADR-014; FIN-INV-08.'],
  ['NFR-SEC-002', 'No raw PAN or CVV storage', ['pciBoundaryView', 'trustBoundaries'], ['addPaymentMethod'], ['ADR-001', 'ADR-010'], ['docs/security/pci-boundary.md'], ['Payment Methods', 'PSP adapter'], [], 'Sparelane must not store or log raw PAN or CVV. Card data is tokenised by the PSP.'],
  ['NFR-SEC-003', 'Centralised secrets management', ['securityArchitecture'], [], ['ADR-011'], ['docs/security/secrets-management.md'], ['config/secrets'], [], 'Platform secrets must be managed via centralised secrets management; secrets must not be hardcoded in source.'],
  ['NFR-SEC-004', 'Admin MFA for privileged access', ['privilegedAccess'], ['adminPrivilegedAction'], ['ADR-012'], ['docs/security/admin-access.md'], ['Admin surfaces'], [], 'Sparelane administrators must use MFA for privileged administrative access.'],
  ['NFR-SEC-005', 'Signed merchant webhooks', ['merchantIntegration', 'trustBoundaries'], ['merchantWebhookDelivery'], ['ADR-009'], ['docs/security/webhook-security.md'], ['Webhooks'], [], 'Outbound merchant webhooks must be signed so merchants can authenticate Sparelane as the sender.'],
  ['NFR-SEC-006', 'Verify provider webhooks', ['trustBoundaries', 'pciBoundaryView'], ['providerWebhookVerification'], ['ADR-010'], ['docs/security/webhook-security.md'], ['PSP adapter', 'Integrations'], [], 'Inbound provider webhooks must be authenticated/verified before affecting payment or settlement state.'],
  ['NFR-SEC-007', 'Durable privileged audit', ['privilegedAccess', 'securityArchitecture'], ['adminPrivilegedAction'], ['ADR-012'], ['docs/security/audit.md'], ['Audit'], [], 'Privileged administrative actions must be durably audited.'],
]

for (const row of nfrSec) {
  const [id, title, architecture, flows, adrs, contracts, modules, tests, req, rationale] = row
  add(
    'security',
    {
      id,
      title,
      type: 'non-functional',
      area: 'security',
      status: 'accepted',
      priority: 'must',
      mvp: true,
      architecture,
      flows,
      adrs,
      contracts,
      modules,
      tests: tests || [],
    },
    `## Requirement

${req}

## Rationale

${rationale || 'Security architecture baseline.'}

## Acceptance Criteria

- Requirement is reflected in security architecture/docs and ADR bindings.
- Verification planned via security/acceptance tests in product CI (future platform repo).

## Notes

Stored under \`requirements/security/\` for navigation; type is non-functional.`,
  )
}

const nfrRel = [
  ['NFR-REL-001', 'Idempotent async consumers', ['eventsArchitecture', 'productionDeployment'], ['dlqReplay'], ['ADR-017'], ['docs/operations/async-processing.md'], ['Workers', 'Outbox'], ['FIN-INV-09'], 'Async consumers must be idempotent so at-least-once delivery cannot create duplicate financial effects.'],
  ['NFR-REL-002', 'Safe worker restart', ['productionDeployment', 'runtimeProcessing'], [], ['ADR-017', 'ADR-016'], ['docs/implementation/workers.md'], ['Workers'], ['FIN-INV-10'], 'Worker restart must not create duplicate financial effects; in-flight work must resume safely.'],
  ['NFR-REL-003', 'Bounded retry', ['paymentEngineCore', 'productionDeployment'], ['scheduledRetry'], ['ADR-017'], ['docs/operations/resilience-patterns.md'], ['Workers', 'Reliability Engine'], [], 'Retries for payment, webhook, and settlement operations must be bounded by policy (count/time/jitter as configured).'],
  ['NFR-REL-004', 'Dead-letter queue for poison messages', ['eventsArchitecture'], ['dlqReplay'], ['ADR-017'], ['docs/operations/async-processing.md'], ['Workers'], [], 'Poison or repeatedly failing messages must be routed to a DLQ with operable replay runbooks.'],
  ['NFR-REL-005', 'No blind retry after unknown financial outcome', ['paymentEngineCore', 'settlementCore'], ['paymentProviderTimeout', 'unknownSettlementOutcome'], ['ADR-016', 'ADR-006'], [], ['Payment Workflows', 'Settlement'], ['FIN-INV-06'], 'After an unknown financial provider outcome, Sparelane must reconcile status before retrying money-moving operations.'],
]

for (const [id, title, architecture, flows, adrs, contracts, modules, tests, req] of nfrRel) {
  add(
    'non-functional',
    {
      id,
      title,
      type: 'non-functional',
      area: 'reliability',
      status: 'accepted',
      priority: 'must',
      mvp: true,
      architecture,
      flows,
      adrs,
      contracts,
      modules,
      tests: tests || [],
    },
    `## Requirement

${req}

## Rationale

Reliability patterns from ADR-016/017 and financial invariants.

## Acceptance Criteria

- Behaviour is covered by financial invariant tests and/or resilience docs.
- Runbooks exist for operator response where applicable.

## Notes

Numerical SLOs remain TBD where not yet decided.`,
  )
}

const nfrOps = [
  ['NFR-OPS-001', 'Correlated logs and traces', ['productionDeployment'], [], [], ['docs/operations/observability.md'], ['Platform Operations'], 'Operational logs/traces for a payment or settlement journey must be correlatable by workflow/request identifiers.'],
  ['NFR-OPS-002', 'Alerting for critical failures', ['productionDeployment'], [], ['ADR-019'], ['docs/operations/alerting.md'], ['Platform Operations'], 'Critical payment, ledger, settlement, and webhook backlog conditions must be alertable.'],
  ['NFR-OPS-003', 'Restore testing', ['productionDeployment'], [], [], ['docs/operations/disaster-recovery.md'], ['Platform Operations'], 'Backup restore procedures for critical stores must be tested on a defined cadence (exact cadence TBD).'],
  ['NFR-OPS-004', 'Operable runbooks', ['productionDeployment'], [], [], ['docs/operations/runbooks/README.md'], ['Platform Operations'], 'Operators must have runbooks for provider outages, DLQ replay, ledger lag, and webhook backlog.'],
  ['NFR-OPS-005', 'Financial workload isolation', ['resilienceIsolation', 'runtimeProcessing'], [], ['ADR-019'], ['docs/operations/resilience-patterns.md'], ['payment/settlement workers'], 'Notification or non-financial workload failures must not block payment and settlement processing paths.'],
]

for (const [id, title, architecture, flows, adrs, contracts, modules, req] of nfrOps) {
  add(
    'non-functional',
    {
      id,
      title,
      type: 'non-functional',
      area: 'operations',
      status: 'accepted',
      priority: 'must',
      mvp: true,
      architecture,
      flows,
      adrs,
      contracts,
      modules,
      tests: [],
    },
    `## Requirement

${req}

## Rationale

Operations readiness for MVP architecture.

## Acceptance Criteria

- Corresponding operations docs exist and are linked.
- Alerting/runbook coverage reviewed in ops readiness.

## Notes

Do not invent numeric SLOs still marked TBD.`,
  )
}

const nfrPriv = [
  ['NFR-PRIV-001', 'Data minimisation', ['dataClassification', 'dataArchitecture'], [], [], ['docs/security/data-classification.md'], ['Data Layer'], 'Sparelane must collect and retain only personal data necessary for payment reliability, settlement, and compliance purposes.'],
  ['NFR-PRIV-002', 'Restrict sensitive data in logs', ['securityArchitecture'], [], ['ADR-010'], ['docs/security/data-classification.md'], ['Platform Operations'], 'Logs must not contain raw cardholder data or unnecessary secrets/PII.'],
  ['NFR-PRIV-003', 'Deletion and anonymisation handling', ['dataArchitecture'], ['consumerDeletion'], [], ['docs/security/data-classification.md'], ['Data Layer'], 'Consumer deletion/anonymisation requests must be handleable without destroying required financial audit integrity.'],
  ['NFR-PRIV-004', 'Retain financial integrity under privacy actions', ['fundsLedger', 'dataArchitecture'], ['consumerDeletion'], ['ADR-004'], [], ['Ledger', 'Audit'], 'Privacy deletion/anonymisation must not mutate or delete immutable financial ledger entries required for audit; apply approved redaction patterns to personal data only.'],
]

for (const [id, title, architecture, flows, adrs, contracts, modules, req] of nfrPriv) {
  add(
    'non-functional',
    {
      id,
      title,
      type: 'non-functional',
      area: 'privacy',
      status: 'accepted',
      priority: 'must',
      mvp: true,
      architecture,
      flows,
      adrs,
      contracts,
      modules,
      tests: [],
    },
    `## Requirement

${req}

## Rationale

Privacy and financial auditability must coexist.

## Acceptance Criteria

- Privacy handling is documented relative to ledger immutability.
- Logs/classification docs forbid CHD in logs.

## Notes

Regulatory specifics remain open where TBD.`,
  )
}

// ── Integrations ──────────────────────────────────────────
const integrations = [
  ['INT-PSP-001', 'Secure tokenisation capability', 'psp', ['pciBoundaryView'], ['addPaymentMethod'], ['ADR-001', 'ADR-010'], [], ['PSP adapter'], 'The PSP interface must support secure tokenisation so Sparelane never handles raw PAN/CVV.'],
  ['INT-PSP-002', 'Pre-authorisation where required', 'psp', ['paymentEngineCore'], ['preAuthorisation'], ['ADR-002'], [], ['PSP adapter'], 'The PSP interface must support pre-authorisation/capture patterns where Sparelane payment policy requires them.'],
  ['INT-PSP-003', 'Payment execution', 'psp', ['paymentEngineCore'], ['primaryCardSuccess', 'paymentProviderTimeout'], ['ADR-002'], [], ['PSP adapter'], 'The PSP interface must support payment execution (authorise/capture or equivalent) with clear success/failure outcomes.'],
  ['INT-PSP-004', 'Idempotency or safe reconciliation', 'psp', ['paymentEngineCore'], ['paymentProviderTimeout'], ['ADR-016'], [], ['PSP adapter'], 'The PSP interface must support idempotent requests and/or provider transaction lookup sufficient to reconcile unknown outcomes safely.'],
  ['INT-PSP-005', 'Authenticated provider webhooks', 'psp', ['trustBoundaries'], ['providerWebhookVerification'], ['ADR-010'], ['docs/security/webhook-security.md'], ['PSP adapter'], 'The PSP interface must provide signed or otherwise authenticated webhooks for payment outcome updates.'],
  ['INT-PSP-006', 'Provider transaction lookup', 'psp', ['paymentEngineCore'], ['paymentProviderTimeout'], [], [], ['PSP adapter'], 'The PSP interface must allow Sparelane to look up provider transaction status to resolve unknown outcomes.'],
  ['INT-SET-001', 'Settlement instruction submission', 'settlement-partner', ['settlementCore'], ['merchantSettlement'], ['ADR-006'], [], ['Settlement'], 'The settlement partner interface must accept settlement instructions idempotently and return acknowledgements.'],
  ['INT-SET-002', 'Settlement status and outcomes', 'settlement-partner', ['settlementCore', 'reconciliationCore'], ['settlementConfirmation', 'unknownSettlementOutcome'], ['ADR-006'], [], ['Settlement', 'Reconciliation'], 'The settlement partner interface must provide status/webhooks sufficient to confirm, fail, or reconcile payouts without blind resubmission.'],
  ['INT-KYB-001', 'Merchant KYC/KYB verification capability', 'kyb', ['merchantIntegration', 'securityArchitecture'], [], [], ['docs/integrations/merchant-onboarding.md'], ['Merchant Integrations', 'Risk'], 'KYC/KYB provider interfaces must support merchant verification outcomes required for onboarding risk controls.'],
  ['INT-NOT-001', 'Email notification delivery', 'notifications', ['experienceApi'], [], ['ADR-019'], [], ['Notifications'], 'Email notification providers must support delivering consumer/merchant emails without coupling failure to payment financial paths.'],
  ['INT-NOT-002', 'SMS notification delivery', 'notifications', ['experienceApi'], [], ['ADR-019'], [], ['Notifications'], 'SMS notification providers may be used for consumer alerts; SMS failure must not block payment or settlement processing.'],
]

for (const [id, title, area, architecture, flows, adrs, contracts, modules, req] of integrations) {
  add(
    'integrations',
    {
      id,
      title,
      type: 'integration',
      area,
      status: 'accepted',
      priority: id === 'INT-NOT-002' ? 'should' : 'must',
      mvp: id !== 'INT-NOT-002',
      architecture,
      flows,
      adrs,
      contracts,
      modules,
      tests: [],
    },
    `## Requirement

${req}

## Rationale

Defines required provider interface capabilities for vendor evaluation. Does not select a vendor.

## Acceptance Criteria

- Capability is expressible as an adapter interface in implementation blueprints.
- Unknown/timeout behaviours have a safe reconciliation path where money movement is involved.

## Notes

Vendors remain open decisions.`,
  )
}

// Deferred PayTo example
add(
  'integrations',
  {
    id: 'INT-PSP-010',
    title: 'PayTo rail support',
    type: 'integration',
    area: 'psp',
    status: 'deferred',
    priority: 'could',
    mvp: false,
    architecture: ['paymentEngineExtended'],
    flows: [],
    adrs: [],
    contracts: [],
    modules: ['PSP adapter'],
    tests: [],
  },
  `## Requirement

Future PayTo (or equivalent account-to-account) rail support may be added after MVP card rails.

## Rationale

PayTo is tagged future in the architecture model; not MVP.

## Acceptance Criteria

- Not required for MVP.
- Introduction requires updated ADRs/flows and provider interface requirements.

## Notes

status: deferred; mvp: false.`,
)

console.log(`Wrote ${ids.length} requirements`)
fs.writeFileSync(path.join(reqRoot, '.generated-ids.json'), JSON.stringify(ids, null, 2))
