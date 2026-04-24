import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useTheme } from '../lib/useTheme'

interface HeaderProps {
  backTo?: string
  backLabel?: string
}

export default function Header({ backTo, backLabel }: HeaderProps) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const fromArchive = location.state?.from === 'archive' || document.referrer.includes('/archive')

  const resolvedBackTo = backTo ?? (fromArchive ? '/archive' : '/')
  const resolvedBackLabel = backLabel ?? (fromArchive ? 'Archive' : 'Home')

  return (
    <nav className="border-b border-black/10 dark:border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-12 py-6">
        <Link
          to="/"
          className="text-xl font-black uppercase tracking-tighter text-black dark:text-white hover:opacity-70 transition-opacity"
        >
          Mierepen
        </Link>
        <div className="flex items-center gap-8">
          <Link
            to={resolvedBackTo}
            className="text-sm uppercase tracking-[0.2em] font-bold text-black dark:text-white hover:opacity-70 transition-opacity flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            {resolvedBackLabel}
          </Link>
          <button
            onClick={toggleTheme}
            className="p-2 text-black dark:text-white hover:opacity-70 transition-opacity"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  )
}
