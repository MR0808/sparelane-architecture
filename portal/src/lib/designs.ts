/**
 * Design catalogue — Mermaid engineering design docs under docs/design/.
 * LikeC4 remains architecture SoT; these supplement detailed behaviour.
 */

function parseFrontmatter(raw: string): { data: Record<string, unknown>; content: string } {
  const trimmed = raw.replace(/^\uFEFF/, '')
  if (!trimmed.startsWith('---')) return { data: {}, content: trimmed }
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
      data[currentKey] = []
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

function asArray(v: unknown): string[] {
  if (v == null) return []
  if (Array.isArray(v)) return v.map(String)
  return [String(v)]
}

export type DesignType = 'sequence' | 'state' | 'flow' | 'erd'

export type DesignDoc = {
  id: string
  title: string
  type: DesignType | string
  area: string
  status: string
  mvp: boolean
  likec4: string[]
  requirements: string[]
  adrs: string[]
  tests: string[]
  renderingTest: boolean
  body: string
  sourcePath: string
}

const modules = import.meta.glob('../../../docs/design/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const all: DesignDoc[] = []
for (const [key, raw] of Object.entries(modules)) {
  const normalized = key.replace(/\\/g, '/')
  const idx = normalized.lastIndexOf('/docs/design/')
  if (idx === -1) continue
  const rel = normalized.slice(idx + '/docs/'.length) // design/...
  const base = rel.split('/').pop() ?? ''
  if (base.toLowerCase() === 'readme.md') continue

  const { data, content } = parseFrontmatter(raw)
  if (!data.id) continue

  all.push({
    id: String(data.id),
    title: String(data.title ?? data.id),
    type: String(data.type ?? 'sequence'),
    area: String(data.area ?? ''),
    status: String(data.status ?? 'accepted'),
    mvp: Boolean(data.mvp),
    likec4: asArray(data.likec4),
    requirements: asArray(data.requirements),
    adrs: asArray(data.adrs),
    tests: asArray(data.tests),
    renderingTest: Boolean(data.renderingTest) || String(data.status) === 'portal-test',
    body: content.trim(),
    sourcePath: `docs/${rel}`,
  })
}

all.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
const byId = new Map(all.map((d) => [d.id, d]))

export function listDesigns(): DesignDoc[] {
  return all
}

export function listCatalogueDesigns(): DesignDoc[] {
  return all.filter((d) => !d.renderingTest)
}

export function getDesign(id: string): DesignDoc | null {
  return byId.get(id) ?? null
}

export type DesignFilters = {
  area?: string
  type?: string
  mvp?: 'true' | 'false' | 'all'
}

export function filterDesigns(items: DesignDoc[], filters: DesignFilters): DesignDoc[] {
  return items.filter((d) => {
    if (filters.area && filters.area !== 'all' && d.area !== filters.area) return false
    if (filters.type && filters.type !== 'all' && d.type !== filters.type) return false
    if (filters.mvp === 'true' && !d.mvp) return false
    if (filters.mvp === 'false' && d.mvp) return false
    return true
  })
}

export function designStats(items: DesignDoc[] = listCatalogueDesigns()) {
  const byArea: Record<string, number> = {}
  const byType: Record<string, number> = {}
  for (const d of items) {
    byArea[d.area] = (byArea[d.area] ?? 0) + 1
    byType[d.type] = (byType[d.type] ?? 0) + 1
  }
  return { total: items.length, byArea, byType }
}

export function designHref(id: string): string {
  return `/design/${id}`
}
