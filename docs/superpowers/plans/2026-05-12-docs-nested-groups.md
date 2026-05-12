# Docs 教程二级目录支持 — 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 docs 教程系统增加二级目录（分组）支持，允许 `docs/<教程>/<分组>/<章节>.mdx` 的组织方式，同时向后兼容现有扁平结构。

**Architecture:** 修改 `vite.config.ts` 中的 `docsIndexPlugin` 以递归扫描二级目录并导出分组信息；更新类型定义和运行时加载逻辑；在 `DocsTutorial.tsx` 中按分组结构渲染侧边栏；新增三层路由支持分组内章节 URL。

**Tech Stack:** React 19, Vite 8, TypeScript, React Router v6, Tailwind v4

---

## 文件映射

| 文件 | 变更 | 说明 |
|------|------|------|
| `vite.config.ts` | 修改 | `docsIndexPlugin.load()` 扫描逻辑 — 核心变更 |
| `src/vite-env.d.ts` | 修改 | 虚拟模块类型声明 — 新增 `groupSlug`, `TutorialGroupMeta`, `hasGroups` 等字段 |
| `src/lib/docs.ts` | 修改 | `import.meta.glob` 模式 + 类型定义 + `getTutorialBySlug` 加载分组 `index.mdx` |
| `src/App.tsx` | 修改 | 新增 `/docs/:tutorialSlug/:groupSlug/:chapterSlug` 路由 |
| `src/pages/DocsTutorial.tsx` | 修改 | URL 解析逻辑 + 侧边栏渲染（顶层章节 + 可折叠分组） |

---

### Task 1: 更新 `vite.config.ts` 的 `docsIndexPlugin`

**Files:**
- Modify: `vite.config.ts:184-288`（`docsIndexPlugin` 的 `load` 方法）

**Context:** 当前 `docsIndexPlugin` 只扫描教程根目录下的 `.mdx` 文件。需要改为：扫描根目录下的 `.mdx` 文件作为顶层章节，递归扫描子目录作为分组。

- [ ] **Step 1: 更新 `TutorialChapterMeta` 的生成逻辑 — 为顶层章节和分组章节分别生成 `groupSlug`**

在 `docsIndexPlugin` 的 `load` 方法中，替换现有的 `chapterFiles` 扫描逻辑。

当前代码（约 235-260 行）：
```typescript
const chapterFiles = fs
  .readdirSync(tutorialDir)
  .filter((file) => file.endsWith('.mdx'))

const chapters = chapterFiles
  .map((fileName) => {
    const chapterPath = path.join(tutorialDir, fileName)
    // ...
    return {
      slug: fileName.replace(/\.mdx$/, ''),
      // ...
      importPath: toImportPath(`../../docs/${slug}/${fileName}`),
      // ...
    }
  })
```

替换为：
```typescript
// 扫描根目录下的所有内容
const entries = fs.readdirSync(tutorialDir)

// 收集顶层章节（根目录下的 .mdx 文件，排除 index.mdx）
const topLevelChapters = entries
  .filter((file) => file.endsWith('.mdx') && file !== 'index.mdx')
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

// 收集分组
const groups: Array<{
  slug: string
  title: string
  hasIndex: boolean
  indexImportPath: string | null
  chapters: Array<{
    slug: string
    title: string
    sidebarPosition: number
    excerpt: string
    importPath: string
    headings: Array<{ id: string; text: string; level: number }>
    groupSlug: string | null
  }>
}> = []

const groupDirs = entries.filter((name) => {
  const fullPath = path.join(tutorialDir, name)
  return fs.statSync(fullPath).isDirectory()
})

for (const groupSlug of groupDirs) {
  const groupDir = path.join(tutorialDir, groupSlug)
  const groupEntries = fs.readdirSync(groupDir)

  const hasIndex = groupEntries.includes('index.mdx')
  const indexImportPath = hasIndex
    ? toImportPath(`../../docs/${slug}/${groupSlug}/index.mdx`)
    : null

  const groupChapters = groupEntries
    .filter((file) => file.endsWith('.mdx') && file !== 'index.mdx')
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

  if (groupChapters.length === 0 && !hasIndex) continue

  groups.push({
    slug: groupSlug,
    title: groupSlug,
    hasIndex,
    indexImportPath,
    chapters: groupChapters,
  })
}

// 排序分组
const groupsOrder = Array.isArray(metadata.groups)
  ? (metadata.groups as unknown[]).filter((g): g is string => typeof g === 'string')
  : []

const orderedGroups: typeof groups = []
const seen = new Set<string>()

for (const groupSlug of groupsOrder) {
  const group = groups.find((g) => g.slug === groupSlug)
  if (group) {
    orderedGroups.push(group)
    seen.add(groupSlug)
  }
}

const remainingGroups = groups
  .filter((g) => !seen.has(g.slug))
  .sort((a, b) => a.slug.localeCompare(b.slug))

orderedGroups.push(...remainingGroups)

const hasGroups = groups.length > 0
const allChapters = [
  ...topLevelChapters,
  ...orderedGroups.flatMap((g) => g.chapters),
]
```

