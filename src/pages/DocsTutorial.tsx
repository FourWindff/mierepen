import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
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

      <div className="relative px-12 pt-10 pb-32 xl:px-[260px] 2xl:px-[340px]">
        <section className="mx-auto">
          {/* Left sidebar: chapter navigation */}
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

          {/* Center: content */}
          <article className="max-w-5xl mx-auto min-w-0 px-10 2xl:px-12">
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

          {/* Right sidebar: TOC */}
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
