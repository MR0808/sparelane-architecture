import { Link, useParams } from 'react-router-dom'
import { useLikeC4View } from 'likec4:react'
import { LikeC4ViewPage } from '../components/LikeC4ViewPage'

/**
 * Generic deep-link page for any LikeC4 view ID.
 * Route: /architecture/view/:viewId
 */
export function ArchitectureViewPage() {
  const { viewId } = useParams()
  const resolvedId = viewId ?? ''
  const view = useLikeC4View(resolvedId as Parameters<typeof useLikeC4View>[0])

  if (!viewId) {
    return (
      <article>
        <h1 className="page-title">View not found</h1>
        <p className="page-lead">Missing view id.</p>
        <Link to="/architecture/overview">Back to overview</Link>
      </article>
    )
  }

  if (!view) {
    return (
      <article>
        <h1 className="page-title">View not found</h1>
        <p className="page-lead">
          No LikeC4 view with id <code>{viewId}</code> exists in the model.
        </p>
        <p>
          <Link to="/architecture/overview">Back to overview</Link>
        </p>
      </article>
    )
  }

  const title =
    (view as { title?: string; name?: string }).title ||
    (view as { name?: string }).name ||
    viewId
  const description =
    (view as { description?: string | null }).description || `LikeC4 view \`${viewId}\`.`

  return (
    <LikeC4ViewPage
      title={String(title)}
      description={String(description)}
      viewId={viewId}
      relatedDocs={[
        { label: 'Architecture overview', to: '/architecture/overview' },
        { label: 'Requirements', to: '/requirements' },
      ]}
    />
  )
}
