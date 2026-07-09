import { useState, useEffect } from 'react'
import { CFG } from '../config.js'

function getStatus(target, durH) {
  const now  = Date.now()
  const diff = target - now
  const end  = target + durH * 3600 * 1000
  if (now > end)  return { status: 'past',    d:0, h:0, m:0, s:0 }
  if (diff <= 0)  return { status: 'ongoing',  d:0, h:0, m:0, s:0 }
  const secs = Math.floor(diff / 1000)
  return {
    status: 'upcoming',
    d: Math.floor(secs / 86400),
    h: Math.floor((secs % 86400) / 3600),
    m: Math.floor((secs % 3600)  / 60),
    s: secs % 60,
  }
}

// Singleton clock — un seul setInterval pour toute l'app
const listeners  = new Set()
let   intervalId = null

function startClock() {
  if (intervalId !== null) return
  intervalId = setInterval(() => listeners.forEach(fn => fn()), 1000)
}

function stopClock() {
  if (listeners.size === 0 && intervalId !== null) {
    clearInterval(intervalId)
    intervalId = null
  }
}

export function useCountdown(eventKey) {
  const cfg    = CFG[eventKey]
  const target = new Date(CFG.year, CFG.month, CFG.day, cfg.h, cfg.m, 0).getTime()
  const durH   = cfg.durH

  const [state, setState] = useState(() => getStatus(target, durH))

  useEffect(() => {
    const tick = () => setState(getStatus(target, durH))
    listeners.add(tick)
    startClock()
    return () => {
      listeners.delete(tick)
      stopClock()
    }
  }, [target, durH])

  return state
}
