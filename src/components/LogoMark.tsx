interface LogoMarkProps {
  className?: string
}

export default function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <polygon
        points="50,5 89,27 89,72 50,95 11,72 11,27"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M50 20 L65 40 L58 65 L50 75 L42 65 L35 40 Z"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <line
        x1="50"
        y1="40"
        x2="50"
        y2="60"
        stroke="currentColor"
        strokeOpacity="0.85"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle
        cx="50"
        cy="63"
        r="4"
        fill="currentColor"
        fillOpacity="0.85"
      />
      <path
        d="M50 82 C50 82 46 87 46 90 C46 92.2 47.8 94 50 94 C52.2 94 54 92.2 54 90 C54 87 50 82 50 82 Z"
        fill="currentColor"
      />
    </svg>
  )
}
