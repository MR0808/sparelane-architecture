/**
 * Client-side search index (MiniSearch).
 *
 * Library choice: MiniSearch — small, zero-dependency, prefix + light fuzzy,
 * good enough for a static architecture portal without a search service.
 * Indexes requirements, docs, ADRs, open decisions, architecture views, tests, contracts.
 */
import MiniSearch from 'minisearch'
import { listRequirements } from '../requirements'
import { listDocPaths, getDocMarkdown } from '../docs'
import { listOpenDecisions } from '../openDecisions'
import { listTests } from '../tests'
import { listCatalogueDesigns } from '../designs'
import { architecturePages, proofViews } from '../views'

export type SearchType =
  | 'requirement'
  | 'adr'
  | 'architecture'
  | 'flow'
  | 'document'
  | 'contract'
  | 'runbook'
  | 'open-decision'
  | 'test'
  | 'implementation'
  | 'design'

export type SearchDoc = {
  id: string
  type: SearchType
  title: string
  text: string
  route: string
  sourcePath: string
  area?: string
  status?: string
}

const VIEW_TITLES: Record<string, { title: string; kind: 'architecture' | 'flow' }> = {
  architectureMap: { title: 'Architecture Map', kind: 'architecture' },
  index: { title: 'System Context', kind: 'architecture' },
  platform: { title: 'Platform Architecture', kind: 'architecture' },
  paymentEngineCore: { title: 'Payment Reliability Engine / Core', kind: 'architecture' },
  paymentEngineExtended: { title: 'Payment Reliability Engine / Extended', kind: 'architecture' },
  fundsLedger: { title: 'Funds & Ledger', kind: 'architecture' },
  settlementCore: { title: 'Settlement Core', kind: 'architecture' },
  settlement: { title: 'Settlement', kind: 'architecture' },
  reconciliationCore: { title: 'Reconciliation Core', kind: 'architecture' },
  merchantIntegration: { title: 'Merchant Integration', kind: 'architecture' },
  trustBoundaries: { title: 'Trust Boundaries', kind: 'architecture' },
  securityArchitecture: { title: 'Security Architecture', kind: 'architecture' },
  pciBoundaryView: { title: 'PCI Boundary', kind: 'architecture' },
  dataArchitecture: { title: 'Data Architecture', kind: 'architecture' },
  productionDeployment: { title: 'Production Deployment', kind: 'architecture' },
  implementationDeployables: { title: 'Implementation Deployables', kind: 'architecture' },
  implementationModules: { title: 'Implementation Modules', kind: 'architecture' },
  experienceApi: { title: 'Experience & API', kind: 'architecture' },
  eventsArchitecture: { title: 'Events Architecture', kind: 'architecture' },
  primaryCardSuccess: { title: 'Primary card success', kind: 'flow' },
  backupRecovery: { title: 'Backup recovery', kind: 'flow' },
  scheduledRetry: { title: 'Scheduled retry', kind: 'flow' },
  completeFailure: { title: 'Complete failure', kind: 'flow' },
  consumerRetryNow: { title: 'Consumer Retry Now', kind: 'flow' },
  collectionToLedger: { title: 'Collection to ledger', kind: 'flow' },
  merchantSettlement: { title: 'Merchant settlement', kind: 'flow' },
  unknownSettlementOutcome: { title: 'Unknown settlement outcome', kind: 'flow' },
  settlementFailure: { title: 'Settlement failure', kind: 'flow' },
  settlementConfirmation: { title: 'Settlement confirmation', kind: 'flow' },
  duplicateBillSubmission: { title: 'Duplicate bill submission', kind: 'flow' },
  merchantWebhookRetry: { title: 'Merchant webhook retry', kind: 'flow' },
  providerWebhookVerification: { title: 'Provider webhook verification', kind: 'flow' },
  billIngestion: { title: 'Bill ingestion', kind: 'flow' },
  billSubmission: { title: 'Bill submission', kind: 'flow' },
  paymentLifecycle: { title: 'Payment lifecycle', kind: 'flow' },
  paymentRecovery: { title: 'Payment recovery', kind: 'flow' },
  preAuthorisation: { title: 'Pre-authorisation', kind: 'flow' },
  dlqReplay: { title: 'DLQ replay', kind: 'flow' },
  ledgerPostingRecovery: { title: 'Ledger posting recovery', kind: 'flow' },
}

