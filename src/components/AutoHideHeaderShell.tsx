import { type ReactNode, useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useAutoHideHeader } from '../lib/useAutoHideHeader'

interface AutoHideHeaderShellProps {
  children: ReactNode
  freeze?: boolean
  reserveSpace?: boolean
  shellClassName?: string
}

export default function AutoHideHeaderShell({
  children,
  freeze = false,
  reserveSpace = true,
  shellClassName = 'theme-header-shell theme-border border-b',
}: AutoHideHeaderShellProps) {
  const { isHidden } = useAutoHideHeader({ disabled: freeze })
  const shellRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)

  useEffect(() => {
    const element = shellRef.current
    if (!element) return

    const updateHeight = () => {
      const nextHeight = element.getBoundingClientRect().height
      setHeight(nextHeight)
      document.documentElement.style.setProperty('--header-shell-height', `${nextHeight}px`)
    }

    updateHeight()

    const observer = new ResizeObserver(updateHeight)
    observer.observe(element)
    window.addEventListener('resize', updateHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateHeight)
    }
  }, [])

  return (
    <>
      {reserveSpace ? <div aria-hidden="true" style={{ height }} /> : null}
      <motion.div
        initial={false}
        animate={{ y: isHidden ? '-100%' : '0%' }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        className="fixed inset-x-0 top-0 z-40"
      >
        <div ref={shellRef} className={shellClassName}>
          {children}
        </div>
      </motion.div>
    </>
  )
}
