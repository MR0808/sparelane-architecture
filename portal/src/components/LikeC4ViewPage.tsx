import { useEffect, useRef, useState, type RefObject } from 'react'
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
 * Relationship/details overlays use a separate React Flow with LikeC4 defaults
 * (panOnScroll, no reactFlowProps). Without intervention, wheel events scroll the
 * portal page. Capture wheel over any .react-flow, block page scroll, and in
 * overlays re-dispatch as ctrl+wheel so zoomOnPinch zooms instead of panning.
 */
function useOverlayWheelZoom(hostRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    let reentrant = false

    const onWheel = (event: WheelEvent) => {
      if (reentrant) return
      if (!hostRef.current) return

      const path = event.composedPath()
      const overHost = path.includes(hostRef.current)
      if (!overHost) return

      const reactFlowEl = path.find(
        (n): n is HTMLElement =>
          n instanceof HTMLElement && n.classList.contains('react-flow'),
      )
      if (!reactFlowEl) return

      // Stop the portal/document from scrolling underneath the diagram
      event.preventDefault()

      const inOverlay = path.some(
        (n) =>
          n instanceof HTMLElement &&
          (n.tagName === 'DIALOG' || n.classList.contains('likec4-overlay')),
      )
      if (!inOverlay || event.ctrlKey || event.metaKey) return

      // Overlay RF: convert wheel → pinch-zoom (ctrl+wheel)
      event.stopImmediatePropagation()
      const target =
        path.find(
          (n): n is HTMLElement =>
            n instanceof HTMLElement && n.classList.contains('react-flow__pane'),
        ) ?? reactFlowEl

      reentrant = true
      try {
        target.dispatchEvent(
          new WheelEvent('wheel', {
            bubbles: true,
            cancelable: true,
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            deltaZ: event.deltaZ,
            deltaMode: event.deltaMode,
            clientX: event.clientX,
            clientY: event.clientY,
            screenX: event.screenX,
            screenY: event.screenY,
            ctrlKey: true,
            shiftKey: event.shiftKey,
            altKey: event.altKey,
            metaKey: event.metaKey,
          }),
        )
      } finally {
        reentrant = false
      }
    }

    window.addEventListener('wheel', onWheel, { capture: true, passive: false })
    return () => window.removeEventListener('wheel', onWheel, { capture: true })
  }, [hostRef])
}

/**
 * Full interactive diagram (stock-app style): selection, details, search, and
 * navigateTo between views. ReactLikeC4 wraps a ShadowRoot that injects
 * xyflow/Mantine/LikeC4 styles — required for node hit-testing and menus.
 */
export function LikeC4ViewPage({ title, description, viewId, relatedDocs }: Props) {
  const [activeViewId, setActiveViewId] = useState(viewId)
  const hostRef = useRef<HTMLDivElement>(null)
  useOverlayWheelZoom(hostRef)

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
        <div className="likec4-host" ref={hostRef}>
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
              reactFlowProps={diagramReactFlowProps as never}
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
