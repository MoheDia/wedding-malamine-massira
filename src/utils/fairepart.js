async function ensureFonts() {
  await document.fonts.ready
}

function loadImage(src) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = src
  })
}

export async function generateFairePart(hasFull) {
  await ensureFonts()
  const danceImg = await loadImage('/images/dance.jpg')

  const W = 1200
  const H = hasFull ? 1700 : 1180
  const canvas = document.createElement('canvas')
  canvas.width  = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#FFFCF8')
  bg.addColorStop(0.5, '#FEF5EE')
  bg.addColorStop(1, '#FDF0F4')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Border frame
  ctx.strokeStyle = 'rgba(181,137,12,0.25)'
  ctx.lineWidth = 1
  ctx.strokeRect(36, 36, W - 72, H - 72)
  ctx.strokeStyle = 'rgba(181,137,12,0.12)'
  ctx.lineWidth = 1
  ctx.strokeRect(48, 48, W - 96, H - 96)

  // Corner ornaments
  const corners = [[64,64],[W-64,64],[64,H-64],[W-64,H-64]]
  corners.forEach(([x,y]) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.fillStyle = 'rgba(212,175,55,0.35)'
    ctx.font = '28px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('✦', 0, 0)
    ctx.restore()
  })

  // Top gold rule
  const grd = ctx.createLinearGradient(120, 0, W - 120, 0)
  grd.addColorStop(0, 'transparent')
  grd.addColorStop(0.5, '#D4AF37')
  grd.addColorStop(1, 'transparent')
  ctx.strokeStyle = grd
  ctx.lineWidth = 1.5
  ctx.beginPath(); ctx.moveTo(120, 130); ctx.lineTo(W - 120, 130); ctx.stroke()

  ctx.textAlign = 'center'

  // Chip
  ctx.fillStyle = '#C2768A'
  ctx.font = '600 22px "Lato", sans-serif'
  ctx.fillText('SAVE THE DATE', W / 2, 180)

  // Rope separator
  ctx.fillStyle = 'rgba(181,137,12,0.5)'
  ctx.font = '24px serif'
  ctx.fillText('— ♥ —', W / 2, 220)

  // Names
  ctx.fillStyle = '#B5890C'
  ctx.font = 'italic 900 118px "Playfair Display", Georgia, serif'
  ctx.fillText('Malamine', W / 2, 348)

  ctx.fillStyle = '#C2768A'
  ctx.font = 'italic 52px "Cormorant Garamond", Georgia, serif'
  ctx.fillText('& ', W / 2, 416)

  ctx.fillStyle = '#B5890C'
  ctx.font = 'italic 900 118px "Playfair Display", Georgia, serif'
  ctx.fillText('Massira', W / 2, 554)

  // Date block
  ctx.fillStyle = 'rgba(181,137,12,0.18)'
  roundRect(ctx, W/2 - 220, 590, 440, 110, 20)
  ctx.fill()

  ctx.fillStyle = '#2E1420'
  ctx.font = '300 32px "Lato", sans-serif'
  ctx.fillText('SAMEDI  3  OCTOBRE  2026', W / 2, 657)

  // Gold rule mid
  ctx.strokeStyle = grd
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(120, 730); ctx.lineTo(W - 120, 730); ctx.stroke()

  if (hasFull) {
    drawEventCard(ctx, W, 760,  '#C2768A', '💍', 'Mairie',    '14h30 — Parc du Souvenir Emile Fouchard', '77500 Chelles')
    drawEventCard(ctx, W, 1040, '#D4AF37', danceImg, 'Cérémonie', '17h00 — La Bella', '16 Rue de Pontault, 77680 Roissy-en-Brie')
  } else {
    drawEventCard(ctx, W, 760,  '#D4AF37', danceImg, 'Cérémonie', '17h00 — La Bella', '16 Rue de Pontault, 77680 Roissy-en-Brie')
  }

  // Footer
  const footerY = H - 80
  ctx.strokeStyle = grd
  ctx.beginPath(); ctx.moveTo(120, footerY - 30); ctx.lineTo(W - 120, footerY - 30); ctx.stroke()
  ctx.fillStyle = 'rgba(46,20,32,0.3)'
  ctx.font = 'italic 26px "Cormorant Garamond", Georgia, serif'
  ctx.fillText('Nous avons hâte de partager ce jour avec vous  ✦', W / 2, footerY)

  return new Promise(resolve => {
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob)
      const a   = document.createElement('a')
      a.href     = url
      a.download = 'faire-part-malamine-massira.jpg'
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
      resolve()
    }, 'image/jpeg', 0.96)
  })
}

function drawEventCard(ctx, W, y, color, icon, label, line1, line2) {
  const CARD_H = 250

  ctx.save()
  ctx.fillStyle = 'rgba(255,255,255,0.7)'
  roundRect(ctx, 110, y, W - 220, CARD_H, 20)
  ctx.fill()
  ctx.strokeStyle = color + '55'
  ctx.lineWidth = 1.5
  ctx.stroke()
  ctx.restore()

  const lineGrd = ctx.createLinearGradient(200, 0, W - 200, 0)
  lineGrd.addColorStop(0, 'transparent')
  lineGrd.addColorStop(0.5, color)
  lineGrd.addColorStop(1, 'transparent')
  ctx.strokeStyle = lineGrd
  ctx.lineWidth = 2
  ctx.beginPath(); ctx.moveTo(200, y + 2); ctx.lineTo(W - 200, y + 2); ctx.stroke()

  ctx.textAlign = 'center'

  // Icône — image ou emoji
  if (icon && typeof icon === 'object') {
    const size = 68
    const ix = W / 2 - size / 2
    const iy = y + 18
    ctx.save()
    ctx.globalCompositeOperation = 'multiply'
    ctx.drawImage(icon, ix, iy, size, size)
    ctx.restore()
  } else {
    ctx.fillStyle = color
    ctx.font = '38px serif'
    ctx.fillText(icon, W / 2, y + 58)
  }

  // Label événement
  ctx.fillStyle = color
  ctx.font = '600 24px "Lato", sans-serif'
  ctx.fillText(label.toUpperCase(), W / 2, y + 100)

  // Séparateur fin sous le label
  ctx.strokeStyle = color + '44'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(W/2 - 80, y + 116); ctx.lineTo(W/2 + 80, y + 116); ctx.stroke()

  // line1 — horaire + lieu principal
  ctx.fillStyle = 'rgba(46,20,32,0.78)'
  ctx.font = '300 28px "Lato", sans-serif'
  ctx.fillText(line1, W / 2, y + 160)

  // line2 — adresse
  ctx.fillStyle = 'rgba(122,72,88,0.72)'
  ctx.font = 'italic 24px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(line2, W / 2, y + 200)
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
