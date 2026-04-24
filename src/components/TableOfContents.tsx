import { useEffect, useState, useCallback, useRef } from 'react'

interface HeadingItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  containerSelector?: string
}

export default function TableOfContents({ containerSelector = 'article' }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const scrollLockIdRef = useRef<string | null>(null)
  const scrollUnlockTimerRef = useRef<number | null>(null)

  // Extract headings from DOM
  useEffect(() => {
    const extractHeadings = () => {
      const container = document.querySelector(containerSelector)
      if (!container) {
        setHeadings([])
        return
      }

      const elements = container.querySelectorAll('h2, h3, h4, h5, h6')
      const items: HeadingItem[] = []

      elements.forEach((el) => {
        const level = parseInt(el.tagName[1], 10)
        let id = el.id

        // Generate id if missing
        if (!id) {
          id = el.textContent?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '') || ''
          el.id = id
        }

        items.push({
          id,
          text: el.textContent || '',
          level,
        })
      })

      setHeadings(items)
    }

    // Initial extraction with delay to ensure MDX content is rendered
    const timer = setTimeout(extractHeadings, 100)

    // Re-extract when content changes (e.g., chapter navigation)
    const observer = new MutationObserver(() => {
      extractHeadings()
    })

    const container = document.querySelector(containerSelector)
    if (container) {
      observer.observe(container, { childList: true, subtree: true })
    }

    return () => {
      clearTimeout(timer)
      observer.disconnect()
    }
  }, [containerSelector])

  useEffect(() => {
    if (headings.length === 0) return

    const headingElements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => element !== null)

    if (headingElements.length === 0) {
      setActiveId('')
      return
    }

    const topOffset = 96

    const clearUnlockTimer = () => {
      if (scrollUnlockTimerRef.current !== null) {
        window.clearTimeout(scrollUnlockTimerRef.current)
        scrollUnlockTimerRef.current = null
      }
    }

    const scheduleUnlock = () => {
      clearUnlockTimer()
      scrollUnlockTimerRef.current = window.setTimeout(() => {
        scrollLockIdRef.current = null
        scrollUnlockTimerRef.current = null
        updateActiveId()
      }, 120)
    }

    const updateActiveId = () => {
      const scrollPosition = window.scrollY + topOffset
      const documentBottom = window.scrollY + window.innerHeight
      const pageBottom = document.documentElement.scrollHeight - 8
      const lockedId = scrollLockIdRef.current

      if (lockedId) {
        const lockedElement = document.getElementById(lockedId)

        if (!lockedElement) {
          scrollLockIdRef.current = null
        } else {
          const targetTop = lockedElement.getBoundingClientRect().top + window.scrollY - topOffset

          if (Math.abs(window.scrollY - targetTop) <= 2) {
            scrollLockIdRef.current = null
          } else {
            setActiveId(lockedId)
            scheduleUnlock()
            return
          }
        }
      }

      if (documentBottom >= pageBottom) {
        setActiveId(headingElements[headingElements.length - 1].id)
        return
      }

      let nextActiveId = headingElements[0].id

      for (const element of headingElements) {
        if (element.offsetTop <= scrollPosition) {
          nextActiveId = element.id
          continue
        }

        break
      }

      setActiveId(nextActiveId)
    }

    updateActiveId()
    window.addEventListener('scroll', updateActiveId, { passive: true })
    window.addEventListener('resize', updateActiveId)

    return () => {
      clearUnlockTimer()
      window.removeEventListener('scroll', updateActiveId)
      window.removeEventListener('resize', updateActiveId)
    }
  }, [headings])

  const handleClick = useCallback((id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const topOffset = 96
      const top = element.getBoundingClientRect().top + window.scrollY - topOffset

      scrollLockIdRef.current = id
      window.scrollTo({ top, behavior: 'smooth' })
      setActiveId(id)
      // Update URL hash without jumping
      window.history.replaceState(null, '', `#${id}`)
    }
  }, [])

  if (headings.length === 0) {
    return null
  }

  return (
    <nav
      className="hidden lg:block w-full"
      aria-label="Table of contents"
    >
      <div className="sticky top-10">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40 dark:text-white/40 font-bold mb-4">
          On This Page
        </h2>
        <ul className="space-y-1">
          {headings.map((heading) => {
            const indent = (heading.level - 2) * 1 // h2=0, h3=1rem, h4=2rem...
            const isActive = activeId === heading.id

            return (
              <li key={heading.id} className="relative">
                {isActive ? (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-[0.85rem] h-px w-3 bg-black dark:bg-white"
                  />
                ) : null}
                <button
                  onClick={() => handleClick(heading.id)}
                  className={`block w-full text-left text-xs leading-relaxed py-1 pr-2 break-words transition-colors hover:text-black dark:hover:text-white ${
                    isActive
                      ? 'text-black dark:text-white'
                      : 'text-black/50 dark:text-white/50'
                  }`}
                  style={{ paddingLeft: `${indent + 1}rem` }}
                >
                  {heading.text}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
