import { useEffect, useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { getPostBySlug, type BlogPost as BlogPostType } from '../lib/blog'
import { useTheme } from '../lib/useTheme'
import { mdxComponents } from '../components/mdx'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const location = useLocation()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null)
  const { theme, toggleTheme } = useTheme()

  const fromArchive = location.state?.from === 'archive' || document.referrer.includes('/archive')

  useEffect(() => {
    if (!slug) return
    let cancelled = false

    void getPostBySlug(slug).then((nextPost) => {
      if (cancelled) return
      setPost(nextPost)
      setLoadedSlug(slug)
    })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (slug && loadedSlug !== slug) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#080808] text-black dark:text-white flex items-center justify-center font-mono text-sm tracking-widest uppercase">
        Loading Data...
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#080808] text-black dark:text-white flex items-center justify-center font-mono text-sm tracking-widest uppercase">
        Post Not Found
      </div>
    )
  }

  const MdxContent = post.Component

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#080808] text-black dark:text-white font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
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
              to={fromArchive ? '/archive' : '/'}
              className="text-sm uppercase tracking-[0.2em] font-bold text-black dark:text-white hover:opacity-70 transition-opacity flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              {fromArchive ? 'Archive' : 'Home'}
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

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-12 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-black/40 dark:text-white/40 mb-6 font-bold flex items-center gap-2">
            <span className="w-4 h-[1px] bg-black/20 dark:bg-white/20"></span>
            {post.meta.category}
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-8">
            {post.meta.title}
          </h1>
          <div className="flex items-center gap-6 text-[10px] font-mono text-black/40 dark:text-white/40 uppercase tracking-widest font-bold">
            <span>{post.meta.author}</span>
            <span>/</span>
            <span>{post.meta.date}</span>
            <span>/</span>
            <span>{post.meta.readTime}</span>
          </div>
        </motion.div>
      </header>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-12 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="prose-custom"
        >
          <MdxContent components={mdxComponents} />
        </motion.div>
      </article>

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
