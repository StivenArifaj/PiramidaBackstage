'use client'

import { useEffect, useRef } from 'react'

interface ScrollVideoProps {
  frameCount?: number
  frameDir?: string
  className?: string
}

export function ScrollVideo({ frameCount = 120, frameDir = '/frames', className }: ScrollVideoProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const framesRef = useRef<HTMLImageElement[]>([])
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const frames: HTMLImageElement[] = []
    let firstDrawn = false

    for (let i = 1; i <= frameCount; i++) {
      const img = new Image()
      img.src = `${frameDir}/${String(i).padStart(4, '0')}.webp`
      img.onload = () => {
        if (!firstDrawn) {
          canvas.width = img.naturalWidth || 1920
          canvas.height = img.naturalHeight || 1080
          ctx.drawImage(img, 0, 0)
          firstDrawn = true
        }
      }
      frames.push(img)
    }
    framesRef.current = frames

    function drawFrame(index: number) {
      const img = framesRef.current[Math.round(index)]
      if (!img?.complete || !ctx || !canvas) return
      canvas.width = img.naturalWidth || 1920
      canvas.height = img.naturalHeight || 1080
      ctx.drawImage(img, 0, 0)
    }

    async function initGSAP() {
      const { gsap } = await import('gsap')
      const { ScrollTrigger } = await import('gsap/ScrollTrigger')
      gsap.registerPlugin(ScrollTrigger)

      const obj = { frame: 0 }
      gsap.to(obj, {
        frame: frameCount - 1,
        snap: 'frame',
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.5,
        },
        onUpdate: () => drawFrame(obj.frame),
      })
    }

    initGSAP()
  }, [frameCount, frameDir])

  return (
    <div ref={containerRef} className={className} style={{ height: '300vh' }}>
      <div className="sticky top-0 w-full h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-concrete-black)' }}>
        <canvas ref={canvasRef} className="w-full h-full object-cover" />
      </div>
    </div>
  )
}
