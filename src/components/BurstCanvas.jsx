import { useEffect, useRef } from 'react'

const COLORS = ['#D4AF37','#EDD46A','#F0D080','#C2768A','#EFC4D4','#B5890C','#FFFCF8']

export default function BurstCanvas({ onComplete }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx   = canvas.getContext('2d')
    const W     = canvas.width  = window.innerWidth
    const H     = canvas.height = window.innerHeight
    const cx = W / 2, cy = H / 2

    const particles = Array.from({ length: 120 }, (_, i) => {
      const angle = (Math.PI * 2 / 120) * i + (Math.random() - .5) * .2
      const speed = 3 + Math.random() * 9
      return {
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r:  2 + Math.random() * 5,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        alpha: 1,
        decay: .012 + Math.random() * .01,
        trail: [],
      }
    })

    let raf
    function draw() {
      ctx.clearRect(0, 0, W, H)
      let alive = 0
      for (const p of particles) {
        if (p.alpha <= 0) continue
        alive++
        p.trail.push({ x: p.x, y: p.y })
        if (p.trail.length > 6) p.trail.shift()

        for (let t = 0; t < p.trail.length - 1; t++) {
          const ta = (p.alpha * t / p.trail.length) * .4
          ctx.save()
          ctx.globalAlpha = ta
          ctx.strokeStyle = p.color
          ctx.lineWidth   = p.r * .5
          ctx.beginPath()
          ctx.moveTo(p.trail[t].x, p.trail[t].y)
          ctx.lineTo(p.trail[t+1].x, p.trail[t+1].y)
          ctx.stroke()
          ctx.restore()
        }

        ctx.save()
        ctx.globalAlpha = p.alpha
        ctx.fillStyle   = p.color
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        p.x += p.vx; p.y += p.vy
        p.vy += .12
        p.alpha -= p.decay
      }

      if (alive > 0) {
        raf = requestAnimationFrame(draw)
      } else {
        cancelAnimationFrame(raf)
        onComplete?.()
      }
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [onComplete])

  return (
    <canvas
      ref={ref}
      style={{ position:'fixed', inset:0, zIndex:900, pointerEvents:'none' }}
    />
  )
}
