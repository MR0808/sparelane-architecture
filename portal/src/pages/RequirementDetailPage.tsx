import type { ReactNode } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { MarkdownDoc } from '../components/MarkdownDoc'
import { SourceFooter } from '../components/SourceFooter'
import {
  adrHref,
  architectureViewHref,
  contractHref,
  designHref,
  getRequirement,
  openDecisionHref,
  testHref,
} from '../lib/requirements'
import { getTest } from '../lib/tests'
import { getOpenDecision } from '../lib/openDecisions'
import { getDesign } from '../lib/designs'

function TraceList({
  title,
  empty,
  children,
}: {
  title: string
  empty: boolean
  children: ReactNode
}) {
  return (
    <section className="req-trace-section">
      <h2 className="req-section-title">{title}</h2>
      {empty ? <p className="page-lead">None linked.</p> : <ul className="link-list">{children}</ul>}
    </section>
  )
}

export function RequirementDetailPage() {
  const { id } = useParams()
  const req = id ? getRequirement(id) : null

  if (!id) return <Navigate to="/requirements" replace />
  if (!req) {
    return (
      <article>
        <h1 className="page-title">Requirement not found</h1>
        <p className="page-lead">
          No requirement <code>{id}</code> in <code>requirements/</code>.
        </p>
        <Link to="/requirements">Back to requirements</Link>
      </article>
    )
  }

  const openIds = [
    ...req.openDecisions,
    ...req.openDecisionDocs
      .map((p) => {
        const m = p.match(/(OD-\d{3})/i)
        return m ? m[1].toUpperCase() : null
      })
      .filter((x): x is string => Boolean(x)),
  ]
  const uniqueOpen = [...new Set(openIds)]

  return (
    <article className="req-detail">
      <p className="req-back">
        <Link to="/requirements">← Requirements</Link>
        {' · '}
        <Link to="/requirements/traceability">Traceability</Link>
      </p>
      <header className="req-detail-header">
        <p className="req-id">{req.id}</p>
        <h1 className="page-title">{req.title}</h1>
        <div className="req-meta-row">
          <span className={`req-pill status-${req.status}`}>{req.status}</span>
          <span className={`req-pill impl-${req.implementationStatus}`}>
            {req.implementationStatus.replaceAll('_', ' ')}
          </span>
          <span className="req-pill">{req.priority}</span>
          <span className="req-pill">{req.mvp ? 'MVP' : 'Future'}</span>
          <span className="req-pill">
            {req.type} / {req.area}
          </span>
        </div>
      </header>
      {req.implementationEvidence ? (
        <p className="req-muted">
          Platform evidence: <code>{req.implementationEvidence}</code>
        </p>
      ) : null}

      <div className="markdown-body req-body">
        <MarkdownDoc markdown={req.body} />
      </div>

      <TraceList title="Architecture" empty={req.architecture.length === 0}>
        {req.architecture.map((v) => (
          <li key={v}>
            <Link to={architectureViewHref(v)}>{v}</Link>
            <span className="req-muted"> (LikeC4 view)</span>
          </li>
        ))}
      </TraceList>

      <TraceList title="Flows" empty={req.flows.length === 0}>
        {req.flows.map((v) => (
          <li key={v}>
            <Link to={architectureViewHref(v)}>{v}</Link>
            <span className="req-muted"> (dynamic / sequence view)</span>
          </li>
        ))}
      </TraceList>

      <TraceList title="Decisions (ADRs)" empty={req.adrs.length === 0}>
        {req.adrs.map((adr) => (
          <li key={adr}>
            <Link to={adrHref(adr)}>{adr}</Link>
          </li>
        ))}
      </TraceList>

      <TraceList title="Open decisions" empty={uniqueOpen.length === 0}>
        {uniqueOpen.map((oid) => {
          const od = getOpenDecision(oid)
          return (
            <li key={oid}>
              <Link to={openDecisionHref(oid)}>{oid}</Link>
              {od ? ` — ${od.title}` : ''}
            </li>
          )
        })}
      </TraceList>

      <TraceList title="Contracts" empty={req.contracts.length === 0}>
        {req.contracts.map((c) => (
          <li key={c}>
            <Link to={contractHref(c)}>{c}</Link>
          </li>
        ))}
      </TraceList>

      <TraceList title="Implementation" empty={req.modules.length === 0}>
        {req.modules.map((m) => (
          <li key={m}>
            {m}{' '}
            <span className="req-muted">
              — <Link to="/implementation">implementation docs</Link>
            </span>
          </li>
        ))}
      </TraceList>

      <TraceList title="Design diagrams" empty={req.designs.length === 0}>
        {req.designs.map((did) => {
          const design = getDesign(did)
          return (
            <li key={did}>
              <Link to={designHref(did)}>{did}</Link>
              {design ? ` — ${design.title}` : ''}
            </li>
          )
        })}
      </TraceList>

      <TraceList title="Tests" empty={req.tests.length === 0}>
        {req.tests.map((t) => {
          const spec = getTest(t)
          return (
            <li key={t}>
              <Link to={testHref(t)}>{t}</Link>
              {spec ? ` — ${spec.title}` : ''}
            </li>
          )
        })}
      </TraceList>

      {(req.dependsOn.length > 0 || req.related.length > 0) && (
        <TraceList title="Related requirements" empty={false}>
          {req.dependsOn.map((rid) => (
            <li key={`d-${rid}`}>
              depends on <Link to={`/requirements/${rid}`}>{rid}</Link>
              {getRequirement(rid) ? ` — ${getRequirement(rid)!.title}` : ''}
            </li>
          ))}
          {req.related.map((rid) => (
            <li key={`r-${rid}`}>
              related <Link to={`/requirements/${rid}`}>{rid}</Link>
              {getRequirement(rid) ? ` — ${getRequirement(rid)!.title}` : ''}
            </li>
          ))}
        </TraceList>
      )}

      <SourceFooter repoPath={`requirements/${req.sourcePath}`} />
    </article>
  )
}
