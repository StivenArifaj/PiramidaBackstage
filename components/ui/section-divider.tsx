import { cn } from '@/lib/utils'

interface SectionDividerProps {
  fromColor?: string
  toColor?: string
  height?: number
  flip?: boolean
  className?: string
}

export function SectionDivider({
  fromColor = 'var(--color-concrete-bone)',
  toColor = 'var(--color-concrete-char)',
  height = 80,
  flip = false,
  className,
}: SectionDividerProps) {
  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{ height }}
      aria-hidden="true"
    >
      <svg
        viewBox={`0 0 1440 ${height}`}
        preserveAspectRatio="none"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="1440" height={height} fill={toColor} />
        <polygon
          points={flip ? `1440,0 0,0 0,${height}` : `0,0 1440,0 1440,${height}`}
          fill={fromColor}
        />
      </svg>
    </div>
  )
}
