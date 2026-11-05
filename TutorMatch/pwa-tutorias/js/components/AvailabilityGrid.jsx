import { DAYS, HOURS } from '../data/content.js'

export default function AvailabilityGrid({ value, onChange, tone = 'azul' }) {
  const toggle = (s) => onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s].sort((a, b) => a - b))
  const on = tone === 'oro' ? 'border-oro bg-oro/80 text-ink' : 'border-azul bg-azul/80 text-ink'
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[300px] grid-cols-[3.5rem_repeat(5,1fr)] gap-1.5 text-center text-sm">
        <span />
        {DAYS.map((d) => <b key={d} className="text-bone/70">{d}</b>)}
        {HOURS.map((h, hi) => (
          <div key={h} className="contents">
            <span className="self-center text-bone/60">{h}</span>
            {DAYS.map((d, di) => {
              const s = di * 4 + hi, sel = value.includes(s)
              return (
                <button key={s} type="button" aria-pressed={sel} aria-label={`${d} ${h}`} onClick={() => toggle(s)}
                  className={`h-10 rounded-md border transition-colors ${sel ? on : 'border-bone/15 hover:border-azul'}`}>
                  {sel ? '•' : ''}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
