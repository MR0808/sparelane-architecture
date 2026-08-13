/**
 * Eager load requirement markdown from the repository (authoritative source).
 * Uses a small frontmatter parser (no gray-matter in the browser bundle).
 */

export type RequirementStatus =
  | 'draft'
  | 'proposed'
  | 'accepted'
  | 'implemented'
  | 'verified'
  | 'deferred'
  | 'rejected'

export type RequirementPriority = 'must' | 'should' | 'could' | 'wont'

export type RequirementType = 'business' | 'functional' | 'non-functional' | 'integration'

export type RequirementMeta = {
  id: string
  title: string
  type: RequirementType
  area: string
  status: RequirementStatus
  priority: RequirementPriority
  mvp: boolean
  architecture: string[]
  flows: string[]
  adrs: string[]
  contracts: string[]
  modules: string[]
  tests: string[]
  dependsOn: string[]
  related: string[]
  openDecisionDocs: string[]
  openDecisions: string[]
  designs: string[]
}

export type Requirement = RequirementMeta & {
  body: string
  sourcePath: string
}

const modules = import.meta.glob('../../../requirements/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function asStringArray(value: unknown): string[] {
  if (value == null) return []
  if (Array.isArray(value)) return value.map(String)
  return [String(value)]
}

/** Minimal YAML subset parser for our requirement frontmatter. */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const trimmed = raw.replace(/^\uFEFF/, '')
  if (!trimmed.startsWith('---')) {
    return { data: {}, content: trimmed }
  }
  const end = trimmed.indexOf('\n---', 3)
  if (end === -1) return { data: {}, content: trimmed }
  const yaml = trimmed.slice(4, end).trim()
  const content = trimmed.slice(end + 4).replace(/^\s*\n/, '')
  const data: Record<string, unknown> = {}
  let currentKey: string | null = null
  let currentList: string[] | null = null

  for (const line of yaml.split(/\r?\n/)) {
    if (/^\s*-\s+/.test(line) && currentKey) {
      if (!currentList) {
        currentList = []
        data[currentKey] = currentList
      }
      currentList.push(line.replace(/^\s*-\s+/, '').trim())
      continue
    }
    const m = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!m) continue
    currentKey = m[1]
    currentList = null
    const rest = m[2].trim()
    if (rest === '' || rest === '[]') {
      data[currentKey] = rest === '[]' ? [] : []
      currentList = data[currentKey] as string[]
      continue
    }
    if (rest === 'true' || rest === 'false') {
      data[currentKey] = rest === 'true'
      continue
    }
    data[currentKey] = rest.replace(/^["']|["']$/g, '')
  }

  return { data, content }
}

function normalizeKey(filePath: string): string {
  const marker = '/requirements/'
  const normalized = filePath.replace(/\\/g, '/')
  const idx = normalized.lastIndexOf(marker)
  if (idx === -1) return normalized
  return normalized.slice(idx + marker.length)
}

function parseRequirement(sourcePath: string, raw: string): Requirement | null {
  const base = sourcePath.split('/').pop() || ''
  if (base.toLowerCase() === 'readme.md' || base === 'test-catalog.md') return null
  if (sourcePath.includes('/templates/') || sourcePath.startsWith('tests/')) return null

  const { data, content } = parseFrontmatter(raw)
  if (!data?.id) return null
  // Requirement IDs only (exclude test catalogue IDs if mis-filed)
  if (!/^(BUS|FUN|NFR|INT)-/.test(String(data.id))) return null

  return {
    id: String(data.id),
    title: String(data.title ?? data.id),
    type: data.type as RequirementType,
    area: String(data.area ?? ''),
    status: data.status as RequirementStatus,
    priority: data.priority as RequirementPriority,
    mvp: Boolean(data.mvp),
    architecture: asStringArray(data.architecture),
    flows: asStringArray(data.flows),
    adrs: asStringArray(data.adrs),
    contracts: asStringArray(data.contracts),
    modules: asStringArray(data.modules),
    tests: asStringArray(data.tests),
    dependsOn: asStringArray(data.dependsOn),
    related: asStringArray(data.related),
    openDecisionDocs: asStringArray(data.openDecisionDocs),
    openDecisions: asStringArray(data.openDecisions),
    designs: asStringArray(data.designs),
    body: content.trim(),
    sourcePath,
  }
}

const all: Requirement[] = []
for (const [key, raw] of Object.entries(modules)) {
  const sourcePath = normalizeKey(key)
  const parsed = parseRequirement(sourcePath, raw)
  if (parsed) all.push(parsed)
}

