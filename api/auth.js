// Vercel serverless function — les codes ne sont JAMAIS dans le bundle client
// Ils vivent uniquement dans les variables d'environnement Vercel.

const jwt = require('jsonwebtoken');

// Rate limiting en mémoire (par instance, suffisant pour un site de mariage)
const attempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS    = 15 * 60 * 1000; // 15 minutes

function isRateLimited(ip) {
  const now = Date.now();
  const rec = attempts.get(ip) || { count: 0, resetAt: now + WINDOW_MS };
  if (now > rec.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (rec.count >= MAX_ATTEMPTS) return true;
  rec.count++;
  attempts.set(ip, rec);
  return false;
}

module.exports = async function handler(req, res) {
  // CORS headers (requêtes depuis le même domaine Vercel)
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  // Rate limiting
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' });
  }

  // Validation de l'entrée
  const { code } = req.body || {};
  if (!code || typeof code !== 'string' || code.length > 64) {
    return res.status(400).json({ error: 'Requête invalide' });
  }

  const normalised = code.trim().toLowerCase();

  // Correspondance des codes (depuis les variables d'environnement)
  const CODES = {
    [process.env.CODE_CEREMONY]: 'ceremony',
    [process.env.CODE_FULL]:     'full',
  };

  const level = CODES[normalised];
  if (!level) {
    // Délai artificiel pour ralentir le brute-force
    await new Promise(r => setTimeout(r, 400 + Math.random() * 200));
    return res.status(401).json({ error: 'Code invalide' });
  }

  // Signature JWT côté serveur — le secret ne quitte jamais le serveur
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    console.error('JWT_SECRET manquant dans les variables d\'environnement');
    return res.status(500).json({ error: 'Erreur de configuration serveur' });
  }

  const token = jwt.sign({ level }, secret, { expiresIn: '30d' });
  return res.status(200).json({ token });
};
