import { Navigate, useParams } from 'react-router-dom'
import { LikeC4ViewPage } from '../components/LikeC4ViewPage'
import { architecturePages } from '../lib/views'

export function ArchitectureSectionPage() {
  const { section } = useParams()
  const page = architecturePages.find((p) => p.slug === section)
  if (!page) {
    return <Navigate to="/architecture/overview" replace />
  }
  return (
    <LikeC4ViewPage
      title={page.title}
      description={page.description}
      viewId={page.viewId}
      relatedDocs={page.relatedDocs}
    />
  )
}
