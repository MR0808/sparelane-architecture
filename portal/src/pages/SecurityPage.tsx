import { Link } from 'react-router-dom'

export function SecurityPage() {
  return (
    <article>
      <h1 className="page-title">Security</h1>
      <p className="page-lead">Security architecture, trust boundaries, and security requirements.</p>
      <div className="card-grid">
        <Link to="/architecture/security" className="info-card">
          <strong>Security architecture</strong>
          <span>LikeC4 trust boundaries and PCI views.</span>
        </Link>
        <Link to="/requirements?area=security" className="info-card">
          <strong>Security requirements</strong>
          <span>NFR-SEC-* and related controls.</span>
        </Link>
        <Link to="/docs/security/README" className="info-card">
          <strong>Security docs</strong>
          <span>Security documentation index.</span>
        </Link>
        <Link to="/architecture/view/trustBoundaries" className="info-card">
          <strong>Trust boundaries</strong>
          <span>Deep link to trustBoundaries view.</span>
        </Link>
        <Link to="/architecture/view/pciBoundaryView" className="info-card">
          <strong>PCI boundary</strong>
          <span>Deep link to pciBoundaryView.</span>
        </Link>
      </div>
    </article>
  )
}
