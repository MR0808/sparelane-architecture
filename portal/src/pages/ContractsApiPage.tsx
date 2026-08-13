import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { SourceFooter } from '../components/SourceFooter'
import '@scalar/api-reference-react/style.css'

const ApiReferenceReact = lazy(async () => {
  const mod = await import('@scalar/api-reference-react')
  return { default: mod.ApiReferenceReact }
})

/** Documentation-only OpenAPI viewer — no live Try-it server. */
export function ContractsApiPage() {
  return (
    <article className="api-page">
      <header>
        <h1 className="page-title">Merchant API</h1>
        <p className="page-lead">
          Rendered from <code>contracts/openapi.yaml</code> (source of truth). Documentation only —
          no live API target; do not use Try it against production.
        </p>
        <p>
          <Link to="/contracts">← Contracts</Link>
          {' · '}
          <a href="/openapi.yaml" target="_blank" rel="noreferrer">
            Raw OpenAPI YAML
          </a>
        </p>
      </header>
      <div className="api-viewer">
        <Suspense fallback={<p className="page-lead">Loading API reference…</p>}>
          <ApiReferenceReact
            configuration={{
              url: '/openapi.yaml',
              hideClientButton: true,
              hideModels: false,
              documentDownloadType: 'yaml',
              withDefaultFonts: true,
              // No servers / proxy — documentation only
              servers: [],
            }}
          />
        </Suspense>
      </div>
      <SourceFooter repoPath="contracts/openapi.yaml" />
    </article>
  )
}
