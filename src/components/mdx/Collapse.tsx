import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, HelpCircle } from 'lucide-react'

interface CollapseProps {
  question: string
  children: React.ReactNode
}

export default function Collapse({ question, children }: CollapseProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="theme-border border rounded-lg my-6 overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left cursor-pointer theme-surface-hover transition-colors"
        aria-expanded={isOpen}
      >
        <HelpCircle size={16} className="theme-text-muted shrink-0" />
        <span className="theme-text-primary font-medium text-sm leading-relaxed flex-1">
          {question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="shrink-0"
        >
          <ChevronDown size={16} className="theme-text-muted" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1 theme-text-secondary text-sm leading-relaxed border-t theme-border">
              <div className="pt-4">{children}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
