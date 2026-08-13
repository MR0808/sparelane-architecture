import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ReactLikeC4, useLikeC4View } from 'likec4:react'
import { diagramReactFlowProps } from '../lib/views'

type Props = {
  title: string
  description: string
  viewId: string
  relatedDocs?: { label: string; to: string }[]
}

/**
 * Full interactive diagram (stock-app style): selection, details, search, and
 * navigateTo between views. ReactLikeC4 wraps a ShadowRoot that injects
 * xyflow/Mantine/LikeC4 styles — required for node hit-testing and menus.
 */
export function LikeC4ViewPage({ title, description, viewId, relatedDocs }: Props) {
  const [activeViewId, setActiveViewId] = useState(viewId)

  useEffect(() => {
    setActiveViewId(viewId)
  }, [viewId])

  const view = useLikeC4View(activeViewId as Parameters<typeof useLikeC4View>[0])

  return (
    <article className="diagram-page">
      <header className="diagram-page-header">
        <h1 className="page-title">{title}</h1>
        <p className="page-lead">{description}</p>
      </header>
      <div className="diagram-shell">
        <div className="likec4-host">
          {!view ? (
            <p className="page-lead" style={{ padding: '1rem' }}>
              View <code>{activeViewId}</code> not found in the LikeC4 model.
            </p>
          ) : (
            <ReactLikeC4
              viewId={activeViewId as Parameters<typeof useLikeC4View>[0]}
              className="portal-likec4-diagram"
              keepAspectRatio={false}
              colorScheme="light"
              pannable
              zoomable
              controls
              fitView
              fitViewPadding={{
                top: 32,
                left: 32,
                right: 32,
                bottom: 32,
              }}
              background="dots"
              nodesSelectable
              showNavigationButtons
              enableSearch
              enableFocusMode
              enableElementDetails
              enableRelationshipDetails
              enableRelationshipBrowser
              enableElementTags
              enableDynamicViewWalkthrough
              enableNotes
              onNavigateTo={(next) => setActiveViewId(String(next))}
              onInitialized={({ xyflow }) => {
                requestAnimationFrame(() => {
                  void xyflow.fitView({ padding: 0.12 })
                })
              }}
              reactFlowProps={{ ...diagramReactFlowProps }}
            />
          )}
        </div>
      </div>
      {relatedDocs && relatedDocs.length > 0 ? (
        <div className="related-docs">
          <strong>Related documents</strong>
          <ul className="link-list">
            {relatedDocs.map((doc) => (
              <li key={doc.to}>
                <Link to={doc.to}>{doc.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  )
}
