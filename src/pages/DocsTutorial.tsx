import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { getTutorialBySlug, type Tutorial } from '../lib/docs'
import { formatArchiveDate } from '../lib/content'
import { mdxComponents } from '../components/mdx'
import Header from '../components/Header'
import TableOfContents, { useTableOfContents } from '../components/TableOfContents'
import type { HeadingItem } from '../components/TableOfContents'

export default function DocsTutorial() {
  const { tutorialSlug, chapterSlug } = useParams<{
    tutorialSlug: string
    chapterSlug?: string
  }>()
  const location = useLocation()
  const [tutorial, setTutorial] = useState<Tutorial | null>(null)
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null)
  const [expandedMobileChapterSlug, setExpandedMobileChapterSlug] = useState<string | null>(null)

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
  const toc = useTableOfContents('article', activeChapter?.slug)

  useEffect(() => {
    if (!activeChapter) return

    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
      return
    }

    const targetId = decodeURIComponent(location.hash.slice(1))
    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(targetId)
      if (!element) return

      const topOffset = 96
      const top = element.getBoundingClientRect().top + window.scrollY - topOffset
      window.scrollTo({ top, left: 0, behavior: 'auto' })
    })

    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [activeChapter?.slug, location.hash, toc.headings])

  useEffect(() => {
    setExpandedMobileChapterSlug(activeChapter?.slug ?? null)
  }, [activeChapter?.slug])

  if (tutorialSlug && loadedSlug !== tutorialSlug) {
    return (
      <div className="theme-page min-h-screen flex items-center justify-center font-mono text-sm tracking-widest uppercase">
        Loading Tutorial...
      </div>
    )
  }

  if (!tutorial || !activeChapter) {
    return (
      <div className="theme-page min-h-screen flex items-center justify-center font-mono text-sm tracking-widest uppercase">
        Tutorial Not Found
      </div>
    )
  }

  const ActiveChapter = activeChapter.Component
  const activeTocHeading = toc.headings.find((heading) => heading.id === toc.activeId) ?? toc.headings[0]

  const renderChapterHeadings = ({
    chapter,
    closeMenu,
  }: {
    chapter: Tutorial['chapters'][number]
    closeMenu: () => void
  }) => {
    const isActiveChapter = chapter.slug === activeChapter.slug
    const headings: HeadingItem[] = isActiveChapter ? toc.headings : chapter.headings

    if (headings.length === 0) {
      return null
    }

    return (
      <div className="theme-border overflow-hidden border-t">
        {isActiveChapter ? (
          <TableOfContents
            state={toc}
            className="block w-full px-4 py-4"
            title="Section Directory"
            sticky={false}
            onItemClick={closeMenu}
          />
        ) : (
          <nav className="block w-full px-4 py-4" aria-label={`${chapter.title} sections`}>
            <h2 className="theme-text-muted mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em]">
              Section Directory
            </h2>
            <ul className="space-y-1">
              {headings.map((heading) => (
                <li key={heading.id}>
                  <Link
                    to={`/docs/${tutorial.meta.slug}/${chapter.slug}#${heading.id}`}
                    onClick={closeMenu}
                    className="theme-text-hover-primary theme-text-tertiary block w-full break-words py-1 pr-2 text-left text-xs leading-relaxed"
                    style={{ paddingLeft: `${heading.level - 1}rem` }}
                  >
                    {heading.text}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    )
  }

  return (
    <div className="theme-page min-h-screen font-sans">
      <Header
        mobileMenuContent={({ closeMenu }) => (
          <div className="theme-border border-b pb-8">
            <div className="theme-text-muted font-mono text-[10px] uppercase tracking-[0.3em] font-bold mb-4">
              Docs Directory
            </div>
            <div className="theme-text-primary font-bold text-base leading-tight mb-2">
              {tutorial.meta.title}
            </div>
            <nav aria-label={`${tutorial.meta.title} files`}>
              <ul className="space-y-1">
                {tutorial.chapters.map((chapter) => {
                  const isActive = chapter.slug === activeChapter.slug
                  const isExpanded = expandedMobileChapterSlug === chapter.slug
                  const chapterHeadings = isActive ? toc.headings : chapter.headings
                  const canToggleToc = chapterHeadings.length > 0

                  return (
                    <li key={chapter.slug}>
                      <div
                        className={`border-l-2 transition-colors ${
                          isActive
                            ? 'theme-border-primary'
                            : 'border-transparent theme-surface-hover'
                        }`}
                      >
                        <div className="flex items-stretch">
                          <Link
                            to={`/docs/${tutorial.meta.slug}/${chapter.slug}`}
                            onClick={closeMenu}
                            className={`min-w-0 flex-1 px-3 py-3 ${
                              isActive ? 'theme-text-primary' : 'theme-text-secondary'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 pt-1">
                                {String(chapter.sidebarPosition).padStart(2, '0')}
                              </span>
                              <div className="min-w-0 font-bold leading-tight break-words">
                                {chapter.title}
                              </div>
                            </div>
                          </Link>
                          <div className="flex items-center pr-2">
                            {canToggleToc ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedMobileChapterSlug((current) =>
                                    current === chapter.slug ? null : chapter.slug,
                                  )
                                }
                                className="theme-text-muted theme-text-hover-primary p-2 transition-colors"
                                aria-expanded={isExpanded}
                                aria-label={
                                  isExpanded
                                    ? `Collapse ${chapter.title} section directory`
                                    : `Expand ${chapter.title} section directory`
                                }
                              >
                                {isExpanded ? (
                                  <ChevronDown size={18} />
                                ) : (
                                  <ChevronRight size={18} />
                                )}
                              </button>
                            ) : (
                              <span className="theme-text-muted p-2 opacity-50" aria-hidden="true">
                                <ChevronRight size={18} />
                              </span>
                            )}
                          </div>
                        </div>
                        <AnimatePresence initial={false}>
                          {canToggleToc && isExpanded ? (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              {renderChapterHeadings({ chapter, closeMenu })}
                            </motion.div>
                          ) : null}
                        </AnimatePresence>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        )}
      />

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
                <div className="theme-text-muted font-mono text-[10px] uppercase tracking-[0.25em] mb-4 font-bold">
                  {tutorial.meta.label} / {formatArchiveDate(tutorial.meta.date)}
                </div>
                <h1 className="text-2xl font-black uppercase tracking-tight leading-[0.95] mb-3">
                  {tutorial.meta.title}
                </h1>
                <p className="theme-text-secondary font-mono text-xs leading-relaxed">
                  {tutorial.meta.summary}
                </p>
              </motion.header>

              <div className="theme-border border-l pl-4">
                <div className="px-2 py-3">
                  <h2 className="theme-text-muted font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
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
                            ? 'theme-border-primary theme-text-primary'
                            : 'border-transparent theme-border-hover theme-text-secondary'
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

          {/* Mobile page header (visible below xl) */}
          <div className="xl:hidden mb-8 max-w-5xl mx-auto">
            <div className="theme-text-muted font-mono text-[10px] uppercase tracking-[0.25em] mb-3 font-bold">
              {tutorial.meta.label} / {formatArchiveDate(tutorial.meta.date)}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight leading-[0.95] mb-6 break-words">
              {tutorial.meta.title}
            </h1>
            {activeTocHeading ? (
              <p className="theme-text-secondary font-mono text-xs leading-relaxed">
                Current section: {activeTocHeading.text}
              </p>
            ) : null}
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
              <TableOfContents state={toc} />
            </div>
          </aside>
        </section>
      </div>
    </div>
  )
}
