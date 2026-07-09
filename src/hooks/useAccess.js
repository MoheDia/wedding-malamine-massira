import { useState, useCallback, useEffect } from 'react'

export function useAccess() {
  const [accessLevel, setAccessLevel] = useState(null)
  const [loading,     setLoading]     = useState(true)   // true pendant la vérification initiale
  const [error,       setError]       = useState(null)

  const hasCeremony = accessLevel === 'ceremony' || accessLevel === 'full'
  const hasFull     = accessLevel === 'full'

  // Vérification du cookie au montage (restauration de session)
  useEffect(() => {
    fetch('/api/verify', { method: 'GET', credentials: 'same-origin' })
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data?.level) setAccessLevel(data.level) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const submitCode = useCallback(async (rawCode) => {
    setLoading(true)
    setError(null)
    try {
      // 1. Valider le code → le serveur pose le cookie httpOnly
      const authRes = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ code: rawCode }),
      })
      const authData = await authRes.json()
      if (!authRes.ok) {
        setError(authData.error || 'Code invalide')
        return false
      }

      // 2. Lire le niveau depuis le serveur (vérification de signature côté serveur)
      const verifyRes = await fetch('/api/verify', { method: 'GET', credentials: 'same-origin' })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) {
        setError('Erreur de vérification')
        return false
      }

      setAccessLevel(verifyData.level)
      return verifyData.level
    } catch {
      setError('Erreur réseau, veuillez réessayer.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { accessLevel, hasCeremony, hasFull, loading, error, setError, submitCode }
}
