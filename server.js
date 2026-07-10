import 'dotenv/config'
import express   from 'express'
import jwt       from 'jsonwebtoken'
import path      from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 3000

// ── Middlewares ──────────────────────────────────────────
app.use(express.json({ limit: '4kb' }))

// ── Rate limiting en mémoire ─────────────────────────────
const attempts    = new Map()
const MAX_ATTEMPTS = 8
const WINDOW_MS   = 15 * 60 * 1000

function isRateLimited(ip) {
  const now = Date.now()
  const rec = attempts.get(ip) || { count: 0, resetAt: now + WINDOW_MS }
  if (now > rec.resetAt) { attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS }); return false }
  if (rec.count >= MAX_ATTEMPTS) return true
  rec.count++
  attempts.set(ip, rec)
  return false
}

function parseCookies(header) {
  const cookies = {}
  if (!header) return cookies
  header.split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=')
    if (k) cookies[k.trim()] = v.join('=').trim()
  })
  return cookies
}

// ── POST /api/auth ───────────────────────────────────────
app.post('/api/auth', async (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown'
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' })
  }

  const { code } = req.body || {}
  if (!code || typeof code !== 'string' || code.length > 64) {
    return res.status(400).json({ error: 'Requête invalide' })
  }

  const normalised = code.trim().toLowerCase()
  const CODES = {
    [process.env.CODE_CEREMONY]: 'ceremony',
    [process.env.CODE_FULL]:     'full',
  }
  const level = CODES[normalised]

  if (!level) {
    await new Promise(r => setTimeout(r, 400 + Math.random() * 200))
    return res.status(401).json({ error: 'Code invalide' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.error('JWT_SECRET manquant')
    return res.status(500).json({ error: 'Erreur de configuration serveur' })
  }

  const token = jwt.sign({ level }, secret, { expiresIn: '7d' })

  res.setHeader('Set-Cookie',
    `wdg_token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${7 * 24 * 3600}; Path=/`
  )
  return res.status(200).json({ ok: true })
})

// ── GET /api/verify ──────────────────────────────────────
app.get('/api/verify', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  const cookies = parseCookies(req.headers.cookie)
  const token   = cookies.wdg_token

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ error: 'Erreur de configuration serveur' })
  }

  try {
    const payload = jwt.verify(token, secret)
    return res.status(200).json({ level: payload.level })
  } catch {
    res.setHeader('Set-Cookie', 'wdg_token=; HttpOnly; Max-Age=0; Path=/')
    return res.status(401).json({ error: 'Session expirée' })
  }
})

// ── Fichiers statiques (build Vite) ──────────────────────
app.use(express.static(path.join(__dirname, 'dist')))

// SPA fallback — toutes les routes non-API servent index.html
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// ── Démarrage ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})
