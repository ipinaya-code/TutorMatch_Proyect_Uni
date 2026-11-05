import { useState } from 'react'
import Tabs from '../../components/Tabs.jsx'
import Dashboard from './Dashboard.jsx'
import Requests from './Requests.jsx'
import GeneticLab from './GeneticLab.jsx'
import Catalog from './Catalog.jsx'
import Users from './Users.jsx'

const TABS = [{ id: 'dash', label: 'Dashboard' }, { id: 'lab', label: 'Laboratorio genético' }, { id: 'req', label: 'Solicitudes' },
  { id: 'cat', label: 'Catálogo e importación' }, { id: 'usr', label: 'Usuarios' }]

export default function CoordinatorPanel({ db }) {
  const [tab, setTab] = useState('lab')
  return (
    <>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === 'dash' && <Dashboard db={db} />}
      {tab === 'lab' && <GeneticLab db={db} />}
      {tab === 'req' && <Requests db={db} />}
      {tab === 'cat' && <Catalog db={db} />}
      {tab === 'usr' && <Users db={db} />}
    </>
  )
}
