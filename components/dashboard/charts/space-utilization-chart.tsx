'use client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'

export interface SpaceUtilizationPoint {
  code: string
  name: string
  bookings: number
  revenue: number
}

const M = 'var(--font-mono)'
const ACCENT_COLORS = [
  '#c8da2b', '#378ADD', '#f4a261', '#e63946',
  '#2a9d8f', '#5a4fcf', '#ec4899', '#97C459',
]

function CustomTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: SpaceUtilizationPoint }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div style={{
      background: '#111110', border: '1px solid #3a3835', padding: '10px 14px',
      fontFamily: M, fontSize: '8px', letterSpacing: '0.08em',
    }}>
      <p style={{ color: '#c8da2b', textTransform: 'uppercase', margin: '0 0 6px', letterSpacing: '0.14em', fontWeight: 700 }}>
        {d.code}
      </p>
      <p style={{ color: '#9a9890', margin: '2px 0', textTransform: 'uppercase' }}>
        bookings: <span style={{ color: '#f5f5f0' }}>{d.bookings}</span>
      </p>
      {d.revenue > 0 && (
        <p style={{ color: '#9a9890', margin: '2px 0', textTransform: 'uppercase' }}>
          revenue: <span style={{ color: '#f5f5f0' }}>€{d.revenue.toLocaleString()}</span>
        </p>
      )}
    </div>
  )
}

function truncateName(name: string, max = 14): string {
  return name.length > max ? name.slice(0, max) + '…' : name
}

interface Props {
  data: SpaceUtilizationPoint[]
}

export function SpaceUtilizationChart({ data }: Props) {
  // Sort by bookings desc, cap at 12 bars for readability
  const sorted = [...data].sort((a, b) => b.bookings - a.bookings).slice(0, 12)

  if (sorted.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, background: '#fafaf5', border: '1px dashed #d8d5cc' }}>
        <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c0bdb4', margin: 0 }}>
          no data for this period
        </p>
      </div>
    )
  }

  const chartHeight = Math.max(220, sorted.length * 34)

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart
        layout="vertical"
        data={sorted}
        margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
        barCategoryGap="28%"
      >
        <CartesianGrid stroke="#e8e6dd" strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: '#9a9890' }}
          axisLine={{ stroke: '#e8e6dd' }}
          tickLine={false}
          label={{ value: 'bookings', position: 'insideBottom', offset: -2, style: { fontFamily: M, fontSize: 7, fill: '#9a9890', textTransform: 'uppercase', letterSpacing: '0.1em' } }}
        />
        <YAxis
          type="category"
          dataKey="code"
          tickFormatter={code => {
            const d = sorted.find(s => s.code === code)
            return d ? truncateName(d.name) : code
          }}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: '#9a9890' }}
          axisLine={false}
          tickLine={false}
          width={90}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,218,43,0.05)' }} />
        <Bar dataKey="bookings" radius={0} maxBarSize={18}>
          {sorted.map((_, i) => (
            <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
