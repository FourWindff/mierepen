interface InlineCodeProps {
  children: React.ReactNode
}

export default function InlineCode({ children }: InlineCodeProps) {
  return (
    <code className="theme-surface theme-text-soft font-mono text-sm px-1.5 py-0.5 rounded">
      {children}
    </code>
  )
}
