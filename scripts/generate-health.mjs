/**
 * Generate portal/generated/health.json from repository state (static).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function walkMd(dir, out = [], skipDirs = new Set()) {
  if (!fs.existsSync(dir)) return out
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    const st = fs.statSync(p)
    if (st.isDirectory()) {
      if (skipDirs.has(name) || name === 'node_modules' || name === 'templates') continue
      walkMd(p, out, skipDirs)
    } else if (/\.md$/i.test(name)) out.push(p)
  }
  return out
}

function discoverViewIds() {
  const ids = new Set()
  const architectureDir = path.join(root, 'architecture')
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

function asArray(v) {
  if (v == null) return []
  if (Array.isArray(v)) return v.map(String)
  return [String(v)]
}

const reqFiles = walkMd(path.join(root, 'requirements'), [], new Set(['tests']))
const requirements = []
for (const file of reqFiles) {
  const base = path.basename(file)
  if (base.toLowerCase() === 'readme.md' || base === 'test-catalog.md') continue
  const { data } = matter(fs.readFileSync(file, 'utf8'))
  if (!data?.id || !/^(BUS|FUN|NFR|INT)-/.test(String(data.id))) continue
  requirements.push(data)
}

const openDir = path.join(root, 'docs', 'decisions', 'open')
const openDecisions = fs.existsSync(openDir)
  ? fs.readdirSync(openDir).filter((n) => /^OD-\d{3}/i.test(n)).length
  : 0

const adrCount = fs
  .readdirSync(path.join(root, 'docs', 'decisions'))
  .filter((n) => /^ADR-\d{3}/i.test(n)).length

const testFiles = walkMd(path.join(root, 'requirements', 'tests'))
const testCount = testFiles.filter((f) => path.basename(f).toLowerCase() !== 'readme.md').length

const designFiles = walkMd(path.join(root, 'docs', 'design')).filter(
  (f) => path.basename(f).toLowerCase() !== 'readme.md',
)
let designTotal = 0
let designSequence = 0
let designState = 0
let designInvalidTrace = 0
const viewIdsForHealth = discoverViewIds()
const adrIdsForHealth = new Set(
  fs
    .readdirSync(path.join(root, 'docs', 'decisions'))
    .filter((n) => /^ADR-\d{3}/i.test(n))
    .map((n) => n.match(/^(ADR-\d{3})/i)[1].toUpperCase()),
)
const reqIdSet = new Set(requirements.map((r) => String(r.id)))
const testIdSet = new Set()
for (const f of testFiles) {
  if (path.basename(f).toLowerCase() === 'readme.md') continue
  try {
    const { data } = matter(fs.readFileSync(f, 'utf8'))
    if (data?.id) testIdSet.add(String(data.id))
  } catch {
    /* ignore */
  }
}
for (const f of designFiles) {
  try {
    const { data } = matter(fs.readFileSync(f, 'utf8'))
    if (!data?.id || data.renderingTest || data.status === 'portal-test') continue
    designTotal += 1
    if (data.type === 'sequence') designSequence += 1
    if (data.type === 'state') designState += 1
    for (const v of asArray(data.likec4)) {
      if (viewIdsForHealth.size > 0 && !viewIdsForHealth.has(v)) designInvalidTrace += 1
    }
    for (const r of asArray(data.requirements)) {
      if (!reqIdSet.has(r)) designInvalidTrace += 1
    }
    for (const a of asArray(data.adrs)) {
      if (!adrIdsForHealth.has(String(a).toUpperCase())) designInvalidTrace += 1
    }
    for (const t of asArray(data.tests)) {
      if (!testIdSet.has(String(t))) designInvalidTrace += 1
    }
  } catch {
    /* ignore */
  }
}

const docCount = walkMd(path.join(root, 'docs')).length
const views = viewIdsForHealth

let mvp = 0
let blocked = 0
let missingArchitecture = 0
let missingTests = 0
let mvpVerified = 0
let foundationImplemented = 0
let productImplemented = 0
for (const r of requirements) {
  const mvpFlag = Boolean(r.mvp)
  if (mvpFlag) mvp += 1
  if (asArray(r.openDecisions).length > 0) blocked += 1
  if (asArray(r.architecture).length + asArray(r.flows).length === 0) missingArchitecture += 1
  if (asArray(r.tests).length === 0) missingTests += 1
  if (mvpFlag && String(r.status) === 'verified') mvpVerified += 1
  if (String(r.implementationStatus) === 'foundation_implemented') foundationImplemented += 1
  if (String(r.implementationStatus) === 'implemented') productImplemented += 1
}

