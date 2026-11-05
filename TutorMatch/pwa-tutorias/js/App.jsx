import { useState } from 'react'
import { useDB } from './store/store.js'
import Navbar from './pages/public/Navbar.jsx'
import Hero from './pages/public/Hero.jsx'
import Problems from './pages/public/Problems.jsx'
import GeneticDemo from './pages/public/GeneticDemo.jsx'
import Objectives from './pages/public/Objectives.jsx'
import Footer from './pages/public/Footer.jsx'
import Auth from './pages/public/Auth.jsx'
import AppShell from './pages/AppShell.jsx'

export default function App() {
  const db = useDB()
  const [auth, setAuth] = useState(false)
  if (!db) return <p className="grid min-h-svh place-items-center text-bone/70">Cargando…</p>
  const me = db.users.find((u) => u.id === db.session)
  if (me) return <AppShell me={me} db={db} />
  if (auth) return <Auth onBack={() => setAuth(false)} />
  return (
    <>
      <Navbar onLogin={() => setAuth(true)} />
      <main>
        <Hero onLogin={() => setAuth(true)} />
        <Problems />
        <GeneticDemo />
        <Objectives />
      </main>
      <Footer />
    </>
  )
}
