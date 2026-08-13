import { Link } from 'react-router-dom'

const cards = [
  {
    title: 'Merchant API',
    description: 'Interactive OpenAPI reference for the Merchant API.',
    to: '/contracts/api',
    primary: true,
  },
  {
    title: 'Webhook Envelope',
    description: 'Signed outbound webhook envelope shape.',
    to: '/docs/contracts/webhook-envelope',
  },
  {
    title: 'Webhook Events',
    description: 'Curated merchant-facing webhook event catalogue.',
    to: '/docs/contracts/webhook-events',
  },
  {
    title: 'Internal Event Envelope',
    description: 'Internal async event envelope conventions.',
    to: '/docs/contracts/event-envelope',
  },
  {
    title: 'API Versioning',
    description: 'External contract versioning policy.',
    to: '/docs/contracts/api-versioning',
  },
  {
    title: 'Money',
    description: 'Minor units, decimal strings, currency conventions.',
    to: '/docs/contracts/money',
  },
  {
    title: 'Time / Due Dates',
    description: 'Time and due-date semantics for scheduling.',
    to: '/docs/contracts/due-dates',
  },
]

export function ContractsPage() {
  return (
    <article>
      <h1 className="page-title">Contracts</h1>
      <p className="page-lead">
        External API and event contracts. The Merchant API OpenAPI file remains the single API
        specification.
      </p>
      <div className="card-grid">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className={c.primary ? 'info-card primary' : 'info-card'}>
            <strong>{c.title}</strong>
            <span>{c.description}</span>
          </Link>
        ))}
      </div>
      <ul className="link-list" style={{ marginTop: '1.25rem' }}>
        <li>
          <Link to="/docs/contracts/README">Contracts index</Link>
        </li>
        <li>
          <Link to="/docs/contracts/time">Time conventions</Link>
        </li>
        <li>
          <Link to="/docs/integrations/merchant-api">Merchant API narrative</Link>
        </li>
        <li>
          <a href="/openapi.yaml" target="_blank" rel="noreferrer">
            Raw OpenAPI YAML
          </a>
        </li>
      </ul>
    </article>
  )
}
