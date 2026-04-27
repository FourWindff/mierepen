import type { ReactElement } from 'react'
import CodeBlock from './CodeBlock'
import Callout from './Callout'
import InlineCode from './InlineCode'
import Blockquote from './Blockquote'
import Table from './Table'

interface CodeChildProps {
  className?: string
  children?: React.ReactNode
}

// MDX components mapping for MDXProvider
export const mdxComponents = {
  pre: (props: React.ComponentProps<'pre'>) => {
    const child = props.children as ReactElement<CodeChildProps>
    if (child?.props?.className) {
      return (
        <CodeBlock className={child.props.className}>
          {String(child.props.children || '')}
        </CodeBlock>
      )
    }
    return <CodeBlock>{String(child?.props?.children || '')}</CodeBlock>
  },
  code: (props: React.ComponentProps<'code'>) => {
    // If inside pre, let pre handle it
    if (props.className?.startsWith('language-')) {
      return <>{props.children}</>
    }
    return <InlineCode>{props.children}</InlineCode>
  },
  blockquote: Blockquote,
  table: Table,
  thead: (props: React.ComponentProps<'thead'>) => (
    <thead className="theme-border-strong border-b">{props.children}</thead>
  ),
  th: (props: React.ComponentProps<'th'>) => (
    <th className="theme-text-primary text-left py-3 px-4 font-bold uppercase tracking-widest text-[10px] font-mono">
      {props.children}
    </th>
  ),
  td: (props: React.ComponentProps<'td'>) => (
    <td className="theme-border theme-text-secondary border-b py-3 px-4">
      {props.children}
    </td>
  ),
  tr: (props: React.ComponentProps<'tr'>) => (
    <tr className="theme-surface-hover">{props.children}</tr>
  ),
  // Custom components
  Callout,
}
