import { Link } from 'react-router-dom'
import { getDocMarkdown } from '../lib/docs'
import { MarkdownDoc } from '../components/MarkdownDoc'
import { SourceFooter } from '../components/SourceFooter'

type Props = {
  /** docs-relative path without leading slash, with or without .md */
  docPath: string
  title?: string
}

export function DocPage({ docPath, title }: Props) {
  const markdown = getDocMarkdown(docPath)
  const normalized = docPath.replace(/\.md$/i, '') + '.md'
  const repoPath = `docs/${normalized.replace(/^docs\//, '')}`

  if (!markdown) {
    return (
      <article>
        <h1 className="page-title">{title ?? 'Document'}</h1>
        <p className="page-lead">
          Document not found: <code>{docPath}</code>. <Link to="/">Return home</Link>
        </p>
      </article>
    )
  }

  return (
    <article>
      {title ? <h1 className="page-title">{title}</h1> : null}
      <MarkdownDoc markdown={markdown} />
      <SourceFooter repoPath={repoPath} />
    </article>
  )
}
