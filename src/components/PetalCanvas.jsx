import { useEffect, useRef } from 'react'

const PETALS  = 22
const SPARKS  = 30

function rand(min, max) { return min + Math.random() * (max - min) }

function createPetal(W, H) {
  return {
    x:     rand(0, W),
    y:     rand(-H * .2, H * .8),
    r:     rand(5, 11),
    vx:    rand(-.4, .6),
    vy:    rand(.4, 1.2),
    angle: rand(0, Math.PI * 2),
    va:    rand(-.015, .015),
    alpha: rand(.25, .55),
    type:  Math.random() > .4 ? 'petal' : 'star',
  }
}

function createSpark(W, H) {
  return {
    x:     rand(0, W),
    y:     rand(-H, H),
    vy:    rand(.3, .9),
    vx:    rand(-.2, .2),
    life:  rand(.3, 1),
    decay: rand(.003, .007),
    size:  rand(1.5, 3.5),
  }
}

export default function PetalCanvas() {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, petals, sparks, raf

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      petals = Array.from({ length: PETALS }, () => createPetal(W, H))
      sparks = Array.from({ length: SPARKS }, () => createSpark(W, H))
    }

    function drawPetal(p) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.globalAlpha = p.alpha
      if (p.type === 'petal') {
        ctx.fillStyle = `rgba(228,160,180,${p.alpha})`
        ctx.beginPath()
        ctx.ellipse(0, 0, p.r, p.r * 1.7, 0, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.fillStyle = `rgba(212,175,55,${p.alpha * .9})`
        ctx.font = `${p.r * 2}px serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('✦', 0, 0)
      }
      ctx.restore()
    }

    function draw() {
      ctx.clearRect(0, 0, W, H)

      for (const p of petals) {
        drawPetal(p)
        p.x += p.vx; p.y += p.vy; p.angle += p.va
        if (p.y > H + 20) { Object.assign(p, createPetal(W, H), { y: -20 }) }
      }

      for (const s of sparks) {
        s.life -= s.decay
        if (s.life <= 0) { Object.assign(s, createSpark(W, H)) }
        ctx.save()
        ctx.globalAlpha = s.life * .6
        ctx.fillStyle   = `rgba(212,175,55,${s.life})`
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        s.x += s.vx; s.y += s.vy
      }

      raf = requestAnimationFrame(draw)
    }

    window.addEventListener('resize', resize)
    resize()
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <canvas
      ref={ref}
      style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        zIndex: 0, opacity: .55,
      }}
    />
  )
}
