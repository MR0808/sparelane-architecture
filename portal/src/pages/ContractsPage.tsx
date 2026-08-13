import { Link } from 'react-router-dom'

export function ContractsPage() {
  return (
    <article>
      <h1 className="page-title">Contracts</h1>
      <p className="page-lead">
        External API and event contracts. Interactive OpenAPI explorers may be added later.
      </p>
      <ul className="link-list">
        <li>
          <Link to="/docs/contracts/README">Contracts index</Link>
        </li>
        <li>
          <a href="/openapi.yaml" target="_blank" rel="noreferrer">
            Merchant API OpenAPI (raw YAML)
          </a>
        </li>
        <li>
          <Link to="/docs/contracts/api-versioning">API versioning</Link>
        </li>
        <li>
          <Link to="/docs/contracts/webhook-envelope">Webhook envelope</Link>
        </li>
        <li>
          <Link to="/docs/contracts/webhook-events">Webhook events</Link>
        </li>
        <li>
          <Link to="/docs/contracts/event-envelope">Event envelope</Link>
        </li>
        <li>
          <Link to="/docs/contracts/money">Money conventions</Link>
        </li>
        <li>
          <Link to="/docs/contracts/time">Time conventions</Link>
        </li>
        <li>
          <Link to="/docs/contracts/due-dates">Due-date semantics</Link>
        </li>
        <li>
          <Link to="/docs/integrations/merchant-api">Merchant API narrative</Link>
        </li>
      </ul>
    </article>
  )
}