const openapiExists = fs.existsSync(path.join(root, 'contracts', 'openapi.yaml'))

const phaseAFile = path.join(root, 'docs', 'implementation', 'phase-a-status.md')
const phaseBFile = path.join(root, 'docs', 'implementation', 'phase-b-status.md')
const phaseCFile = path.join(root, 'docs', 'implementation', 'phase-c-status.md')
const phaseDFile = path.join(root, 'docs', 'implementation', 'phase-d-status.md')
const phaseFFile = path.join(root, 'docs', 'implementation', 'phase-f-status.md')
const phaseGFile = path.join(root, 'docs', 'implementation', 'phase-g-status.md')
const phaseH0GateFile = path.join(root, 'docs', 'implementation', 'phase-h0-admin-decision-gate.md')
const phaseHStatusFile = path.join(root, 'docs', 'implementation', 'phase-h-status.md')
const phaseH1ScopeFile = path.join(root, 'docs', 'implementation', 'phase-h1-decision-gate-scope.md')
const phaseH1GateFile = path.join(root, 'docs', 'implementation', 'phase-h1-admin-decision-gate.md')
const phaseAPresent = fs.existsSync(phaseAFile)
const phaseBPresent = fs.existsSync(phaseBFile)
const phaseCPresent = fs.existsSync(phaseCFile)
const phaseDPresent = fs.existsSync(phaseDFile)
const phaseFPresent = fs.existsSync(phaseFFile)
const phaseGPresent = fs.existsSync(phaseGFile)
const phaseH0GatePresent = fs.existsSync(phaseH0GateFile)
const phaseHStatusPresent = fs.existsSync(phaseHStatusFile)
const phaseHStatusText = phaseHStatusPresent ? fs.readFileSync(phaseHStatusFile, 'utf8') : ''
const phaseH0PlatformPass = /Platform H0 status:[\s\S]*?\*\*PASS\*\*/.test(phaseHStatusText)
const phaseH1PlatformPass = /Platform H1 status:[\s\S]*?\*\*PASS\*\*/.test(phaseHStatusText)
const phaseHInProgress = /Canonical Phase H status:[\s\S]*?\*\*IN PROGRESS\*\*/.test(phaseHStatusText)
const phaseH1ScopePresent = fs.existsSync(phaseH1ScopeFile)
const phaseH1GatePresent = fs.existsSync(phaseH1GateFile)
const phaseA = phaseAPresent
  ? {
      gate: 'pass_with_documented_non_blocking_risks',
      phasesCompleted: 'A0-A9',
      nextPhase: 'B',
      nextPhaseStatus: phaseBPresent ? 'pass_with_documented_non_blocking_risks' : 'not_started',
      documented: true,
    }
  : {
      gate: 'unknown',
      phasesCompleted: '',
      nextPhase: 'B',
      nextPhaseStatus: 'not_started',
      documented: false,
    }

const phaseB = phaseBPresent
  ? {
      gate: 'pass_with_documented_non_blocking_risks',
      phasesCompleted: 'B0-B6',
      nextPhase: 'C',
      nextPhaseStatus: phaseCPresent ? 'pass_with_documented_non_blocking_risks' : 'not_started',
      documented: true,
    }
  : {
      gate: 'not_started',
      phasesCompleted: '',
      nextPhase: 'C',
      nextPhaseStatus: 'not_started',
      documented: false,
    }

const phaseC = phaseCPresent
  ? {
      gate: 'pass_with_documented_non_blocking_risks',
      phasesCompleted: 'C0-C5',
      nextPhase: 'D',
      nextPhaseStatus: phaseDPresent ? 'pass_with_documented_non_blocking_risks' : 'not_started',
      documented: true,
    }
  : {
      gate: 'not_started',
      phasesCompleted: '',
      nextPhase: 'D',
      nextPhaseStatus: 'not_started',
      documented: false,
    }

