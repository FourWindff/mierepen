import { Info, AlertTriangle, XCircle } from 'lucide-react'

interface CalloutProps {
  type?: 'info' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
}

const config = {
  info: {
    border: 'border-l-blue-500 dark:border-l-blue-400',
    icon: Info,
  },
  warning: {
    border: 'border-l-amber-500 dark:border-l-amber-400',
    icon: AlertTriangle,
  },
  error: {
    border: 'border-l-red-500 dark:border-l-red-400',
    icon: XCircle,
  },
}

export default function Callout({ type = 'info', title, children }: CalloutProps) {
  const { border, icon: Icon } = config[type]

  return (
    <div className={`border-l-2 ${border} bg-black/2 dark:bg-white/2 pl-6 pr-4 py-4 my-8`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-black/50 dark:text-white/50" />
        {title && (
          <span className="font-bold text-black dark:text-white text-sm">{title}</span>
        )}
      </div>
      <div className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{children}</div>
    </div>
  )
}
