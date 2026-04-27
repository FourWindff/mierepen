import { useEffect, useRef, useState } from 'react'

interface UseAutoHideHeaderOptions {
  disabled?: boolean
}

export function useAutoHideHeader({ disabled = false }: UseAutoHideHeaderOptions = {}) {
  const [scrollHidden, setScrollHidden] = useState(false)
  const lastScrollY = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (disabled) {
      return
    }

    lastScrollY.current = window.scrollY

    frameRef.current = window.requestAnimationFrame(() => {
      setScrollHidden(false)
      frameRef.current = null
    })

    const updateVisibility = () => {
      const currentScrollY = window.scrollY
      const delta = currentScrollY - lastScrollY.current

      if (currentScrollY <= 24) {
        setScrollHidden(false)
      } else if (Math.abs(delta) >= 6) {
        setScrollHidden(delta > 0 && currentScrollY > 96)
      }

      lastScrollY.current = currentScrollY
      frameRef.current = null
    }

    const handleScroll = () => {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(updateVisibility)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [disabled])

  return { isHidden: disabled ? false : scrollHidden }
}
