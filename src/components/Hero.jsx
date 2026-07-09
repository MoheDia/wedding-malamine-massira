export default function Hero() {
  return (
    <section className="hero">

      {/* ── Noms — pleine largeur, en haut ── */}
      <div className="hero-names">
        <div className="hero-chip">
          <span>DIATTA  ✦  SAMAKÉ</span>
        </div>

        <div className="names-block">
          <div className="hero-name bride">Massira</div>
          <span className="hero-et">&amp;</span>
          <div className="hero-name">Malamine</div>
        </div>

        <div className="hero-date-strip">
          <span className="hds-line" />
          <span className="hds-text">Samedi · 3 · Octobre · 2026</span>
          <span className="hds-line" />
        </div>
      </div>

      {/* ── Contenu — 2 colonnes ── */}
      <div className="hero-content">
        <div className="hero-left">
          <p className="invite-text">
            C'est avec une joie immense et un cœur débordant d'amour que nous vous
            convions à partager le plus beau jour de nos vies. Votre présence est
            notre plus grand bonheur, et nous souhaitons vous offrir une soirée
            inoubliable, empreinte d'émotion, de rires et de belles rencontres.
            <br /><br />
            Venez célébrer avec nous l'union de deux âmes, deux familles, deux
            histoires qui n'en forment désormais plus qu'une.
          </p>
        </div>

        <div className="hero-right">
          <div id="countdowns" />
        </div>
      </div>

      {/* orbs ambiants */}
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
    </section>
  )
}