- [ ] **Step 2: 更新 `tutorials.push()` 以包含新字段**

替换现有的 `tutorials.push({...})` 调用：

```typescript
tutorials.push({
  slug,
  title: String(metadata.title),
  summary: String(metadata.summary),
  date: String(metadata.date),
  label: String(metadata.label || 'Tutorial'),
  hasGroups,
  chapters: allChapters,
  topLevelChapters,
  groups: orderedGroups,
})
```

- [ ] **Step 3: 验证 `npm run build`**

Run: `npm run build`
Expected: TypeScript 编译通过（类型声明还没更新，但 Vite 构建不会检查 `.d.ts` 文件，所以应该通过）

- [ ] **Step 4: Commit**

```bash
git add vite.config.ts
git commit -m "feat(docs-index): scan nested group directories in docsIndexPlugin"
```

---

### Task 2: 更新类型定义和运行时加载

**Files:**
- Modify: `src/vite-env.d.ts`
- Modify: `src/lib/docs.ts`

**Context:** 虚拟模块导出的数据结构已变，需要在类型声明中反映。同时 `import.meta.glob` 的模式需要更新以匹配二级目录下的 `.mdx` 文件。

- [ ] **Step 1: 更新 `src/vite-env.d.ts`**

替换 `declare module 'virtual:docs-index'` 块：

```typescript
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

  export const tutorials: TutorialMeta[]
  export const tutorialMap: Record<string, TutorialMeta>
}
```

- [ ] **Step 2: 更新 `src/lib/docs.ts` — 类型和 `import.meta.glob`**

替换整个文件内容：

```typescript
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
```

- [ ] **Step 3: 验证 `npm run build` 和 `npm run lint`**

Run: `npm run build`
Expected: 编译通过（如果之前通过了，这里应该也通过，因为只是类型声明更新）

Run: `npm run lint`
Expected: 无 ESLint 错误

- [ ] **Step 4: Commit**

```bash
git add src/vite-env.d.ts src/lib/docs.ts
git commit -m "feat(docs): update types and module loading for nested groups"
```

---

### Task 3: 新增三层路由

**Files:**
- Modify: `src/App.tsx:311-317`

- [ ] **Step 1: 在 `App.tsx` 中新增三层路由**

在现有路由之后添加：

```tsx
<Route path="/docs/:tutorialSlug/:groupSlug/:chapterSlug" element={<DocsTutorial />} />
```

完整的路由部分应为：

```tsx
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/blog/:slug" element={<BlogPost />} />
  <Route path="/docs/:tutorialSlug" element={<DocsTutorial />} />
  <Route path="/docs/:tutorialSlug/:chapterSlug" element={<DocsTutorial />} />
  <Route path="/docs/:tutorialSlug/:groupSlug/:chapterSlug" element={<DocsTutorial />} />
  <Route path="/archive" element={<Archive />} />
</Routes>
```

