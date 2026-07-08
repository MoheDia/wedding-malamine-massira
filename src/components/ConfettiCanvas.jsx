import { useEffect, useRef } from 'react'

const COLS = ['#D4AF37','#EDD46A','#C2768A','#EFC4D4','#B5890C','#F0D080','#8A3A56']

function mkConfetto(W) {
  return {
    x:     Math.random() * W,
    y:     -20 - Math.random() * 80,
    w:     6 + Math.random() * 10,
    h:     8 + Math.random() * 14,
    color: COLS[Math.floor(Math.random() * COLS.length)],
    vx:    (Math.random() - .5) * 3,
    vy:    2.5 + Math.random() * 3.5,
    angle: Math.random() * Math.PI * 2,
    va:    (Math.random() - .5) * .18,
    alpha: .85,
  }
}

export default function ConfettiCanvas({ duration = 3500 }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W   = canvas.width  = window.innerWidth
    const H   = canvas.height = window.innerHeight

    const pieces  = Array.from({ length: 90 }, () => mkConfetto(W))
    const startTs = Date.now()
    let raf

    function draw() {
      const elapsed = Date.now() - startTs
      ctx.clearRect(0, 0, W, H)

      for (const p of pieces) {
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.angle)
        ctx.globalAlpha = p.alpha
        ctx.fillStyle   = p.color
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
        ctx.restore()

        p.x += p.vx; p.y += p.vy; p.angle += p.va
        if (elapsed > duration * .65) p.alpha -= .012
        if (p.y > H + 20 || p.alpha <= 0) Object.assign(p, mkConfetto(W))
      }

      if (elapsed < duration + 400) raf = requestAnimationFrame(draw)
      else canvas.style.display = 'none'
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [duration])

  return (
    <canvas
      ref={ref}
      style={{ position:'fixed', inset:0, zIndex:800, pointerEvents:'none' }}
    />
  )
}
