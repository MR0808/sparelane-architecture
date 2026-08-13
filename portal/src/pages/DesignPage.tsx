import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  filterDesigns,
  listCatalogueDesigns,
  designStats,
  type DesignFilters,
} from '../lib/designs'
import { SourceFooter } from '../components/SourceFooter'

export function DesignPage() {
  const all = listCatalogueDesigns()
  const [params, setParams] = useSearchParams()
  const filters: DesignFilters = {
    area: params.get('area') ?? 'all',
    type: params.get('type') ?? 'all',
    mvp: (params.get('mvp') as DesignFilters['mvp']) ?? 'all',
  }
  const filtered = useMemo(() => filterDesigns(all, filters), [all, filters])
  const stats = designStats(all)
  const areas = [...new Set(all.map((d) => d.area))].sort()
  const types = [...new Set(all.map((d) => d.type))].sort()

  function setFilter(name: string, value: string) {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(name)
    else next.set(name, value)
    setParams(next, { replace: true })
  }

  const grouped = useMemo(() => {
    const order = ['payments', 'money', 'integrations', 'security', 'data', 'operations']
    const map = new Map<string, typeof filtered>()
    for (const d of filtered) {
      const key = d.area || 'other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(d)
    }
    return [...map.entries()].sort(([a], [b]) => {
      const ia = order.indexOf(a)
      const ib = order.indexOf(b)
      if (ia === -1 && ib === -1) return a.localeCompare(b)
      if (ia === -1) return 1
      if (ib === -1) return -1
      return ia - ib
    })
  }, [filtered])

  return (
    <article>
      <h1 className="page-title">Design</h1>
      <p className="page-lead">
        Mermaid engineering design catalogue. <strong>LikeC4</strong> remains the architecture
        source of truth; Mermaid supplements detailed sequences, branching, and state machines.
      </p>
      <ul className="link-list">
        <li>
          <Link to="/architecture/overview">LikeC4 Architecture Map</Link>
        </li>
        <li>
          <Link to="/docs/design/README">Design catalogue README</Link>
        </li>
      </ul>

      <section className="req-stats" aria-label="Summary">
        <div className="req-stat">
          <strong>{stats.total}</strong>
          <span>Diagrams</span>
        </div>
        {Object.entries(stats.byType).map(([t, n]) => (
          <div className="req-stat" key={t}>
            <strong>{n}</strong>
            <span>{t}</span>
          </div>
        ))}
      </section>

      <section className="req-filters" aria-label="Filters">
        <label className="req-filter">
          <span>Area</span>
          <select value={filters.area ?? 'all'} onChange={(e) => setFilter('area', e.target.value)}>
            <option value="all">All areas</option>
            {areas.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        <label className="req-filter">
          <span>Type</span>
          <select value={filters.type ?? 'all'} onChange={(e) => setFilter('type', e.target.value)}>
            <option value="all">All types</option>
            {types.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="req-filter">
          <span>MVP</span>
          <select value={filters.mvp ?? 'all'} onChange={(e) => setFilter('mvp', e.target.value)}>
            <option value="all">MVP + Future</option>
            <option value="true">MVP only</option>
            <option value="false">Future only</option>
          </select>
        </label>
      </section>

      <p className="page-lead">
        Showing {filtered.length} of {all.length}.
      </p>

      {grouped.map(([area, rows]) => (
        <section key={area} className="req-group">
          <h2 className="req-section-title">{area}</h2>
          <div className="table-scroll">
            <table className="req-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>MVP</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <Link to={`/design/${d.id}`}>{d.id}</Link>
                    </td>
                    <td>{d.title}</td>
                    <td>
                      <span className="req-pill">{d.type}</span>
                    </td>
                    <td>{d.status}</td>
                    <td>{d.mvp ? 'MVP' : 'Future'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}

      <section className="req-group">
        <h2 className="req-section-title">Portal Rendering Test</h2>
        <p className="page-lead">
          Regression page for Mermaid rendering — not a product design artefact.
        </p>
        <ul className="link-list">
          <li>
            <Link to="/design/mermaid-test">Portal Mermaid Test</Link>
          </li>
        </ul>
      </section>

      <SourceFooter repoPath="docs/design/README.md" />
    </article>
  )
}
