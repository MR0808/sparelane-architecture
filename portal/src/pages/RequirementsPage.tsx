import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  coverageSummary,
  filterRequirements,
  listRequirements,
  requirementStats,
  type RequirementFilters,
} from '../lib/requirements'

function Select({
  label,
  name,
  value,
  options,
  onChange,
}: {
  label: string
  name: string
  value: string
  options: { value: string; label: string }[]
  onChange: (name: string, value: string) => void
}) {
  return (
    <label className="req-filter">
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(name, e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

export function RequirementsPage() {
  const all = listRequirements()
  const [params, setParams] = useSearchParams()

  const filters: RequirementFilters = {
    type: params.get('type') ?? 'all',
    area: params.get('area') ?? 'all',
    status: params.get('status') ?? 'all',
    priority: params.get('priority') ?? 'all',
    mvp: (params.get('mvp') as RequirementFilters['mvp']) ?? 'all',
    coverage: (params.get('coverage') as RequirementFilters['coverage']) ?? 'all',
    q: params.get('q') ?? '',
  }

  const filtered = useMemo(() => filterRequirements(all, filters), [all, filters])
  const stats = requirementStats(all)
  const coverage = coverageSummary(all)

  const areas = [...new Set(all.map((r) => r.area))].sort()

  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(params)
    if (!value || value === 'all' || (name === 'q' && !value.trim())) next.delete(name)
    else next.set(name, value)
    setParams(next, { replace: true })
  }

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const r of filtered) {
      const key = `${r.type} / ${r.area}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(r)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <article className="req-page">
      <header>
        <h1 className="page-title">Requirements</h1>
        <p className="page-lead">
          Git-native requirements with traceability into architecture, ADRs, contracts, and tests.
          Source files live under <code>requirements/</code>.
        </p>
      </header>

      <section className="req-stats" aria-label="Summary">
        <div className="req-stat">
          <strong>{stats.total}</strong>
          <span>Total</span>
        </div>
        <div className="req-stat">
          <strong>{stats.mvp}</strong>
          <span>MVP</span>
        </div>
        <div className="req-stat">
          <strong>{stats.future}</strong>
          <span>Future</span>
        </div>
        {Object.entries(stats.byStatus).map(([status, n]) => (
          <div className="req-stat" key={status}>
            <strong>{n}</strong>
            <span>{status}</span>
          </div>
        ))}
      </section>

      <section className="req-coverage" aria-label="Coverage">
        <h2 className="req-section-title">Coverage dashboard</h2>
        <ul className="req-coverage-list">
          <li>
            With architecture/flow links: {coverage.withArch}/{coverage.total}
          </li>
          <li>Missing architecture: {coverage.missingArch}</li>
          <li>
            With test mapping: {coverage.withTests}/{coverage.total}
          </li>
          <li>Missing tests: {coverage.missingTests}</li>
          <li>Blocked by open decisions: {coverage.blocked}</li>
          <li>Implemented but not verified: {coverage.implementedUnverified}</li>
          <li>Foundation implemented (not product): {coverage.foundationImplemented}</li>
          <li>Accepted without Acceptance Criteria: {coverage.acceptedNoAc}</li>
          <li>
            With ADR links: {coverage.withAdr}/{coverage.total}
          </li>
        </ul>
        <p>
          <Link to="/docs/governance/requirements-coverage">Coverage definitions</Link>
          {' · '}
          <Link to="/requirements/traceability">Traceability matrix</Link>
          {' · '}
          <Link to="/health">Portal health</Link>
        </p>
      </section>

      <section className="req-filters" aria-label="Filters">
        <Select
          label="Coverage"
          name="coverage"
          value={filters.coverage ?? 'all'}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All' },
            { value: 'missing-architecture', label: 'Missing architecture' },
            { value: 'missing-test', label: 'Missing test' },
            { value: 'blocked', label: 'Blocked' },
            { value: 'unverified', label: 'Unverified (implemented)' },
            { value: 'foundation', label: 'Foundation implemented' },
          ]}
        />
        <Select
          label="Type"
          name="type"
          value={filters.type ?? 'all'}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All types' },
            { value: 'business', label: 'Business' },
            { value: 'functional', label: 'Functional' },
            { value: 'non-functional', label: 'Non-functional' },
            { value: 'integration', label: 'Integration' },
          ]}
        />
        <Select
          label="Area"
          name="area"
          value={filters.area ?? 'all'}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All areas' },
            ...areas.map((a) => ({ value: a, label: a })),
          ]}
        />
        <Select
          label="Status"
          name="status"
          value={filters.status ?? 'all'}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All statuses' },
            { value: 'draft', label: 'draft' },
            { value: 'proposed', label: 'proposed' },
            { value: 'accepted', label: 'accepted' },
            { value: 'implemented', label: 'implemented' },
            { value: 'verified', label: 'verified' },
            { value: 'deferred', label: 'deferred' },
            { value: 'rejected', label: 'rejected' },
          ]}
        />
        <Select
          label="Priority"
          name="priority"
          value={filters.priority ?? 'all'}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'All priorities' },
            { value: 'must', label: 'must' },
            { value: 'should', label: 'should' },
            { value: 'could', label: 'could' },
            { value: 'wont', label: 'wont' },
          ]}
        />
        <Select
          label="MVP"
          name="mvp"
          value={filters.mvp ?? 'all'}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'MVP + Future' },
            { value: 'true', label: 'MVP only' },
            { value: 'false', label: 'Future only' },
          ]}
        />
        <label className="req-filter req-filter-search">
          <span>Search</span>
          <input
            type="search"
            value={filters.q ?? ''}
            placeholder="ID or title…"
            onChange={(e) => setFilter('q', e.target.value)}
          />
        </label>
      </section>

      <p className="page-lead">
        Showing {filtered.length} of {all.length}.{' '}
        <Link to="/docs/governance/requirements-governance">Governance</Link>
      </p>

      {grouped.map(([group, rows]) => (
        <section key={group} className="req-group">
          <h2 className="req-section-title">{group}</h2>
          <div className="table-scroll">
            <table className="req-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Implementation</th>
                  <th>Priority</th>
                  <th>MVP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link to={`/requirements/${r.id}`}>{r.id}</Link>
                    </td>
                    <td>{r.title}</td>
                    <td>
                      <span className={`req-pill status-${r.status}`}>{r.status}</span>
                    </td>
                    <td>
                      <span className={`req-pill impl-${r.implementationStatus}`}>
                        {r.implementationStatus.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td>{r.priority}</td>
                    <td>{r.mvp ? 'MVP' : 'Future'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </article>
  )
}
