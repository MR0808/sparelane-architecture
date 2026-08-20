import { Link } from 'react-router-dom'

export function ImplementationPage() {
  return (
    <article>
      <h1 className="page-title">Implementation</h1>
      <p className="page-lead">
        Engineering blueprint for <code>sparelane-platform</code>. Architecture Accepted is not
        product implemented.
      </p>

      <div className="card-grid">
        <div className="info-card">
          <strong>Phase A</strong>
          <span>Platform Foundation</span>
          <span>PASS WITH DOCUMENTED NON-BLOCKING RISKS</span>
          <span>A0–A9 complete</span>
          <Link to="/docs/implementation/phase-a-status">Phase A status</Link>
        </div>
        <div className="info-card">
          <strong>Phase B</strong>
          <span>Merchant + Consumer Core</span>
          <span>NOT STARTED</span>
          <Link to="/docs/implementation/build-phases">Build phases</Link>
        </div>
      </div>

      <h2>Status vocabulary</h2>
      <p className="page-lead">
        Designed ≠ foundation implemented ≠ product implemented ≠ verified. See{' '}
        <Link to="/docs/implementation/implementation-status">implementation status</Link>.
      </p>

      <h2>Blueprint</h2>
      <ul className="link-list">
        <li>
          <Link to="/docs/implementation/README">Implementation README</Link>
        </li>
        <li>
          <Link to="/docs/implementation/architecture-traceability">Architecture traceability</Link>
        </li>
        <li>
          <Link to="/docs/implementation/mvp-acceptance-criteria">MVP acceptance criteria</Link>
        </li>
        <li>
          <Link to="/docs/decisions/open-decisions">Open decisions</Link>
        </li>
        <li>
          <Link to="/architecture/implementation">Initial deployables (LikeC4)</Link>
        </li>
        <li>
          <Link to="/docs/implementation/repo-structure">Repo structure</Link>
        </li>
        <li>
          <Link to="/docs/implementation/modules">Module boundaries</Link>
        </li>
        <li>
          <Link to="/docs/implementation/module-dependencies">Module dependencies</Link>
        </li>
      </ul>
    </article>
  )
}
