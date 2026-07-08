import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

import { useAccess }     from './hooks/useAccess.js'
import { useCountdown }  from './hooks/useCountdown.js'

import PetalCanvas      from './components/PetalCanvas.jsx'
import BurstCanvas      from './components/BurstCanvas.jsx'
import ConfettiCanvas   from './components/ConfettiCanvas.jsx'
import Popup            from './components/Popup.jsx'
import Hero             from './components/Hero.jsx'
import CountdownCard    from './components/CountdownCard.jsx'
import VenueSection     from './components/VenueSection.jsx'
import FairePartSection from './components/FairePartSection.jsx'
import ThankYou         from './components/ThankYou.jsx'
import Footer           from './components/Footer.jsx'

function CountdownPortal({ hasFull, mairsieStatus }) {
  const el = document.getElementById('countdowns')
  if (!el) return null

  return createPortal(
    <>
      {hasFull && (
        <CountdownCard
          eventKey="mairie"
          icon="🌿"
          label="Mariage Civil"
          time="14h30"
          address="Parc du Souvenir Emile Fouchard — 77500 Chelles"
          isMairie
        />
      )}
      <CountdownCard
        eventKey="ceremony"
        icon="💍"
        label="Cérémonie & Réception"
        time="19h00"
        address="La Bella — 16 Rue de Pontault, 77680 Roissy-en-Brie"
        isMairie={false}
      />
    </>,
    el
  )
}

export default function App() {
  const { hasCeremony, hasFull, loading, error, setError, submitCode } = useAccess()
  const [showPopup,   setShowPopup]   = useState(!hasCeremony)
  const [burst,       setBurst]       = useState(false)
  const [confetti,    setConfetti]    = useState(false)
  const [freshUnlock, setFreshUnlock] = useState(false)
  const prevFullRef = useRef(hasFull)

  const ceremonyStatus = useCountdown('ceremony').status
  const allDone        = ceremonyStatus === 'past'

  // When user submits a valid code
  async function handleSuccess(level) {
    setBurst(true)
    setConfetti(true)
    setFreshUnlock(true)
    setShowPopup(false)
  }

  // Called from Popup — forwards to submitCode and triggers celebration on success
  async function handleSubmit(rawCode) {
    const level = await submitCode(rawCode)
    if (level) await handleSuccess(level)
    return level
  }

  // If already had full access before and now gets fresh upgrade, show burst
  useEffect(() => {
    if (hasFull && !prevFullRef.current && !freshUnlock) {
      setBurst(true); setConfetti(true)
    }
    prevFullRef.current = hasFull
  }, [hasFull, freshUnlock])

  return (
    <>
      <PetalCanvas />

      {burst    && <BurstCanvas   onComplete={() => setBurst(false)} />}
      {confetti && <ConfettiCanvas duration={3200} />}

      {showPopup && (
        <Popup
          onSuccess={handleSuccess}
          loading={loading}
          error={error}
          setError={setError}
          submitCode={handleSubmit}
        />
      )}

      <div className="page">
        <Hero />
        <CountdownPortal hasFull={hasFull} />

        {allDone && <ThankYou />}

        <VenueSection     hasFull={hasFull} />
        <FairePartSection hasFull={hasFull} />
        <Footer />
      </div>
    </>
  )
}
