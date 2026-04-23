import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import fs from 'fs'
import path from 'path'

const virtualBlogIndexId = 'virtual:blog-index'
const resolvedVirtualBlogIndexId = '\0' + virtualBlogIndexId

function stripFrontmatterPlugin() {
  return {
    name: 'strip-frontmatter',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (!/\.mdx$/.test(id)) return
      const cleaned = code.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '')
      return cleaned
    },
  }
}

function blogIndexPlugin() {
  return {
    name: 'blog-index',
    resolveId(id: string) {
      if (id === virtualBlogIndexId) return resolvedVirtualBlogIndexId
    },
    load(id: string) {
      if (id !== resolvedVirtualBlogIndexId) return

      const blogDir = path.resolve(__dirname, 'blog')
      if (!fs.existsSync(blogDir)) {
        return 'export const posts = []; export const postMap = {};'
      }

      const dirs = fs.readdirSync(blogDir).filter((d) => {
        const full = path.join(blogDir, d)
        return fs.statSync(full).isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(d)
      })

      const posts: Array<{
        slug: string
        title: string
        date: string
        author: string
        readTime: string
        category: string
        excerpt: string
      }> = []

      for (const dir of dirs) {
        const mdxPath = path.join(blogDir, dir, 'index.mdx')
        if (!fs.existsSync(mdxPath)) continue

        const raw = fs.readFileSync(mdxPath, 'utf-8')
        const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
        const data: Record<string, string> = {}

        if (fmMatch) {
          for (const line of fmMatch[1].split('\n')) {
            const idx = line.indexOf(':')
            if (idx > 0) {
              const key = line.slice(0, idx).trim()
              const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
              data[key] = value
            }
          }
        }

        posts.push({
          slug: dir,
          title: data.title || 'Untitled',
          date: data.date || dir,
          author: data.author || 'Unknown',
          readTime: data.readTime || '5 min',
          category: data.category || 'General',
          excerpt: data.excerpt || '',
        })
      }

      posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const lines = [
        'export const posts = ' + JSON.stringify(posts) + ';',
        'export const postMap = {',
        ...posts.map((p) => `  "${p.slug}": ${JSON.stringify(p)},`),
        '};',
      ]

      return lines.join('\n')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    blogIndexPlugin(),
    stripFrontmatterPlugin(),
    { enforce: 'pre', ...mdx() },
    react(),
    tailwindcss(),
  ],
})
