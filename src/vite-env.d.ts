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

declare module 'virtual:docs-index' {
  export interface TutorialHeadingMeta {
    id: string
    text: string
    level: number
  }

  export interface TutorialChapterMeta {
    slug: string
    title: string
    sidebarPosition: number
    excerpt: string
    importPath: string
    headings: TutorialHeadingMeta[]
  }

  export interface TutorialMeta {
    slug: string
    title: string
    summary: string
    date: string
    label: string
    chapters: TutorialChapterMeta[]
  }

  export const tutorials: TutorialMeta[]
  export const tutorialMap: Record<string, TutorialMeta>
}
