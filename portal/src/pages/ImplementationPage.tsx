import { Link } from 'react-router-dom'

export function ImplementationPage() {
  return (
    <article>
      <h1 className="page-title">Implementation</h1>
      <p className="page-lead">
        Engineering blueprint for <code>sparelane-platform</code>. Does not implement the product.
      </p>
      <ul className="link-list">
        <li>
          <Link to="/docs/implementation/README">Implementation README</Link>
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
        <li>
          <Link to="/docs/implementation/build-phases">Build phases</Link>
        </li>
        <li>
          <Link to="/docs/implementation/mvp-acceptance-criteria">MVP acceptance criteria</Link>
        </li>
        <li>
          <Link to="/docs/implementation/architecture-traceability">Architecture traceability</Link>
        </li>
        <li>
          <Link to="/architecture/implementation">Initial deployables (LikeC4)</Link>
        </li>
      </ul>
    </article>
  )
}
