import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft, Sun, Moon } from 'lucide-react'
import { getAllPosts } from '../lib/blog'
import { useTheme } from '../lib/theme'

export default function Archive() {
  const posts = getAllPosts()
  const { theme, toggleTheme } = useTheme()

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

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
            A complete registry of all writings. {posts.length} entries found.
          </p>
        </motion.div>
      </header>

      {/* Post List */}
      <section className="max-w-7xl mx-auto px-12 pb-32">
        <div className="space-y-4">
          {posts.map((post, idx) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="flex items-center justify-between p-6 border border-black/5 dark:border-white/5 hover:border-black/40 dark:hover:border-white/40 transition-colors group"
            >
              <div className="flex items-center gap-8">
                <span className="font-mono text-[10px] text-black/20 dark:text-white/20">
                  #{posts.length - idx}
                </span>
                <span className="text-lg font-bold group-hover:translate-x-2 transition-transform">
                  {post.title}
                </span>
              </div>
              <span className="font-mono text-[10px] text-black/20 dark:text-white/20">
                {formatDate(post.date)}
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
