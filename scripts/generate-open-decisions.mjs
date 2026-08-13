/**
 * Generate docs/decisions/open/OD-*.md from structured catalogue.
 * Also rewrites docs/decisions/open-decisions.md as an index.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outDir = path.join(root, 'docs', 'decisions', 'open')
fs.mkdirSync(outDir, { recursive: true })

/** @type {Array<{id:string,slug:string,title:string,category:string,blockingStage:string,why:string,status:string,related:string[]}>} */
const decisions = [
  { id: 'OD-001', slug: 'retry-timing', title: 'Exact retry timing, windows, maxima, quiet hours', category: 'product', blockingStage: 'development', why: 'Shapes Retry Service configuration', status: 'open', related: ['docs/payments/payment-lifecycle.md'] },
  { id: 'OD-002', slug: 'due-date-local-clock', title: 'Exact due-date local capture clock time', category: 'product', blockingStage: 'pilot', why: 'Converts date-only due dates to UTC schedule instants', status: 'open', related: ['docs/contracts/due-dates.md'] },
  { id: 'OD-003', slug: 'backup-cardinality', title: 'Payment-method backup cardinality / wallet ordering', category: 'product', blockingStage: 'development', why: 'Reliability Engine inputs', status: 'open', related: ['docs/payments/payment-method-selection.md'] },
  { id: 'OD-004', slug: 'wallet-product-rules', title: 'Wallet product rules (enablement, funding, spend)', category: 'product', blockingStage: 'wallet-only', why: 'Optional MVP capability boundaries', status: 'open', related: [] },
  { id: 'OD-005', slug: 'notification-rules', title: 'Consumer notification rules and copy', category: 'product', blockingStage: 'non-blocking', why: 'Notification worker behaviour', status: 'open', related: [] },
  { id: 'OD-006', slug: 'timezone-change-policy', title: 'Merchant timezone change handling policy', category: 'product', blockingStage: 'pilot', why: 'Prevents silent reschedule of in-flight bills', status: 'open', related: ['docs/contracts/due-dates.md'] },
  { id: 'OD-007', slug: 'multi-workflow-per-bill', title: 'Multi-workflow-per-bill (future)', category: 'product', blockingStage: 'non-blocking', why: 'Must not be built in MVP', status: 'deferred', related: [] },
  { id: 'OD-008', slug: 'psp-selection', title: 'PSP selection', category: 'payments', blockingStage: 'sandbox', why: 'Tokenisation, auth/capture, webhooks', status: 'open', related: ['docs/decisions/ADR-001-psp-tokenisation.md'] },
  { id: 'OD-009', slug: 'settlement-partner', title: 'Settlement / banking partner', category: 'payments', blockingStage: 'sandbox', why: 'Payout rails, confirmation events', status: 'open', related: ['docs/decisions/ADR-006-separate-settlement-lifecycle.md'] },
  { id: 'OD-010', slug: 'provider-capability-matrix', title: 'Provider capability matrix (pre-auth, idempotency keys)', category: 'payments', blockingStage: 'pilot', why: 'Orchestrator/adapter behaviour', status: 'open', related: ['docs/decisions/ADR-002-payment-orchestrator.md'] },
  { id: 'OD-011', slug: 'settlement-batching', title: 'Settlement schedule / batching rules', category: 'payments', blockingStage: 'non-blocking', why: 'Settlement worker batching', status: 'open', related: [] },
  { id: 'OD-012', slug: 'wallet-custody-licensing', title: 'Wallet custody / safeguarding / licensing', category: 'regulatory', blockingStage: 'wallet-only', why: 'Whether wallet is live in a jurisdiction', status: 'open', related: [] },
  { id: 'OD-013', slug: 'pci-validation', title: 'PCI validation approach / SAQ level', category: 'regulatory', blockingStage: 'production', why: 'Depends on PSP integration method', status: 'open', related: ['docs/security/pci-boundary.md'] },
  { id: 'OD-014', slug: 'legal-retention', title: 'Legal data retention periods', category: 'regulatory', blockingStage: 'production', why: 'Retention categories exist; durations TBD', status: 'open', related: ['docs/security/data-classification.md'] },
  { id: 'OD-015', slug: 'kyb-evidence-retention', title: 'KYC/KYB evidence retention', category: 'regulatory', blockingStage: 'development', why: 'Object storage lifecycle', status: 'open', related: [] },
  { id: 'OD-016', slug: 'cloud-provider', title: 'Cloud provider', category: 'infrastructure', blockingStage: 'development', why: 'Hosting', status: 'open', related: [] },
  { id: 'OD-017', slug: 'queue-broker', title: 'Queue / event broker', category: 'infrastructure', blockingStage: 'production', why: 'Event Bus implementation', status: 'open', related: ['docs/decisions/ADR-017-at-least-once-async-processing.md'] },
  { id: 'OD-018', slug: 'outbox-publish', title: 'Outbox publish mechanism (polling vs CDC)', category: 'infrastructure', blockingStage: 'development', why: 'Outbox Processor implementation', status: 'open', related: ['docs/decisions/ADR-016-operational-ledger-consistency.md'] },
  { id: 'OD-019', slug: 'db-topology', title: 'Physical DB topology (shared vs separate ledger DB)', category: 'infrastructure', blockingStage: 'production', why: 'Deployment', status: 'open', related: ['docs/decisions/ADR-013-ledger-operational-separation.md'] },
  { id: 'OD-020', slug: 'worker-runtime', title: 'Worker runtime (K8s/ECS/serverless/…)', category: 'infrastructure', blockingStage: 'development', why: 'Deployables', status: 'open', related: ['docs/decisions/ADR-018-logical-vs-physical-services.md'] },
  { id: 'OD-021', slug: 'observability-siem', title: 'Observability / SIEM vendors', category: 'infrastructure', blockingStage: 'non-blocking', why: 'Ops tooling', status: 'open', related: ['docs/operations/observability.md'] },
  { id: 'OD-022', slug: 'regions-ha', title: 'Regions / HA / numeric RPO-RTO', category: 'infrastructure', blockingStage: 'production', why: 'DR', status: 'open', related: ['docs/operations/disaster-recovery.md'] },
  { id: 'OD-023', slug: 'identity-provider', title: 'Identity provider', category: 'security', blockingStage: 'sandbox', why: 'Consumer/merchant/admin auth', status: 'open', related: [] },
  { id: 'OD-024', slug: 'mfa-passkey', title: 'MFA / passkey implementation', category: 'security', blockingStage: 'pilot', why: 'Admin/consumer assurance', status: 'open', related: ['docs/security/admin-access.md'] },
  { id: 'OD-025', slug: 'secrets-kms', title: 'Secrets product / KMS/HSM', category: 'security', blockingStage: 'pilot', why: 'Implements ADR-011', status: 'open', related: ['docs/decisions/ADR-011-centralised-secrets-management.md'] },
  { id: 'OD-026', slug: 'dual-control-break-glass', title: 'Dual-control / break-glass workflows', category: 'security', blockingStage: 'non-blocking', why: 'Privileged financial actions', status: 'open', related: ['docs/security/admin-access.md'] },
  { id: 'OD-027', slug: 'rls-vs-app-tenancy', title: 'PostgreSQL RLS vs app-only tenancy', category: 'security', blockingStage: 'non-blocking', why: 'Defence in depth; app enforcement mandatory', status: 'open', related: ['docs/decisions/ADR-014-merchant-tenant-isolation.md'] },
  { id: 'OD-028', slug: 'oauth-mtls-merchant-api', title: 'OAuth/mTLS for enterprise merchant API', category: 'security', blockingStage: 'non-blocking', why: 'Auth alternatives', status: 'open', related: [] },
  { id: 'OD-029', slug: 'rate-limits', title: 'Numeric rate limits', category: 'api', blockingStage: 'non-blocking', why: 'Edge protection', status: 'open', related: [] },
  { id: 'OD-030', slug: 'idempotency-ttl', title: 'Idempotency key retention TTL', category: 'api', blockingStage: 'development', why: 'Storage TTL', status: 'open', related: ['docs/decisions/ADR-008-idempotent-merchant-api.md'] },
  { id: 'OD-031', slug: 'webhook-retry-bounds', title: 'Webhook retry schedule / attempt bounds', category: 'api', blockingStage: 'development', why: 'Delivery worker', status: 'open', related: ['docs/decisions/ADR-009-signed-at-least-once-webhooks.md'] },
  { id: 'OD-032', slug: 'public-id-prefixes', title: 'Public ID prefix final spelling', category: 'api', blockingStage: 'non-blocking', why: 'Cosmetic if opacity preserved', status: 'open', related: ['docs/decisions/ADR-020-opaque-public-identifiers.md'] },
  { id: 'OD-033', slug: 'attempt-api-visibility', title: 'Payment-attempt merchant API visibility', category: 'api', blockingStage: 'non-blocking', why: 'Future endpoint', status: 'open', related: ['contracts/openapi.yaml'] },
  { id: 'OD-034', slug: 'webhook-endpoint-api', title: 'Webhook endpoint management via API', category: 'api', blockingStage: 'non-blocking', why: 'Portal-managed for now', status: 'open', related: [] },
]