const phaseD = phaseDPresent
  ? {
      gate: 'pass_with_documented_non_blocking_risks',
      phasesCompleted: 'D0-D7',
      nextPhase: 'E',
      nextPhaseStatus: 'pass_with_documented_non_blocking_risks',
      documented: true,
    }
  : {
      gate: 'not_started',
      phasesCompleted: '',
      nextPhase: 'E',
      nextPhaseStatus: 'not_started',
      documented: false,
    }

const phaseF = phaseFPresent
  ? {
      gate: 'pass_with_documented_non_blocking_risks',
      phasesCompleted: 'F0-F2',
      nextPhase: 'G',
      nextPhaseStatus: phaseGPresent ? 'pass_with_documented_non_blocking_risks' : 'not_started',
      documented: true,
      verification: 'local_fake_settlement',
    }
  : {
      gate: 'not_started',
      phasesCompleted: '',
      nextPhase: 'G',
      nextPhaseStatus: 'not_started',
      documented: false,
      verification: '',
    }

const phaseG = phaseGPresent
  ? {
      gate: 'pass_with_documented_non_blocking_risks',
      phasesCompleted: 'G0-G2',
      nextPhase: 'H',
      nextPhaseStatus: 'in_progress',
      documented: true,
      verification: 'local_webhook_sink_fake_email',
    }
  : {
      gate: 'not_started',
      phasesCompleted: '',
      nextPhase: 'H',
      nextPhaseStatus: 'not_started',
      documented: false,
      verification: '',
    }

const health = {
  generatedAt: new Date().toISOString(),
  label: 'Generated from repository state',
  requirements: {
    total: requirements.length,
    mvp,
    future: requirements.length - mvp,
    blocked,
    missingArchitecture,
    missingTests,
    mvpVerified,
    foundationImplemented,
    productImplemented,
  },
  decisions: {
    adrs: adrCount,
    open: openDecisions,
  },
  tests: { total: testCount },
  designs: {
    total: designTotal,
    sequence: designSequence,
    state: designState,
    invalidTraceability: designInvalidTrace,
  },
  architecture: { views: views.size },
  contracts: { openapi: openapiExists ? 'present' : 'missing' },
  docs: { count: docCount },
  implementation: {
    phaseAGate: phaseA.gate,
    phasesCompleted: phaseA.phasesCompleted,
    phaseBGate: phaseB.gate,
    phaseBPhasesCompleted: phaseB.phasesCompleted,
    phaseB: phaseB.gate,
    phaseCGate: phaseC.gate,
    phaseCPhasesCompleted: phaseC.phasesCompleted,
    phaseC: phaseC.gate,
    phaseDGate: phaseD.gate,
    phaseDPhasesCompleted: phaseD.phasesCompleted,
    phaseD: phaseD.gate,
    phaseE: 'pass_with_documented_non_blocking_risks',
    phaseFGate: phaseF.gate,
    phaseFPhasesCompleted: phaseF.phasesCompleted,
    phaseF: phaseF.gate,
    phaseFVerification: phaseF.verification || 'none',
    phaseGGate: phaseG.gate,
    phaseGPhasesCompleted: phaseG.phasesCompleted,
    phaseG: phaseG.gate,
    phaseGVerification: phaseG.verification || 'none',
    phaseH0Gate: phaseH0GatePresent ? 'pass' : 'not_documented',
    phaseH0Documented: phaseH0GatePresent,
    phaseH0Exit: phaseH0PlatformPass ? 'pass' : phaseH0GatePresent ? 'gate_only' : 'not_documented',
    phaseH: phaseHInProgress || phaseH0PlatformPass ? 'in_progress' : 'not_started',
    phaseH1Gate: phaseH1GatePresent ? 'pass' : phaseH1ScopePresent ? 'scoped_not_started' : 'not_documented',
    phaseH1Exit: phaseH1PlatformPass ? 'pass' : phaseH1GatePresent ? 'gate_only' : 'not_documented',
    phaseH1Documented: phaseH1GatePresent || phaseH1ScopePresent,
    nextPhase: phaseGPresent ? 'H' : phaseFPresent ? 'G' : phaseDPresent ? 'E' : 'D',
    label: 'Generated from repository state — not live production health',
  },
}

const outDir = path.join(root, 'portal', 'src', 'generated')
fs.mkdirSync(outDir, { recursive: true })
const outFile = path.join(outDir, 'health.json')
fs.writeFileSync(outFile, JSON.stringify(health, null, 2) + '\n')
console.log(`Wrote ${path.relative(root, outFile)}`)
