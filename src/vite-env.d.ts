/// <reference types="vite/client" />

declare module 'virtual:blog-index' {
  export interface BlogMeta {
    slug: string
    title: string
    date: string
    author: string
    readTime: string
    category: string
    excerpt: string
  }

  export const posts: BlogMeta[]
  export const postMap: Record<string, BlogMeta>
}
