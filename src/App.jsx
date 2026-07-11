import { useState, useCallback } from 'react'
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

// Isolé pour que le tick 1s ne re-rende pas App
function AllDoneGate() {
  const { status } = useCountdown('ceremony')
  return status === 'past' ? <ThankYou /> : null
}

function CountdownPortal({ hasFull }) {
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
        time="17h00"
        address="La Bella — 16 Rue de Pontault, 77680 Roissy-en-Brie"
        isMairie={false}
      />
    </>,
    el
  )
}

export default function App() {
  const { hasCeremony, hasFull, loading, error, setError, submitCode } = useAccess()
  const [showPopup, setShowPopup] = useState(true)
  const [burst,     setBurst]     = useState(false)
  const [confetti,  setConfetti]  = useState(false)

  // Ferme le popup dès que la session est restaurée (cookie valide au montage)
  // useAccess met loading=false après la vérification initiale
  if (!loading && hasCeremony && showPopup) setShowPopup(false)

  const handleBurstDone   = useCallback(() => setBurst(false),   [])
  const handleConfettiDone = useCallback(() => setConfetti(false), [])

  async function handleSubmit(rawCode) {
    const level = await submitCode(rawCode)
    if (level) {
      setShowPopup(false)
      setBurst(true)
      setConfetti(true)
    }
    return level
  }

  return (
    <>
      <PetalCanvas paused={showPopup} />

      {burst    && <BurstCanvas    onComplete={handleBurstDone} />}
      {confetti && <ConfettiCanvas duration={3200} onDone={handleConfettiDone} />}

      {showPopup && !loading && (
        <Popup
          onSuccess={() => {}}
          loading={loading}
          error={error}
          setError={setError}
          submitCode={handleSubmit}
        />
      )}

      <div className="page">
        <Hero />
        <CountdownPortal hasFull={hasFull} />

        <AllDoneGate />

        <VenueSection     hasFull={hasFull} />
        <FairePartSection hasFull={hasFull} />
        <Footer />
      </div>
    </>
  )
}
