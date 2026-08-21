import { Link } from 'react-router-dom'
import health from '../generated/health.json'
import { SourceFooter } from '../components/SourceFooter'

export function HealthPage() {
  return (
    <article>
      <h1 className="page-title">Portal health</h1>
      <p className="page-lead">
        Generated from repository state at build/index time — not live CI results.
      </p>
      <p className="health-banner">Generated from repository state</p>
      <div className="card-grid">
        <div className="info-card">
          <strong>Platform implementation</strong>
          <span>Phase A — Platform Foundation</span>
          <span>Phase A gate: {health.implementation?.phaseAGate ?? 'unknown'}</span>
          <span>Sub-phases: {health.implementation?.phasesCompleted ?? 'A0-A9'}</span>
          <Link to="/docs/implementation/phase-a-status">Phase A status</Link>
          <span>Phase B — Merchant + Consumer Core</span>
          <span>Phase B gate: {health.implementation?.phaseBGate ?? 'unknown'}</span>
          <span>Sub-phases: {health.implementation?.phaseBPhasesCompleted ?? 'B0-B6'}</span>
          <Link to="/docs/implementation/phase-b-status">Phase B status</Link>
          <span>Phase C — Bill Ingestion</span>
          <span>Phase C gate: {health.implementation?.phaseCGate ?? health.implementation?.phaseC ?? 'not_started'}</span>
          <span>Sub-phases: {health.implementation?.phaseCPhasesCompleted ?? 'C0-C5'}</span>
          <Link to="/docs/implementation/phase-c-status">Phase C status</Link>
          <span>Phase D — Payment Reliability Engine</span>
          <span>Phase D gate: {health.implementation?.phaseDGate ?? health.implementation?.phaseD ?? 'not_started'}</span>
          <span>Sub-phases: {health.implementation?.phaseDPhasesCompleted ?? 'D0-D7'}</span>
          <span>Phase E: {health.implementation?.phaseE ?? 'not_started'}</span>
          <span>Not live production health</span>
          <Link to="/docs/implementation/phase-d-status">Phase D status</Link>
        </div>
        <div className="info-card">
          <strong>Requirements</strong>
          <span>{health.requirements.total} total</span>
          <span>
            MVP {health.requirements.mvp} · Future {health.requirements.future}
          </span>
          <span>Blocked by open decisions: {health.requirements.blocked}</span>
          <span>Missing architecture: {health.requirements.missingArchitecture}</span>
          <span>Missing tests: {health.requirements.missingTests}</span>
          <span>MVP verified: {health.requirements.mvpVerified}</span>
          <span>Foundation implemented (NFR evidence): {health.requirements.foundationImplemented ?? 0}</span>
          <span>Product implemented (Phase B/C/D slice): {health.requirements.productImplemented ?? 0}</span>
          <Link to="/requirements">Open requirements</Link>
        </div>
        <div className="info-card">
          <strong>Decisions</strong>
          <span>Accepted ADRs: {health.decisions.adrs}</span>
          <span>Open decisions: {health.decisions.open}</span>
          <Link to="/decisions">Open decisions</Link>
        </div>
        <div className="info-card">
          <strong>Tests</strong>
          <span>{health.tests.total} specifications</span>
          <Link to="/tests">Open catalogue</Link>
        </div>
        <div className="info-card">
          <strong>Designs</strong>
          <span>{health.designs?.total ?? 0} diagrams</span>
          <span>
            Sequence {health.designs?.sequence ?? 0} · State {health.designs?.state ?? 0}
          </span>
          <span>Invalid traceability refs: {health.designs?.invalidTraceability ?? 0}</span>
          <Link to="/design">Open design catalogue</Link>
        </div>
        <div className="info-card">
          <strong>Architecture</strong>
          <span>LikeC4 views indexed: {health.architecture.views}</span>
          <span>
            Validation: static — run <code>npm run validate</code>
          </span>
          <Link to="/architecture/overview">Architecture</Link>
        </div>
        <div className="info-card">
          <strong>Contracts</strong>
          <span>OpenAPI: {health.contracts.openapi}</span>
          <span>
            Lint: static — run <code>npm run openapi:lint</code>
          </span>
          <Link to="/contracts/api">Merchant API</Link>
        </div>
        <div className="info-card">
          <strong>Docs</strong>
          <span>Markdown docs indexed: {health.docs.count}</span>
          <span>
            Link check: static — run <code>npm run docs:links</code>
          </span>
        </div>
      </div>
      <p className="req-muted" style={{ marginTop: '1rem' }}>
        Generated at: {health.generatedAt}
      </p>
      <SourceFooter repoPath="portal/src/generated/health.json" label="Artifact" />
    </article>
  )
}
