'use client'

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts'

export interface RevenueTrendPoint {
  date: string       // YYYY-MM-DD
  confirmed: number  // accepted/locked revenue (€)
  pipeline: number   // pending/quoted revenue (€)
}

const M = 'var(--font-mono)'

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ name: string; value: number; color: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#111110', border: '1px solid #3a3835', padding: '10px 14px',
      fontFamily: M, fontSize: '8px', letterSpacing: '0.08em',
    }}>
      <p style={{ color: '#9a9890', textTransform: 'uppercase', margin: '0 0 8px', letterSpacing: '0.14em' }}>
        {label}
      </p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, margin: '3px 0', textTransform: 'uppercase' }}>
          {p.name}: €{p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

function formatXDate(date: string) {
  return new Date(date + 'T12:00:00Z').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function formatYAxis(val: number) {
  if (val >= 1000) return `€${(val / 1000).toFixed(0)}k`
  return `€${val}`
}

interface Props {
  data: RevenueTrendPoint[]
}

export function RevenueTrendChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 220, background: '#fafaf5', border: '1px dashed #d8d5cc' }}>
        <p style={{ fontFamily: M, fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#c0bdb4', margin: 0 }}>
          no data for this period
        </p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="confirmedGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#c8da2b" stopOpacity={0.22} />
            <stop offset="95%" stopColor="#c8da2b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="pipelineGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#378ADD" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#378ADD" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="#e8e6dd" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatXDate}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: '#9a9890', letterSpacing: '0.08em' }}
          axisLine={{ stroke: '#e8e6dd' }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontFamily: 'var(--font-mono)', fontSize: 7, fill: '#9a9890' }}
          axisLine={false}
          tickLine={false}
          width={44}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '0.1em', textTransform: 'uppercase', paddingTop: 8 }}
          formatter={(val: string) => <span style={{ color: '#6b6966' }}>{val}</span>}
        />
        <Area
          type="monotone"
          dataKey="confirmed"
          name="confirmed"
          stroke="#c8da2b"
          strokeWidth={1.5}
          fill="url(#confirmedGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#c8da2b' }}
        />
        <Area
          type="monotone"
          dataKey="pipeline"
          name="pipeline"
          stroke="#378ADD"
          strokeWidth={1.5}
          fill="url(#pipelineGrad)"
          dot={false}
          activeDot={{ r: 3, fill: '#378ADD' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
