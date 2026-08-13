import { Link } from 'react-router-dom'

const cards = [
  { to: '/architecture/overview', title: 'Architecture', blurb: 'LikeC4 views across domains' },
  { to: '/design', title: 'Design', blurb: 'Mermaid sequence and detail diagrams' },
  { to: '/decisions', title: 'Decisions', blurb: 'Accepted ADRs and open decisions' },
  { to: '/contracts', title: 'Contracts', blurb: 'OpenAPI, webhooks, money and time' },
  { to: '/docs/security/README', title: 'Security', blurb: 'Trust, PCI, threat model, audit' },
  { to: '/operations', title: 'Operations', blurb: 'Deployables, resilience, runbooks' },
  { to: '/implementation', title: 'Implementation', blurb: 'Build blueprint and phases' },
]

export function HomePage() {
  return (
    <article>
      <h1 className="page-title">Sparelane Architecture</h1>
      <p className="page-lead">
        Sparelane&apos;s architecture, solution design, technical decisions, contracts, requirements,
        operations guidance, and implementation blueprint.
      </p>

      <div className="card-grid">
        {cards.map((card) => (
          <Link key={card.to} className="nav-card" to={card.to}>
            <strong>{card.title}</strong>
            <span>{card.blurb}</span>
          </Link>
        ))}
      </div>

      <h2>Quick links</h2>
      <ul className="link-list">
        <li>
          <Link to="/docs/START-HERE">Start Here</Link>
        </li>
        <li>
          <Link to="/docs/decisions/decision-register">Decision Register</Link>
        </li>
        <li>
          <Link to="/docs/decisions/open-decisions">Open Decisions</Link>
        </li>
        <li>
          <Link to="/architecture/overview">Architecture Map (LikeC4)</Link>
        </li>
        <li>
          <Link to="/docs/architecture-principles">Architecture Principles</Link>
        </li>
      </ul>
    </article>
  )
}
