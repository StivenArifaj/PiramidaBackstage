'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform, useInView, animate, type Variants } from 'framer-motion'
import { BrandStrip } from '@/components/ui/brand-strip'
import { SectionDivider } from '@/components/ui/section-divider'
import { Pill } from '@/components/ui/pill'
import type { SpaceFloor } from '@/types/api'

// ─── Shared easing curve ──────────────────────────────────────────────────────
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

// ─── Fade-up animation preset ────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 48 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
}
const stagger: Variants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.12 } },
}
const fadeIn: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.9, ease: 'easeOut' } },
}

// ─── Animated counter ─────────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  useEffect(() => {
    if (!inView || !ref.current) return
    const ctrl = animate(0, target, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) + suffix },
    })
    return ctrl.stop
  }, [inView, target, suffix])
  return <span ref={ref}>0{suffix}</span>
}

// ─── Parallax image wrapper ───────────────────────────────────────────────────
function ParallaxImage({ src, speed = 0.25, style }: { src: string; speed?: number; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], ['-12%', '12%'])
  return (
    <div ref={ref} style={{ position: 'relative', overflow: 'hidden', width: '100%', height: '100%', ...style }}>
      <motion.div
        style={{ y, position: 'absolute', inset: '-15% 0', backgroundImage: `url(${src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
    </div>
  )
}

// ─── Horizontal ticker ────────────────────────────────────────────────────────
function Ticker() {
  const items = ['Albania\'s most iconic venue', 'MVRDV · 2023', '80+ bookable spaces', 'Pyramid of Tirana', '5 floors', '300 pax capacity', 'JunctionX 2026', 'Piramida Backstage']
  const text = items.join('  ·  ')
  return (
    <div style={{ overflow: 'hidden', borderTop: '2px solid var(--color-concrete-char)', borderBottom: '2px solid var(--color-concrete-char)', backgroundColor: 'var(--color-lime)', padding: '12px 0' }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
        style={{ display: 'flex', whiteSpace: 'nowrap', gap: '0' }}
      >
        {[0, 1].map((i) => (
          <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-lime-ink)', paddingRight: '48px' }}>
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  )
}

// ─── Space type card ──────────────────────────────────────────────────────────
function SpaceCard({ color, label, count, area, rate }: { color: string; label: string; count: number; area: string; rate: number }) {
  const [hov, setHov] = useState(false)
  return (
    <motion.div
      variants={fadeUp}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        border: hov ? `2px solid ${color}` : '2px solid var(--color-concrete-char)',
        padding: '32px',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Color strip */}
      <motion.div
        animate={{ height: hov ? '4px' : '2px' }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, backgroundColor: color, transition: 'height 0.2s ease' }}
      />
      <div style={{ marginTop: '8px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>
          {count} spaces
        </p>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 500, letterSpacing: '0.02em', color: 'var(--color-concrete-char)', margin: '0 0 24px' }}>
          {label}
        </h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--color-concrete-mid)', paddingTop: '16px' }}>
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 500, color: 'var(--color-concrete-char)', margin: 0 }}>{area}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '4px 0 0' }}>area m²</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 500, color: 'var(--color-concrete-char)', margin: 0 }}>€{rate}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '4px 0 0' }}>from / hr</p>
          </div>
        </div>
        <motion.div
          animate={{ opacity: hov ? 1 : 0, x: hov ? 0 : 8 }}
          transition={{ duration: 0.2 }}
          style={{ marginTop: '20px' }}
        >
          <Link href="/spaces" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color, display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            view spaces →
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

// ─── Floor pill row for elevation section ─────────────────────────────────────
const FLOORS: Array<{ key: SpaceFloor; label: string; top: string }> = [
  { key: 'roof',      label: 'Roof L+4',       top: '8%'  },
  { key: 'l3',        label: '3rd Floor',       top: '27%' },
  { key: 'l0',        label: 'Ground Floor',    top: '50%' },
  { key: 'l_minus_1', label: 'B1 Floor',        top: '66%' },
  { key: 'exterior',  label: 'Exterior Boxes',  top: '82%' },
]

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 800], [0, 240])
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0])
  const [activeFloor, setActiveFloor] = useState<SpaceFloor>('l0')

  return (
    <div style={{ backgroundColor: 'var(--color-concrete-bone)', overflowX: 'hidden' }}>
      <BrandStrip />

      {/* ══════════════════════════════════════════════════════
          01 · HERO — aerial night shot
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '100vh', minHeight: '720px', overflow: 'hidden', backgroundColor: '#050505' }}>
        {/* Parallax background */}
        <motion.div
          style={{ position: 'absolute', inset: '-15% 0', y: heroY, backgroundImage: "url('/pyramid/mvrdv-27.jpg')", backgroundSize: 'cover', backgroundPosition: 'center top', opacity: 0.85 }}
        />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(5,5,5,0.95) 100%)' }} />
        {/* Left vignette */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(5,5,5,0.5) 0%, transparent 60%)' }} />

        {/* Hero content */}
        <motion.div
          style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '0 72px 88px', opacity: heroOpacity }}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 20px' }}>
            Pyramid of Tirana · MVRDV · Albania · 2023
          </motion.p>

          <motion.div variants={fadeUp}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(64px, 9vw, 120px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-bone)', lineHeight: 0.92 }}>
              piramida
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(64px, 9vw, 120px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-lime)', lineHeight: 0.92, marginBottom: '48px' }}>
              backstage.
            </div>
          </motion.div>

          <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-body)', fontSize: '17px', color: 'rgba(245,245,240,0.65)', maxWidth: '480px', margin: '0 0 52px', lineHeight: 1.7 }}>
            Replace 30 emails with one sentence. Book event spaces, generate quotes, coordinate teams — all inside the most iconic building in Albania.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <Link href="/spaces" style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '16px 40px', display: 'inline-block', flexShrink: 0 }}>
              explore spaces
            </Link>
            <Link href="/dashboard" style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', textDecoration: 'none', color: 'rgba(245,245,240,0.8)', border: '2px solid rgba(245,245,240,0.25)', padding: '14px 40px', display: 'inline-block' }}>
              dashboard
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8, duration: 1 }}
          style={{ position: 'absolute', bottom: '40px', right: '72px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
        >
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '1px', height: '56px', background: 'linear-gradient(to bottom, transparent, rgba(200,218,43,0.7))' }}
          />
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(200,218,43,0.5)', writingMode: 'vertical-rl', margin: 0 }}>scroll</p>
        </motion.div>

        {/* Corner label */}
        <div style={{ position: 'absolute', top: '72px', right: '72px' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.3)', margin: 0, textAlign: 'right' }}>
            JunctionX Tirana 2026<br />AADF Pyramid Backstage Challenge
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TICKER
      ══════════════════════════════════════════════════════ */}
      <Ticker />

      {/* ══════════════════════════════════════════════════════
          02 · STATS — concrete bone
      ══════════════════════════════════════════════════════ */}
      <motion.section
        variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }}
        style={{ borderBottom: '2px solid var(--color-concrete-char)' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {[
            { target: 80,   suffix: '+',  label: 'bookable spaces',    sub: 'across 5 floors' },
            { target: 3500, suffix: 'm²', label: 'total leasable area', sub: 'indoor + outdoor' },
            { target: 300,  suffix: '',   label: 'max capacity pax',   sub: 'blue space seated' },
            { target: 90,   suffix: 's',  label: 'full booking cycle',  sub: 'request to confirmed' },
          ].map(({ target, suffix, label, sub }, i) => (
            <motion.div key={label} variants={fadeUp} style={{ padding: '56px 40px', borderRight: i < 3 ? '2px solid var(--color-concrete-char)' : 'none' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '52px', fontWeight: 500, color: 'var(--color-concrete-char)', margin: '0 0 8px', letterSpacing: '-0.02em', lineHeight: 1 }}>
                {i === 3 ? '< ' : ''}<Counter target={target} suffix={suffix} />
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em', color: 'var(--color-concrete-char)', margin: '0 0 6px', textTransform: 'uppercase' }}>{label}</p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--color-concrete-gray)', margin: 0 }}>{sub}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════
          02b · BLUEPRINT — ground floor plan reference
      ══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--color-concrete-char)', borderBottom: '2px solid var(--color-lime)' }}>
        {/* Section header */}
        <div style={{ padding: '64px 72px 48px', borderBottom: '1px solid rgba(245,245,240,0.08)', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 16px' }}>
              architectural reference · ground floor
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-bone)', margin: 0, lineHeight: 1.0 }}>
              Every space,<br />every centimetre.
            </motion.h2>
          </motion.div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.3 }}
            style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(245,245,240,0.45)', maxWidth: '320px', textAlign: 'right', lineHeight: 1.65, margin: 0 }}
          >
            The existing architectural floor plan of the Pyramid — digitised, labelled, and wired to real-time availability data.
          </motion.p>
        </div>

        {/* Twin plan panels */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {/* Ground floor plan */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE }}
            style={{ position: 'relative', borderRight: '2px solid rgba(245,245,240,0.08)', overflow: 'hidden' }}
          >
            <img
              src="/references/current-site-plan-ground.png"
              alt="Ground floor architectural plan"
              style={{ width: '100%', height: '480px', objectFit: 'cover', objectPosition: 'center', display: 'block', filter: 'contrast(1.08) brightness(0.9)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)' }} />
            {/* Plan label */}
            <div style={{ position: 'absolute', bottom: '28px', left: '28px', right: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 6px' }}>ground floor · L0</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--color-concrete-bone)', margin: 0 }}>Radial annular ring</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(245,245,240,0.5)', margin: '4px 0 0' }}>16 bookable extension rooms · A1 – A16</p>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.25)', border: '1px solid rgba(245,245,240,0.12)', padding: '4px 8px' }}>ref. plan</span>
            </div>
          </motion.div>

          {/* Exterior plan */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.1 }}
            style={{ position: 'relative', overflow: 'hidden' }}
          >
            <img
              src="/references/current-site-plan-exterior.png"
              alt="Exterior spaces floor plan"
              style={{ width: '100%', height: '480px', objectFit: 'cover', objectPosition: 'center', display: 'block', filter: 'contrast(1.08) brightness(0.9)' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.8) 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: '28px', left: '28px', right: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#f4a261', margin: '0 0 6px' }}>exterior · rooftop</p>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 500, color: 'var(--color-concrete-bone)', margin: 0 }}>MVRDV colour boxes</p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'rgba(245,245,240,0.5)', margin: '4px 0 0' }}>16 exterior stacked volumes · B1 – B16</p>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.25)', border: '1px solid rgba(245,245,240,0.12)', padding: '4px 8px' }}>ref. plan</span>
            </div>
          </motion.div>
        </div>

        {/* Bottom strip: plan legend */}
        <div style={{ padding: '24px 72px', borderTop: '1px solid rgba(245,245,240,0.08)', display: 'flex', gap: '48px', alignItems: 'center' }}>
          {[
            { label: 'available', color: 'var(--color-lime)' },
            { label: 'reserved',  color: '#e63946' },
            { label: 'pending',   color: '#f4a261' },
            { label: 'blocked',   color: '#6b7280' },
          ].map(({ label, color }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '10px', height: '10px', backgroundColor: color, display: 'inline-block', flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.4)' }}>{label}</span>
            </div>
          ))}
          <div style={{ marginLeft: 'auto' }}>
            <Link href="/spaces" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '10px 24px', display: 'inline-block' }}>
              open interactive plan →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          03 · FLOOR SELECTOR — front elevation with interactive pills
      ══════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '2px solid var(--color-concrete-char)', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 4fr', minHeight: '680px' }}>
          {/* Elevation photo */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRight: '2px solid var(--color-concrete-char)' }}>
            <ParallaxImage src="/pyramid/mvrdv-28.jpg" />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent 60%, rgba(10,10,10,0.3) 100%)' }} />

            {/* Pill overlays — positioned over the pyramid elevation */}
            {FLOORS.map((floor, i) => (
              <motion.div
                key={floor.key}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 + 0.3, duration: 0.5, ease: EASE }}
                style={{ position: 'absolute', top: floor.top, left: '50%', transform: 'translateX(-50%)' }}
              >
                <Pill label={floor.label} active={activeFloor === floor.key} onClick={() => setActiveFloor(floor.key)} />
              </motion.div>
            ))}

            {/* Caption */}
            <div style={{ position: 'absolute', bottom: '24px', left: '28px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.45)', margin: 0 }}>
                front elevation · select a floor
              </p>
            </div>
          </div>

          {/* Right: floor info */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '72px 56px', backgroundColor: 'var(--color-concrete-bone)' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 20px' }}>
                the building
              </motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: '42px', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--color-concrete-char)', margin: '0 0 20px', lineHeight: 1.1 }}>
                five floors.<br />one system.
              </motion.h2>
              <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-concrete-gray)', margin: '0 0 40px', lineHeight: 1.7 }}>
                From the rooftop MVRDV boxes to the underground B1 level, every square metre is catalogued, priced, and bookable in real time. Click a floor to explore.
              </motion.p>

              {/* Floor list */}
              {FLOORS.map((floor, i) => (
                <motion.button
                  key={floor.key}
                  variants={fadeUp}
                  onClick={() => setActiveFloor(floor.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px',
                    padding: '14px 0',
                    borderBottom: '1px solid var(--color-concrete-mid)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', textAlign: 'left', width: '100%',
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: activeFloor === floor.key ? 'var(--color-lime-ink)' : 'var(--color-concrete-gray)', backgroundColor: activeFloor === floor.key ? 'var(--color-lime)' : 'transparent', padding: '2px 6px', transition: 'all 0.2s', minWidth: '28px', textAlign: 'center' }}>
                    0{i + 1}
                  </span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: activeFloor === floor.key ? 'var(--color-concrete-char)' : 'var(--color-concrete-gray)', transition: 'color 0.2s' }}>
                    {floor.label}
                  </span>
                  {activeFloor === floor.key && (
                    <motion.span layoutId="floor-indicator" style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '2px 8px' }}>
                      selected
                    </motion.span>
                  )}
                </motion.button>
              ))}

              <motion.div variants={fadeUp} style={{ marginTop: '36px' }}>
                <Link href="/spaces" style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '14px 32px', display: 'inline-block' }}>
                  open floor plans
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          04 · ATRIUM INTERIOR — full bleed cinematic
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '90vh', minHeight: '640px', overflow: 'hidden', borderBottom: '2px solid var(--color-concrete-char)' }}>
        <ParallaxImage src="/pyramid/mvrdv-15.jpg" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(10,10,10,0.85) 42%, transparent 75%)' }} />

        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', padding: '0 72px' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-120px' }} variants={stagger} style={{ maxWidth: '520px' }}>
            <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 20px' }}>
              interior · the atrium
            </motion.p>
            <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 64px)', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--color-concrete-bone)', margin: '0 0 24px', lineHeight: 1.05 }}>
              MVRDV coloured boxes stacked inside concrete.
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'rgba(245,245,240,0.6)', margin: '0 0 40px', lineHeight: 1.7 }}>
              Six jewel-coloured volumes suspended within the atrium — blue, orange, green, red, purple, yellow. Each one a distinct bookable space. Each one visible from every floor.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { label: 'blue',   color: '#378ADD' },
                { label: 'orange', color: '#f4a261' },
                { label: 'green',  color: '#97C459' },
                { label: 'red',    color: '#e63946' },
                { label: 'purple', color: '#5a4fcf' },
                { label: 'yellow', color: '#f9c74f' },
              ].map(({ label, color }) => (
                <span key={label} style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#050505', backgroundColor: color, padding: '4px 10px' }}>{label}</span>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          04c · PHOTO STRIP — five real photographs
      ══════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '2px solid var(--color-concrete-char)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.4fr 1fr', height: '480px' }}>
          {[
            { src: '/pyramid/mvrdv-13.jpg', label: 'atrium · looking up',   pos: 'center bottom' },
            { src: '/pyramid/mvrdv-16.jpg', label: 'the oculus',             pos: 'center center' },
            { src: '/pyramid/mvrdv-10.jpg', label: 'coloured volumes',       pos: 'center center' },
            { src: '/pyramid/mvrdv-28.jpg', label: 'evening · exterior',     pos: 'center bottom' },
            { src: '/pyramid/mvrdv-21.jpg', label: 'glass floor · looking down', pos: 'center top' },
          ].map(({ src, label, pos }, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 1.04 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.8, ease: EASE, delay: i * 0.08 }}
              style={{
                position: 'relative',
                overflow: 'hidden',
                borderRight: i < 4 ? '2px solid var(--color-concrete-char)' : 'none',
                backgroundImage: `url(${src})`,
                backgroundSize: 'cover',
                backgroundPosition: pos,
              }}
            >
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.65) 0%, transparent 45%)' }} />
              <div style={{ position: 'absolute', bottom: '16px', left: '14px', right: '14px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.55)', margin: 0 }}>{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Credit strip */}
        <div style={{ padding: '10px 24px', backgroundColor: 'var(--color-concrete-char)', display: 'flex', justifyContent: 'flex-end' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.25)', margin: 0 }}>
            photography © Ossip van Duivenbode / Arch2O
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          04b · GROUND PLAN — full-bleed architectural closeup
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', borderBottom: '2px solid var(--color-concrete-char)' }}>
        {/* Giant plan image — fills the section */}
        <div style={{ position: 'relative', overflow: 'hidden', height: '72vh', minHeight: '520px' }}>
          <motion.div
            initial={{ scale: 1.06 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.4, ease: EASE }}
            style={{ position: 'absolute', inset: 0 }}
          >
            <img
              src="/references/current-site-plan-ground.png"
              alt="Ground floor plan closeup"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', filter: 'contrast(1.1) saturate(1.15)' }}
            />
          </motion.div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(10,10,10,0.72) 0%, rgba(10,10,10,0.1) 55%, transparent 100%)' }} />

          {/* Floating annotation boxes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
            style={{ position: 'absolute', top: '36px', left: '60px', maxWidth: '480px' }}
          >
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.24em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 14px' }}>
              ground floor · L0 · annular plan
            </p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-bone)', margin: 0, lineHeight: 0.96 }}>
              The ring of<br />sixteen rooms.
            </h2>
          </motion.div>

          {/* Space count badges */}
          <motion.div
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{ position: 'absolute', bottom: '40px', left: '60px', display: 'flex', gap: '12px' }}
          >
            {[
              { n: '16', label: 'extension rooms', color: 'var(--color-lime)' },
              { n: '80+', label: 'total spaces', color: '#378ADD' },
              { n: '5', label: 'floors mapped', color: '#f4a261' },
            ].map(({ n, label, color }) => (
              <div key={label} style={{ backgroundColor: 'rgba(10,10,10,0.8)', border: `2px solid ${color}`, padding: '16px 24px' }}>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 500, color, margin: '0 0 4px', letterSpacing: '-0.01em' }}>{n}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.45)', margin: 0 }}>{label}</p>
              </div>
            ))}
          </motion.div>

          {/* Right side annotation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
            style={{ position: 'absolute', top: '50%', right: '60px', transform: 'translateY(-50%)', textAlign: 'right', maxWidth: '280px' }}
          >
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(245,245,240,0.6)', margin: '0 0 20px', lineHeight: 1.65 }}>
              Radial geometry derived directly from the Pyramid&apos;s architecture. Every SVG arc matches the actual building.
            </p>
            <Link href="/spaces" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-lime)', border: '1px solid var(--color-lime)', padding: '8px 16px', display: 'inline-block' }}>
              explore the plan →
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          05 · SPACE TYPES GRID
      ══════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '2px solid var(--color-concrete-char)' }}>
        <div style={{ padding: '80px 72px 0', borderBottom: '2px solid var(--color-concrete-char)' }}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: '40px' }}>
            <motion.div variants={fadeUp}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>space categories</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--color-concrete-char)', margin: 0, lineHeight: 1.1 }}>
                every type of<br />event. one building.
              </h2>
            </motion.div>
            <motion.div variants={fadeUp}>
              <Link href="/spaces" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-concrete-char)', border: '2px solid var(--color-concrete-char)', padding: '12px 24px', display: 'inline-block' }}>
                view all spaces
              </Link>
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)' }}
        >
          <SpaceCard color="#378ADD" label="Hero Spaces" count={4}  area="120–240" rate={180} />
          <div style={{ borderLeft: '2px solid var(--color-concrete-char)', borderRight: '2px solid var(--color-concrete-char)' }}>
            <SpaceCard color="#f4a261" label="Extension Rooms" count={19} area="80–110" rate={120} />
          </div>
          <SpaceCard color="#97C459" label="Exterior Boxes" count={16} area="86–192" rate={95} />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          06 · THREE-QUARTER AERIAL — full bleed
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '80vh', minHeight: '560px', overflow: 'hidden', borderBottom: '2px solid var(--color-concrete-char)' }}>
        <ParallaxImage src="/pyramid/mvrdv-9.jpg" />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10,10,10,0.45)' }} />

        {/* Centered quote */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 72px' }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-120px' }} variants={stagger}
            style={{ textAlign: 'center', maxWidth: '800px' }}
          >
            <motion.div variants={fadeUp} style={{ width: '2px', height: '64px', backgroundColor: 'var(--color-lime)', margin: '0 auto 32px' }} />
            <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 68px)', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--color-concrete-bone)', margin: '0 0 24px', lineHeight: 1.05 }}>
              The building is the interface.
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'rgba(245,245,240,0.6)', margin: 0, lineHeight: 1.6 }}>
              Every interactive floor plan traces the actual geometry of the Pyramid. Every space you click is a real room you can book.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          07 · HOW IT WORKS — dark bg, numbered steps
      ══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--color-concrete-char)', borderBottom: '2px solid var(--color-concrete-char)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
          {/* Left: steps */}
          <div style={{ padding: '96px 72px', borderRight: '2px solid rgba(245,245,240,0.08)' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 24px' }}>
                how it works
              </motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--color-concrete-bone)', margin: '0 0 64px', lineHeight: 1.1 }}>
                from request to<br />ready in minutes.
              </motion.h2>

              {[
                { n: '01', title: 'browse the building', body: 'Navigate 5 floors via interactive architectural SVG plans. Every space colour-coded by live availability.' },
                { n: '02', title: 'fill one form', body: 'Tell us the date, headcount, and setup type. The system matches the right space and reserves compatible assets.' },
                { n: '03', title: 'accept the quote', body: 'A detailed line-item quote is generated in seconds. Accept it and the booking is confirmed.' },
                { n: '04', title: 'tasks auto-generate', body: 'Setup, AV calibration, catering prep, teardown — all scheduled with assigned teams before you close the tab.' },
              ].map(({ n, title, body }, i) => (
                <motion.div
                  key={n}
                  variants={fadeUp}
                  style={{ display: 'flex', gap: '28px', paddingBottom: '40px', borderBottom: i < 3 ? '1px solid rgba(245,245,240,0.08)' : 'none', marginBottom: i < 3 ? '40px' : 0 }}
                >
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', color: 'var(--color-lime)', flexShrink: 0, paddingTop: '2px', minWidth: '32px' }}>{n}</span>
                  <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-concrete-bone)', margin: '0 0 8px' }}>{title}</p>
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-concrete-gray)', margin: 0, lineHeight: 1.65 }}>{body}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: interior boxes detail photo */}
          <div style={{ position: 'relative', minHeight: '600px', overflow: 'hidden' }}>
            <ParallaxImage src="/pyramid/mvrdv-11.jpg" />
            {/* Spec callout overlay */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
              style={{ position: 'absolute', bottom: '40px', left: '40px', border: '2px solid var(--color-lime)', backgroundColor: 'var(--color-concrete-char)', padding: '20px 24px' }}
            >
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 8px' }}>blue space · L0</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '24px', fontWeight: 500, color: 'var(--color-concrete-bone)', margin: '0 0 4px', letterSpacing: '-0.01em' }}>240 m²</p>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-concrete-gray)', margin: '0 0 12px' }}>300 pax · €180/hr</p>
              <Link href="/spaces/blue" style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-lime)' }}>
                view space →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          08 · WIDE CONTEXT — city aerial
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '70vh', minHeight: '480px', overflow: 'hidden', borderBottom: '2px solid var(--color-concrete-char)' }}>
        <ParallaxImage src="/pyramid/mvrdv-30.jpg" />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,10,10,0.2) 0%, rgba(10,10,10,0.65) 100%)' }} />

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}
          style={{ position: 'absolute', bottom: '56px', left: '72px', right: '72px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}
        >
          <motion.div variants={fadeUp}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 12px' }}>Tirana, Albania · street level</p>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--color-concrete-bone)', margin: 0, lineHeight: 1.1 }}>
              A building you<br />walk on top of.
            </h2>
          </motion.div>
          <motion.div variants={fadeUp} style={{ textAlign: 'right' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.5)', margin: 0, lineHeight: 1.8 }}>
              Blvd. Dëshmorët e Kombit<br />Tirana, 1001<br />Albania
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          09 · ENTRANCE + CTA — ground level photo
      ══════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '2px solid var(--color-concrete-char)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '560px' }}>
          {/* Entrance photo */}
          <div style={{ position: 'relative', overflow: 'hidden', borderRight: '2px solid var(--color-concrete-char)' }}>
            <ParallaxImage src="/pyramid/mvrdv-17.jpg" />
          </div>

          {/* CTA panel */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '80px 72px', backgroundColor: 'var(--color-concrete-bone)' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 20px' }}>
                ready to book
              </motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--color-concrete-char)', margin: '0 0 20px', lineHeight: 1.1 }}>
                Replace 30 emails<br />with one sentence.
              </motion.h2>
              <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-concrete-gray)', margin: '0 0 48px', lineHeight: 1.7 }}>
                Pick a space, set the date, accept the quote. The Piramida Backstage assistant handles the rest — assets, tasks, coordination.
              </motion.p>

              {/* Feature list */}
              <motion.div variants={stagger} style={{ marginBottom: '48px' }}>
                {[
                  'Real-time availability across all 80+ spaces',
                  'Instant quote with line-item breakdown',
                  'Auto-generated setup and teardown tasks',
                  'Conflict detection and resolution',
                  'AI assistant for natural-language booking',
                ].map((feat) => (
                  <motion.div key={feat} variants={fadeUp} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--color-concrete-mid)' }}>
                    <span style={{ width: '6px', height: '6px', backgroundColor: 'var(--color-lime)', flexShrink: 0, marginTop: '6px' }} />
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--color-concrete-char)', margin: 0 }}>{feat}</p>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: 'flex', gap: '16px' }}>
                <Link href="/spaces" style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '16px 36px', display: 'inline-block' }}>
                  book a space
                </Link>
                <Link href="/dashboard" style={{ fontFamily: 'var(--font-display)', fontSize: '12px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-concrete-char)', border: '2px solid var(--color-concrete-char)', padding: '14px 36px', display: 'inline-block' }}>
                  organizer view
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          10 · AERIAL B CLOSE — rooftop boxes
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', height: '60vh', minHeight: '400px', overflow: 'hidden', borderBottom: '2px solid var(--color-concrete-char)' }}>
        <ParallaxImage src="/pyramid/mvrdv-26.jpg" />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,10,10,0.35)' }} />
        <motion.div
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          style={{ position: 'absolute', top: '56px', right: '72px', maxWidth: '340px', textAlign: 'right' }}
        >
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 12px' }}>rooftop · exterior</p>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 500, letterSpacing: '-0.01em', color: 'var(--color-concrete-bone)', margin: '0 0 12px', lineHeight: 1.1 }}>
            People climb the roof. You book what&apos;s at the top.
          </h3>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'rgba(245,245,240,0.55)', margin: 0 }}>
            Yellow, maroon, blue, orange — each rooftop box is a distinct bookable volume with panoramic views across Tirana.
          </p>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          11 · NAVIGATE EVERY FLOOR — floor selector UI showcase
      ══════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: 'var(--color-concrete-bone)', borderBottom: '2px solid var(--color-concrete-char)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '4fr 5fr', minHeight: '600px' }}>
          {/* Left: copy */}
          <div style={{ padding: '96px 72px', borderRight: '2px solid var(--color-concrete-char)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 20px' }}>
                floor navigation
              </motion.p>
              <motion.h2 variants={fadeUp} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 4vw, 56px)', fontWeight: 500, letterSpacing: '-0.02em', color: 'var(--color-concrete-char)', margin: '0 0 24px', lineHeight: 1.05 }}>
                Select a floor.<br />The plan appears.
              </motion.h2>
              <motion.p variants={fadeUp} style={{ fontFamily: 'var(--font-body)', fontSize: '15px', color: 'var(--color-concrete-gray)', margin: '0 0 48px', lineHeight: 1.7 }}>
                The front elevation of the Pyramid doubles as the navigation. Click a level — the floor plan updates instantly, showing real-time availability colour-coded on every space.
              </motion.p>

              {/* Feature chips */}
              <motion.div variants={stagger} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {[
                  { n: '01', label: 'Elevation photo as nav UI' },
                  { n: '02', label: 'Radial SVG plans per floor' },
                  { n: '03', label: 'Live colour-coded availability' },
                  { n: '04', label: 'Click any space → booking flow' },
                ].map(({ n, label }) => (
                  <motion.div key={n} variants={fadeUp} style={{ display: 'flex', gap: '20px', alignItems: 'center', padding: '16px 0', borderBottom: '1px solid var(--color-concrete-mid)' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '2px 6px', flexShrink: 0 }}>{n}</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--color-concrete-char)' }}>{label}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div variants={fadeUp} style={{ marginTop: '40px' }}>
                <Link href="/spaces" style={{ fontFamily: 'var(--font-display)', fontSize: '11px', fontWeight: 500, letterSpacing: '0.14em', textTransform: 'uppercase', textDecoration: 'none', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '14px 32px', display: 'inline-block' }}>
                  try it now
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: floor selector screenshot */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.9, ease: EASE }}
            style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#0a0a0a' }}
          >
            <img
              src="/references/current-site-floor-selector.png"
              alt="Piramida floor selector interface"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block', opacity: 0.85 }}
            />
            {/* Overlay: label this as existing UI reference */}
            <div style={{ position: 'absolute', top: '28px', right: '28px', backgroundColor: 'rgba(10,10,10,0.85)', border: '1px solid rgba(245,245,240,0.15)', padding: '10px 16px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.4)', margin: 0 }}>
                reference · piramida.edu.al
              </p>
            </div>
            {/* Bottom gradient */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,10,10,0.6) 0%, transparent 40%)' }} />
            {/* Bottom tag */}
            <div style={{ position: 'absolute', bottom: '28px', left: '28px' }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-lime)', margin: '0 0 4px' }}>our new system</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 500, color: 'var(--color-concrete-bone)', margin: 0 }}>Rebuilt from the ground up</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: 'var(--color-concrete-char)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', padding: '72px', gap: '0', borderBottom: '1px solid rgba(245,245,240,0.08)' }}>
          {/* Brand */}
          <div style={{ paddingRight: '48px', borderRight: '1px solid rgba(245,245,240,0.08)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '20px' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-concrete-bone)' }}>piramida</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-lime-ink)', backgroundColor: 'var(--color-lime)', padding: '0 5px' }}>backstage</span>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--color-concrete-gray)', margin: 0, lineHeight: 1.65, maxWidth: '260px' }}>
              Event space management for the Pyramid of Tirana. Built for JunctionX Tirana 2026.
            </p>
          </div>

          {/* Links */}
          <div style={{ padding: '0 48px', borderRight: '1px solid rgba(245,245,240,0.08)' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 20px' }}>navigation</p>
            {[
              { label: 'spaces',    href: '/spaces' },
              { label: 'book',      href: '/book' },
              { label: 'dashboard', href: '/dashboard' },
            ].map(({ label, href }) => (
              <Link key={label} href={href} style={{ display: 'block', fontFamily: 'var(--font-display)', fontSize: '13px', letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none', color: 'rgba(245,245,240,0.5)', marginBottom: '12px' }}>
                {label}
              </Link>
            ))}
          </div>

          {/* Project info */}
          <div style={{ paddingLeft: '48px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--color-concrete-gray)', margin: '0 0 20px' }}>project</p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'rgba(245,245,240,0.5)', margin: 0, lineHeight: 1.65 }}>
              JunctionX Tirana 2026<br />AADF Pyramid Backstage Challenge<br />The Pyramid of Tirana<br />Designed by MVRDV, 2023
            </p>
          </div>
        </div>
        <div style={{ padding: '24px 72px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.25)', margin: 0 }}>
            © 2026 Piramida Backstage
          </p>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,245,240,0.25)', margin: 0 }}>
            Next.js · Supabase · Gemini · GSAP · Framer Motion
          </p>
        </div>
      </footer>
    </div>
  )
}
