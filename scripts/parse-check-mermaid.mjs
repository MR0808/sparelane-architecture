import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import mermaid from 'mermaid'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const designRoot = path.join(root, 'docs', 'design')

mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' })

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, out)
    else if (/\.md$/i.test(name)) out.push(p)
  }
  return out
}

let ok = 0
let fail = 0
for (const file of walk(designRoot)) {
  const raw = fs.readFileSync(file, 'utf8')
  const blocks = [...raw.matchAll(/```mermaid\s*([\s\S]*?)```/gi)]
  for (let i = 0; i < blocks.length; i++) {
    const src = blocks[i][1].trim()
    try {
      await mermaid.parse(src)
      ok++
    } catch (e) {
      fail++
      console.error('FAIL', path.relative(root, file), `block ${i + 1}`)
      console.error(' ', e?.str || e?.message || e)
    }
  }
}
console.log(`Mermaid parse: ok=${ok} fail=${fail}`)
if (fail) process.exit(1)
