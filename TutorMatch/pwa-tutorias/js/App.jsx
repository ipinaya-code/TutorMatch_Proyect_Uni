import { useState } from 'react'
import { useDB } from './utils/store.js'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Problems from './components/Problems.jsx'
import GeneticDemo from './components/GeneticDemo.jsx'
import Objectives from './components/Objectives.jsx'
import Footer from './components/Footer.jsx'
import Auth from './pages/Auth.jsx'
import AppShell from './pages/AppShell.jsx'

export default function App() {
  const db = useDB()
  const [auth, setAuth] = useState(false)
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
