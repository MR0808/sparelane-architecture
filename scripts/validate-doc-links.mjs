/**
 * Lightweight internal markdown link checker for docs/ and root README.
 * Resolves relative links to .md/.markdown and paths ending without query/hash.
 * Skips http(s), mailto, and pure # anchors.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const roots = [path.join(root, 'docs'), path.join(root, 'README.md')]

const linkRe = /\[([^\]]*)\]\(([^)]+)\)/g
let filesChecked = 0
let linksChecked = 0
const failures = []

function collectMarkdownFiles(entry, out = []) {
  const st = fs.statSync(entry)
  if (st.isFile()) {
    if (/\.md$/i.test(entry)) out.push(entry)
    return out
  }
  for (const name of fs.readdirSync(entry)) {
    if (name === 'node_modules' || name === 'dist') continue
    collectMarkdownFiles(path.join(entry, name), out)
  }
  return out
}

function checkFile(filePath) {
  filesChecked += 1
  const text = fs.readFileSync(filePath, 'utf8')
  const dir = path.dirname(filePath)
  let m
  while ((m = linkRe.exec(text)) !== null) {
    const target = m[2].trim()
    if (!target || target.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(target)) {
      continue
    }
    // Portal app routes (not filesystem paths)
    if (target.startsWith('/')) {
      continue
    }
    const bare = target.split('#')[0].split('?')[0]
    if (!bare) continue
    // Only validate repo-relative doc/code path links
    if (!bare.startsWith('.') && !bare.startsWith('/') && !/^[A-Za-z0-9_./-]+$/.test(bare)) {
      continue
    }
    linksChecked += 1
    const resolved = path.resolve(dir, bare)
    if (!fs.existsSync(resolved)) {
      failures.push({ file: path.relative(root, filePath), link: target, resolved: path.relative(root, resolved) })
    }
  }
}

const files = []
for (const r of roots) {
  if (!fs.existsSync(r)) continue
  collectMarkdownFiles(r, files)
}

for (const f of files) checkFile(f)

if (failures.length) {
  console.error(`Doc link validation failed (${failures.length}):`)
  for (const f of failures) {
    console.error(`  ${f.file}: (${f.link}) → missing ${f.resolved}`)
  }
  process.exit(1)
}

console.log(`Doc links OK: ${filesChecked} files, ${linksChecked} internal links`)
