import { Link } from 'react-router-dom'

const cards = [
  { to: '/architecture/overview', title: 'Architecture', blurb: 'LikeC4 views across domains' },
  { to: '/design', title: 'Design', blurb: 'Mermaid sequence and detail diagrams' },
  { to: '/requirements', title: 'Requirements', blurb: 'Git-native requirements & coverage' },
  { to: '/tests', title: 'Tests', blurb: 'Test specifications catalogue' },
  { to: '/decisions', title: 'Decisions', blurb: 'Accepted ADRs and open decisions' },
  { to: '/contracts', title: 'Contracts', blurb: 'OpenAPI, webhooks, money and time' },
  { to: '/security', title: 'Security', blurb: 'Trust, PCI, security requirements' },
  { to: '/operations', title: 'Operations', blurb: 'Deployables, resilience, runbooks' },
  {
    to: '/implementation',
    title: 'Implementation',
        blurb: 'Blueprint, Phase A/B/C status, build phases',
  },
  { to: '/health', title: 'Health', blurb: 'Static architecture/docs health' },
]

export function HomePage() {
  return (
    <article>
      <h1 className="page-title">Sparelane Architecture</h1>
      <p className="page-lead">
        Sparelane&apos;s architecture, solution design, technical decisions, contracts, requirements,
        operations guidance, and implementation blueprint. Press <kbd>Ctrl</kbd>+<kbd>K</kbd> to
        search.
      </p>
      <p className="page-lead">
        Phase A platform foundation:{' '}
        <Link to="/docs/implementation/phase-a-status">PASS WITH DOCUMENTED NON-BLOCKING RISKS</Link>
        . Phase B merchant + consumer core:{' '}
        <Link to="/docs/implementation/phase-b-status">
          PASS WITH DOCUMENTED NON-BLOCKING RISKS
        </Link>{' '}
        (no money movement). Phase C bill ingestion:{' '}
        <Link to="/docs/implementation/phase-c-status">
          PASS WITH DOCUMENTED NON-BLOCKING RISKS
        </Link>{' '}
        (no money movement). Phase D not started.
      </p>

      <div className="card-grid">
        {cards.map((card) => (
          <Link key={card.to} className="info-card" to={card.to}>
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
          <Link to="/decisions">Open Decisions (OD-*)</Link>
        </li>
        <li>
          <Link to="/architecture/overview">Architecture Map (LikeC4)</Link>
        </li>
        <li>
          <Link to="/contracts/api">Merchant API (OpenAPI)</Link>
        </li>
        <li>
          <Link to="/docs/implementation/phase-a-status">Phase A implementation status</Link>
        </li>
        <li>
          <Link to="/docs/implementation/phase-b-status">Phase B implementation status</Link>
        </li>
      </ul>
    </article>
  )
}
