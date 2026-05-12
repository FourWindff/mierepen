# Docs 教程二级目录支持设计文档

## 背景

当前 docs 教程采用扁平结构：`docs/<教程名>/<NN-章节名>.mdx`。当教程内容较多时，所有章节平铺在一个目录下，难以组织和导航。本设计引入**二级目录（分组）**支持，允许将教程章节按主题组织到子目录中。

## 目录结构约定

### 有分组的教程

```
docs/
  rag-tutorial/                         <- 教程根目录
    metadata.json                       <- 教程元数据
    index.mdx                           <- 可选：教程整体概览页
    01-overview.mdx                     <- 顶层章节（根目录下的 .mdx 文件）
    02-prerequisites.mdx                <- 顶层章节
    rag-general-flow/                   <- 二级目录（分组）
      index.mdx                         <- 可选：分组概览页
      01-what-is-rag.mdx
      02-rag-pipeline.mdx
    advanced-techniques/                <- 二级目录（分组）
      index.mdx
      01-hybrid-search.mdx
      02-query-rewrite.mdx
    evaluation/                         <- 二级目录（分组）
      01-metrics.mdx
```

### 无分组的教程（向后兼容）

```
docs/
  stm32-basics/                         <- 教程根目录
    metadata.json
    01-overview.mdx
    02-gpio.mdx
    03-timers.mdx
```

无分组的教程保持当前行为，**零改动**。

## metadata.json 格式

```json
{
  "title": "RAG 完全指南",
  "summary": "从基础概念到高级实践...",
  "date": "2026-05-10",
  "label": "Tutorial",
  "groups": ["rag-general-flow", "advanced-techniques", "evaluation"]
}
```

- `groups`：**可选**。字符串数组，元素是二级目录的文件夹名，定义分组在侧边栏中的显示顺序
- 未提供 `groups` 时，分组按文件夹名字母顺序排列
- `groups` 中列出的目录不存在 → 静默忽略
- 存在但未在 `groups` 中列出的目录 → 追加到末尾（按字母顺序）

## 文件约定

### 章节文件的 frontmatter

保持不变：

```yaml
---
title: "什么是 RAG"
sidebar_position: 1
excerpt: "..."
---
```

`sidebar_position` 只在**同作用域内**排序：
- 顶层章节之间按 `sidebar_position` 排序
- 每个分组内部的章节按各自的 `sidebar_position` 排序

### 分组的 `index.mdx`

可选文件。存在时：
- 分组标题在侧边栏中变为可点击的链接，点击跳转到该概览页
- 仍保留独立的折叠/展开按钮

不存在时：
- 分组标题仅作为不可点击的分类标签

## 数据模型

### `src/vite-env.d.ts`

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
    groupSlug: string | null   // null 表示顶层章节
  }

  export interface TutorialGroupMeta {
    slug: string
    title: string
    hasIndex: boolean
    chapters: TutorialChapterMeta[]
  }

  export interface TutorialMeta {
    slug: string
    title: string
    summary: string
    date: string
    label: string
    hasGroups: boolean
    topLevelChapters: TutorialChapterMeta[]
    groups: TutorialGroupMeta[]
  }

  export const tutorials: TutorialMeta[]
  export const tutorialMap: Record<string, TutorialMeta>
}
```

### `src/lib/docs.ts`

更新 `import.meta.glob` 模式：

```typescript
// 之前：只匹配根目录下的 .mdx
const tutorialModules = import.meta.glob('../../docs/*/*.mdx')

// 之后：同时匹配根目录和二级目录下的 .mdx
const tutorialModules = import.meta.glob('../../docs/*/**/*.mdx')
```

`getTutorialBySlug` 逻辑不变，按 `chapter.importPath` 加载模块。

## 构建时扫描逻辑（`vite.config.ts`）

`docsIndexPlugin.load()` 的扫描流程：

1. 读取教程根目录下的所有内容（文件 + 子目录）
2. **根目录下的 `.mdx` 文件** → 收集为 `topLevelChapters`
   - 排除 `metadata.json`
   - 排除子目录中的文件
   - 按 `sidebar_position` 排序
3. **子目录** → 视为分组：
   - 目录名 = 分组 slug = 分组显示标题
   - 检查是否有 `index.mdx`，设置 `hasIndex`
   - 收集子目录下的 `.mdx` 文件（排除 `index.mdx`）
   - 按 `sidebar_position` 排序
4. **分组排序**：
   - 读取 `metadata.json` 中的 `groups` 数组
   - 按数组顺序排列分组
   - 未在 `groups` 中列出的分组追加到末尾（按字母顺序）
5. **向后兼容判断**：
   - 有子目录（且子目录内有有效的 `.mdx` 文件）→ `hasGroups = true`
   - 无子目录 → `hasGroups = false`，`topLevelChapters` 包含所有章节

## 路由设计

### `App.tsx`

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

保留现有两层路由（向后兼容），新增三层路由。

### `DocsTutorial.tsx` 中的 URL 解析

1. 获取教程元数据，检查 `hasGroups`
2. **无分组教程**（`hasGroups = false`）：
   - `/docs/:tutorialSlug` → 重定向到第一个章节
   - `/docs/:tutorialSlug/:chapterSlug` → `chapterSlug` 为章节 slug
3. **有分组教程**（`hasGroups = true`）：
   - `/docs/:tutorialSlug` → 重定向到第一个顶层章节（如果没有则第一个分组的第一个章节）
   - `/docs/:tutorialSlug/:param1` → 检查 `param1` 是否匹配某个 `groupSlug`：
     - **是** → 当作分组名，重定向到该分组的第一个章节
     - **否** → 当作顶层章节 slug
   - `/docs/:tutorialSlug/:groupSlug/:chapterSlug` → 分组内章节

## 侧边栏 UI

### 桌面端

侧边栏中自上而下显示：

1. **顶层章节**（根目录下的 `.mdx` 文件）
   - 带 `sidebar_position` 编号
   - 可点击跳转
   - 当前激活章节高亮

2. **分组**（二级目录）
   - 分组标题 + 折叠按钮
   - 有 `index.mdx` 时，标题本身也是可点击链接
   - 展开后显示该分组下的章节列表
   - 固定顺序：顶层章节在前，分组在后

### 移动端

结构相同，放在 Header 的抽屉菜单中。

## 排序规则总结

| 元素 | 排序依据 | 说明 |
|------|---------|------|
| 顶层章节 | `sidebar_position` | 根目录下的 `.mdx` 文件之间排序 |
| 分组 | `metadata.json` 中的 `groups` 数组 | 未配置则按字母顺序 |
| 分组内章节 | `sidebar_position` | 各分组内部独立排序 |
| 顶层 vs 分组 | 固定位置 | 所有顶层章节在前，所有分组在后 |

## 向后兼容性

- 无子目录的教程：**完全不受影响**，继续按现有逻辑工作
- `metadata.json` 无需新增 `groups` 字段
- 路由保持不变（两层）
- 类型定义中新增字段有合理的默认值

## 影响范围

| 文件 | 变更类型 |
|------|---------|
| `vite.config.ts` | 修改：`docsIndexPlugin` 扫描逻辑 |
| `src/vite-env.d.ts` | 修改：新增类型字段 |
| `src/lib/docs.ts` | 修改：`import.meta.glob` 模式 + 类型更新 |
| `src/App.tsx` | 修改：新增路由 |
| `src/pages/DocsTutorial.tsx` | 修改：侧边栏渲染逻辑 + URL 解析 |
| `src/pages/Archive.tsx` | 可能需要微调（如果有影响） |
| `docs/*/metadata.json` | 可选：新增 `groups` 字段 |
