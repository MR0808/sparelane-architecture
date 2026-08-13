import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  adrHref,
  architectureViewHref,
  filterRequirements,
  listRequirements,
  type RequirementFilters,
} from '../lib/requirements'

function cellLinks(items: string[], hrefFn: (id: string) => string, max = 3) {
  if (items.length === 0) return <span className="req-muted">—</span>
  const shown = items.slice(0, max)
  return (
    <>
      {shown.map((id, i) => (
        <span key={id}>
          {i > 0 ? ', ' : ''}
          <Link to={hrefFn(id)}>{id}</Link>
        </span>
      ))}
      {items.length > max ? <span className="req-muted"> +{items.length - max}</span> : null}
    </>
  )
}

export function RequirementsTraceabilityPage() {
  const all = listRequirements()
  const [params, setParams] = useSearchParams()
  const filters: RequirementFilters = {
    type: params.get('type') ?? 'all',
    mvp: (params.get('mvp') as RequirementFilters['mvp']) ?? 'all',
    status: params.get('status') ?? 'all',
  }
  const rows = useMemo(() => filterRequirements(all, filters), [all, filters])

  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(name)
    else next.set(name, value)
    setParams(next, { replace: true })
  }

  return (
    <article className="req-page">
      <header>
        <h1 className="page-title">Requirements traceability</h1>
        <p className="page-lead">
          Generated from requirement frontmatter. The ADR-centric matrix remains in{' '}
          <Link to="/docs/implementation/architecture-traceability">
            architecture-traceability.md
          </Link>
          .
        </p>
      </header>

      <div className="req-filters">
        <label className="req-filter">
          <span>Type</span>
          <select value={filters.type ?? 'all'} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="all">All</option>
            <option value="business">Business</option>
            <option value="functional">Functional</option>
            <option value="non-functional">Non-functional</option>
            <option value="integration">Integration</option>
          </select>
        </label>
        <label className="req-filter">
          <span>Status</span>
          <select
            value={filters.status ?? 'all'}
            onChange={(e) => setFilter('status', e.target.value)}
          >
            <option value="all">All</option>
            <option value="accepted">accepted</option>
            <option value="deferred">deferred</option>
            <option value="proposed">proposed</option>
          </select>
        </label>
        <label className="req-filter">
          <span>MVP</span>
          <select value={filters.mvp ?? 'all'} onChange={(e) => setFilter('mvp', e.target.value)}>
            <option value="all">All</option>
            <option value="true">MVP</option>
            <option value="false">Future</option>
          </select>
        </label>
      </div>

      <div className="req-matrix-wrap">
        <table className="req-table req-matrix">
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Architecture</th>
              <th>ADR</th>
              <th>Contract</th>
              <th>Module</th>
              <th>Test</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <Link to={`/requirements/${r.id}`}>{r.id}</Link>
                  <div className="req-muted">{r.title}</div>
                </td>
                <td>
                  {cellLinks([...r.architecture, ...r.flows], architectureViewHref)}
                </td>
                <td>{cellLinks(r.adrs, adrHref)}</td>
                <td>
                  {r.contracts.length === 0 ? (
                    <span className="req-muted">—</span>
                  ) : (
                    <span title={r.contracts.join(', ')}>{r.contracts.length}</span>
                  )}
                </td>
                <td>
                  {r.modules.length === 0 ? (
                    <span className="req-muted">—</span>
                  ) : (
                    <span title={r.modules.join(', ')}>{r.modules.slice(0, 2).join(', ')}</span>
                  )}
                </td>
                <td>
                  {r.tests.length === 0 ? (
                    <span className="req-muted">—</span>
                  ) : (
                    r.tests.join(', ')
                  )}
                </td>
                <td>
                  <span className={`req-pill status-${r.status}`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  )
}
