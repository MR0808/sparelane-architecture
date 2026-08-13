/**
 * One-shot: attach openDecisions + extra test IDs to selected requirements.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const patches = {
  'FUN-PAY-001': { openDecisions: ['OD-007'], testsAdd: ['E2E-PAY-001'] },
  'FUN-PAY-003': { testsAdd: ['E2E-PAY-001'] },
  'FUN-PAY-004': { openDecisions: ['OD-003'], testsAdd: ['E2E-PAY-002'] },
  'FUN-PAY-006': { openDecisions: ['OD-001'], testsAdd: ['E2E-PAY-003'] },
  'FUN-PAY-007': { testsAdd: ['E2E-PAY-004'] },
  'FUN-CON-004': { openDecisions: ['OD-003'] },
  'FUN-CON-006': { testsAdd: ['E2E-PAY-005'] },
  'FUN-BIL-002': { openDecisions: ['OD-002'] },
  'FUN-WAL-001': { openDecisions: ['OD-004', 'OD-012'] },
  'FUN-SET-001': { testsAdd: ['E2E-SET-001'] },
  'FUN-SET-002': { openDecisions: ['OD-009', 'OD-011'], testsAdd: ['E2E-SET-001'] },
  'FUN-SET-003': { testsAdd: ['E2E-SET-003'] },
  'INT-SET-001': { openDecisions: ['OD-009'], testsAdd: ['E2E-SET-001'] },
  'INT-SET-002': { openDecisions: ['OD-009'], testsAdd: ['E2E-SET-002'] },
  'INT-PSP-001': { openDecisions: ['OD-008'] },
  'INT-PSP-003': { openDecisions: ['OD-008'], testsAdd: ['E2E-PAY-001'] },
  'INT-PSP-005': { openDecisions: ['OD-008'], testsAdd: ['INT-PSP-001'] },
  'FUN-MER-004': { testsAdd: ['INT-API-001'] },
  'FUN-MER-006': { openDecisions: ['OD-031'], testsAdd: ['INT-API-002', 'CON-WEBHOOK-001'] },
  'NFR-SEC-001': { testsAdd: ['SEC-TEN-001'] },
  'NFR-SEC-004': { openDecisions: ['OD-024'] },
  'NFR-SEC-003': { openDecisions: ['OD-025'] },
  'NFR-SEC-006': { testsAdd: ['INT-PSP-001'] },
  'FUN-MER-002': { testsAdd: ['SEC-AUTH-001', 'CON-API-001'] },
  'NFR-REL-004': { testsAdd: ['OPS-REC-002'] },
  'NFR-REL-001': { testsAdd: ['OPS-REC-001'] },
  'NFR-REL-002': { testsAdd: ['OPS-REC-001'] },
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
for (const [id, patch] of Object.entries(patches)) {
  const file = findReq(id)
  if (!file) {
    console.warn('missing', id)
    continue
  }
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = matter(raw)
  const data = parsed.data
  if (patch.openDecisions) {
    const existing = Array.isArray(data.openDecisions) ? data.openDecisions.map(String) : []
    data.openDecisions = [...new Set([...existing, ...patch.openDecisions])]
  }
  if (patch.testsAdd) {
    const existing = Array.isArray(data.tests) ? data.tests.map(String) : []
    data.tests = [...new Set([...existing, ...patch.testsAdd])]
  }
  if (Array.isArray(data.openDecisionDocs) && data.openDecisionDocs.length === 0) {
    delete data.openDecisionDocs
  }
  const out = matter.stringify(parsed.content.replace(/^\n/, ''), data)
  fs.writeFileSync(file, out.endsWith('\n') ? out : out + '\n')
  n++
  console.log('patched', id)
}
console.log('done', n)
