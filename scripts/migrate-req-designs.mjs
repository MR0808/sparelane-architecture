/**
 * Attach designs: frontmatter to carefully mapped requirements.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const patches = {
  'FUN-BIL-001': ['SEQ-PAY-001', 'SEQ-INT-001'],
  'FUN-BIL-002': ['SEQ-PAY-001'],
  'FUN-MER-003': ['SEQ-PAY-001', 'SEQ-INT-001'],
  'FUN-MER-004': ['SEQ-INT-002'],
  'FUN-MER-006': ['SEQ-INT-003', 'SEQ-INT-004'],
  'FUN-PAY-001': ['STATE-PAY-001', 'SEQ-PAY-003'],
  'FUN-PAY-002': ['SEQ-PAY-002'],
  'FUN-PAY-003': ['SEQ-PAY-003'],
  'FUN-PAY-004': ['SEQ-PAY-004'],
  'FUN-PAY-006': ['SEQ-PAY-005'],
  'FUN-PAY-007': ['SEQ-PAY-006'],
  'FUN-CON-003': ['SEQ-SEC-001'],
  'FUN-CON-006': ['SEQ-PAY-007'],
  'FUN-SET-001': ['SEQ-MONEY-001', 'STATE-MONEY-001'],
  'FUN-SET-002': ['SEQ-MONEY-002'],
  'FUN-SET-003': ['SEQ-MONEY-005'],
  'FUN-SET-004': ['SEQ-MONEY-004', 'SEQ-MONEY-006'],
  'FUN-SET-005': ['SEQ-MONEY-001', 'SEQ-OPS-002'],
  'NFR-SEC-002': ['SEQ-SEC-001'],
  'NFR-SEC-005': ['SEQ-INT-003', 'SEQ-INT-004'],
  'NFR-SEC-006': ['SEQ-SEC-002'],
  'NFR-REL-004': ['SEQ-OPS-003'],
  'NFR-REL-005': ['SEQ-MONEY-005', 'SEQ-OPS-001'],
  'NFR-PRIV-003': ['SEQ-DATA-002'],
  'INT-PSP-005': ['SEQ-SEC-002'],
  'INT-SET-001': ['SEQ-MONEY-002', 'SEQ-OPS-004'],
}

function findReq(id) {
  const dirs = ['business', 'functional', 'non-functional', 'integrations', 'security']
  for (const d of dirs) {
    const p = path.join(root, 'requirements', d, `${id}.md`)
    if (fs.existsSync(p)) return p
  }
  return null
}

let n = 0
for (const [id, designs] of Object.entries(patches)) {
  const file = findReq(id)
  if (!file) {
    console.warn('missing', id)
    continue
  }
  const parsed = matter(fs.readFileSync(file, 'utf8'))
  const existing = Array.isArray(parsed.data.designs) ? parsed.data.designs.map(String) : []
  parsed.data.designs = [...new Set([...existing, ...designs])]
  const out = matter.stringify(parsed.content.replace(/^\n/, ''), parsed.data)
  fs.writeFileSync(file, out.endsWith('\n') ? out : out + '\n')
  n++
  console.log('patched', id, '→', parsed.data.designs.join(', '))
}
console.log('done', n)
