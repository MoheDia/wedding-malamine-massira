import { useState, useEffect, useRef } from 'react'

export default function Popup({ onSuccess, loading, error, setError, submitCode }) {
  const [code,    setCode]    = useState('')
  const [shake,   setShake]   = useState(false)
  const [closing, setClosing] = useState(false)
  const inputRef = useRef(null)

  // Block Escape key entirely
  useEffect(() => {
    const block = e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation() } }
    window.addEventListener('keydown', block, true)
    return () => window.removeEventListener('keydown', block, true)
  }, [])

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (error) {
      setShake(true)
      const t = setTimeout(() => { setShake(false); setError(null) }, 600)
      return () => clearTimeout(t)
    }
  }, [error, setError])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!code.trim() || loading) return
    const level = await submitCode(code.trim())
    if (level) {
      setClosing(true)
      setTimeout(() => onSuccess(level), 540)
    }
  }

  return (
    <div className={`popup-overlay${closing ? ' closing' : ''}`}>
      <div className="popup-card">
        <div className="popup-ring">💍</div>
        <div className="popup-title">Bienvenue</div>
        <div className="popup-sub">Invitation privée</div>

        <p className="popup-q">
          Vous avez reçu un code d'invitation ? Entrez-le ci-dessous pour accéder
          à votre programme personnalisé.
          <small>Ce site est réservé aux invités de Malamine & Massira.</small>
        </p>

        <form onSubmit={handleSubmit} autoComplete="off">
          <input
            ref={inputRef}
            className={`code-input${shake ? ' shake' : ''}`}
            type="text"
            placeholder="Code d'invitation"
            value={code}
            onChange={e => setCode(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            disabled={loading}
          />
          <button className="popup-btn" type="submit" disabled={loading || !code.trim()}>
            {loading ? 'Vérification…' : 'Confirmer  →'}
          </button>
        </form>
      </div>
    </div>
  )
}
