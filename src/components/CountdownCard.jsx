import { useCountdown } from '../hooks/useCountdown.js'

function Digit({ n, colorClass }) {
  const formatted = String(n).padStart(2, '0')
  return (
    <span key={formatted} className={`cd-num ${colorClass}`}>
      {formatted}
    </span>
  )
}

const SPARKS = Array.from({ length: 6 }, (_, i) => ({
  dur:   `${2.2 + i * .4}s`,
  delay: `${i * .32}s`,
  left:  `${10 + i * 14}%`,
}))

export default function CountdownCard({ eventKey, icon, label, time, address, isMairie }) {
  const { status, d, h, m, s } = useCountdown(eventKey)
  const cls   = `event-card${isMairie ? ' mairie-card' : ''}${status === 'past' ? ' is-past' : ''}`
  const numCls = isMairie ? 'mairie-num' : ''

  return (
    <div className={cls}>
      <div className="card-header">
        <div className="card-icon">{icon}</div>
        <div className="card-meta">
          <div className="card-type">{isMairie ? 'Cérémonie civile' : 'Cérémonie'}</div>
          <div className="card-name">{label}</div>
          <div className="card-time-loc">{time}</div>
        </div>
      </div>

      {status === 'ongoing' && (
        <div className="ongoing-badge">
          <span className="dot" />
          En cours
          <span className="dot" />
        </div>
      )}

      {status === 'upcoming' && (
        <div className="cd-wrap">
          <div className="cd-unit"><Digit n={d} colorClass={numCls} /><span className="cd-label">Jours</span></div>
          <div className="cd-sep">:</div>
          <div className="cd-unit"><Digit n={h} colorClass={numCls} /><span className="cd-label">Heures</span></div>
          <div className="cd-sep">:</div>
          <div className="cd-unit"><Digit n={m} colorClass={numCls} /><span className="cd-label">Min</span></div>
          <div className="cd-sep">:</div>
          <div className="cd-unit"><Digit n={s} colorClass={numCls} /><span className="cd-label">Sec</span></div>
        </div>
      )}

      {status === 'past' && (
        <p style={{ textAlign:'center', fontStyle:'italic', fontSize:'.85rem', color:'var(--muted)', margin:'14px 0' }}>
          Cet événement est passé — merci d'avoir partagé ce moment.
        </p>
      )}

      <div className="card-address">{address}</div>

      {status === 'ongoing' && (
        <div className="sparkles-layer">
          {SPARKS.map((sp, i) => (
            <div key={i} className="spark" style={{ left:sp.left, bottom:'10%', '--dur':sp.dur, '--delay':sp.delay }} />
          ))}
        </div>
      )}
    </div>
  )
}
