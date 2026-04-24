import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

const virtualBlogIndexId = 'virtual:blog-index'
const resolvedVirtualBlogIndexId = '\0' + virtualBlogIndexId
const virtualDocsIndexId = 'virtual:docs-index'
const resolvedVirtualDocsIndexId = '\0' + virtualDocsIndexId
const configDir = path.dirname(fileURLToPath(import.meta.url))

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

      const blogDir = path.resolve(configDir, 'blog')
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

function toImportPath(filePath: string) {
  return filePath.split(path.sep).join(path.posix.sep)
}

function docsIndexPlugin() {
  return {
    name: 'docs-index',
    resolveId(id: string) {
      if (id === virtualDocsIndexId) return resolvedVirtualDocsIndexId
    },
    load(id: string) {
      if (id !== resolvedVirtualDocsIndexId) return

      const docsDir = path.resolve(configDir, 'docs')
      if (!fs.existsSync(docsDir)) {
        return 'export const tutorials = []; export const tutorialMap = {};'
      }

      const tutorialDirs = fs.readdirSync(docsDir).filter((name) => {
        const fullPath = path.join(docsDir, name)
        return fs.statSync(fullPath).isDirectory()
      })

      const tutorials: Array<{
        slug: string
        title: string
        summary: string
        date: string
        label: string
        chapters: Array<{
          slug: string
          title: string
          sidebarPosition: number
          excerpt: string
          importPath: string
        }>
      }> = []

      for (const slug of tutorialDirs) {
        const tutorialDir = path.join(docsDir, slug)
        const metadataPath = path.join(tutorialDir, 'metadata.json')
        if (!fs.existsSync(metadataPath)) continue

        let metadata: Record<string, string>
        try {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as Record<string, string>
        } catch {
          continue
        }

        const chapterFiles = fs
          .readdirSync(tutorialDir)
          .filter((file) => file.endsWith('.mdx'))

        const chapters = chapterFiles
          .map((fileName) => {
            const chapterPath = path.join(tutorialDir, fileName)
            const raw = fs.readFileSync(chapterPath, 'utf-8')
            const { data } = matter(raw)

            const sidebarPosition = Number(data.sidebar_position)
            if (!data.title || Number.isNaN(sidebarPosition)) {
              return null
            }

            return {
              slug: fileName.replace(/\.mdx$/, ''),
              title: String(data.title),
              sidebarPosition,
              excerpt: String(data.excerpt ?? ''),
              importPath: toImportPath(`../../docs/${slug}/${fileName}`),
            }
          })
          .filter((chapter): chapter is NonNullable<typeof chapter> => chapter !== null)
          .sort((a, b) => a.sidebarPosition - b.sidebarPosition)

        if (!metadata.title || !metadata.summary || !metadata.date || chapters.length === 0) {
          continue
        }

        tutorials.push({
          slug,
          title: metadata.title,
          summary: metadata.summary,
          date: metadata.date,
          label: metadata.label || 'Tutorial',
          chapters,
        })
      }

      tutorials.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      const lines = [
        'export const tutorials = ' + JSON.stringify(tutorials) + ';',
        'export const tutorialMap = {',
        ...tutorials.map((tutorial) => `  "${tutorial.slug}": ${JSON.stringify(tutorial)},`),
        '};',
      ]

      return lines.join('\n')
    },
  }
}

function spaRedirectsPlugin() {
  return {
    name: 'spa-redirects',
    closeBundle() {
      const redirectsPath = path.resolve(configDir, 'dist', '_redirects')
      fs.writeFileSync(redirectsPath, '/* /index.html 200\n')
      console.log('[spa-redirects] Generated _redirects for SPA routing')
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    blogIndexPlugin(),
    docsIndexPlugin(),
    stripFrontmatterPlugin(),
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm] }) },
    react(),
    tailwindcss(),
    spaRedirectsPlugin(),
  ],
})
