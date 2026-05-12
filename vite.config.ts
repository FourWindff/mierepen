import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import mdx from '@mdx-js/rollup'
import remarkGfm from 'remark-gfm'
import { visit } from 'unist-util-visit'
import type { Node } from 'unist'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import matter from 'gray-matter'

interface CodeNode extends Node {
  type: 'code'
  lang?: string
  meta?: string
  value: string
  data?: {
    hProperties?: Record<string, string | string[]>
  }
}

function remarkCodeTitle() {
  return (tree: Node) => {
    visit(tree, 'code', (node: CodeNode) => {
      if (!node.meta) return
      const titleMatch = node.meta.match(/title=["']([^"']+)["']/)
      if (!titleMatch) return
      const title = titleMatch[1]
      node.data = node.data || {}
      node.data.hProperties = node.data.hProperties || {}
      const existingClass = node.data.hProperties.className
      const baseClass = Array.isArray(existingClass)
        ? existingClass.join(' ')
        : (existingClass as string) || `language-${node.lang || 'text'}`
      node.data.hProperties.className = `${baseClass} title="${title}"`
    })
  }
}

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

function normalizeHeadingText(raw: string) {
  return raw
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<\/?[^>]+>/g, '')
    .replace(/[*_~]/g, '')
    .trim()
}

function createHeadingId(text: string, usedIds?: Set<string>): string {
  let id = text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\-]/gu, '')
    .replace(/^-+|-+$/g, '')

  if (!id) id = 'heading'

  if (usedIds) {
    let counter = 1
    const baseId = id
    while (usedIds.has(id)) {
      id = `${baseId}-${counter}`
      counter++
    }
    usedIds.add(id)
  }

  return id
}

function extractMdxHeadings(raw: string) {
  const headings: Array<{ id: string; text: string; level: number }> = []
  const usedIds = new Set<string>()
  const lines = raw.split(/\r?\n/)
  let inFence = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      inFence = !inFence
      continue
    }

    if (inFence) continue

    const match = /^(#{2,6})\s+(.+?)\s*$/.exec(trimmed)
    if (!match) continue

    const text = normalizeHeadingText(match[2])
    if (!text) continue

    headings.push({
      id: createHeadingId(text, usedIds),
      text,
      level: match[1].length,
    })
  }

  return headings
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

      interface ChapterMeta {
        slug: string
        title: string
        sidebarPosition: number
        excerpt: string
        importPath: string
        headings: Array<{
          id: string
          text: string
          level: number
        }>
        groupSlug: string | null
      }

      interface GroupMeta {
        slug: string
        title: string
        hasIndex: boolean
        indexImportPath: string
        chapters: ChapterMeta[]
      }

      const tutorials: Array<{
        slug: string
        title: string
        summary: string
        date: string
        label: string
        hasGroups: boolean
        chapters: ChapterMeta[]
        topLevelChapters: ChapterMeta[]
        groups: GroupMeta[]
      }> = []

      for (const slug of tutorialDirs) {
        const tutorialDir = path.join(docsDir, slug)
        const metadataPath = path.join(tutorialDir, 'metadata.json')
        if (!fs.existsSync(metadataPath)) continue

        let metadata: Record<string, unknown>
        try {
          metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as Record<string, unknown>
        } catch {
          continue
        }

        const title = String(metadata.title ?? '')
        const summary = String(metadata.summary ?? '')
        const date = String(metadata.date ?? '')
        const label = String(metadata.label || 'Tutorial')
        if (!title || !summary || !date) {
          continue
        }

        const entries = fs.readdirSync(tutorialDir)

        // Top-level chapters: .mdx files excluding index.mdx
        const topLevelFiles = entries.filter(
          (name) => name.endsWith('.mdx') && name !== 'index.mdx',
        )
        const topLevelChapters: ChapterMeta[] = topLevelFiles
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
              headings: extractMdxHeadings(raw),
              groupSlug: null,
            }
          })
          .filter((chapter): chapter is NonNullable<typeof chapter> => chapter !== null)
          .sort((a, b) => a.sidebarPosition - b.sidebarPosition)

        // Groups: subdirectories with .mdx files
        const groupDirs = entries
          .filter((name) => {
            const fullPath = path.join(tutorialDir, name)
            return fs.statSync(fullPath).isDirectory()
          })

        const groups: GroupMeta[] = groupDirs
          .map((groupSlug) => {
            const groupDir = path.join(tutorialDir, groupSlug)
            const groupEntries = fs.readdirSync(groupDir)
            const hasIndex = groupEntries.includes('index.mdx')
            const indexImportPath = hasIndex
              ? toImportPath(`../../docs/${slug}/${groupSlug}/index.mdx`)
              : ''

            const groupFiles = groupEntries.filter(
              (name) => name.endsWith('.mdx') && name !== 'index.mdx',
            )
            const groupChapters: ChapterMeta[] = groupFiles
              .map((fileName) => {
                const chapterPath = path.join(groupDir, fileName)
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
                  importPath: toImportPath(`../../docs/${slug}/${groupSlug}/${fileName}`),
                  headings: extractMdxHeadings(raw),
                  groupSlug,
                }
              })
              .filter((chapter): chapter is NonNullable<typeof chapter> => chapter !== null)
              .sort((a, b) => a.sidebarPosition - b.sidebarPosition)

            return {
              slug: groupSlug,
              title: groupSlug,
              hasIndex,
              indexImportPath,
              chapters: groupChapters,
            }
          })
          .filter((group) => group.chapters.length > 0 || group.hasIndex)

        // Sort groups by metadata.groups order, then alphabetically for unlisted
        const groupsOrder = Array.isArray(metadata.groups)
          ? metadata.groups.filter((g): g is string => typeof g === 'string')
          : []
        const groupOrderMap = new Map(groupsOrder.map((g, i) => [g, i]))
        groups.sort((a, b) => {
          const orderA = groupOrderMap.get(a.slug)
          const orderB = groupOrderMap.get(b.slug)
          if (orderA !== undefined && orderB !== undefined) {
            return orderA - orderB
          }
          if (orderA !== undefined) return -1
          if (orderB !== undefined) return 1
          return a.slug.localeCompare(b.slug)
        })

        const allChapters: ChapterMeta[] = [
          ...topLevelChapters,
          ...groups.flatMap((g) => g.chapters),
        ]
        const hasGroups = groups.length > 0

        tutorials.push({
          slug,
          title,
          summary,
          date,
          label,
          hasGroups,
          chapters: allChapters,
          topLevelChapters,
          groups,
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

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    blogIndexPlugin(),
    docsIndexPlugin(),
    stripFrontmatterPlugin(),
    { enforce: 'pre', ...mdx({ remarkPlugins: [remarkGfm, remarkCodeTitle] }) },
    react(),
    tailwindcss(),
  ],
})
