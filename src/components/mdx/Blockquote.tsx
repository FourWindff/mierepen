interface BlockquoteProps {
  children: React.ReactNode
}

export default function Blockquote({ children }: BlockquoteProps) {
  return (
    <blockquote className="theme-border-strong theme-text-soft theme-surface-soft border-l-2 pl-6 my-8 italic py-4 pr-4">
      {children}
    </blockquote>
  )
}
