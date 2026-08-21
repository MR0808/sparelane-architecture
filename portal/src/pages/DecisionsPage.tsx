import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listOpenDecisions, BLOCKING_STAGES } from '../lib/openDecisions'
import { SourceFooter } from '../components/SourceFooter'

export function DecisionsPage() {
  const decisions = listOpenDecisions()
  const [params, setParams] = useSearchParams()
  const category = params.get('category') ?? 'all'
  const stage = params.get('stage') ?? 'all'

  const categories = [...new Set(decisions.map((d) => d.category))].sort()
  const filtered = useMemo(
    () =>
      decisions.filter((d) => {
        if (category !== 'all' && d.category !== category) return false
        if (stage !== 'all' && d.blockingStage !== stage) return false
        return true
      }),
    [decisions, category, stage],
  )

  function set(name: string, value: string) {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(name)
    else next.set(name, value)
    setParams(next, { replace: true })
  }

  return (
    <article>
      <h1 className="page-title">Decisions</h1>
      <p className="page-lead">
        Accepted ADRs bind implementation. Open decisions track unresolved items with stable{' '}
        <code>OD-###</code> IDs.
      </p>

      <section>
        <h2 className="req-section-title">Accepted ADRs</h2>
        <ul className="link-list">
          <li>
            <Link to="/docs/decisions/decision-register">Decision register (ADR-001–028)</Link>
          </li>
          <li>
            <Link to="/docs/decisions/README">Decisions index</Link>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="req-section-title">Open Decisions ({filtered.length})</h2>
        <div className="req-filters">
          <label className="req-filter">
            <span>Category</span>
            <select value={category} onChange={(e) => set('category', e.target.value)}>
              <option value="all">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="req-filter">
            <span>Blocking stage</span>
            <select value={stage} onChange={(e) => set('stage', e.target.value)}>
              <option value="all">All</option>
              {BLOCKING_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        </div>
        <table className="req-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Blocking</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id}>
                <td>
                  <Link to={`/decisions/open/${d.id}`}>{d.id}</Link>
                </td>
                <td>{d.title}</td>
                <td>{d.category}</td>
                <td>
                  <span className="req-pill">{d.blockingStage}</span>
                </td>
                <td>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <SourceFooter repoPath="docs/decisions/open-decisions.md" />
    </article>
  )
}
