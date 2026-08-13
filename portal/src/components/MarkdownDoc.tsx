import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Link } from 'react-router-dom'
import { MermaidBlock } from './MermaidBlock'

function rewriteDocHref(href: string | undefined): string | undefined {
  if (!href) return href
  if (/^(https?:|mailto:|#)/i.test(href)) return href
  // Relative markdown links → portal /docs/... routes
  if (href.endsWith('.md') || href.includes('.md#')) {
    const [path, hash] = href.split('#')
    const cleaned = path
      .replace(/^\.\//, '')
      .replace(/^\.\.\//g, '')
      .replace(/\.md$/, '')
    // Heuristic: keep as /docs/... when it looks like a docs path
    const docPath = cleaned.startsWith('docs/') ? cleaned.slice(5) : cleaned
    return `/docs/${docPath}${hash ? `#${hash}` : ''}`
  }
  return href
}

const components: Components = {
  a({ href, children, ...props }) {
    const next = rewriteDocHref(href)
    if (next && next.startsWith('/') && !next.startsWith('//')) {
      return (
        <Link to={next} {...props}>
          {children}
        </Link>
      )
    }
    return (
      <a href={next} {...props} rel={href?.startsWith('http') ? 'noreferrer' : undefined}>
        {children}
      </a>
    )
  },
  code({ className, children, ...props }) {
    const text = String(children).replace(/\n$/, '')
    const match = /language-(\w+)/.exec(className || '')
    const lang = match?.[1]

    if (lang === 'mermaid') {
      return <MermaidBlock chart={text} />
    }

    return (
      <code className={className} {...props}>
        {children}
      </code>
    )
  },
}

type Props = {
  markdown: string
}

export function MarkdownDoc({ markdown }: Props) {
  const body = markdown.replace(/^\uFEFF?---[\s\S]*?\n---\s*/, '')
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {body}
      </ReactMarkdown>
    </div>
  )
}
