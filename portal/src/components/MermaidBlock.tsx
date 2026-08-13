import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type Props = {
  chart: string
}

/** Lazy-loads Mermaid on first render; click/Expand opens a larger lightbox. */
export function MermaidBlock({ chart }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const expandedHostRef = useRef<HTMLDivElement>(null)
  const reactId = useId().replace(/:/g, '')
  const [error, setError] = useState<string | null>(null)
  const [svg, setSvg] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      setError(null)
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'neutral',
        })
        const id = `mermaid-${reactId}-${Math.random().toString(36).slice(2, 8)}`
        const { svg: rendered } = await mermaid.render(id, chart.trim())
        if (!cancelled) setSvg(rendered)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          setSvg(null)
        }
      }
    }
    void render()
    return () => {
      cancelled = true
    }
  }, [chart, reactId])

  useEffect(() => {
    if (hostRef.current && svg) hostRef.current.innerHTML = svg
  }, [svg])

  useEffect(() => {
    if (expanded && expandedHostRef.current && svg) {
      expandedHostRef.current.innerHTML = svg
    }
  }, [expanded, svg])

  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setExpanded(false)
      }
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [expanded])

  if (error) {
    return (
      <pre className="mermaid-error" role="alert">
        Mermaid render error: {error}
      </pre>
    )
  }

  return (
    <>
      <figure className="mermaid-figure">
        <div className="mermaid-toolbar">
          <button
            type="button"
            className="mermaid-expand-btn"
            onClick={() => setExpanded(true)}
            disabled={!svg}
          >
            Expand
          </button>
        </div>
        <button
          type="button"
          className="mermaid-block mermaid-block-clickable"
          onClick={() => svg && setExpanded(true)}
          aria-label="Expand diagram"
          disabled={!svg}
        >
          <div className="mermaid-host" ref={hostRef} />
        </button>
        <figcaption className="mermaid-hint">Click diagram or Expand to enlarge · Esc to close</figcaption>
      </figure>

      {expanded && svg
        ? createPortal(
            <div
              className="mermaid-lightbox"
              role="dialog"
              aria-modal="true"
              aria-label="Expanded Mermaid diagram"
              onClick={() => setExpanded(false)}
            >
              <div
                className="mermaid-lightbox-panel"
                onClick={(e) => e.stopPropagation()}
              >
                <header className="mermaid-lightbox-header">
                  <span>Diagram</span>
                  <button
                    type="button"
                    className="mermaid-expand-btn"
                    onClick={() => setExpanded(false)}
                  >
                    Close
                  </button>
                </header>
                <div className="mermaid-lightbox-body">
                  <div className="mermaid-lightbox-host" ref={expandedHostRef} />
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
