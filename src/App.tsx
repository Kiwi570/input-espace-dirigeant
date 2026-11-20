import { AnimatePresence, motion } from 'framer-motion'
import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ClarteFab, ClartePanel } from './components/clarte/ClartePanel'
import { AppHeader, DemoBand, Footer } from './components/Shell'
import { TourProvider } from './components/Tour'
import { Toasts } from './components/ui/ui'
import type { ProfilId } from './data/demo'
import { useStore } from './lib/store'
import Home from './screens/Home'
import Profils from './screens/Profils'
import Sync from './screens/Sync'
import Cockpit from './screens/Cockpit'

const Simulateur = lazy(() => import('./screens/Simulateur'))
const Plan = lazy(() => import('./screens/Plan'))
const Situation = lazy(() => import('./screens/Situation'))
const Imprimer = lazy(() => import('./screens/Imprimer'))
const Evoluer = lazy(() => import('./screens/Evoluer'))
const Lancer = lazy(() => import('./screens/Lancer'))
const Cabinet = lazy(() => import('./screens/Cabinet'))
const CabinetSituation = lazy(() => import('./screens/CabinetSituation'))
const Introuvable = lazy(() => import('./screens/Introuvable'))

function Page({ children, profil, app = true, titre }: { children: ReactNode; profil?: ProfilId; app?: boolean; titre: string }) {
  const { setProfil } = useStore()
  useEffect(() => { if (profil) setProfil(profil) }, [profil, setProfil])
  useEffect(() => { document.title = `${titre} · INPUT Espace dirigeant` }, [titre])
  return (
    <div className="flex min-h-[calc(100svh-2rem)] flex-col">
      {app && <AppHeader />}
      <motion.main id="contenu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: [0.22, 0.8, 0.24, 1] }} className="flex-1">
        {children}
      </motion.main>
      {app && <Footer />}
    </div>
  )
}

function Chargement() {
  return <div className="grid min-h-[60vh] place-items-center text-encre-3" aria-busy="true"><span className="h-6 w-6 animate-spin rounded-full border-2 border-or/30 border-t-or" /></div>
}

export default function App() {
  const location = useLocation()
  useEffect(() => {
    if (!location.hash) window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    else setTimeout(() => document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 450)
  }, [location.pathname, location.hash])
  return (
    <TourProvider>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-10 focus:z-[100] focus:rounded-full focus:bg-marine focus:px-4 focus:py-2 focus:text-ivoire">Aller au contenu</a>
      <DemoBand />
      <Suspense fallback={<Chargement />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Page app={false} titre="Accueil"><Home /></Page>} />
            <Route path="/demo" element={<Page app={false} titre="Choisir un profil"><Profils /></Page>} />
            <Route path="/connexion/:profil" element={<Page app={false} titre="Connexion à Pennylane"><Sync /></Page>} />
            <Route path="/piloter" element={<Page profil="piloter" titre="Cockpit"><Cockpit /></Page>} />
            <Route path="/piloter/decider" element={<Page profil="piloter" titre="Simulateur de décision"><Simulateur /></Page>} />
            <Route path="/piloter/plan" element={<Page profil="piloter" titre="Plan d’action"><Plan /></Page>} />
            <Route path="/piloter/situation" element={<Page profil="piloter" titre="Situation trimestrielle"><Situation /></Page>} />
            <Route path="/situation/imprimer" element={<Page app={false} titre="Situation trimestrielle à imprimer"><Imprimer /></Page>} />
            <Route path="/evoluer" element={<Page profil="evoluer" titre="Parcours Évoluer"><Evoluer /></Page>} />
            <Route path="/se-lancer" element={<Page profil="lancer" titre="Parcours Se lancer"><Lancer /></Page>} />
            <Route path="/cabinet" element={<Page profil="cabinet" titre="Vue cabinet"><Cabinet /></Page>} />
            <Route path="/cabinet/situation" element={<Page profil="cabinet" titre="Préparer la situation trimestrielle"><CabinetSituation /></Page>} />
            <Route path="*" element={<Page app={false} titre="Page introuvable"><Introuvable /></Page>} />
          </Routes>
        </AnimatePresence>
      </Suspense>
      <ClarteFab />
      <ClartePanel />
      <Toasts />
    </TourProvider>
  )
}
