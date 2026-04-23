# Project Style Guide

> Last updated: 2026-04-23

## Overview

This is a personal blog/website built with React + Vite + Tailwind CSS v4. It features a dark, cyber-brutalist aesthetic with ASCII generative art and monospace typography.

## Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| Background | `#080808` | Primary page background |
| Surface | `white/[0.01]` to `white/[0.05]` | Elevated surfaces, cards, inputs |
| Primary Text | `white` | Headings, primary content |
| Secondary Text | `neutral-400` | Body text, descriptions |
| Muted Text | `white/40`, `white/50` | Labels, metadata, captions |
| Border | `white/5`, `white/10`, `white/20` | Dividers, card borders, hover states |
| Accent | `neutral-300` | Hover states, secondary accents |
| Selection | `bg-white text-black` | Text selection highlight |

### Opacity Scale (Borders/Surfaces)
- `white/5` - Subtle dividers
- `white/10` - Default borders, section borders
- `white/20` - Emphasized borders, scrollbar, hover borders
- `white/30` - Gradient overlays, secondary icons
- `white/40` - ASCII art layers, labels
- `white/50` - Primary labels, metadata
- `white/70` - Gradient overlays
- `white/80` - ASCII art foreground

## Typography

### Font Families
- **Sans-serif**: `Inter` (weights: 400, 700, 900)
- **Monospace**: `JetBrains Mono` (weights: 400, 700)

### Type Scale

| Element | Size | Weight | Tracking | Transform | Font |
|---------|------|--------|----------|-----------|------|
| Hero Title | `120px` | `black (900)` | `[-0.05em]` | `uppercase` | Sans |
| H1 (Blog) | `text-5xl` to `text-6xl` | `black (900)` | `tight` | `uppercase` | Sans |
| H2 (Section) | `text-4xl` | `bold (700)` | - | - | Sans |
| H3 (Subsection) | `text-2xl` | `bold (700)` | - | - | Sans |
| H4 (Card Title) | `text-xl` | `bold (700)` | - | - | Sans |
| Body | `text-base` | `normal (400)` | - | - | Sans |
| Body Small | `text-sm` | `normal (400)` | - | - | Sans |
| Label/Metadata | `text-[10px]` | `bold (700)` | `[0.2em]` to `[0.3em]` | `uppercase` | Mono |
| Mono Body | `text-xs` to `text-sm` | `normal (400)` | - | - | Mono |
| ASCII Art | `text-[8px]` to `text-[10px]` | - | `leading-tight` | - | Mono |

### Prose Styles (Blog Content)
Blog content uses the `.prose-custom` class with these conventions:
- Headings: tight line-height, generous top margin
- Paragraphs: `neutral-400`, `leading-relaxed`
- Links: white with underline, hover to `neutral-300`
- Code: mono font, `white/10` background
- Code blocks: `white/5` background, `white/10` border
- Tables: uppercase mono headers with `white/20` border
- Blockquotes: left border accent, italic

## Spacing

### Container
- Max width: `max-w-7xl` (80rem / 1280px)
- Horizontal padding: `px-12` (3rem)
- Centered with `mx-auto`

### Section Spacing
- Vertical padding: `py-24` (6rem) for major sections
- Content gap: `gap-12` (3rem) for grids

### Component Spacing
- Card padding: `p-12` (3rem)
- Input padding: `py-4` vertical
- Border thickness: 1px (Tailwind default borders)

## Layout Patterns

### Grid System
- 12-column grid: `grid-cols-12` with `lg:col-span-*` breakpoints
- Common splits: 4/8, 6/6, 1/1 (responsive)
- Card grids: `md:grid-cols-2`, `lg:grid-cols-3`

### Border Conventions
- Sections separated by `border-t border-white/10`
- Side borders on contained sections: `border-x border-white/10`
- Cards use `border-white/5` to `border-white/20` with hover transitions

### Z-Layering
- Background ASCII art: `absolute inset-0` with `z-0` (implied)
- Navigation: `relative z-10`
- Gradient overlays: `absolute inset-0`

## Component Patterns

### Navigation Items
```
text-sm uppercase tracking-[0.2em] font-bold text-white mix-blend-difference hover:opacity-70 transition-opacity
```

### Section Labels
```
font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 mb-16 font-bold text-center
```

### Cards
- Background: `bg-[#080808]` or `bg-white/[0.01]`
- Border: `border border-white/10`
- Hover: `hover:bg-white/[0.05] hover:border-white transition-colors`
- Inner padding: `p-12`

### Inputs
- Background: `bg-transparent`
- Border: `border-b border-white/20`
- Focus: `focus:border-white focus:outline-none transition-colors`
- Font: `font-mono text-sm`

### Buttons
- Primary: `bg-white text-black font-black uppercase text-xs py-4 hover:bg-neutral-200 transition-colors tracking-[0.2em]`

## Animation

- Entrance animations use `motion/react` with `initial={{ opacity: 0, y: 20 }}` and `whileInView` triggers
- Stagger delays: `idx * 0.1` for card grids
- Hover transitions: `transition-colors`, `transition-opacity`, `transition-transform`
- ASCII wave: 100ms interval animation

## File Organization

```
src/
  App.tsx          # Main app with routing and home page
  main.tsx         # Entry point
  index.css        # Global styles, Tailwind theme, prose styles
  pages/
    BlogPost.tsx   # Blog post page
  lib/
    blog.ts        # Blog data fetching utilities
  assets/          # Static assets

blog/
  YYYY-MM-DD/
    index.mdx      # Blog post content with frontmatter
```

### Style Organization Rules
1. Global styles live in `src/index.css`
2. Tailwind theme configuration is in CSS via `@theme` (Tailwind v4)
3. Component styles use Tailwind utility classes inline
4. Blog prose styles use the `.prose-custom` class in `index.css`
5. No separate CSS modules or styled-components

## Dependencies

- `tailwindcss` v4.2.4 with `@tailwindcss/vite`
- `motion` v12.38.0 for animations
- `lucide-react` v1.8.0 for icons
- `@mdx-js/react` and `@mdx-js/rollup` for MDX support
