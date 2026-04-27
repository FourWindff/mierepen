import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { getTutorialBySlug, type Tutorial } from '../lib/docs'
import { formatArchiveDate } from '../lib/content'
import { mdxComponents } from '../components/mdx'
import Header from '../components/Header'
import TableOfContents from '../components/TableOfContents'

export default function DocsTutorial() {
  const { tutorialSlug, chapterSlug } = useParams<{
    tutorialSlug: string
    chapterSlug?: string
  }>()
  const [tutorial, setTutorial] = useState<Tutorial | null>(null)
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null)
  const [isMobileChapterOpen, setIsMobileChapterOpen] = useState(false)

  useEffect(() => {
    if (!tutorialSlug) return
    let cancelled = false

    void getTutorialBySlug(tutorialSlug).then((nextTutorial) => {
      if (cancelled) return
      setTutorial(nextTutorial)
      setLoadedSlug(tutorialSlug)
    })

    return () => {
      cancelled = true
    }
  }, [tutorialSlug])

  const activeChapter =
    tutorial?.chapters.find((chapter) => chapter.slug === chapterSlug) ?? tutorial?.chapters[0]

  useEffect(() => {
    if (!activeChapter) return

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })

    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }, [activeChapter?.slug])

  // Close mobile chapter panel when chapter changes
  useEffect(() => {
    setIsMobileChapterOpen(false)
  }, [activeChapter?.slug])

  if (tutorialSlug && loadedSlug !== tutorialSlug) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#080808] text-black dark:text-white flex items-center justify-center font-mono text-sm tracking-widest uppercase">
        Loading Tutorial...
      </div>
    )
  }

  if (!tutorial || !activeChapter) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#080808] text-black dark:text-white flex items-center justify-center font-mono text-sm tracking-widest uppercase">
        Tutorial Not Found
      </div>
    )
  }

  const ActiveChapter = activeChapter.Component

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#080808] text-black dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <Header />

      <div className="relative px-4 sm:px-6 lg:px-12 pt-10 pb-32 xl:px-[260px] 2xl:px-[340px]">
        <section className="mx-auto">
          {/* Left sidebar: chapter navigation (desktop only) */}
          <aside className="hidden xl:block xl:fixed xl:left-0 xl:top-24 xl:bottom-10 xl:w-[260px] 2xl:w-[340px]">
            <div className="h-full overflow-y-auto px-10 2xl:px-14">
              <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 text-left"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/40 dark:text-white/40 mb-4 font-bold">
                  {tutorial.meta.label} / {formatArchiveDate(tutorial.meta.date)}
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight leading-[0.95] mb-3">
                  {tutorial.meta.title}
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 font-mono text-xs leading-relaxed">
                  {tutorial.meta.summary}
                </p>
              </motion.header>

              <div className="border-l border-black/10 dark:border-white/10 pl-4">
                <div className="px-2 py-3">
                  <h2 className="font-mono text-[10px] uppercase tracking-[0.3em] text-black/40 dark:text-white/40 font-bold">
                    Chapter Directory
                  </h2>
                </div>
                <nav className="p-2" aria-label={`${tutorial.meta.title} chapters`}>
                  {tutorial.chapters.map((chapter) => {
                    const isActive = chapter.slug === activeChapter.slug

                    return (
                      <Link
                        key={chapter.slug}
                        to={`/docs/${tutorial.meta.slug}/${chapter.slug}`}
                        className={`block px-3 py-3 border-l transition-colors ${
                          isActive
                            ? 'border-black dark:border-white text-black dark:text-white'
                            : 'border-transparent hover:border-black/30 dark:hover:border-white/30 text-black/70 dark:text-white/70'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 pt-1">
                            {String(chapter.sidebarPosition).padStart(2, '0')}
                          </span>
                          <div className="font-bold leading-tight">{chapter.title}</div>
                        </div>
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </div>
          </aside>

          {/* Mobile chapter navigation (visible below xl) */}
          <div className="xl:hidden mb-8 max-w-5xl mx-auto">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-black/40 dark:text-white/40 mb-3 font-bold">
              {tutorial.meta.label} / {formatArchiveDate(tutorial.meta.date)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-[0.95] mb-6 break-words">
              {tutorial.meta.title}
            </h1>
            <button
              type="button"
              onClick={() => setIsMobileChapterOpen((open) => !open)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 border border-black/15 dark:border-white/15 hover:border-black/40 dark:hover:border-white/40 transition-colors text-left"
              aria-expanded={isMobileChapterOpen}
              aria-label="Toggle chapter list"
            >
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-1">
                  Chapter {String(activeChapter.sidebarPosition).padStart(2, '0')}
                </div>
                <div className="font-bold text-base leading-tight truncate">{activeChapter.title}</div>
              </div>
              {isMobileChapterOpen ? (
                <ChevronUp size={20} className="shrink-0 text-black/60 dark:text-white/60" />
              ) : (
                <ChevronDown size={20} className="shrink-0 text-black/60 dark:text-white/60" />
              )}
            </button>
            <AnimatePresence>
              {isMobileChapterOpen ? (
                <motion.nav
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden border-x border-b border-black/15 dark:border-white/15"
                  aria-label={`${tutorial.meta.title} chapters`}
                >
                  <ul>
                    {tutorial.chapters.map((chapter) => {
                      const isActive = chapter.slug === activeChapter.slug
                      return (
                        <li key={chapter.slug}>
                          <Link
                            to={`/docs/${tutorial.meta.slug}/${chapter.slug}`}
                            onClick={() => setIsMobileChapterOpen(false)}
                            className={`block px-4 py-3 border-l-2 transition-colors ${
                              isActive
                                ? 'border-black dark:border-white bg-black/5 dark:bg-white/5 text-black dark:text-white'
                                : 'border-transparent hover:bg-black/5 dark:hover:bg-white/5 text-black/70 dark:text-white/70'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 pt-1">
                                {String(chapter.sidebarPosition).padStart(2, '0')}
                              </span>
                              <div className="font-bold leading-tight break-words">{chapter.title}</div>
                            </div>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                </motion.nav>
              ) : null}
            </AnimatePresence>
          </div>

          {/* Center: content */}
          <article className="max-w-5xl mx-auto min-w-0 sm:px-6 lg:px-10 2xl:px-12">
            <motion.div
              key={activeChapter.slug}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="prose-custom"
            >
              <ActiveChapter components={mdxComponents} />
            </motion.div>
          </article>

          {/* Right sidebar: TOC (desktop only) */}
          <aside className="hidden xl:block xl:fixed xl:right-0 xl:top-24 xl:bottom-10 xl:w-[260px] 2xl:w-[340px]">
            <div className="h-full overflow-y-auto px-10 2xl:px-14">
              <TableOfContents />
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}
