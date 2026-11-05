export default function Users({ db }) {
  return (
    <section className="panel overflow-x-auto">
      <h2 className="mb-4 text-2xl font-extrabold">Usuarios ({db.users.length})</h2>
      <table className="w-full min-w-[640px] text-left">
        <thead className="text-bone/60"><tr>{['Nombre', 'Correo', 'Rol', 'Semestre', 'Franjas libres'].map((h) => <th key={h} className="p-2 font-medium">{h}</th>)}</tr></thead>
        <tbody>{db.users.map((u) => (
          <tr key={u.id} className="border-t border-bone/10"><td className="p-2">{u.name}</td><td className="p-2">{u.email}</td><td className="p-2">{u.role}</td><td className="p-2">{u.semester}</td><td className="p-2">{20 - u.classes.length}</td></tr>))}</tbody>
      </table>
    </section>
  )
}
