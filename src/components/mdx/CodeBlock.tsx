import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  children: string
  className?: string
}

export default function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const language = className?.replace(/language-/, '') || ''

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(children)
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

  const lines = children.split('\n')
  // Remove trailing empty line from split
  if (lines[lines.length - 1] === '') lines.pop()

  return (
    <div className="theme-surface-soft theme-border border rounded-none mb-6 overflow-hidden">
      {/* Header */}
      <div className="theme-surface-soft theme-border flex items-center justify-between px-4 py-3 border-b">
        {language ? (
          <span className="theme-text-muted font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
            {language}
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={handleCopy}
          className="theme-text-muted theme-text-hover-primary flex items-center gap-2"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                Copied
              </span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">
                Copy
              </span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="overflow-x-auto p-6">
        <pre className="font-mono text-sm leading-relaxed">
          <code>
            {lines.map((line, i) => (
              <div key={i} className="flex">
                <span className="theme-text-dim select-none w-8 text-right mr-4 shrink-0">
                  {i + 1}
                </span>
                <span
                  className="theme-text-soft"
                  dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
                />
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