- [ ] **Step 2: 验证 `npm run build`**

Run: `npm run build`
Expected: 编译通过

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat(routing): add three-level route for docs group chapters"
```

---

### Task 4: 更新 `DocsTutorial.tsx`

**Files:**
- Modify: `src/pages/DocsTutorial.tsx`

**Context:** 这是最大的改动。需要：
1. 更新 URL 解析逻辑，支持分组和顶层章节的混合
2. 更新侧边栏渲染，先显示顶层章节，再显示可折叠分组
3. 处理分组有 `index.mdx` 时的可点击标题

- [ ] **Step 1: 更新导入和 `activeChapter` 解析逻辑**

在文件顶部，确保导入了 `TutorialGroup` 类型（如果 `getTutorialBySlug` 返回的 `Tutorial` 已包含 `groups`，不需要额外导入）。

替换 `activeChapter` 的解析逻辑（约第 37 行）：

```typescript
const activeChapter = (() => {
  if (!tutorial) return null

  if (!tutorial.meta.hasGroups) {
    // 无分组：现有逻辑
    return tutorial.chapters.find((chapter) => chapter.slug === chapterSlug) ?? tutorial.chapters[0]
  }

  // 有分组：解析 URL
  if (groupSlug && chapterSlug) {
    // 三层路由：/docs/tutorial/group/chapter
    const group = tutorial.groups.find((g) => g.slug === groupSlug)
    return group?.chapters.find((c) => c.slug === chapterSlug) ?? null
  }

  if (chapterSlug) {
    // 两层路由：/docs/tutorial/something
    // 检查 something 是否是分组名
    const group = tutorial.groups.find((g) => g.slug === chapterSlug)
    if (group) {
      // 是分组名：显示该分组首页（第一个章节，后续可改为 index.mdx）
      return group.chapters[0] ?? null
    }
    // 不是分组名：查找顶层章节
    return tutorial.topLevelChapters.find((c) => c.slug === chapterSlug) ?? null
  }

  // 无 chapterSlug：显示第一个可用内容
  return tutorial.topLevelChapters[0] ?? tutorial.groups[0]?.chapters[0] ?? null
})()
```

注意：`groupSlug` 需要从 `useParams` 中解构出来：

```typescript
const { tutorialSlug, chapterSlug, groupSlug } = useParams<{
  tutorialSlug: string
  chapterSlug?: string
  groupSlug?: string
}>()
```

- [ ] **Step 2: 更新桌面侧边栏渲染 — 顶层章节 + 分组**

替换现有的侧边栏章节导航部分（约 254-284 行）：

```tsx
<div className="theme-border border-l pl-4">
  <div className="px-2 py-3">
    <h2 className="theme-text-muted font-mono text-[10px] uppercase tracking-[0.3em] font-bold">
      Chapter Directory
    </h2>
  </div>
  <nav className="p-2" aria-label={`${tutorial.meta.title} chapters`}>
    {tutorial.meta.hasGroups ? (
      // 有分组：先显示顶层章节，再显示分组
      <>
        {/* 顶层章节 */}
        {tutorial.topLevelChapters.map((chapter) => {
          const isActive = chapter.slug === activeChapter?.slug
          return (
            <Link
              key={chapter.slug}
              to={`/docs/${tutorial.meta.slug}/${chapter.slug}`}
              className={`block px-3 py-3 border-l transition-colors ${
                isActive
                  ? 'theme-border-primary theme-text-primary'
                  : 'border-transparent theme-border-hover theme-text-secondary'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 pt-1">
                  {String(chapter.sidebarPosition).padStart(2, '0')}
                </span>
                <div className="font-bold leading-tight">{chapter.title}</div>
              </div>
            </Link>
          )
        })}

        {/* 分组 */}
        {tutorial.groups.map((group) => (
          <GroupSidebarItem
            key={group.slug}
            group={group}
            tutorialSlug={tutorial.meta.slug}
            activeChapter={activeChapter}
          />
        ))}
      </>
    ) : (
      // 无分组：现有逻辑
      tutorial.chapters.map((chapter) => {
        const isActive = chapter.slug === activeChapter?.slug
        return (
          <Link
            key={chapter.slug}
            to={`/docs/${tutorial.meta.slug}/${chapter.slug}`}
            className={`block px-3 py-3 border-l transition-colors ${
              isActive
                ? 'theme-border-primary theme-text-primary'
                : 'border-transparent theme-border-hover theme-text-secondary'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 pt-1">
                {String(chapter.sidebarPosition).padStart(2, '0')}
              </span>
              <div className="font-bold leading-tight">{chapter.title}</div>
            </div>
          </Link>
        )
      })
    )}
  </nav>
</div>
```

- [ ] **Step 3: 添加 `GroupSidebarItem` 组件**

在 `DocsTutorial.tsx` 文件中（`export default function DocsTutorial` 之前）添加：

```tsx
function GroupSidebarItem({
  group,
  tutorialSlug,
  activeChapter,
}: {
  group: Tutorial['groups'][number]
  tutorialSlug: string
  activeChapter: Tutorial['chapters'][number] | null
}) {
  const [isExpanded, setIsExpanded] = useState(() => {
    // 默认展开包含当前激活章节的分组
    return group.chapters.some((c) => c.slug === activeChapter?.slug)
  })

  const isActiveGroup = group.chapters.some((c) => c.slug === activeChapter?.slug)

  return (
    <div className="mt-2">
      {/* 分组标题 */}
      <div className="flex items-center">
        {group.hasIndex ? (
          <Link
            to={`/docs/${tutorialSlug}/${group.slug}`}
            className={`flex-1 px-3 py-2 text-sm font-bold transition-colors ${
              isActiveGroup ? 'theme-text-primary' : 'theme-text-secondary'
            }`}
          >
            {group.title}
          </Link>
        ) : (
          <span
            className={`flex-1 px-3 py-2 text-sm font-bold ${
              isActiveGroup ? 'theme-text-primary' : 'theme-text-secondary'
            }`}
          >
            {group.title}
          </span>
        )}
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          className="theme-text-muted theme-text-hover-primary p-2 transition-colors"
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* 分组章节 */}
      {isExpanded && (
        <div className="ml-2 border-l theme-border pl-2">
          {group.chapters.map((chapter) => {
            const isActive = chapter.slug === activeChapter?.slug
            return (
              <Link
                key={chapter.slug}
                to={`/docs/${tutorialSlug}/${group.slug}/${chapter.slug}`}
                className={`block px-3 py-2 border-l transition-colors text-sm ${
                  isActive
                    ? 'theme-border-primary theme-text-primary'
                    : 'border-transparent theme-border-hover theme-text-secondary'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 pt-0.5">
                    {String(chapter.sidebarPosition).padStart(2, '0')}
                  </span>
                  <div className="leading-tight">{chapter.title}</div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: 更新移动端菜单**

移动端菜单的章节列表也需要更新以支持分组。替换现有的移动端菜单中的 `<nav>` 部分（约 146-227 行）：

```tsx
<nav aria-label={`${tutorial.meta.title} files`}>
  <ul className="space-y-1">
    {tutorial.meta.hasGroups ? (
      <>
        {/* 顶层章节 */}
        {tutorial.topLevelChapters.map((chapter) => {
          const isActive = chapter.slug === activeChapter?.slug
          return (
            <li key={chapter.slug}>
              <div
                className={`border-l-2 transition-colors ${
                  isActive ? 'theme-border-primary' : 'border-transparent theme-surface-hover'
                }`}
              >
                <Link
                  to={`/docs/${tutorial.meta.slug}/${chapter.slug}`}
                  onClick={() => handleMobileChapterNavigation(closeMenu)}
                  className={`block px-3 py-3 ${
                    isActive ? 'theme-text-primary' : 'theme-text-secondary'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.2em] opacity-50 pt-1">
                      {String(chapter.sidebarPosition).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 font-bold leading-tight break-words">
                      {chapter.title}
                    </div>
                  </div>
                </Link>
              </div>
            </li>
          )
        })}

        {/* 分组 */}
        {tutorial.groups.map((group) => (
          <MobileGroupMenuItem
            key={group.slug}
            group={group}
            tutorial={tutorial}
            activeChapter={activeChapter}
            closeMenu={closeMenu}
            expandedMobileChapterSlug={expandedMobileChapterSlug}
            setExpandedMobileChapterSlug={setExpandedMobileChapterSlug}
            handleMobileChapterNavigation={handleMobileChapterNavigation}
          />
        ))}
      </>
    ) : (
      // 无分组：现有逻辑
      tutorial.chapters.map((chapter) => {
        // ... 保留现有代码
      })
    )}
  </ul>
</nav>
```

由于移动端菜单的改动较大且复杂，建议将其提取为一个独立的组件。但为保持计划简洁，这里给出关键变更点：在有分组时，先渲染顶层章节（和现有章节项一样的结构），然后渲染分组（可折叠的章节列表）。

更实际的简化方案：保持移动端菜单基本不变，当 `hasGroups=true` 时，`tutorial.chapters` 仍然包含所有章节（按顺序），所以现有的移动端菜单渲染逻辑可以继续工作，只是章节链接的 URL 需要根据 `groupSlug` 生成。可以在渲染时检查 `chapter.groupSlug` 来决定 URL：

```tsx
const chapterUrl = chapter.groupSlug
  ? `/docs/${tutorial.meta.slug}/${chapter.groupSlug}/${chapter.slug}`
  : `/docs/${tutorial.meta.slug}/${chapter.slug}`
```

这样可以最小化改动。采用这种简化方案。

在移动端菜单的 `Link` 中：
```tsx
to={`/docs/${tutorial.meta.slug}/${chapter.slug}`}
```

改为：
```tsx
to={chapter.groupSlug
  ? `/docs/${tutorial.meta.slug}/${chapter.groupSlug}/${chapter.slug}`
  : `/docs/${tutorial.meta.slug}/${chapter.slug}`
}
```

这样移动端菜单就不需要大改了。

- [ ] **Step 5: 验证 `npm run build` 和 `npm run lint`**

Run: `npm run build`
Expected: 编译通过

Run: `npm run lint`
Expected: 无 ESLint 错误

- [ ] **Step 6: Commit**

```bash
git add src/pages/DocsTutorial.tsx
git commit -m "feat(docs-tutorial): support nested groups in sidebar and routing"
```

---

### Task 5: 创建测试数据并验证

**Files:**
- Create: `docs/test-nested-groups/metadata.json`
- Create: `docs/test-nested-groups/01-overview.mdx`
- Create: `docs/test-nested-groups/basics/index.mdx`
- Create: `docs/test-nested-groups/basics/01-what-is-it.mdx`
- Create: `docs/test-nested-groups/basics/02-details.mdx`
- Create: `docs/test-nested-groups/advanced/01-technique-a.mdx`

**Context:** 创建一个带二级目录的测试教程，验证整个流程。

- [ ] **Step 1: 创建测试教程目录和文件**

```bash
mkdir -p docs/test-nested-groups/basics
mkdir -p docs/test-nested-groups/advanced
```

`docs/test-nested-groups/metadata.json`:
```json
{
  "title": "测试分组教程",
  "summary": "用于验证二级目录分组功能的测试教程。",
  "date": "2026-05-12",
  "label": "Test",
  "groups": ["basics", "advanced"]
}
```

`docs/test-nested-groups/01-overview.mdx`:
```mdx
---
title: "概述"
sidebar_position: 1
excerpt: "测试教程的概述章节。"
---

# 概述

这是测试分组教程的顶层章节。
```

`docs/test-nested-groups/basics/index.mdx`:
```mdx
---
title: "基础"
sidebar_position: 0
excerpt: "基础分组概览。"
---

# 基础分组

这是基础分组的概览页面。
```

`docs/test-nested-groups/basics/01-what-is-it.mdx`:
```mdx
---
title: "这是什么"
sidebar_position: 1
excerpt: "基础概念介绍。"
---

# 这是什么

基础概念介绍内容。
```

`docs/test-nested-groups/basics/02-details.mdx`:
```mdx
---
title: "详细说明"
sidebar_position: 2
excerpt: "详细说明内容。"
---

# 详细说明

详细说明内容。
```

`docs/test-nested-groups/advanced/01-technique-a.mdx`:
```mdx
---
title: "技术 A"
sidebar_position: 1
excerpt: "高级技术 A 的介绍。"
---

# 技术 A

高级技术 A 的内容。
```

- [ ] **Step 2: 验证 `npm run build`**

Run: `npm run build`
Expected: 编译通过。`docsIndexPlugin` 应该在构建时扫描到新目录结构。

- [ ] **Step 3: 启动 dev server 并用 Playwright 验证**

注意：根据项目 CLAUDE.md，添加新的 MDX 文件需要重启 dev server 才能重新扫描索引。

Run: `npm run dev`
等待服务器启动。

使用 Playwright MCP 验证：
1. 导航到首页，确认 "测试分组教程" 卡片显示（`test-nested-groups`）
2. 点击卡片，确认跳转到 `/docs/test-nested-groups`
3. 确认侧边栏显示：
   - 顶层章节：01 概述
   - 分组：basics（可折叠，标题可点击因为有 index.mdx）
   - 分组：advanced（可折叠）
4. 点击 "basics" 分组标题，确认展开显示 01 这是什么、02 详细说明
5. 点击 "这是什么"，确认 URL 为 `/docs/test-nested-groups/basics/01-what-is-it`
6. 点击 "概述"，确认 URL 为 `/docs/test-nested-groups/01-overview`
7. 验证现有的无分组教程（如 `stm32-basics`）仍然正常工作

- [ ] **Step 4: 停止 dev server**

Run: 终止 `npm run dev` 进程。

- [ ] **Step 5: 清理测试数据（可选）**

如果用户确认不需要保留测试教程：

```bash
rm -rf docs/test-nested-groups
```

- [ ] **Step 6: 最终 Commit**

```bash
git add docs/test-nested-groups/
git commit -m "test: add sample nested-group tutorial for validation"
```

（如果清理了测试数据，这一步跳过）

---

## 自我审查

### Spec 覆盖检查

| Spec 要求 | 对应 Task |
|-----------|----------|
| 二级目录扫描 | Task 1 |
| `groups` 字段排序 | Task 1 |
| 顶层章节 + 分组共存 | Task 1, Task 4 |
| 顶层章节在前、分组在后 | Task 4 (渲染顺序) |
| `groupSlug` 字段 | Task 2 |
| `hasGroups` 标志 | Task 1, Task 4 |
| 三层路由 `/docs/:tutorial/:group/:chapter` | Task 3 |
| 向后兼容（无分组的教程） | Task 1, Task 4 (条件渲染) |
| 分组 `index.mdx` 可点击 | Task 4 (GroupSidebarItem) |
| 分组可折叠 | Task 4 (GroupSidebarItem) |

### Placeholder 检查

- 无 "TBD"、"TODO"、"implement later"
- 所有代码步骤包含完整代码
- 所有命令包含预期输出

### 类型一致性检查

- `groupSlug: string | null` — 在 Task 1 (vite.config.ts)、Task 2 (vite-env.d.ts, docs.ts) 中一致
- `hasGroups: boolean` — 在 Task 1、Task 2、Task 4 中一致
- `TutorialGroupMeta` / `TutorialGroup` — 字段名一致（`hasIndex`, `indexImportPath`, `chapters`）

---

## 执行选项

**Plan complete and saved to `docs/superpowers/plans/2026-05-12-docs-nested-groups.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
