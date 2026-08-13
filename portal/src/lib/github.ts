/** Central GitHub source config for Edit/View links. */
export const GITHUB_OWNER = 'MR0808'
export const GITHUB_REPO = 'sparelane-architecture'
export const GITHUB_BRANCH = 'main'
export const GITHUB_BASE = `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}`

/** @param repoPath path relative to repo root, e.g. requirements/functional/FUN-PAY-001.md */
export function githubBlobUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\/+/, '').replace(/\\/g, '/')
  return `${GITHUB_BASE}/blob/${GITHUB_BRANCH}/${cleaned}`
}

export function githubEditUrl(repoPath: string): string {
  const cleaned = repoPath.replace(/^\/+/, '').replace(/\\/g, '/')
  return `${GITHUB_BASE}/edit/${GITHUB_BRANCH}/${cleaned}`
}
