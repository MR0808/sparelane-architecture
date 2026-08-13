/**
 * Validate requirements markdown frontmatter and traceability references.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const reqRoot = path.join(root, 'requirements')
const decisionsDir = path.join(root, 'docs', 'decisions')
const architectureDir = path.join(root, 'architecture')

const STATUSES = new Set([
  'draft',
  'proposed',
  'accepted',
  'implemented',
  'verified',
  'deferred',
  'rejected',
])
const PRIORITIES = new Set(['must', 'should', 'could', 'wont'])
const TYPES = new Set(['business', 'functional', 'non-functional', 'integration'])
const REQUIRED = ['id', 'title', 'type', 'area', 'status', 'priority', 'mvp']

const TEST_IDS = new Set([
  'FIN-INV-01',
  'FIN-INV-02',
  'FIN-INV-03',
  'FIN-INV-04',
  'FIN-INV-05',
  'FIN-INV-06',
  'FIN-INV-07',
  'FIN-INV-08',
  'FIN-INV-09',
  'FIN-INV-10',
])

const failures = []
const warnings = []

function fail(file, msg) {
  failures.push(`${file}: ${msg}`)
}

function warn(file, msg) {
  warnings.push(`${file}: ${msg}`)
}

function collectMd(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      if (name === 'templates' || name === 'node_modules') continue
      collectMd(p, out)
    } else if (/\.md$/i.test(name) && name.toUpperCase() !== 'README.MD' && name !== 'test-catalog.md') {
      out.push(p)
    }
  }
  return out
}

function listAdrIds() {
  const ids = new Set()
  if (!fs.existsSync(decisionsDir)) return ids
  for (const name of fs.readdirSync(decisionsDir)) {
    const m = name.match(/^(ADR-\d+)/i)
    if (m) ids.add(m[1].toUpperCase().replace(/ADR-(\d+)/, (_, n) => `ADR-${n.padStart(3, '0')}`))
    // Also accept ADR-001 style from filename ADR-001-...
    const m2 = name.match(/^(ADR-\d{3})/i)
    if (m2) ids.add(m2[1].toUpperCase())
  }
  return ids
}

function discoverViewIds() {
  const ids = new Set()
  if (!fs.existsSync(architectureDir)) return ids
  const files = []
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name)
      if (fs.statSync(p).isDirectory()) walk(p)
      else if (/\.c4$/i.test(name)) files.push(p)
    }
  }
  walk(architectureDir)
  const viewRe = /\bview\s+([A-Za-z_][\w]*)\s*\{/g
  for (const file of files) {
    const text = fs.readFileSync(file, 'utf8')
    let m
    while ((m = viewRe.exec(text)) !== null) ids.add(m[1])
  }
  return ids
}

function asArray(v) {
  if (v == null) return []
  if (Array.isArray(v)) return v.map(String)
  return [String(v)]
}

const adrIds = listAdrIds()
const viewIds = discoverViewIds()
const files = collectMd(reqRoot)
const byId = new Map()
const idToFile = new Map()

for (const file of files) {
  const rel = path.relative(root, file).replace(/\\/g, '/')
  let parsed
  try {
    parsed = matter(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    fail(rel, `malformed frontmatter: ${e.message}`)
    continue
  }
  const data = parsed.data || {}
  if (!data || Object.keys(data).length === 0) {
    fail(rel, 'missing YAML frontmatter')
    continue
  }

  for (const key of REQUIRED) {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      fail(rel, `missing required field '${key}'`)
    }
  }

  const id = String(data.id || '')
  const base = path.basename(file, '.md')
  if (id && base !== id) fail(rel, `filename '${base}' must match id '${id}'`)

  if (id) {
    if (idToFile.has(id)) fail(rel, `duplicate id ${id} (also ${idToFile.get(id)})`)
    idToFile.set(id, rel)
    byId.set(id, data)
  }

  if (data.type && !TYPES.has(String(data.type))) fail(rel, `invalid type '${data.type}'`)
  if (data.status && !STATUSES.has(String(data.status))) fail(rel, `invalid status '${data.status}'`)
  if (data.priority && !PRIORITIES.has(String(data.priority))) fail(rel, `invalid priority '${data.priority}'`)
  if (typeof data.mvp !== 'boolean') fail(rel, `mvp must be boolean true|false`)

  for (const adr of asArray(data.adrs)) {
    const norm = String(adr).toUpperCase()
    if (!adrIds.has(norm)) fail(rel, `ADR not found: ${adr}`)
  }

  for (const view of [...asArray(data.architecture), ...asArray(data.flows)]) {
    if (viewIds.size > 0 && !viewIds.has(view)) {
      fail(rel, `LikeC4 view id not found: ${view}`)
    }
  }

  for (const c of asArray(data.contracts)) {
    const target = path.resolve(root, c)
    if (!fs.existsSync(target)) fail(rel, `contract/doc path not found: ${c}`)
  }

  for (const t of asArray(data.tests)) {
    if (!TEST_IDS.has(String(t))) fail(rel, `unknown test id '${t}' (see requirements/test-catalog.md)`)
  }

  for (const doc of asArray(data.openDecisionDocs)) {
    const target = path.resolve(root, doc)
    if (!fs.existsSync(target)) fail(rel, `openDecisionDocs path not found: ${doc}`)
  }

  // Open decision OD- ids are not used yet
  if (data.openDecisions != null && asArray(data.openDecisions).length > 0) {
    warn(rel, 'openDecisions IDs are not defined; use openDecisionDocs paths instead')
  }
}

// Second pass: requirement references
for (const [id, data] of byId) {
  const rel = idToFile.get(id)
  for (const ref of [...asArray(data.dependsOn), ...asArray(data.related)]) {
    if (!byId.has(ref)) fail(rel, `referenced requirement not found: ${ref}`)
  }
}

if (warnings.length) {
  console.warn('Requirements warnings:')
  for (const w of warnings) console.warn(`  - ${w}`)
}

if (failures.length) {
  console.error(`Requirements validation FAILED (${failures.length}):`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(
  `Requirements OK: ${files.length} files, ${byId.size} unique ids, ${viewIds.size} LikeC4 views indexed, ${adrIds.size} ADRs indexed`,
)
