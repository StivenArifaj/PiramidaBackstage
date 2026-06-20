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
}

export function ScrollVideo({
  framesFolder,
  frameCount,
  overlayTitle,
  overlaySubtitle,
  overlayLabel,
  children,
  scrollHeight = '300vh',
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

    const frames: HTMLImageElement[] = []
    let firstLoaded = false

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      img.src = `${framesFolder}/${String(i).padStart(4, '0')}.jpg`
      img.onload = () => {
        if (!firstLoaded) {
          firstLoaded = true
          drawFrame(0)
          setLoaded(true)
        }
      }
      frames.push(img)
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

      const obj = { frame: 0 }
      const tween = gsap.to(obj, {
        frame: frameCount - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
          onUpdate(self) {
            const p   = self.progress
            const num = Math.round(p * (frameCount - 1)) + 1
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
  }, [framesFolder, frameCount])

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
            backgroundColor: 'rgba(10,10,10,0.38)',
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

        {/* Frame counter — just below BrandStrip (48px fixed header) */}
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
            zIndex: 2,
          }}
        >
          {`FRAME 0001 / ${String(frameCount).padStart(4, '0')} · SCROLL ↓`}
        </p>

        {/* Text block — bottom left */}
        <div
          style={{
            position: 'absolute',
            left: '48px',
            bottom: '56px',
            pointerEvents: 'none',
            zIndex: 2,
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
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5vw, 68px)',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: 'var(--color-concrete-bone)',
              margin: 0,
              lineHeight: 1,
            }}
          >
            {overlayTitle}
          </h2>
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

        {/* Slot for absolutely-positioned overlays (stats panel, CTAs, badges) */}
        {children}

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
