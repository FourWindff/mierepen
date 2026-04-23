import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { getAllPosts } from '../lib/blog'

export default function Archive() {
  const posts = getAllPosts()

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans selection:bg-white selection:text-black">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-12 py-6">
          <Link
            to="/"
            className="text-xl font-black uppercase tracking-tighter mix-blend-difference hover:opacity-70 transition-opacity"
          >
            Cyber.Tides
          </Link>
          <Link
            to="/"
            className="text-sm uppercase tracking-[0.2em] font-bold text-white mix-blend-difference hover:opacity-70 transition-opacity flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Home
          </Link>
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
          <p className="text-neutral-400 text-sm font-mono max-w-xl">
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
              className="flex items-center justify-between p-6 border border-white/5 hover:border-white/40 transition-colors group"
            >
              <div className="flex items-center gap-8">
                <span className="font-mono text-[10px] text-white/20">
                  #{posts.length - idx}
                </span>
                <span className="text-lg font-bold group-hover:translate-x-2 transition-transform">
                  {post.title}
                </span>
              </div>
              <span className="font-mono text-[10px] text-white/20">
                {formatDate(post.date)}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="px-12 py-10 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">
              System Status: Optimal
            </span>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-white/50">
            &copy; 2024 CYBER_TIDES BLOG
          </p>
        </div>
      </footer>
    </div>
  )
}
