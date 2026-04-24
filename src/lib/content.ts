import { getAllPosts, type BlogMeta } from './blog'
import { getAllTutorials, type TutorialMeta } from './docs'

export type ArchiveEntry =
  | ({ kind: 'blog'; href: string; typeLabel: string } & BlogMeta)
  | ({ kind: 'docs'; href: string; typeLabel: string } & TutorialMeta)

export function formatArchiveDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function getArchiveEntries(): ArchiveEntry[] {
  const posts: ArchiveEntry[] = getAllPosts().map((post) => ({
    ...post,
    kind: 'blog',
    href: `/blog/${post.slug}`,
    typeLabel: 'Blog',
  }))

  const tutorials: ArchiveEntry[] = getAllTutorials().map((tutorial) => ({
    ...tutorial,
    kind: 'docs',
    href: `/docs/${tutorial.slug}`,
    typeLabel: tutorial.label,
  }))

  return [...posts, ...tutorials].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  )
}
