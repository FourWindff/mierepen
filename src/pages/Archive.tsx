import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatArchiveDate, getArchiveEntries } from '../lib/content'
import { useTheme } from '../lib/useTheme'

const ARCHIVE_FILTER_STORAGE_KEY = 'archive-filter'

export default function Archive() {
  const entries = getArchiveEntries()
  const [activeFilter, setActiveFilter] = useState<'blog' | 'docs'>(() => {
    const storedFilter = localStorage.getItem(ARCHIVE_FILTER_STORAGE_KEY)
    return storedFilter === 'docs' ? 'docs' : 'blog'
  })
  const { theme, toggleTheme } = useTheme()
  const filteredEntries = entries.filter((entry) => entry.kind === activeFilter)

  useEffect(() => {
    localStorage.setItem(ARCHIVE_FILTER_STORAGE_KEY, activeFilter)
  }, [activeFilter])

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-bg-primary-dark text-black dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Navigation */}
      <nav className="border-b border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-12 py-6">
          <Link
            to="/"
            className="text-xl font-black uppercase tracking-tighter text-black dark:text-white hover:opacity-70 transition-opacity"
          >
            Cyber.Tides
          </Link>
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-sm uppercase tracking-[0.2em] font-bold text-black dark:text-white hover:opacity-70 transition-opacity flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Home
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

      {/* Header */}
      <header className="max-w-7xl mx-auto px-12 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-8">
            Archive
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm font-mono max-w-xl">
            A complete registry of blog posts and tutorial docs. {entries.length} entries found.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveFilter('blog')}
              className={`px-5 py-3 border font-mono text-[10px] uppercase tracking-[0.25em] transition-colors ${
                activeFilter === 'blog'
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'border-black/15 dark:border-white/15 hover:border-black/40 dark:hover:border-white/40'
              }`}
            >
              Blog
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('docs')}
              className={`px-5 py-3 border font-mono text-[10px] uppercase tracking-[0.25em] transition-colors ${
                activeFilter === 'docs'
                  ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                  : 'border-black/15 dark:border-white/15 hover:border-black/40 dark:hover:border-white/40'
              }`}
            >
              Docs
            </button>
          </div>
        </motion.div>
      </header>

      {/* Post List */}
      <section className="max-w-7xl mx-auto px-12 pb-32">
        <div className="space-y-4">
          {filteredEntries.map((entry, idx) => (
            <Link
              key={`${entry.kind}-${entry.slug}`}
              to={entry.href}
              state={{ from: 'archive' }}
              className="flex items-center justify-between p-6 border border-black/5 dark:border-white/5 hover:border-black/40 dark:hover:border-white/40 transition-colors group"
            >
              <div className="flex items-center gap-8 min-w-0">
                <span className="font-mono text-[10px] text-black/20 dark:text-white/20">
                  #{filteredEntries.length - idx}
                </span>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/30 dark:text-white/30 mb-2">
                    {entry.typeLabel}
                  </div>
                  <span className="text-lg font-bold group-hover:translate-x-2 transition-transform block">
                    {entry.title}
                  </span>
                  {'summary' in entry ? (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2 max-w-xl">
                      {entry.summary}
                    </p>
                  ) : null}
                </div>
              </div>
              <span className="font-mono text-[10px] text-black/20 dark:text-white/20">
                {formatArchiveDate(entry.date)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-12 py-10 border-t border-black/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50">
              System Status: Optimal
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-black/50 dark:text-white/50">
            &copy; 2024 CYBER_TIDES BLOG
          </p>
        </div>
      </footer>
    </div>
  )
}
