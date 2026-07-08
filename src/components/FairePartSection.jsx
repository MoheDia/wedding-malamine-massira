import { useState } from 'react'
import { generateFairePart } from '../utils/fairepart.js'

export default function FairePartSection({ hasFull }) {
  const [busy, setBusy] = useState(false)

  async function download() {
    setBusy(true)
    try { await generateFairePart(hasFull) }
    finally { setBusy(false) }
  }

  return (
    <section className="fp-section">
      <p className="section-label">Souvenir</p>
      <h2 className="section-title" style={{ marginBottom: 32 }}>
        Votre faire-part
      </h2>
      <p style={{ fontFamily:'\'Cormorant Garamond\',serif', fontStyle:'italic', fontSize:'1.15rem', color:'var(--text-soft)', marginBottom:36, lineHeight:1.9 }}>
        Téléchargez votre faire-part personnalisé pour conserver un souvenir de ce jour.
      </p>
      <button className="fp-btn" onClick={download} disabled={busy}>
        <span>⬇</span>
        {busy ? 'Génération…' : 'Télécharger le faire-part'}
      </button>
    </section>
  )
}
