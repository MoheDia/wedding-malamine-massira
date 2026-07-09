import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const jwt     = require('jsonwebtoken')

const BODY_LIMIT = 4096

// Partagé entre les deux endpoints
const attempts = new Map()
const MAX_ATTEMPTS = 8
const WINDOW_MS    = 15 * 60 * 1000

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

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => {
      body += chunk
      if (body.length > BODY_LIMIT) {
        req.destroy()
        reject(new Error('Payload trop grand'))
      }
    })
    req.on('end', () => resolve(body))
    req.on('error', reject)
  })
}

function setCookie(res, token) {
  // Pas de flag Secure en dev HTTP
  res.setHeader('Set-Cookie', [
    `wdg_token=${token}; HttpOnly; SameSite=Strict; Max-Age=${7 * 24 * 3600}; Path=/`,
  ])
}

function localApiPlugin(env) {
  return {
    name: 'local-api',
    configureServer(server) {

      // POST /api/auth
      server.middlewares.use('/api/auth', async (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Méthode non autorisée' }))
        }
        const ip = req.socket?.remoteAddress || 'unknown'
        if (isRateLimited(ip)) {
          res.statusCode = 429
          return res.end(JSON.stringify({ error: 'Trop de tentatives.' }))
        }
        let rawBody
        try { rawBody = await readBody(req) }
        catch {
          res.statusCode = 413
          return res.end(JSON.stringify({ error: 'Payload trop grand' }))
        }
        try {
          const { code } = JSON.parse(rawBody || '{}')
          if (!code || typeof code !== 'string' || code.length > 64) {
            res.statusCode = 400
            return res.end(JSON.stringify({ error: 'Requête invalide' }))
          }
          const normalised = code.trim().toLowerCase()
          const CODES = {
            [env.CODE_CEREMONY]: 'ceremony',
            [env.CODE_FULL]:     'full',
          }
          const level = CODES[normalised]
          if (!level) {
            await new Promise(r => setTimeout(r, 400 + Math.random() * 200))
            res.statusCode = 401
            return res.end(JSON.stringify({ error: 'Code invalide' }))
          }
          const token = jwt.sign({ level }, env.JWT_SECRET, { expiresIn: '7d' })
          setCookie(res, token)
          res.statusCode = 200
          res.end(JSON.stringify({ ok: true }))
        } catch {
          res.statusCode = 500
          res.end(JSON.stringify({ error: 'Erreur serveur' }))
        }
      })

      // GET /api/verify
      server.middlewares.use('/api/verify', (req, res) => {
        res.setHeader('Content-Type', 'application/json')
        if (req.method !== 'GET') {
          res.statusCode = 405
          return res.end(JSON.stringify({ error: 'Méthode non autorisée' }))
        }
        const cookies = parseCookies(req.headers.cookie)
        const token   = cookies.wdg_token
        if (!token) {
          res.statusCode = 401
          return res.end(JSON.stringify({ error: 'Non authentifié' }))
        }
        try {
          const payload = jwt.verify(token, env.JWT_SECRET)
          res.statusCode = 200
          res.end(JSON.stringify({ level: payload.level }))
        } catch {
          res.setHeader('Set-Cookie', 'wdg_token=; HttpOnly; Max-Age=0; Path=/')
          res.statusCode = 401
          res.end(JSON.stringify({ error: 'Session expirée' }))
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), localApiPlugin(env)],
    build: { outDir: 'dist' },
  }
})
