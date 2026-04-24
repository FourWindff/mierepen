import type { ComponentType, ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { posts, postMap } from 'virtual:blog-index'

export interface BlogMeta {
  slug: string
  title: string
  date: string
  author: string
  readTime: string
  category: string
  excerpt: string
}

export interface MDXComponentProps {
  components?: MDXComponents
  children?: ReactNode
}

export interface BlogPost {
  meta: BlogMeta
  content: string
  Component: ComponentType<MDXComponentProps>
}

// Dynamic import of MDX React components
const mdxModules = import.meta.glob('../../blog/*/index.mdx')

export function getAllPosts(): BlogMeta[] {
  return posts
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const meta = postMap[slug] as BlogMeta | undefined
  if (!meta) return null

  const loader = mdxModules[`../../blog/${slug}/index.mdx`]
  if (!loader) return null

  const mod = (await loader()) as { default: ComponentType<MDXComponentProps> }

  return {
    meta,
    content: '',
    Component: mod.default,
  }
}
