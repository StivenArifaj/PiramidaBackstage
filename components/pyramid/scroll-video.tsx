'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

interface ScrollVideoProps {
  framesFolder: string
  frameCount: number
  overlayTitle: string
  overlaySubtitle: string
  overlayLabel?: string
  children?: ReactNode
  scrollHeight?: string
  reversed?: boolean
}

export function ScrollVideo({
  framesFolder,
  frameCount,
  overlayTitle,
  overlaySubtitle,
  overlayLabel,
  children,
  scrollHeight = '300vh',
  reversed = false,
}: ScrollVideoProps) {
  const canvasRef      = useRef<HTMLCanvasElement>(null)
  const containerRef   = useRef<HTMLDivElement>(null)
  const counterRef     = useRef<HTMLParagraphElement>(null)
  const progressRef    = useRef<HTMLDivElement>(null)
  const framesRef      = useRef<HTMLImageElement[]>([])
  const currentIdxRef  = useRef(0)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resizeCanvas() {
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    function drawFrame(index: number) {
      const img = framesRef.current[Math.round(index)]
      if (!img?.complete || !ctx || !canvas) return
      const cw = canvas.width
      const ch = canvas.height
      const nw = img.naturalWidth  || 1920
      const nh = img.naturalHeight || 1080
      const scale = Math.max(cw / nw, ch / nh)
      const w = nw * scale
      const h = nh * scale
      ctx.clearRect(0, 0, cw, ch)
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    }

    resizeCanvas()

    const firstIdx = reversed ? frameCount - 1 : 0
    const frames: HTMLImageElement[] = new Array(frameCount)

    // Load the starting frame first so the skeleton clears immediately
    const startImg = new Image()
    startImg.src = `${framesFolder}/${String(firstIdx + 1).padStart(4, '0')}.jpg`
    startImg.onload = () => {
      drawFrame(firstIdx)
      setLoaded(true)
    }
    frames[firstIdx] = startImg

    // Load all other frames (order doesn't affect array index)
    for (let i = 0; i < frameCount; i++) {
      if (i === firstIdx) continue
      const img = new Image()
      img.src = `${framesFolder}/${String(i + 1).padStart(4, '0')}.jpg`
      frames[i] = img
    }
    framesRef.current = frames

    function onResize() {
      resizeCanvas()
      drawFrame(currentIdxRef.current)
    }
    window.addEventListener('resize', onResize)

    let killTween: (() => void) | undefined

    async function initGSAP() {
      const { gsap }         = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const startFrame = reversed ? frameCount - 1 : 0
      const endFrame   = reversed ? 0 : frameCount - 1
      const obj = { frame: startFrame }
      const tween = gsap.to(obj, {
        frame: endFrame,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate(self) {
            const p   = self.progress
            const num = reversed
              ? frameCount - Math.round(p * (frameCount - 1))
              : Math.round(p * (frameCount - 1)) + 1
            if (counterRef.current) {
              counterRef.current.textContent =
                `FRAME ${String(num).padStart(4, '0')} / ${String(frameCount).padStart(4, '0')} · SCROLL ↓`
            }
            if (progressRef.current) {
              progressRef.current.style.width = `${p * 100}%`
            }
          },
        },
        onUpdate() {
          const idx = Math.round(obj.frame)
          currentIdxRef.current = idx
          drawFrame(idx)
        },
      })

      killTween = () => {
        tween.kill()
        ScrollTrigger.getAll().forEach(t => t.kill())
      }
    }

    initGSAP()

    return () => {
      window.removeEventListener('resize', onResize)
      killTween?.()
    }
  }, [framesFolder, frameCount, reversed])

  return (
    <div ref={containerRef} style={{ height: scrollHeight }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          width: '100%',
          height: '100vh',
          overflow: 'hidden',
          backgroundColor: 'var(--color-concrete-black)',
        }}
      >
        {/* Canvas — cover-fit render */}
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        />

        {/* Flat dark scrim — no gradient, per design system */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(10,10,10,0.22)',
            pointerEvents: 'none',
          }}
        />

        {/* Loading skeleton */}
        {!loaded && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'var(--color-concrete-char)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(245,245,240,0.3)',
                margin: 0,
              }}
            >
              loading frames...
            </p>
          </div>
        )}

        {/* ── LIQUID GLASS WATERMARK MASK — z:10, sits BEHIND all text overlays ──
            Covers "BSM 4K BLEDI STRAKOSHA MEDIA" baked into video frames.
            Positioned here in the DOM (before text blocks) so it is naturally
            lower in the stacking context; explicit zIndex:10 < text zIndex:20.
            Rounded corners are an authorised design-system exception for this
            specific element only (master-plan override).                        */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '8%',
            width: '90%',
            maxWidth: '800px',
            height: '180px',
            borderRadius: '24px',
            backdropFilter: 'blur(40px)',
            WebkitBackdropFilter: 'blur(40px)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: 'var(--color-lime)', opacity: 0.7, flexShrink: 0 }} />
          <p style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(245,245,240,0.38)',
            margin: 0,
            textAlign: 'center',
          }}>
            [ PIRAMIDA BACKSTAGE // FEED ACTIVE ]
          </p>
        </div>

        {/* Frame counter — zIndex:20, above glass mask */}
        <p
          ref={counterRef}
          style={{
            position: 'absolute',
            top: '62px',
            right: '24px',
            fontFamily: 'var(--font-mono)',
            fontSize: '8px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(245,245,240,0.36)',
            margin: 0,
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          {`FRAME ${String(reversed ? frameCount : 1).padStart(4, '0')} / ${String(frameCount).padStart(4, '0')} · SCROLL ↓`}
        </p>

        {/* Text block — zIndex:20, always above glass mask */}
        <div
          style={{
            position: 'absolute',
            left: '48px',
            bottom: '56px',
            pointerEvents: 'none',
            zIndex: 20,
          }}
        >
          {overlayLabel && (
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '9px',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(245,245,240,0.48)',
                margin: '0 0 16px',
              }}
            >
              {overlayLabel}
            </p>
          )}
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(56px, 7vw, 96px)',
              fontWeight: 500,
              letterSpacing: '-0.02em',
              color: 'var(--color-concrete-bone)',
              margin: 0,
              lineHeight: 0.95,
            }}
          >
            {overlayTitle}
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              letterSpacing: '0.1em',
              color: 'rgba(245,245,240,0.4)',
              margin: '14px 0 0',
            }}
          >
            {overlaySubtitle}
          </p>
        </div>

        {/* Slot for absolutely-positioned overlays — zIndex:20, above glass mask.
            No pointerEvents override — children manage their own (e.g. Link buttons). */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 20 }}>
          {children}
        </div>

        {/* Watermark mask — Option A: hard geometric block (bottom-right)
            Covers the Ezgif.com attribution that appears in all 565 frames
            (300 hero + 265 detail-sample). Hard edges, brutalist-compliant. */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '0',
            width: '224px',
            height: '40px',
            backgroundColor: 'var(--color-concrete-black)',
            border: '2px solid rgba(245,245,240,0.06)',
            borderRight: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4,
            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '7px',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'rgba(245,245,240,0.1)',
              margin: 0,
            }}
          >
            [ MASK // WM ]
          </p>
        </div>

        {/* Progress bar — lime on translucent track */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            backgroundColor: 'rgba(245,245,240,0.1)',
            zIndex: 2,
          }}
        >
          <div
            ref={progressRef}
            style={{
              height: '100%',
              width: '0%',
              backgroundColor: 'var(--color-lime)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
