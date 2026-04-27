import { Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { formatArchiveDate, getArchiveEntries } from '../lib/content'
import Header from '../components/Header'
import Footer from '../components/Footer'

const ARCHIVE_FILTER_STORAGE_KEY = 'archive-filter'

export default function Archive() {
  const location = useLocation()
  const entries = getArchiveEntries()
  const [activeFilter, setActiveFilter] = useState<'blog' | 'docs'>(() => {
    const stateFilter = (location.state as { filter?: 'blog' | 'docs' } | null)?.filter
    if (stateFilter) return stateFilter
    const storedFilter = localStorage.getItem(ARCHIVE_FILTER_STORAGE_KEY)
    return storedFilter === 'docs' ? 'docs' : 'blog'
  })
  const filteredEntries = entries.filter((entry) => entry.kind === activeFilter)

  useEffect(() => {
    localStorage.setItem(ARCHIVE_FILTER_STORAGE_KEY, activeFilter)
  }, [activeFilter])

  return (
    <div className="theme-page min-h-screen font-sans">
      <Header backTo="/" backLabel="Home" />

      {/* Header */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-8">
            Archive
          </h1>
          <p className="theme-text-secondary text-sm font-mono max-w-xl">
            A complete registry of blog posts and tutorial docs. {entries.length} entries found.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveFilter('blog')}
              className={`px-5 py-3 border font-mono text-[10px] uppercase tracking-[0.25em] transition-colors ${
                activeFilter === 'blog'
                  ? 'theme-button-toggle-active'
                  : 'theme-button-toggle-idle'
              }`}
            >
              Blog
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('docs')}
              className={`px-5 py-3 border font-mono text-[10px] uppercase tracking-[0.25em] transition-colors ${
                activeFilter === 'docs'
                  ? 'theme-button-toggle-active'
                  : 'theme-button-toggle-idle'
              }`}
            >
              Docs
            </button>
          </div>
        </motion.div>
      </header>

      {/* Post List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pb-32">
        <div className="space-y-4">
          {filteredEntries.map((entry, idx) => (
            <Link
              key={`${entry.kind}-${entry.slug}`}
              to={entry.href}
              state={{ from: 'archive' }}
              className="theme-border-subtle theme-border-hover flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-4 sm:p-6 border group"
            >
              <div className="flex items-start sm:items-center gap-4 sm:gap-8 min-w-0">
                <span className="theme-text-faint font-mono text-[10px] shrink-0 mt-1 sm:mt-0">
                  #{filteredEntries.length - idx}
                </span>
                <div className="min-w-0">
                  <div className="theme-text-dim font-mono text-[10px] uppercase tracking-[0.2em] mb-2">
                    {entry.typeLabel}
                  </div>
                  <span className="text-base sm:text-lg font-bold sm:group-hover:translate-x-2 transition-transform block break-words">
                    {entry.title}
                  </span>
                  {'summary' in entry ? (
                    <p className="theme-text-tertiary text-xs mt-2 max-w-xl break-words">
                      {entry.summary}
                    </p>
                  ) : null}
                </div>
              </div>
              <span className="theme-text-faint font-mono text-[10px] shrink-0 sm:ml-4">
                {formatArchiveDate(entry.date)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
