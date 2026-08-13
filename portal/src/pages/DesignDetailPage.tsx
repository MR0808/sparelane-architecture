import { Link, Navigate, useParams } from 'react-router-dom'
import { MarkdownDoc } from '../components/MarkdownDoc'
import { SourceFooter } from '../components/SourceFooter'
import { getDesign } from '../lib/designs'
import { architectureViewHref, adrHref, testHref, getRequirement } from '../lib/requirements'
import { getTest } from '../lib/tests'

export function DesignDetailPage() {
  const { id } = useParams()
  if (!id) return <Navigate to="/design" replace />
  const d = getDesign(id)
  if (!d || d.renderingTest) {
    return (
      <article>
        <h1 className="page-title">Design not found</h1>
        <p className="page-lead">
          No design diagram <code>{id}</code>.
        </p>
        <Link to="/design">Back to design catalogue</Link>
      </article>
    )
  }

  return (
    <article>
      <p className="req-back">
        <Link to="/design">← Design</Link>
      </p>
      <p className="req-id">{d.id}</p>
      <h1 className="page-title">{d.title}</h1>
      <div className="req-meta-row">
        <span className="req-pill">{d.type}</span>
        <span className="req-pill">{d.area}</span>
        <span className="req-pill">{d.status}</span>
        <span className="req-pill">{d.mvp ? 'MVP' : 'Future'}</span>
      </div>

      <MarkdownDoc markdown={d.body} />

      <section className="req-trace-section">
        <h2 className="req-section-title">LikeC4 views</h2>
        {d.likec4.length === 0 ? (
          <p className="page-lead">None linked.</p>
        ) : (
          <ul className="link-list">
            {d.likec4.map((v) => (
              <li key={v}>
                <Link to={architectureViewHref(v)}>{v}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="req-trace-section">
        <h2 className="req-section-title">Requirements</h2>
        {d.requirements.length === 0 ? (
          <p className="page-lead">None linked.</p>
        ) : (
          <ul className="link-list">
            {d.requirements.map((rid) => {
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
        <h2 className="req-section-title">ADRs</h2>
        {d.adrs.length === 0 ? (
          <p className="page-lead">None linked.</p>
        ) : (
          <ul className="link-list">
            {d.adrs.map((adr) => (
              <li key={adr}>
                <Link to={adrHref(adr)}>{adr}</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="req-trace-section">
        <h2 className="req-section-title">Tests</h2>
        {d.tests.length === 0 ? (
          <p className="page-lead">None linked.</p>
        ) : (
          <ul className="link-list">
            {d.tests.map((tid) => {
              const t = getTest(tid)
              return (
                <li key={tid}>
                  <Link to={testHref(tid)}>{tid}</Link>
                  {t ? ` — ${t.title}` : ''}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <SourceFooter repoPath={d.sourcePath} />
    </article>
  )
}
