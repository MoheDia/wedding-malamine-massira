export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-left">
        <div className="hero-chip">
          <span>Malamine &amp; Massira</span>
        </div>

        <p className="invite-text">
          C'est avec une joie immense et un cœur débordant d'amour que nous vous
          convions à partager le plus beau jour de nos vies. Votre présence est
          notre plus grand bonheur, et nous souhaitons vous offrir une soirée
          inoubliable, empreinte d'émotion, de rires et de belles rencontres.
          <br /><br />
          Venez célébrer avec nous l'union de deux âmes, deux familles, deux
          histoires qui n'en forment désormais plus qu'une.
        </p>

        <div className="hero-divider"><span>✦</span></div>

        <div className="names-block">
          <div className="hero-name">Malamine</div>
          <span className="hero-et">&amp;</span>
          <div className="hero-name">Massira</div>
        </div>

        <div className="hero-family">
          DIATTA  ✦  SAMAKÉ
        </div>
      </div>

      <div className="hero-right">
        <div className="date-badge">
          <div className="date-day">3</div>
          <div className="date-info">
            <div className="date-month">Octobre 2026</div>
            <div className="date-year">2026</div>
            <div className="date-day-name">Samedi</div>
          </div>
        </div>

        <div id="countdowns" />
      </div>

      {/* ambient orbs */}
      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />
    </section>
  )
}