all.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))

const byId = new Map(all.map((r) => [r.id, r]))

export function listRequirements(): Requirement[] {
  return all
}

export function getRequirement(id: string): Requirement | null {
  return byId.get(id) ?? null
}

export type RequirementFilters = {
  type?: string
  area?: string
  status?: string
  priority?: string
  mvp?: 'true' | 'false' | 'all'
  q?: string
  coverage?: 'all' | 'missing-architecture' | 'missing-test' | 'blocked' | 'unverified'
}

export function filterRequirements(
  items: Requirement[],
  filters: RequirementFilters,
): Requirement[] {
  return items.filter((r) => {
    if (filters.type && filters.type !== 'all' && r.type !== filters.type) return false
    if (filters.area && filters.area !== 'all' && r.area !== filters.area) return false
    if (filters.status && filters.status !== 'all' && r.status !== filters.status) return false
    if (filters.priority && filters.priority !== 'all' && r.priority !== filters.priority) {
      return false
    }
    if (filters.mvp === 'true' && !r.mvp) return false
    if (filters.mvp === 'false' && r.mvp) return false
    if (filters.coverage === 'missing-architecture') {
      if (r.architecture.length + r.flows.length > 0) return false
    }
    if (filters.coverage === 'missing-test') {
      if (r.tests.length > 0) return false
    }
    if (filters.coverage === 'blocked') {
      if (r.openDecisions.length === 0) return false
    }
    if (filters.coverage === 'unverified') {
      if (r.status !== 'implemented') return false
    }
    if (filters.q) {
      const q = filters.q.toLowerCase()
      const hay = `${r.id} ${r.title} ${r.area} ${r.body}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })
}

export function requirementStats(items: Requirement[] = all) {
  const byStatus: Record<string, number> = {}
  const byType: Record<string, number> = {}
  let mvp = 0
  for (const r of items) {
    byStatus[r.status] = (byStatus[r.status] ?? 0) + 1
    byType[r.type] = (byType[r.type] ?? 0) + 1
    if (r.mvp) mvp += 1
  }
  return {
    total: items.length,
    mvp,
    future: items.length - mvp,
    byStatus,
    byType,
  }
}

export function coverageSummary(items: Requirement[] = all) {
  const withArch = items.filter((r) => r.architecture.length + r.flows.length > 0).length
  const withAdr = items.filter((r) => r.adrs.length > 0).length
  const withModules = items.filter((r) => r.modules.length > 0).length
  const withTests = items.filter((r) => r.tests.length > 0).length
  const missingArch = items.filter((r) => r.architecture.length + r.flows.length === 0).length
  const missingTests = items.filter((r) => r.tests.length === 0).length
  const blocked = items.filter((r) => r.openDecisions.length > 0).length
  const implementedUnverified = items.filter((r) => r.status === 'implemented').length
  const acceptedNoAc = items.filter((r) => {
    if (r.status !== 'accepted') return false
    return !/##\s*Acceptance Criteria/i.test(r.body)
  }).length
  return {
    withArch,
    withAdr,
    withModules,
    withTests,
    missingArch,
    missingTests,
    blocked,
    implementedUnverified,
    acceptedNoAc,
    total: items.length,
  }
}

export function architectureViewHref(viewId: string): string {
  return `/architecture/view/${viewId}`
}

const decisionModules = import.meta.glob('../../../docs/decisions/ADR-*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const adrPathById = new Map<string, string>()
for (const key of Object.keys(decisionModules)) {
  const normalized = key.replace(/\\/g, '/')
  const base = normalized.split('/').pop()?.replace(/\.md$/i, '') ?? ''
  const m = base.match(/^(ADR-\d{3})/i)
  if (m) adrPathById.set(m[1].toUpperCase(), `decisions/${base}`)
}

export function adrHref(adr: string): string {
  const id = adr.toUpperCase()
  const doc = adrPathById.get(id)
  if (doc) return `/docs/${doc}`
  return '/docs/decisions/decision-register'
}

export function contractHref(repoPath: string): string {
  if (repoPath.startsWith('docs/')) {
    return `/docs/${repoPath.slice(5).replace(/\.md$/, '')}`
  }
  if (repoPath === 'contracts/openapi.yaml') return '/contracts/api'
  return `/docs/${repoPath}`
}

export function openDecisionHref(id: string): string {
  return `/decisions/open/${id}`
}

export function testHref(id: string): string {
  return `/tests/${id}`
}

export function designHref(id: string): string {
  return `/design/${id}`
}
