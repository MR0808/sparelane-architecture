/**
 * Test specification catalogue under requirements/tests/
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

export type TestSpec = {
  id: string
  title: string
  type: string
  status: string
  mvp: boolean
  relatedRequirements: string[]
  relatedFlows: string[]
  implementationProgress: string
  body: string
  sourcePath: string
}

const modules = import.meta.glob('../../../requirements/tests/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

const all: TestSpec[] = []
for (const [key, raw] of Object.entries(modules)) {
  const normalized = key.replace(/\\/g, '/')
  const base = normalized.split('/').pop() ?? ''
  if (base.toLowerCase() === 'readme.md') continue
  const { data, content } = parseFrontmatter(raw)
  if (!data.id) continue
  all.push({
    id: String(data.id),
    title: String(data.title ?? data.id),
    type: String(data.type ?? ''),
    status: String(data.status ?? 'specified'),
    mvp: Boolean(data.mvp),
    relatedRequirements: asArray(data.relatedRequirements),
    relatedFlows: asArray(data.relatedFlows),
    implementationProgress: String(data.implementationProgress ?? ''),
    body: content.trim(),
    sourcePath: `requirements/tests/${base}`,
  })
}
all.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
const byId = new Map(all.map((t) => [t.id, t]))

export function listTests(): TestSpec[] {
  return all
}

export function getTest(id: string): TestSpec | null {
  return byId.get(id) ?? null
}

/** All known test IDs for requirement validation. */
export function listTestIds(): string[] {
  return all.map((t) => t.id)
}
