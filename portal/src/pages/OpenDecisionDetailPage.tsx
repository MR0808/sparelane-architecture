import { Link, Navigate, useParams } from 'react-router-dom'
import { MarkdownDoc } from '../components/MarkdownDoc'
import { SourceFooter } from '../components/SourceFooter'
import { getOpenDecision } from '../lib/openDecisions'

export function OpenDecisionDetailPage() {
  const { id } = useParams()
  if (!id) return <Navigate to="/decisions" replace />
  const d = getOpenDecision(id)
  if (!d) {
    return (
      <article>
        <h1 className="page-title">Open decision not found</h1>
        <p className="page-lead">
          No open decision <code>{id}</code>.
        </p>
        <Link to="/decisions">Back to decisions</Link>
      </article>
    )
  }

  return (
    <article>
      <p className="req-back">
        <Link to="/decisions">← Decisions</Link>
      </p>
      <p className="req-id">{d.id}</p>
      <h1 className="page-title">{d.title}</h1>
      <div className="req-meta-row">
        <span className="req-pill">{d.category}</span>
        <span className="req-pill">{d.blockingStage}</span>
        <span className="req-pill">{d.status}</span>
      </div>
      <MarkdownDoc markdown={d.body} />
      <SourceFooter repoPath={d.sourcePath} />
    </article>
  )
}