function stripMd(md: string): string {
  return md
    .replace(/^---[\s\S]*?---\s*/m, '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`\[\]()!-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 4000)
}

function buildDocs(): SearchDoc[] {
  const docs: SearchDoc[] = []

  for (const r of listRequirements()) {
    docs.push({
      id: `req:${r.id}`,
      type: 'requirement',
      title: `${r.id} — ${r.title}`,
      text: `${r.id} ${r.title} ${r.body}`,
      route: `/requirements/${r.id}`,
      sourcePath: `requirements/${r.sourcePath}`,
      area: r.area,
      status: r.status,
    })
  }

  for (const d of listOpenDecisions()) {
    docs.push({
      id: `od:${d.id}`,
      type: 'open-decision',
      title: `${d.id} — ${d.title}`,
      text: `${d.id} ${d.title} ${d.category} ${d.blockingStage} ${d.body}`,
      route: `/decisions/open/${d.id}`,
      sourcePath: d.sourcePath,
      area: d.category,
      status: d.status,
    })
  }

  for (const t of listTests()) {
    docs.push({
      id: `test:${t.id}`,
      type: 'test',
      title: `${t.id} — ${t.title}`,
      text: `${t.id} ${t.title} ${t.body}`,
      route: `/tests/${t.id}`,
      sourcePath: t.sourcePath,
      area: t.type,
      status: t.status,
    })
  }

  for (const d of listCatalogueDesigns()) {
    const participants = [...d.body.matchAll(/\b(?:participant|actor)\s+\w+\s+as\s+([^\n]+)/gi)]
      .map((m) => m[1].trim())
      .join(' ')
    docs.push({
      id: `design:${d.id}`,
      type: 'design',
      title: `${d.id} — ${d.title}`,
      text: `${d.id} ${d.title} ${d.area} ${d.type} ${d.body} ${participants}`,
      route: `/design/${d.id}`,
      sourcePath: d.sourcePath,
      area: d.area,
      status: d.status,
    })
  }

  for (const page of architecturePages) {
    docs.push({
      id: `arch-page:${page.slug}`,
      type: 'architecture',
      title: page.title,
      text: `${page.title} ${page.description} ${page.viewId}`,
      route: `/architecture/${page.slug}`,
      sourcePath: 'architecture/views.c4',
      area: page.slug,
    })
  }

  const seenViews = new Set<string>()
  for (const [viewId, meta] of Object.entries(VIEW_TITLES)) {
    seenViews.add(viewId)
    docs.push({
      id: `view:${viewId}`,
      type: meta.kind === 'flow' ? 'flow' : 'architecture',
      title: meta.title,
      text: `${viewId} ${meta.title}`,
      route: `/architecture/view/${viewId}`,
      sourcePath: 'architecture/views.c4',
    })
  }
  for (const p of proofViews) {
    if (seenViews.has(p.viewId)) continue
    docs.push({
      id: `view:${p.viewId}`,
      type: 'architecture',
      title: p.label,
      text: `${p.viewId} ${p.label}`,
      route: `/architecture/view/${p.viewId}`,
      sourcePath: 'architecture/views.c4',
    })
  }

  for (const rel of listDocPaths()) {
    if (rel.startsWith('decisions/open/')) continue // indexed via open decisions
    if (rel.startsWith('design/') && rel !== 'design/README.md') continue // indexed via designs
    const raw = getDocMarkdown(rel)
    if (!raw) continue
    const base = rel.replace(/\.md$/i, '')
    const titleMatch = raw.match(/^#\s+(.+)$/m)
    const title = titleMatch?.[1]?.trim() ?? base
    let type: SearchType = 'document'
    if (rel.startsWith('decisions/ADR-')) type = 'adr'
    else if (rel.startsWith('contracts/')) type = 'contract'
    else if (rel.startsWith('operations/runbooks/')) type = 'runbook'
    else if (rel.startsWith('implementation/')) type = 'implementation'
    else if (rel.startsWith('security/')) type = 'document'
    const route =
      type === 'adr'
        ? `/docs/${base}`
        : type === 'contract'
          ? rel === 'contracts/README.md'
            ? '/contracts'
            : `/docs/${base}`
          : `/docs/${base}`
    docs.push({
      id: `doc:${rel}`,
      type,
      title: type === 'adr' ? title : title,
      text: stripMd(raw),
      route,
      sourcePath: `docs/${rel}`,
    })
  }

  docs.push({
    id: 'contract:openapi',
    type: 'contract',
    title: 'Merchant API (OpenAPI)',
    text: 'Merchant API OpenAPI contracts endpoints schemas webhooks',
    route: '/contracts/api',
    sourcePath: 'contracts/openapi.yaml',
  })

  return docs
}

let cached: { docs: SearchDoc[]; index: MiniSearch<SearchDoc> } | null = null

function getIndex() {
  if (cached) return cached
  const docs = buildDocs()
  const index = new MiniSearch<SearchDoc>({
    fields: ['title', 'text', 'id'],
    storeFields: ['type', 'title', 'text', 'route', 'sourcePath', 'area', 'status', 'id'],
    idField: 'id',
    searchOptions: {
      boost: { title: 4, id: 6, text: 1 },
      fuzzy: 0.15,
      prefix: true,
    },
  })
  index.addAll(docs)
  cached = { docs, index }
  return cached
}

export type SearchHit = SearchDoc & { score: number; snippet: string }

function snippetFor(doc: SearchDoc, query: string): string {
  const q = query.toLowerCase()
  const text = doc.text
  const idx = text.toLowerCase().indexOf(q)
  if (idx === -1) return text.slice(0, 140)
  const start = Math.max(0, idx - 40)
  return (start > 0 ? '…' : '') + text.slice(start, start + 160).trim()
}

export function searchPortal(query: string, limit = 40): SearchHit[] {
  const q = query.trim()
  if (!q) return []
  const { docs, index } = getIndex()

  // Exact ID boost
  const exact = docs.filter(
    (d) =>
      d.id.toLowerCase().endsWith(`:${q.toLowerCase()}`) ||
      d.title.toLowerCase().startsWith(q.toLowerCase() + ' —') ||
      d.title.toLowerCase() === q.toLowerCase(),
  )

  const results = index.search(q, { combineWith: 'AND' })
  const byId = new Map(docs.map((d) => [d.id, d]))
  const hits: SearchHit[] = []
  const seen = new Set<string>()

  for (const d of exact) {
    seen.add(d.id)
    hits.push({ ...d, score: 10_000, snippet: snippetFor(d, q) })
  }
  for (const r of results) {
    if (seen.has(String(r.id))) continue
    const doc = byId.get(String(r.id))
    if (!doc) continue
    seen.add(doc.id)
    hits.push({ ...doc, score: r.score, snippet: snippetFor(doc, q) })
  }
  return hits.slice(0, limit)
}

export function searchIndexSize(): number {
  return getIndex().docs.length
}
