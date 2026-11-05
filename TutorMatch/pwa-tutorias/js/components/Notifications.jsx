import { useEffect } from 'react'
import { act } from '../store/store.js'
import { fmtDate } from '../utils/helpers.js'

// Con el backend, cada aviso llegará además al Gmail del usuario.
export default function Notifications({ me, db }) {
  const mine = db.notes.filter((n) => n.userId === me.id)
  const unread = mine.some((n) => !n.read)
  useEffect(() => { if (unread) act.markRead(me.id) }, [unread, me.id])
  return (
    <div className="space-y-3">
      <p className="text-bone/60">Estos avisos se enviarán también a tu correo cuando se conecte el servicio de notificaciones.</p>
      {!mine.length && <p className="panel text-bone/70">No tienes avisos.</p>}
      {mine.map((n) => (
        <article key={n.id} className="panel">
          <div className="flex flex-wrap justify-between gap-2"><b className="font-display text-lg">{n.subject}</b><span className="text-bone/50">{fmtDate(n.date)}</span></div>
          <p className="mt-1 text-bone/80">{n.body}</p>
        </article>
      ))}
    </div>
  )
}
