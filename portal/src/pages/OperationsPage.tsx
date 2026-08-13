import { Link } from 'react-router-dom'

export function OperationsPage() {
  return (
    <article>
      <h1 className="page-title">Operations</h1>
      <p className="page-lead">Environments, resilience, observability, and operator runbooks.</p>
      <ul className="link-list">
        <li>
          <Link to="/docs/operations/README">Operations index</Link>
        </li>
        <li>
          <Link to="/docs/operations/runbooks/README">Runbooks</Link>
        </li>
        <li>
          <Link to="/docs/operations/observability">Observability</Link>
        </li>
        <li>
          <Link to="/docs/operations/alerting">Alerting</Link>
        </li>
        <li>
          <Link to="/docs/operations/disaster-recovery">Disaster recovery</Link>
        </li>
        <li>
          <Link to="/docs/operations/resilience-patterns">Resilience</Link>
        </li>
        <li>
          <Link to="/architecture/deployment">Production deployment (LikeC4)</Link>
        </li>
      </ul>
    </article>
  )
}
