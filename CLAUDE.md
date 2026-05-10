# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (binds `0.0.0.0`, default port 5173).
- `npm run build` — Type-checks (`tsc -b`) then bundles (`vite build`). Both must pass.
- `npm run lint` — ESLint over `**/*.{ts,tsx}`.
- `npm run preview` — Serve the built bundle.

There is no test suite in this repo.

## Architecture

A personal blog/docs site (React 19 + Vite 8 + Tailwind v4 + MDX) with content authored as `.mdx` files outside `src/`. The non-obvious piece is the **build-time content index**.

### Content pipeline (vite.config.ts)

Two custom Vite plugins synthesize virtual modules at build time:

- **`virtual:blog-index`** — scans `blog/YYYY-MM-DD/index.mdx`, parses frontmatter with a hand-rolled regex (not gray-matter), exports `posts[]` and `postMap{}` sorted by date desc.
- **`virtual:docs-index`** — scans `docs/<slug>/`, requires a `metadata.json` per tutorial and `<NN-name>.mdx` chapters with frontmatter (`title`, `sidebar_position`, `excerpt`). Uses `gray-matter`. Also extracts `##`–`######` headings at build time (skipping fenced code) for the TOC.
- **`stripFrontmatterPlugin`** — runs `enforce: 'pre'` to strip `---...---` blocks before `@mdx-js/rollup` compiles each MDX file, since MDX itself doesn't parse frontmatter.

`virtual:blog-index` and `virtual:docs-index` types live in `src/vite-env.d.ts`. Runtime helpers in `src/lib/blog.ts` and `src/lib/docs.ts` combine the static index with `import.meta.glob` lazy loaders that return the MDX `default` component on demand. **Adding a new MDX file requires restarting the dev server** for the index plugins to re-scan.

### Routing

`src/App.tsx` defines all routes inline: `/`, `/blog/:slug`, `/docs/:tutorialSlug`, `/docs/:tutorialSlug/:chapterSlug`, `/archive`. `Home` is also defined in `App.tsx`. Page components live in `src/pages/`.

### MDX rendering

`src/components/mdx/index.tsx` exports `mdxComponents` — the mapping passed as `components` when rendering an MDX `Component`. It overrides `pre`/`code` to route through the custom `CodeBlock` (Shiki-highlighted) and `InlineCode`, plus styled `blockquote`/`table`/`th`/`td`/`tr` and a `Callout` custom component usable inside MDX. `remark-gfm` is enabled.

### Theme system (important)

The app supports **light and dark** themes (light is the default for `prefers-color-scheme: light`). Theme state lives in `ThemeProvider` (`src/lib/theme.tsx`) and toggles a `dark` class on `<html>`; selection is persisted to `localStorage` under `theme`.

Styles use **`theme-*` utility classes defined in `src/index.css`** that read CSS variables declared in the Tailwind v4 `@theme` block. Examples: `theme-page`, `theme-surface`, `theme-surface-hover`, `theme-border`, `theme-border-strong`, `theme-text-primary`/`secondary`/`tertiary`/`soft`/`muted`/`dim`/`faint`, `theme-button-primary`, `theme-rule`. Each has a `html.dark` variant defined in the same file.

**Do not hardcode `text-white`, `text-black`, `bg-[#080808]`, or `border-white/10`** — use the `theme-*` primitives so both themes work. Tailwind utilities are fine for layout, sizing, typography, and one-off non-themed styling.

The Tailwind v4 `@theme` block in `src/index.css` is the source of truth for color tokens; there is no `tailwind.config.js`.

## Authoring content

### Blog post

Create `blog/YYYY-MM-DD/index.mdx` with this frontmatter (all strings, manually parsed — keep the format simple):

```
---
title: "..."
date: "YYYY-MM-DD"
author: "..."
readTime: "5 min"
category: "..."
excerpt: "..."
---
```

The directory name must match `/^\d{4}-\d{2}-\d{2}$/` and becomes the slug.

### Tutorial

Create `docs/<slug>/`:
- `metadata.json` with `title`, `summary`, `date`, `label` (all required, plus `chapters` derived from files).
- One or more `<NN-name>.mdx` chapters with frontmatter `title`, `sidebar_position` (number, used for ordering), `excerpt`. Tutorials with zero valid chapters are skipped.

Heading IDs for the TOC are derived from `## …` and deeper headings via lowercase + `\s+→-` + strip non-`[a-z0-9-]` (see `createHeadingId` in `vite.config.ts`). Avoid duplicate heading text within a chapter.

## Style conventions

- Monospace `font-mono` (JetBrains Mono) is used heavily for labels, metadata, and ASCII art; sans (`Inter`) for body and headings.
- Section labels: `font-mono text-[10px] uppercase tracking-[0.3em] theme-text-muted font-bold`.
- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-12`.
- Major section padding: `py-24`. Card padding: `p-12` desktop / `p-6 sm:p-8` smaller.
- Vertical section dividers: `border-x` + `border-t` with `theme-border` / `theme-border-subtle`.
- Entrance animations use `motion/react` with `initial={{ opacity: 0, y: 20 }}` and `whileInView` triggers; stagger by `idx * 0.1`.

## TypeScript / lint notes

- `tsconfig.app.json` enables `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, and `verbatimModuleSyntax` — type-only imports must use `import type`.
- ESLint config (`eslint.config.js`) is flat config with `js.recommended`, `tseslint.recommended`, `react-hooks` recommended, and `react-refresh/vite`.
- The `build` script runs `tsc -b` first; type errors fail the build.
