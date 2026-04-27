import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { getPostBySlug, type BlogPost as BlogPostType } from '../lib/blog'
import { mdxComponents } from '../components/mdx'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null)

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
      <div className="theme-page min-h-screen flex items-center justify-center font-mono text-sm tracking-widest uppercase">
        Loading Data...
      </div>
    )
  }

  if (!post) {
    return (
      <div className="theme-page min-h-screen flex items-center justify-center font-mono text-sm tracking-widest uppercase">
        Post Not Found
      </div>
    )
  }

  const MdxContent = post.Component

  return (
    <div className="theme-page min-h-screen font-sans">
      <Header />

      {/* Article Header */}
      <header className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pt-12 sm:pt-16 lg:pt-24 pb-8 sm:pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="theme-text-muted font-mono text-[10px] uppercase tracking-[0.2em] mb-6 font-bold flex items-center gap-2">
            <span className="theme-rule w-4 h-[1px]"></span>
            {post.meta.category}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[0.9] mb-8">
            {post.meta.title}
          </h1>
          <div className="theme-text-muted flex items-center gap-6 text-[10px] font-mono uppercase tracking-widest font-bold">
            <span>{post.meta.author}</span>
            <span>/</span>
            <span>{post.meta.date}</span>
            <span>/</span>
            <span>{post.meta.readTime}</span>
          </div>
        </motion.div>
      </header>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-12 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="prose-custom"
        >
          <MdxContent components={mdxComponents} />
        </motion.div>
      </article>

      <Footer />
    </div>
  )
}
