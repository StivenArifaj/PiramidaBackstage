import { cn } from '@/lib/utils'
import type { AvailabilityState } from '@/types/api'

const colorMap: Record<AvailabilityState, string> = {
  available: 'var(--color-status-available)',
  reserved:  'var(--color-status-reserved)',
  blocked:   'var(--color-status-blocked)',
  pending:   'var(--color-status-pending)',
}

interface StatusDotProps {
  status: AvailabilityState
  size?: number
  className?: string
  showLabel?: boolean
}

export function StatusDot({ status, size = 8, className, showLabel = false }: StatusDotProps) {
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className="shrink-0 rounded-full"
        style={{ width: size, height: size, backgroundColor: colorMap[status] }}
        aria-label={status}
      />
      {showLabel && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)' }}>
          {status}
        </span>
      )}
    </span>
  )
}
