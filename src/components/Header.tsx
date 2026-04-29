import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ArrowLeft, Sun, Moon, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useTheme } from '../lib/useTheme'
import LogoMark from './LogoMark'
import AutoHideHeaderShell from './AutoHideHeaderShell'

interface HeaderProps {
  backTo?: string
  backLabel?: string
}

export default function Header({ backTo, backLabel }: HeaderProps) {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const fromArchive = location.state?.from === 'archive' || document.referrer.includes('/archive')

  const resolvedBackTo = backTo ?? (fromArchive ? '/archive' : '/')
  const resolvedBackLabel = backLabel ?? (fromArchive ? 'Archive' : 'Home')
  const backdropGradient =
    theme === 'dark'
      ? 'linear-gradient(90deg, rgba(15,16,16,0.52) 0%, rgba(15,16,16,0.34) 32%, rgba(15,16,16,0.18) 68%, rgba(15,16,16,0.08) 100%)'
      : 'linear-gradient(90deg, rgba(22,22,21,0.18) 0%, rgba(22,22,21,0.11) 32%, rgba(22,22,21,0.06) 68%, rgba(22,22,21,0.03) 100%)'

  const closeMenu = () => setIsMenuOpen(false)

  return (
    <>
      <AutoHideHeaderShell freeze={isMenuOpen}>
        <nav className="relative">
          <div className="flex items-center px-4 sm:px-6 xl:px-12 2xl:px-16 py-6">
            {/* Keep the mobile menu control at the far left. */}
            <button
              className="theme-text-primary md:hidden mr-3 p-2"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <Link
              to="/"
              className="theme-text-primary flex items-center gap-3 text-xl font-black uppercase tracking-tighter hover:opacity-70 transition-opacity"
            >
              <LogoMark className="block h-9 w-9 shrink-0" />
              Mierepen
            </Link>

            {/* Desktop nav */}
            <div className="ml-auto hidden md:flex items-center gap-8">
              <Link
                to={resolvedBackTo}
                className="theme-text-primary text-sm uppercase tracking-[0.2em] font-bold hover:opacity-70 transition-opacity flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                {resolvedBackLabel}
              </Link>
              <button
                onClick={toggleTheme}
                className="theme-text-primary p-2 hover:opacity-70 transition-opacity"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
          </div>
        </nav>
      </AutoHideHeaderShell>

      <AnimatePresence>
        {isMenuOpen ? (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 z-50 overflow-hidden"
          >
            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="absolute inset-0 backdrop-blur-[1px]"
              style={{ background: backdropGradient }}
              onClick={closeMenu}
              aria-label="Close menu"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="relative z-10 h-full w-[min(82vw,22rem)]"
            >
              <aside className="theme-panel theme-border h-full w-full border-r">
                <div className="theme-border flex items-center gap-3 border-b px-4 sm:px-6 py-6">
                  <button
                    className="theme-text-primary p-2"
                    onClick={closeMenu}
                    aria-label="Close menu"
                  >
                    <X size={24} />
                  </button>
                  <div className="theme-text-primary flex items-center gap-3 text-xl font-black uppercase tracking-tighter">
                    <LogoMark className="block h-9 w-9 shrink-0" />
                    Mierepen
                  </div>
                </div>
                <div className="flex flex-col px-4 sm:px-6 py-8 gap-8">
                  <Link
                    to={resolvedBackTo}
                    onClick={closeMenu}
                    className="theme-text-primary text-base uppercase tracking-[0.2em] font-bold flex items-center gap-3"
                  >
                    <ArrowLeft size={18} />
                    {resolvedBackLabel}
                  </Link>
                  <Link
                    to="/archive"
                    onClick={closeMenu}
                    className="theme-text-primary text-base uppercase tracking-[0.2em] font-bold"
                  >
                    Archive
                  </Link>
                  <a
                    href="https://github.com/FourWindff"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={closeMenu}
                    className="theme-text-primary flex items-center gap-3 text-base uppercase tracking-[0.2em] font-bold"
                  >
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="h-[18px] w-[18px] fill-current"
                    >
                      <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.44 3.44 10.06 8.2 11.69.6.11.82-.27.82-.6 0-.3-.01-1.08-.02-2.12-3.34.75-4.05-1.67-4.05-1.67-.55-1.43-1.33-1.82-1.33-1.82-1.09-.77.08-.75.08-.75 1.2.09 1.84 1.27 1.84 1.27 1.08 1.9 2.82 1.35 3.5 1.03.11-.8.42-1.35.76-1.67-2.67-.31-5.47-1.37-5.47-6.08 0-1.34.47-2.43 1.24-3.29-.13-.31-.54-1.56.12-3.26 0 0 1.01-.33 3.3 1.26A11.2 11.2 0 0 1 12 5.68c1.02 0 2.05.14 3.01.42 2.29-1.59 3.3-1.26 3.3-1.26.66 1.7.25 2.95.12 3.26.77.86 1.24 1.95 1.24 3.29 0 4.72-2.8 5.76-5.48 6.07.43.38.82 1.12.82 2.26 0 1.63-.02 2.94-.02 3.34 0 .33.21.72.83.6C20.57 22.35 24 17.74 24 12.3 24 5.5 18.63 0 12 0Z" />
                    </svg>
                    Github
                  </a>
                  <button
                    onClick={() => {
                      toggleTheme()
                      closeMenu()
                    }}
                    className="theme-text-primary flex items-center gap-3 text-base uppercase tracking-[0.2em] font-bold text-left"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
              </aside>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  )
}
