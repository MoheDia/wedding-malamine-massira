import { useState, useCallback } from 'react'

const TOKEN_KEY = 'wdg_token'

function decodeLevel(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp && payload.exp < now) return null
    return payload.level || null
  } catch {
    return null
  }
}

function initLevel() {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return null
  const level = decodeLevel(token)
  if (!level) localStorage.removeItem(TOKEN_KEY)
  return level
}

export function useAccess() {
  const [accessLevel, setAccessLevel] = useState(initLevel)
  const [error, setError]             = useState(null)
  const [loading, setLoading]         = useState(false)

  const hasCeremony = accessLevel === 'ceremony' || accessLevel === 'full'
  const hasFull     = accessLevel === 'full'

  const submitCode = useCallback(async (rawCode) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rawCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Code invalide')
        return false
      }
      const level = decodeLevel(data.token)
      if (!level) {
        setError('Réponse serveur invalide')
        return false
      }
      localStorage.setItem(TOKEN_KEY, data.token)
      setAccessLevel(level)
      return level
    } catch {
      setError('Erreur réseau, veuillez réessayer.')
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { accessLevel, hasCeremony, hasFull, loading, error, setError, submitCode }
}
