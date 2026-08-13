import { githubBlobUrl, githubEditUrl } from '../lib/github'

type Props = {
  repoPath: string
  label?: string
}

/** Unobtrusive source footer with View / Edit on GitHub. */
export function SourceFooter({ repoPath, label = 'Source' }: Props) {
  return (
    <p className="source-footer">
      {label}: <code>{repoPath}</code>
      {' · '}
      <a href={githubBlobUrl(repoPath)} target="_blank" rel="noreferrer">
        View on GitHub
      </a>
      {' · '}
      <a href={githubEditUrl(repoPath)} target="_blank" rel="noreferrer">
        Edit on GitHub
      </a>
    </p>
  )
}
