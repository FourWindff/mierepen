import type { ComponentType, ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { tutorialMap, tutorials } from 'virtual:docs-index'

export interface TutorialChapterMeta {
  slug: string
  title: string
  sidebarPosition: number
  excerpt: string
  importPath: string
}

export interface TutorialMeta {
  slug: string
  title: string
  summary: string
  date: string
  label: string
  chapters: TutorialChapterMeta[]
}

export interface MDXComponentProps {
  components?: MDXComponents
  children?: ReactNode
}

export interface TutorialChapter extends TutorialChapterMeta {
  Component: ComponentType<MDXComponentProps>
}

export interface Tutorial {
  meta: TutorialMeta
  chapters: TutorialChapter[]
}

const tutorialModules = import.meta.glob('../../docs/*/*.mdx')

export function getAllTutorials(): TutorialMeta[] {
  return tutorials
}

export async function getTutorialBySlug(slug: string): Promise<Tutorial | null> {
  const meta = tutorialMap[slug] as TutorialMeta | undefined
  if (!meta) return null

  const chapters = await Promise.all(
    meta.chapters.map(async (chapter) => {
      const loader = tutorialModules[chapter.importPath]
      if (!loader) {
        throw new Error(`Missing MDX module for ${chapter.importPath}`)
      }

      const mod = (await loader()) as { default: ComponentType<MDXComponentProps> }

      return {
        ...chapter,
        Component: mod.default,
      }
    }),
  )

  return {
    meta,
    chapters,
  }
}
