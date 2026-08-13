/**
 * Sanitize Mermaid sequence-diagram statement terminators inside fenced blocks.
 * Mermaid treats `;` as end-of-statement, so note/message text must not contain `;`.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const designRoot = path.join(root, 'docs', 'design')

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p, out)
    else if (/\.md$/i.test(name)) out.push(p)
  }
  return out
}

function sanitizeMermaid(src) {
  return src
    .split(/\r?\n/)
    .map((line) => {
      // Leave structural keywords alone (alt/end/etc.); sanitize text after ':' on notes/messages
      const m = line.match(/^(\s*(?:Note\s+(?:over|left of|right of)\s+[^:]+|[\w.-]+\s*(?:->>|-->>|--x|-\)|--\)|>)\s*[\w.-]+)\s*:\s*)(.*)$/i)
      if (!m) return line
      let text = m[2]
      text = text.replace(/≠/g, '!=')
      text = text.replace(/;/g, ' —')
      return m[1] + text
    })
    .join('\n')
}

let filesChanged = 0
for (const file of walk(designRoot)) {
  const raw = fs.readFileSync(file, 'utf8')
  const next = raw.replace(/```mermaid\s*([\s\S]*?)```/gi, (full, body) => {
    const cleaned = sanitizeMermaid(body)
    return '```mermaid\n' + cleaned.replace(/^\n/, '') + '```'
  })
  if (next !== raw) {
    fs.writeFileSync(file, next)
    filesChanged++
    console.log('updated', path.relative(root, file))
  }
}
console.log('files changed:', filesChanged)
