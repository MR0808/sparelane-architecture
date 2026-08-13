import { useEffect, useId, useRef, useState } from 'react'
import mermaid from 'mermaid'

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'neutral',
})

type Props = {
  chart: string
}

export function MermaidBlock({ chart }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const reactId = useId().replace(/:/g, '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const render = async () => {
      setError(null)
      if (!hostRef.current) return
      try {
        const id = `mermaid-${reactId}-${Math.random().toString(36).slice(2, 8)}`
        const { svg } = await mermaid.render(id, chart.trim())
        if (!cancelled && hostRef.current) {
          hostRef.current.innerHTML = svg
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err))
          if (hostRef.current) hostRef.current.innerHTML = ''
        }
      }
    }
    void render()
    return () => {
      cancelled = true
    }
  }, [chart, reactId])

  if (error) {
    return (
      <div className="mermaid-error" role="alert">
        Mermaid render failed: {error}
      </div>
    )
  }

  return <div className="mermaid-block" ref={hostRef} />
}