for (const d of decisions) {
  const relatedYaml = d.related.length
    ? d.related.map((r) => `  - ${r}`).join('\n')
    : '[]'
  const body = `---
id: ${d.id}
title: ${d.title}
category: ${d.category}
blockingStage: ${d.blockingStage}
status: ${d.status}
related:
${relatedYaml === '[]' ? '[]' : relatedYaml}
---

# ${d.id} — ${d.title}

## Decision required

${d.title}.

## Why it matters

${d.why}

## Blocking stage

\`${d.blockingStage}\`

## Status

\`${d.status}\`

## Notes

Unresolved item tracked separately from Accepted ADRs. See the [open decisions index](../open-decisions.md).
`
  fs.writeFileSync(path.join(outDir, `${d.id}-${d.slug}.md`), body, 'utf8')
}

const byCat = new Map()
for (const d of decisions) {
  if (!byCat.has(d.category)) byCat.set(d.category, [])
  byCat.get(d.category).push(d)
}

const index = `# Open Decisions

Unresolved items that are **not** Accepted ADRs. Organised separately from vendor-neutral architecture decisions.

**Source of truth:** individual files under [\`docs/decisions/open/\`](./open/). This index is a catalogue only — do not duplicate decision substance here.

Stable IDs (\`OD-###\`) are never renumbered after assignment.

Implementation phase detail: [\`docs/implementation/build-phases.md\`](../implementation/build-phases.md).

Portal: \`/decisions\` and \`/decisions/open/:id\`.

---

## Catalogue

${[...byCat.entries()]
  .map(
    ([cat, rows]) => `### ${cat}

| ID | Decision | Blocking stage | Status |
| --- | --- | --- | --- |
${rows.map((d) => `| [${d.id}](./open/${d.id}-${d.slug}.md) | ${d.title} | ${d.blockingStage} | ${d.status} |`).join('\n')}
`,
  )
  .join('\n')}

## Highest-priority before production cutover

1. ${'OD-008'} PSP + ${'OD-009'} settlement partner (live money movement)
2. ${'OD-023'} Identity provider + ${'OD-024'} admin MFA
3. ${'OD-025'} Secrets manager product
4. ${'OD-017'} Queue/broker + ${'OD-019'} DB hosting topology
5. ${'OD-014'} Legal retention + ${'OD-012'} wallet regulatory posture (if wallet enabled)
6. ${'OD-002'} Due-date local clock + ${'OD-006'} timezone-change policy
`

fs.writeFileSync(path.join(root, 'docs', 'decisions', 'open-decisions.md'), index, 'utf8')
fs.writeFileSync(path.join(outDir, 'README.md'), `# Open decisions

Individual open-decision files with stable \`OD-###\` IDs.

See [../open-decisions.md](../open-decisions.md) for the catalogue index.
`, 'utf8')

console.log(`Wrote ${decisions.length} open decisions`)
