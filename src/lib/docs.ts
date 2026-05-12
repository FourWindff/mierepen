import type { ComponentType, ReactNode } from 'react'
import type { MDXComponents } from 'mdx/types'
import { tutorialMap, tutorials } from 'virtual:docs-index'

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
  groupSlug: string | null
}

export interface TutorialGroupMeta {
  slug: string
  title: string
  hasIndex: boolean
  indexImportPath: string | null
  chapters: TutorialChapterMeta[]
}

export interface TutorialMeta {
  slug: string
  title: string
  summary: string
  date: string
  label: string
  hasGroups: boolean
  chapters: TutorialChapterMeta[]
  topLevelChapters: TutorialChapterMeta[]
  groups: TutorialGroupMeta[]
}

export interface MDXComponentProps {
  components?: MDXComponents
  children?: ReactNode
}

export interface TutorialChapter extends TutorialChapterMeta {
  Component: ComponentType<MDXComponentProps>
}

export interface TutorialGroup extends TutorialGroupMeta {
  chapters: TutorialChapter[]
  IndexComponent: ComponentType<MDXComponentProps> | null
}

export interface Tutorial {
  meta: TutorialMeta
  chapters: TutorialChapter[]
  topLevelChapters: TutorialChapter[]
  groups: TutorialGroup[]
}

const tutorialModules = import.meta.glob('../../docs/*/**/*.mdx')

export function getAllTutorials(): TutorialMeta[] {
  return tutorials
}

export async function getTutorialBySlug(slug: string): Promise<Tutorial | null> {
  const meta = tutorialMap[slug] as TutorialMeta | undefined
  if (!meta) return null

  const loadChapter = async (chapterMeta: TutorialChapterMeta): Promise<TutorialChapter> => {
    const loader = tutorialModules[chapterMeta.importPath]
    if (!loader) {
      throw new Error(`Missing MDX module for ${chapterMeta.importPath}`)
    }

    const mod = (await loader()) as { default: ComponentType<MDXComponentProps> }

    return {
      ...chapterMeta,
      Component: mod.default,
    }
  }

  const chapters = await Promise.all(meta.chapters.map(loadChapter))
  const topLevelChapters = await Promise.all(meta.topLevelChapters.map(loadChapter))

  const groups = await Promise.all(
    meta.groups.map(async (groupMeta) => {
      let IndexComponent: ComponentType<MDXComponentProps> | null = null

      if (groupMeta.indexImportPath) {
        const loader = tutorialModules[groupMeta.indexImportPath]
        if (loader) {
          const mod = (await loader()) as { default: ComponentType<MDXComponentProps> }
          IndexComponent = mod.default
        }
      }

      return {
        ...groupMeta,
        chapters: await Promise.all(groupMeta.chapters.map(loadChapter)),
        IndexComponent,
      }
    }),
  )

  return {
    meta,
    chapters,
    topLevelChapters,
    groups,
  }
}
