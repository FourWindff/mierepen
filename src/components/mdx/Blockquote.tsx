interface BlockquoteProps {
  children: React.ReactNode
}

export default function Blockquote({ children }: BlockquoteProps) {
  return (
    <blockquote className="border-l-2 border-black/20 dark:border-white/20 pl-6 my-8 text-neutral-700 dark:text-neutral-300 italic bg-black/2 dark:bg-white/2 py-4 pr-4">
      {children}
    </blockquote>
  )
}
