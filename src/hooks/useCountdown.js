import { useState, useEffect } from 'react'
import { CFG } from '../config.js'

function getStatus(target, durH) {
  const now  = Date.now()
  const diff = target - now
  const end  = target + durH * 3600 * 1000
  if (now > end)  return { status: 'past',    d:0, h:0, m:0, s:0 }
  if (diff <= 0)  return { status: 'ongoing',  d:0, h:0, m:0, s:0 }
  const secs  = Math.floor(diff / 1000)
  const d     = Math.floor(secs / 86400)
  const h     = Math.floor((secs % 86400) / 3600)
  const m     = Math.floor((secs % 3600)  / 60)
  const s     = secs % 60
  return { status: 'upcoming', d, h, m, s }
}

export function useCountdown(eventKey) {
  const cfg    = CFG[eventKey]
  const target = new Date(CFG.year, CFG.month, CFG.day, cfg.h, cfg.m, 0).getTime()

  const [state, setState] = useState(() => getStatus(target, cfg.durH))

  useEffect(() => {
    const id = setInterval(() => setState(getStatus(target, cfg.durH)), 1000)
    return () => clearInterval(id)
  }, [target, cfg.durH])

  return state
}
