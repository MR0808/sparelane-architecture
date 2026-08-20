import { Link, Navigate, useParams } from 'react-router-dom'
import { MarkdownDoc } from '../components/MarkdownDoc'
import { SourceFooter } from '../components/SourceFooter'
import { getTest } from '../lib/tests'
import { getRequirement } from '../lib/requirements'
import { architectureViewHref } from '../lib/requirements'

export function TestDetailPage() {
  const { id } = useParams()
  if (!id) return <Navigate to="/tests" replace />
  const t = getTest(id)
  if (!t) {
    return (
      <article>
        <h1 className="page-title">Test not found</h1>
        <p className="page-lead">
          No test spec <code>{id}</code>.
        </p>
        <Link to="/tests">Back to tests</Link>
      </article>
    )
  }

  return (
    <article>
      <p className="req-back">
        <Link to="/tests">← Tests</Link>
      </p>
      <p className="req-id">{t.id}</p>
      <h1 className="page-title">{t.title}</h1>
      <div className="req-meta-row">
        <span className="req-pill">{t.type}</span>
        <span className="req-pill">{t.status}</span>
        {t.implementationProgress ? (
          <span className="req-pill impl-foundation_implemented">{t.implementationProgress.replaceAll('_', ' ')}</span>
        ) : null}
        <span className="req-pill">{t.mvp ? 'MVP' : 'Future'}</span>
      </div>
      <MarkdownDoc markdown={t.body} />
      <section className="req-trace-section">
        <h2 className="req-section-title">Related requirements</h2>
        {t.relatedRequirements.length === 0 ? (
          <p className="page-lead">None linked.</p>
        ) : (
          <ul className="link-list">
            {t.relatedRequirements.map((rid) => {
              const r = getRequirement(rid)
              return (
                <li key={rid}>
                  <Link to={`/requirements/${rid}`}>{rid}</Link>
                  {r ? ` — ${r.title}` : ''}
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <section className="req-trace-section">
        <h2 className="req-section-title">Related flows</h2>
        {t.relatedFlows.length === 0 ? (
          <p className="page-lead">None linked.</p>
        ) : (
          <ul className="link-list">
            {t.relatedFlows.map((v) => (
              <li key={v}>
                <Link to={architectureViewHref(v)}>{v}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>
      <SourceFooter repoPath={t.sourcePath} />
    </article>
  )
}
