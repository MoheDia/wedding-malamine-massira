import { useEffect, useRef } from 'react'

function useReveal(hasFull) {
  const refs = useRef([])

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in-view') }),
      { threshold: .15 }
    )
    refs.current.filter(Boolean).forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [hasFull])

  return el => { if (el && !refs.current.includes(el)) refs.current.push(el) }
}

export default function VenueSection({ hasFull }) {
  const addRef = useReveal(hasFull)

  return (
    <section className="venues-section">
      <div className="venues-inner">
        <p className="section-label">Lieux de réception</p>
        <h2 className="section-title">Nos événements</h2>

        <div className={`venues-grid${hasFull ? ' two' : ''}`}>
          {hasFull && (
            <div className="venue-card mairie-v" ref={addRef}>
              <div className="venue-event-tag">Cérémonie civile</div>
              <div className="venue-time">14h30</div>
              <div className="venue-name-big">Mairie de Chelles</div>
              <div className="venue-divider" />
              <div className="venue-address">
                <strong>Parc du Souvenir Emile Fouchard</strong>
                77500 Chelles
              </div>
            </div>
          )}

          <div className="venue-card" ref={addRef}>
            <div className="venue-event-tag">Cérémonie &amp; Réception</div>
            <div className="venue-time">19h00</div>
            <div className="venue-name-big">La Bella</div>
            <div className="venue-divider" />
            <div className="venue-address">
              <strong>La Bella</strong>
              16 Rue de Pontault<br />
              77680 Roissy-en-Brie
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
