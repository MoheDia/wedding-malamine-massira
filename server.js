import 'dotenv/config'
import express   from 'express'
import jwt       from 'jsonwebtoken'
import path      from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app  = express()
const PORT = process.env.PORT || 3000

// ── Vérification des variables d'environnement au démarrage ──
const REQUIRED_VARS = ['CODE_CEREMONY', 'CODE_FULL', 'JWT_SECRET']
const missing = REQUIRED_VARS.filter(v => !process.env[v])
if (missing.length > 0) {
  console.error(`[ERREUR] Variables d'environnement manquantes : ${missing.join(', ')}`)
  console.error('Créez un fichier .env ou configurez-les dans le panneau Hostinger.')
  process.exit(1)
}
console.log('[OK] Variables d\'environnement chargées :')
console.log(`  CODE_CEREMONY  : ${'*'.repeat(process.env.CODE_CEREMONY.length)}`)
console.log(`  CODE_FULL      : ${'*'.repeat(process.env.CODE_FULL.length)}`)
console.log(`  JWT_SECRET     : ${'*'.repeat(Math.min(process.env.JWT_SECRET.length, 8))}...`)

// ── Middlewares ──────────────────────────────────────────────
app.use(express.json({ limit: '4kb' }))

// ── Rate limiting en mémoire ─────────────────────────────────
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

function buildCookieHeader(token, req) {
  const isHttps = req.secure || req.headers['x-forwarded-proto'] === 'https'
  const parts = [
    `wdg_token=${token}`,
    'HttpOnly',
    isHttps ? 'Secure' : '',
    'SameSite=Strict',
    `Max-Age=${7 * 24 * 3600}`,
    'Path=/',
  ].filter(Boolean)
  return parts.join('; ')
}

// ── GET /api/health — diagnostic (à supprimer après déploiement) ──
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    env: {
      CODE_CEREMONY: process.env.CODE_CEREMONY ? 'défini' : 'MANQUANT',
      CODE_FULL:     process.env.CODE_FULL     ? 'défini' : 'MANQUANT',
      JWT_SECRET:    process.env.JWT_SECRET    ? 'défini' : 'MANQUANT',
    }
  })
})

// ── POST /api/auth ───────────────────────────────────────────
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
    [process.env.CODE_CEREMONY.trim().toLowerCase()]: 'ceremony',
    [process.env.CODE_FULL.trim().toLowerCase()]:     'full',
  }
  const level = CODES[normalised]

  if (!level) {
    await new Promise(r => setTimeout(r, 400 + Math.random() * 200))
    return res.status(401).json({ error: 'Code invalide' })
  }

  const token = jwt.sign({ level }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.setHeader('Set-Cookie', buildCookieHeader(token, req))
  return res.status(200).json({ ok: true })
})

// ── GET /api/verify ──────────────────────────────────────────
app.get('/api/verify', (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  const cookies = parseCookies(req.headers.cookie)
  const token   = cookies.wdg_token

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' })
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    return res.status(200).json({ level: payload.level })
  } catch {
    res.setHeader('Set-Cookie', 'wdg_token=; HttpOnly; Max-Age=0; Path=/')
    return res.status(401).json({ error: 'Session expirée' })
  }
})

// ── Fichiers statiques (build Vite) ──────────────────────────
app.use(express.static(path.join(__dirname, 'dist')))

// SPA fallback — toutes les routes non-API servent index.html
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// ── Démarrage ────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`)
})
