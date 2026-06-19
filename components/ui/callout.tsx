import { cn } from '@/lib/utils'

interface CalloutProps {
  label: string
  value?: string
  x: number
  y: number
  direction?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
}

export function Callout({ label, value, x, y, direction = 'top', className }: CalloutProps) {
  const lineLength = 32

  const positions = {
    top:    { x1: x, y1: y, x2: x,             y2: y - lineLength, textX: x,             textY: y - lineLength - 6,  anchor: 'middle' as const },
    bottom: { x1: x, y1: y, x2: x,             y2: y + lineLength, textX: x,             textY: y + lineLength + 14, anchor: 'middle' as const },
    right:  { x1: x, y1: y, x2: x + lineLength, y2: y,             textX: x + lineLength + 4, textY: y + 4,           anchor: 'start'  as const },
    left:   { x1: x, y1: y, x2: x - lineLength, y2: y,             textX: x - lineLength - 4, textY: y + 4,           anchor: 'end'    as const },
  }[direction]

  return (
    <g className={cn(className)}>
      <line
        x1={positions.x1} y1={positions.y1}
        x2={positions.x2} y2={positions.y2}
        stroke="var(--color-concrete-char)"
        strokeWidth="1"
        strokeDasharray="3 2"
      />
      <circle cx={x} cy={y} r="2" fill="var(--color-concrete-char)" />
      <text
        x={positions.textX} y={positions.textY}
        textAnchor={positions.anchor}
        fill="var(--color-concrete-char)"
        fontSize="10"
        fontFamily="var(--font-mono)"
        letterSpacing="0.05em"
      >
        {label}
      </text>
      {value && (
        <text
          x={positions.textX} y={positions.textY + 12}
          textAnchor={positions.anchor}
          fill="var(--color-concrete-gray)"
          fontSize="9"
          fontFamily="var(--font-mono)"
          letterSpacing="0.05em"
        >
          {value}
        </text>
      )}
    </g>
  )
}
