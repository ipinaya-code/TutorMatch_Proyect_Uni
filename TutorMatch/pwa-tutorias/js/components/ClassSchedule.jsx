import { useState } from 'react'
import { ALL_SLOTS } from '../data/content.js'
import { act } from '../store/store.js'
import AvailabilityGrid from './AvailabilityGrid.jsx'

// El usuario marca sus CLASES; la disponibilidad se calcula sola (semana menos clases).
export default function ClassSchedule({ me }) {
  const [v, setV] = useState(me.classes)
  const [ok, setOk] = useState(false)
  return (
    <div className="panel space-y-5">
      <p className="text-bone/70">Marca las franjas en las que tienes clases. Tu disponibilidad se calcula sola: todas las demás.</p>
      <AvailabilityGrid value={v} onChange={(x) => { setV(x); setOk(false) }} tone="oro" />
      <p><b className="text-azul">{ALL_SLOTS.length - v.length}</b> franjas libres · {v.length} con clase</p>
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" onClick={() => { act.saveUser(me.id, { classes: v }); setOk(true) }}>Guardar horario</button>
        {ok && <span role="status" className="text-azul">Guardado</span>}
      </div>
    </div>
  )
}
