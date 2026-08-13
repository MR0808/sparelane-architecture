/**
 * Validate Mermaid engineering design catalogue under docs/design/.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const designRoot = path.join(root, 'docs', 'design')
const decisionsDir = path.join(root, 'docs', 'decisions')
const architectureDir = path.join(root, 'architecture')
const reqRoot = path.join(root, 'requirements')
const testsDir = path.join(reqRoot, 'tests')

const TYPES = new Set(['sequence', 'state', 'flow', 'erd'])
const REQUIRED = ['id', 'title', 'type', 'area', 'status', 'mvp']

const failures = []
const warnings = []

function fail(file, msg) {
  failures.push(`${file}: ${msg}`)
}

function warn(file, msg) {
  warnings.push(`${file}: ${msg}`)
}

function asArray(v) {
  if (v == null) return []
  if (Array.isArray(v)) return v.map(String)
  return [String(v)]
}

function walkMd(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) walkMd(p, out)
    else if (/\.md$/i.test(name) && name.toUpperCase() !== 'README.MD') out.push(p)
  }
  return out
}

function discoverViewIds() {
  const ids = new Set()
  if (!fs.existsSync(architectureDir)) return ids
  function walk(d) {
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name)
      if (fs.statSync(p).isDirectory()) walk(p)
      else if (/\.c4$/i.test(name)) {
        const text = fs.readFileSync(p, 'utf8')
        const viewRe = /\bview\s+([A-Za-z_][\w]*)\s*\{/g
        let m
        while ((m = viewRe.exec(text)) !== null) ids.add(m[1])
      }
    }
  }
  walk(architectureDir)
  return ids
}

function listAdrIds() {
  const ids = new Set()
  if (!fs.existsSync(decisionsDir)) return ids
  for (const name of fs.readdirSync(decisionsDir)) {
    const m = name.match(/^(ADR-\d{3})/i)
    if (m) ids.add(m[1].toUpperCase())
  }
  return ids
}

function listReqIds() {
  const ids = new Set()
  function walk(d) {
    if (!fs.existsSync(d)) return
    for (const name of fs.readdirSync(d)) {
      const p = path.join(d, name)
      if (fs.statSync(p).isDirectory()) {
        if (name === 'tests' || name === 'templates') continue
        walk(p)
      } else if (/\.md$/i.test(name) && name.toUpperCase() !== 'README.MD' && name !== 'test-catalog.md') {
        try {
          const { data } = matter(fs.readFileSync(p, 'utf8'))
          if (data?.id) ids.add(String(data.id))
        } catch {
          /* ignore */
        }
      }
    }
  }
  walk(reqRoot)
  return ids
}

function listTestIds() {
  const ids = new Set()
  if (!fs.existsSync(testsDir)) return ids
  for (const name of fs.readdirSync(testsDir)) {
    if (!/\.md$/i.test(name) || name.toLowerCase() === 'readme.md') continue
    try {
      const { data } = matter(fs.readFileSync(path.join(testsDir, name), 'utf8'))
      if (data?.id) ids.add(String(data.id))
    } catch {
      ids.add(path.basename(name, '.md'))
    }
  }
  return ids
}

