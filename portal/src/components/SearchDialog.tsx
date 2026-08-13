import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { searchPortal, type SearchHit } from '../lib/search'

const TYPE_LABEL: Record<string, string> = {
  requirement: 'Requirement',
  adr: 'ADR',
  architecture: 'Architecture',
  flow: 'Flow',
  document: 'Document',
  contract: 'Contract',
  runbook: 'Runbook',
  'open-decision': 'Open Decision',
  test: 'Test',
  implementation: 'Implementation',
  design: 'Design',
}

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const results = useMemo(() => searchPortal(q, 30), [q])

  useEffect(() => {
    if (open) {
      setQ('')
      setActive(0)
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  useEffect(() => {
    setActive(0)
  }, [q])

  const go = useCallback(
    (hit: SearchHit) => {
      onClose()
      navigate(hit.route)
    },
    [navigate, onClose],
  )

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((i) => Math.min(i + 1, Math.max(0, results.length - 1)))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((i) => Math.max(0, i - 1))
      } else if (e.key === 'Enter' && results[active]) {
        e.preventDefault()
        go(results[active])
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, active, go, onClose])

  if (!open) return null

  return (
    <div className="search-backdrop" role="presentation" onClick={onClose}>
      <div
        className="search-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Search architecture portal"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          className="search-input"
          type="search"
          placeholder="Search requirements, ADRs, views, docs…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-autocomplete="list"
        />
        <ul className="search-results" role="listbox">
          {q && results.length === 0 ? (
            <li className="search-empty">No results</li>
          ) : (
            results.map((hit, i) => (
              <li key={hit.id} role="option" aria-selected={i === active}>
                <button
                  type="button"
                  className={i === active ? 'search-hit active' : 'search-hit'}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(hit)}
                >
                  <span className="search-type">{TYPE_LABEL[hit.type] ?? hit.type}</span>
                  <span className="search-title">{hit.title}</span>
                  <span className="search-snippet">{hit.snippet}</span>
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="search-hint">
          <kbd>↑</kbd> <kbd>↓</kbd> navigate · <kbd>Enter</kbd> open · <kbd>Esc</kbd> close · MiniSearch
        </p>
      </div>
    </div>
  )
}

export function useGlobalSearchShortcut(onOpen: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onOpen])
}
