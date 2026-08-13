/**
 * Parse open-decision Markdown files under docs/decisions/open/OD-*.md
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
    data[currentKey] = rest.replace(/^["']|["']$/g, '')
  }
  return { data, content }
}

function asArray(v: unknown): string[] {
  if (v == null) return []
  if (Array.isArray(v)) return v.map(String)
  return [String(v)]
}

export type OpenDecision = {
  id: string
  title: string
  category: string
  blockingStage: string
  status: string
  related: string[]
  body: string
  sourcePath: string
}

const modules = import.meta.glob('../../../docs/decisions/open/OD-*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const all: OpenDecision[] = []
for (const [key, raw] of Object.entries(modules)) {
  const normalized = key.replace(/\\/g, '/')
  const base = normalized.split('/').pop() ?? ''
  const sourcePath = `docs/decisions/open/${base}`
  const { data, content } = parseFrontmatter(raw)
  if (!data.id) continue
  all.push({
    id: String(data.id),
    title: String(data.title ?? data.id),
    category: String(data.category ?? ''),
    blockingStage: String(data.blockingStage ?? ''),
    status: String(data.status ?? 'open'),
    related: asArray(data.related),
    body: content.trim(),
    sourcePath,
  })
}
all.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
const byId = new Map(all.map((d) => [d.id, d]))

export function listOpenDecisions(): OpenDecision[] {
  return all
}

export function getOpenDecision(id: string): OpenDecision | null {
  return byId.get(id) ?? null
}

export const BLOCKING_STAGES = [
  'development',
  'sandbox',
  'pilot',
  'production',
  'wallet-only',
  'non-blocking',
] as const
