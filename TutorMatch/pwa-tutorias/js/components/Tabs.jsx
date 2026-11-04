export default function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="mb-6 flex gap-2 overflow-x-auto">
      {tabs.map((t) => (
        <button key={t} role="tab" aria-selected={t === value} onClick={() => onChange(t)}
          className={`btn !px-4 !py-2 whitespace-nowrap ${t === value ? 'btn-primary' : 'btn-ghost'}`}>{t}</button>
      ))}
    </div>
  )
}

export const STATUS = { pendiente: 'text-ambar', asignada: 'text-cian', completada: 'text-viol', cancelada: 'text-bone/40' }
export const Chip = ({ s }) => <span className={`chip ${STATUS[s]}`}>{s}</span>
