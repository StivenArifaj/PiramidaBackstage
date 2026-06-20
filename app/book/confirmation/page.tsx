'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { motion } from 'framer-motion'
import { BrandStrip } from '@/components/ui/brand-strip'

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

function ConfirmationContent() {
  const params = useSearchParams()
  const ref = params.get('ref') ?? 'PB-2026-XXX'
  const [tasks, setTasks] = useState<string[]>([])

  useEffect(() => {
    // Simulate task generation display
    const generated = [
      'Stage & furniture setup',
      'AV system calibration',
      'Reception desk and signage setup',
      'Security briefing and access control',
      'Post-event teardown and furniture return',
      'Final cleaning and space handover',
    ]
    let i = 0
    const interval = setInterval(() => {
      if (i < generated.length) { setTasks(prev => [...prev, generated[i]]); i++ }
      else clearInterval(interval)
    }, 280)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-concrete-char)' }}>
      <BrandStrip />
      <div style={{ paddingTop: '48px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '80px 64px' }}>

        {/* Confirm mark */}
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, ease: EASE }}
          style={{ width: '80px', height: '80px', border: '3px solid var(--color-lime)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px' }}>
          <div style={{ width: '32px', height: '32px', backgroundColor: 'var(--color-lime)' }} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE, delay: 0.2 }} style={{ textAlign: 'center', maxWidth: '560px', marginBottom: '64px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 16px' }}>booking request received</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-bone)', margin: '0 0 16px', lineHeight: 1.0 }}>
            Request logged.
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-concrete-gray)', margin: '0 0 8px' }}>
            Reference: <span style={{ color: 'var(--color-lime)' }}>{ref}</span>
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(245,245,240,0.45)', margin: 0, lineHeight: 1.6 }}>
            The Piramida Backstage system has received your request and is preparing a quote. You&apos;ll receive confirmation at your email within minutes.
          </p>
        </motion.div>

        {/* Auto-generated tasks */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.6 }}
          style={{ width: '100%', maxWidth: '520px', border: '2px solid rgba(245,245,240,0.08)', padding: '28px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 20px' }}>
            auto-generated task list
          </p>
          {tasks.map((task, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: EASE }}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(245,245,240,0.06)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--color-lime)', minWidth: '28px' }}>0{i + 1}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(245,245,240,0.7)' }}>{task}</span>
            </motion.div>
          ))}
          {tasks.length < 6 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 0' }}>
              <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity }}
                style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-lime)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(245,245,240,0.3)', letterSpacing: '0.12em' }}>generating tasks...</span>
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
          <Link href="/dashboard" style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '14px 32px' }}>
            open dashboard
          </Link>
          <Link href="/spaces" style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'rgba(245,245,240,0.6)', border: '2px solid rgba(245,245,240,0.15)', padding: '12px 32px' }}>
            book another space
          </Link>
        </motion.div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense>
      <ConfirmationContent />
    </Suspense>
  )
}
