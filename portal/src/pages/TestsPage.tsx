import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { listTests } from '../lib/tests'

export function TestsPage() {
  const all = listTests()
  const [params, setParams] = useSearchParams()
  const type = params.get('type') ?? 'all'
  const types = [...new Set(all.map((t) => t.type))].sort()

  const filtered = useMemo(
    () => all.filter((t) => (type === 'all' ? true : t.type === type)),
    [all, type],
  )

  const grouped = useMemo(() => {
    const map = new Map<string, typeof filtered>()
    for (const t of filtered) {
      const key = t.type || 'other'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(t)
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  return (
    <article>
      <h1 className="page-title">Tests</h1>
      <p className="page-lead">
        Test specifications (not executable results). Catalogue under{' '}
        <code>requirements/tests/</code>. Product automation will live in the platform repo.
      </p>
      <label className="req-filter">
        <span>Type</span>
        <select
          value={type}
          onChange={(e) => {
            const next = new URLSearchParams(params)
            if (e.target.value === 'all') next.delete('type')
            else next.set('type', e.target.value)
            setParams(next, { replace: true })
          }}
        >
          <option value="all">All ({all.length})</option>
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>
      {grouped.map(([group, rows]) => (
        <section key={group} className="req-group">
          <h2 className="req-section-title">{group}</h2>
          <table className="req-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>MVP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td>
                    <Link to={`/tests/${t.id}`}>{t.id}</Link>
                  </td>
                  <td>{t.title}</td>
                  <td>
                    <span className="req-pill">{t.status}</span>
                  </td>
                  <td>{t.mvp ? 'MVP' : 'Future'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </article>
  )
}
