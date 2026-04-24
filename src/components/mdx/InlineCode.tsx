interface InlineCodeProps {
  children: React.ReactNode
}

export default function InlineCode({ children }: InlineCodeProps) {
  return (
    <code className="font-mono text-sm bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-neutral-700 dark:text-neutral-300">
      {children}
    </code>
  )
}
