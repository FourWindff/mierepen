import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { codeToHtml } from 'shiki'

interface CodeBlockProps {
  children: string
  className?: string
}

function parseMeta(className?: string): { language: string; title: string | null } {
  if (!className) return { language: '', title: null }

  const raw = className.replace(/^language-/, '')
  const firstSpace = raw.search(/\s/)
  const language = firstSpace > 0 ? raw.slice(0, firstSpace) : raw

  const titleMatch = className.match(/title=["']([^"']+)["']/)
  if (titleMatch) return { language, title: titleMatch[1] }

  const titlePrefixMatch = className.match(/title-(\S+)/)
  if (titlePrefixMatch) return { language, title: titlePrefixMatch[1] }

  return { language, title: null }
}

function getActiveTheme(): 'github-light' | 'github-dark' {
  return document.documentElement.classList.contains('dark') ? 'github-dark' : 'github-light'
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

export default function CodeBlock({ children, className }: CodeBlockProps) {
  const [highlighted, setHighlighted] = useState<string>('')
  const [isReady, setIsReady] = useState(false)
  const [copied, setCopied] = useState(false)
  const { language, title } = parseMeta(className)

  const code = children.trimEnd()

  useEffect(() => {
    let mounted = true
    const theme = getActiveTheme()

    codeToHtml(code, { lang: language || 'text', theme })
      .then((html) => {
        if (!mounted) return
        setHighlighted(html)
        setIsReady(true)
      })
      .catch(() => {
        if (!mounted) return
        setHighlighted(
          `<pre class="shiki" tabindex="0"><code>${escapeHtml(code)}</code></pre>`,
        )
        setIsReady(true)
      })

    return () => {
      mounted = false
    }
  }, [code, language])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const theme = getActiveTheme()
      codeToHtml(code, { lang: language || 'text', theme })
        .then((html) => {
          setHighlighted(html)
        })
        .catch(() => {
          setHighlighted(
            `<pre class="shiki" tabindex="0"><code>${escapeHtml(code)}</code></pre>`,
          )
        })
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })
    return () => observer.disconnect()
  }, [code, language])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
    } catch {
      // Graceful degradation
    }
  }

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(timer)
  }, [copied])

  const displayLabel = title || language || 'Code'

  return (
    <div className="rounded-lg overflow-hidden border theme-border mb-6">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 theme-surface-soft theme-border border-b">
        <span className="theme-text-muted text-xs font-mono truncate max-w-[60%]">
          {displayLabel}
        </span>
        <button
          onClick={handleCopy}
          className="theme-text-muted theme-text-hover-primary flex items-center gap-1.5 transition-colors shrink-0"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold">
                Copied
              </span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="font-mono text-[10px] uppercase tracking-[0.15em] font-bold">
                Copy
              </span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div
        className={`code-block-bg overflow-x-auto transition-opacity duration-200 ${isReady ? 'opacity-100' : 'opacity-0'}`}
        dangerouslySetInnerHTML={{
          __html:
            highlighted ||
            `<pre class="shiki" tabindex="0"><code>${escapeHtml(code)}</code></pre>`,
        }}
      />
    </div>
  )
}
