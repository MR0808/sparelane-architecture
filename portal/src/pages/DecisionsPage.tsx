import { Link } from 'react-router-dom'
import { DocPage } from '../components/DocPage'

export function DecisionsPage() {
  return (
    <article>
      <h1 className="page-title">Decisions</h1>
      <p className="page-lead">
        Accepted ADRs bind implementation. Open decisions track unresolved product, vendor, and
        infrastructure items. Markdown remains authoritative.
      </p>
      <ul className="link-list">
        <li>
          <Link to="/docs/decisions/README">Decisions index</Link>
        </li>
        <li>
          <Link to="/docs/decisions/decision-register">Decision register</Link>
        </li>
        <li>
          <Link to="/docs/decisions/open-decisions">Open decisions</Link>
        </li>
        <li>
          <Link to="/docs/decisions/ADR-TEMPLATE">ADR template</Link>
        </li>
      </ul>
      <h2>Decision register</h2>
      <DocPage docPath="decisions/decision-register.md" />
      <h2>Open decisions</h2>
      <DocPage docPath="decisions/open-decisions.md" />
    </article>
  )
}
