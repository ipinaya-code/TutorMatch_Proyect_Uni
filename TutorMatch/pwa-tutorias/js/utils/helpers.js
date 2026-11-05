import { ALL_SLOTS } from '../data/content.js'

// Disponibilidad = semana completa menos las franjas con clases.
export const free = (u) => ALL_SLOTS.filter((s) => !u.classes.includes(s))
export const nameOf = (db, code) => db.subjects.find((s) => s.code === code)?.name || code
export const userName = (db, id) => db.users.find((u) => u.id === id)?.name || '—'
export const fmtDate = (iso) => new Date(iso).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'short' })

export function downloadCsv(file, rows) {
  const csv = rows.map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(',')).join('\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  a.download = file
  a.click()
  URL.revokeObjectURL(a.href)
}
