import { cn } from '@/lib/utils'

interface MonoTableRow {
  label: string
  value: string | number
  unit?: string
}

interface MonoTableProps {
  rows: MonoTableRow[]
  className?: string
}

export function MonoTable({ rows, className }: MonoTableProps) {
  return (
    <table className={cn('w-full border-collapse', className)}>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} style={{ borderTop: '1px solid var(--color-concrete-mid)' }}>
            <td
              className="py-1.5 pr-4"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--color-concrete-gray)',
              }}
            >
              {row.label}
            </td>
            <td
              className="py-1.5 text-right"
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                color: 'var(--color-concrete-char)',
              }}
            >
              {row.value}
              {row.unit && (
                <span style={{ marginLeft: '4px', fontSize: '9px', color: 'var(--color-concrete-gray)' }}>
                  {row.unit}
                </span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
