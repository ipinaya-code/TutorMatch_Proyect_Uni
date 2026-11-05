export default function Tabs({ tabs, value, onChange }) {
  return (
    <div role="tablist" className="mb-6 flex gap-2 overflow-x-auto pb-1">
      {tabs.map((t) => {
        const id = t.id ?? t, label = t.label ?? t
        return (
          <button key={id} role="tab" aria-selected={id === value} onClick={() => onChange(id)}
            className={`btn !px-4 !py-2 whitespace-nowrap ${id === value ? 'btn-primary' : 'btn-ghost'}`}>{label}</button>
        )
      })}
    </div>
  )
}

export const STATUS = { pendiente: 'text-oro', asignada: 'text-azul', realizada: 'text-cielo', ausente: 'text-red-300', cancelada: 'text-bone/40' }
export const Chip = ({ s }) => <span className={`chip ${STATUS[s]}`}>{s}</span>
