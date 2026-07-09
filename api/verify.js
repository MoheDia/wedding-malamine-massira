// Vérifie le JWT depuis le cookie httpOnly et retourne le niveau d'accès.
// Ce endpoint est appelé au chargement de l'app pour restaurer la session.

const jwt = require('jsonwebtoken');

function parseCookies(header) {
  const cookies = {};
  if (!header) return cookies;
  header.split(';').forEach(c => {
    const [k, ...v] = c.trim().split('=');
    if (k) cookies[k.trim()] = v.join('=').trim();
  });
  return cookies;
}

module.exports = function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const cookies = parseCookies(req.headers.cookie);
  const token   = cookies.wdg_token;

  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'Erreur de configuration serveur' });
  }

  try {
    const payload = jwt.verify(token, secret);
    return res.status(200).json({ level: payload.level });
  } catch {
    // Token invalide ou expiré — supprimer le cookie
    res.setHeader('Set-Cookie', 'wdg_token=; HttpOnly; Max-Age=0; Path=/');
    return res.status(401).json({ error: 'Session expirée' });
  }
};
