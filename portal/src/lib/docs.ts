/**
 * Eager raw Markdown load from repository docs/ (source of truth).
 * Keys are Vite-normalized absolute-ish paths; we index by docs-relative path.
 */
const modules = import.meta.glob('../../../docs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function normalizeKey(filePath: string): string {
  const marker = '/docs/'
  const idx = filePath.replace(/\\/g, '/').lastIndexOf(marker)
  if (idx === -1) return filePath
  return filePath.replace(/\\/g, '/').slice(idx + marker.length)
}

const byRelPath = new Map<string, string>()
for (const [key, content] of Object.entries(modules)) {
  byRelPath.set(normalizeKey(key), content)
}

/** Resolve docs-relative path such as `START-HERE.md` or `decisions/open-decisions.md` */
export function getDocMarkdown(relPath: string): string | null {
  const cleaned = relPath.replace(/^\/+/, '').replace(/\\/g, '/')
  const withMd = cleaned.endsWith('.md') ? cleaned : `${cleaned}.md`
  return byRelPath.get(withMd) ?? null
}

export function listDocPaths(): string[] {
  return [...byRelPath.keys()].sort()
}