function basicMermaidCheck(body, rel, id) {
  const blocks = [...body.matchAll(/```mermaid\s*([\s\S]*?)```/gi)]
  if (blocks.length === 0) {
    fail(rel, `${id} missing Mermaid fenced block`)
    return
  }
  for (const b of blocks) {
    const src = (b[1] || '').trim()
    if (!src) {
      fail(rel, `${id} has empty Mermaid block`)
      continue
    }
    const head = src.split(/\r?\n/)[0].toLowerCase()
    if (
      !head.includes('sequencediagram') &&
      !head.includes('statediagram') &&
      !head.includes('flowchart') &&
      !head.includes('erdiagram') &&
      !head.startsWith('graph ')
    ) {
      warn(rel, `${id} Mermaid block does not start with a recognised diagram type`)
    }
    // Unbalanced alt/end / critical/end heuristics for sequence diagrams
    if (head.includes('sequencediagram')) {
      const alts = (src.match(/^\s*alt\b/gim) || []).length
      const criticals = (src.match(/^\s*critical\b/gim) || []).length
      const opts = (src.match(/^\s*opt\b/gim) || []).length
      const loops = (src.match(/^\s*loop\b/gim) || []).length
      const ends = (src.match(/^\s*end\b/gim) || []).length
      const opens = alts + criticals + opts + loops
      if (opens !== ends) {
        warn(rel, `${id} Mermaid block may have unbalanced alt/opt/loop/critical/end (${opens} open, ${ends} end)`)
      }
      // Semicolon terminates Mermaid statements — forbid in note/message text
      for (const line of src.split(/\r?\n/)) {
        if (/^\s*(?:Note\s+|[\w.-]+\s*(?:->>|-->>|--x))\s*.*:/.test(line) && line.includes(';')) {
          fail(rel, `${id} Mermaid line contains ';' (statement terminator): ${line.trim()}`)
        }
      }
    }
  }
}

const viewIds = discoverViewIds()
const adrIds = listAdrIds()
const reqIds = listReqIds()
const testIds = listTestIds()
const files = walkMd(designRoot)
const byId = new Map()
let sequenceCount = 0
let stateCount = 0
let invalidTrace = 0

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
  if (!data.id) {
    // allow non-catalogue files without id only if portal-test marked via status later — still require id
    fail(rel, 'missing required field id')
    continue
  }

  const id = String(data.id)
  if (byId.has(id)) fail(rel, `duplicate design id ${id} (also ${byId.get(id)})`)
  byId.set(id, rel)

  if (data.renderingTest || data.status === 'portal-test') {
    // portal regression test — lighter checks
    if (!/```mermaid/i.test(parsed.content || '')) fail(rel, `${id} missing Mermaid fenced block`)
    continue
  }

  for (const key of REQUIRED) {
    if (data[key] === undefined || data[key] === null || data[key] === '') {
      fail(rel, `missing required field '${key}'`)
    }
  }

  if (data.type && !TYPES.has(String(data.type))) fail(rel, `invalid type '${data.type}'`)
  if (typeof data.mvp !== 'boolean') fail(rel, `mvp must be boolean true|false`)

  if (String(data.type) === 'sequence') sequenceCount += 1
  if (String(data.type) === 'state') stateCount += 1

  for (const view of asArray(data.likec4)) {
    if (viewIds.size > 0 && !viewIds.has(view)) {
      fail(rel, `${id} references unknown LikeC4 view: ${view}`)
      invalidTrace += 1
    }
  }

  for (const rid of asArray(data.requirements)) {
    if (!reqIds.has(rid)) {
      fail(rel, `${id} references unknown requirement: ${rid}`)
      invalidTrace += 1
    }
  }

  for (const adr of asArray(data.adrs)) {
    const norm = String(adr).toUpperCase()
    if (!adrIds.has(norm)) {
      fail(rel, `${id} references unknown ADR: ${adr}`)
      invalidTrace += 1
    }
  }

  for (const tid of asArray(data.tests)) {
    if (!testIds.has(String(tid))) {
      fail(rel, `${id} references unknown test: ${tid}`)
      invalidTrace += 1
    }
  }

  basicMermaidCheck(parsed.content || '', rel, id)
}

if (warnings.length) {
  console.warn('Design warnings:')
  for (const w of warnings) console.warn(`  - ${w}`)
}

if (failures.length) {
  console.error(`Design validation FAILED (${failures.length}):`)
  for (const f of failures) console.error(`  - ${f}`)
  process.exit(1)
}

console.log(
  `Designs OK: ${byId.size} ids, ${sequenceCount} sequence, ${stateCount} state, ${viewIds.size} LikeC4 views indexed, ${invalidTrace} invalid traces`,
)
