import { AnimatePresence, motion } from 'framer-motion'
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'
import { ClarteMark } from './ui/ui'

type Etape = { route: string; cible: string; titre: string; texte: string; profil?: 'piloter' | 'cabinet' }
export const ETAPES: Etape[] = [
  { route: '/', cible: 'promesse', titre: 'La promesse INPUT', texte: 'De la clarté, de l’anticipation et de la capacité à décider. Trois offres, une même méthode : comprendre, décider, avancer.' },
  { route: '/demo', cible: 'profils', titre: 'Un espace pour chaque dirigeant', texte: 'Un créateur, un micro-entrepreneur qui grandit, une PME, et la vue du cabinet. On peut changer de profil à tout moment, en haut de l’écran.' },
  { route: '/connexion/piloter', cible: 'sync', titre: 'Les chiffres Pennylane arrivent', texte: 'Les écritures sont lues, traduites en indicateurs, puis Clarté en tire trois constats. Aucune saisie pour le dirigeant.', profil: 'piloter' },
  { route: '/piloter', cible: 'brief', titre: 'Le brief du jour', texte: 'Trois phrases, rédigées par Clarté : ce qui va bien, ce qui arrive, la priorité de la semaine.', profil: 'piloter' },
  { route: '/piloter', cible: 'kpis', titre: 'Cinq indicateurs, en clair', texte: 'Chaque chiffre s’explique au survol, en langage simple. Pas de jargon sans explication.', profil: 'piloter' },
  { route: '/piloter', cible: 'tresorerie', titre: 'Anticiper le creux de février', texte: 'La trésorerie à 90 jours, le point bas et ses causes. Un clic sur « Comprendre » ouvre Clarté sur le sujet.', profil: 'piloter' },
  { route: '/piloter/decider?scenario=recruter', cible: 'simulateur', titre: 'Simuler avant de décider', texte: 'Recruter, investir, augmenter ses prix : les curseurs font bouger la trésorerie et le résultat en direct.', profil: 'piloter' },
  { route: '/cabinet/situation', cible: 'note', titre: 'L’IA prépare, l’expert valide', texte: 'Clarté rédige la situation trimestrielle. Le conseiller la relit, la corrige et l’envoie : c’est ce qui rend l’offre à 600 € rentable.', profil: 'cabinet' },
]

type Ctx = { actif: boolean; etape: number; demarrer: () => void; arreter: () => void }
const TourCtx = createContext<Ctx>({ actif: false, etape: 0, demarrer: () => {}, arreter: () => {} })
export const useTour = () => useContext(TourCtx)

export function TourProvider({ children }: { children: ReactNode }) {
  const [actif, setActif] = useState(false)
  const [etape, setEtape] = useState(0)
  const nav = useNavigate()
  const loc = useLocation()
  const { setProfil, ouvrirClarte } = useStore()
  const [rect, setRect] = useState<DOMRect | null>(null)
  const carte = useRef<HTMLDivElement>(null)

  const aller = useCallback((i: number) => {
    const e = ETAPES[i]
    setEtape(i)
    setRect(null)
    ouvrirClarte(false)
    if (e.profil) setProfil(e.profil)
    if (loc.pathname + loc.search !== e.route) nav(e.route)
  }, [loc.pathname, loc.search, nav, setProfil, ouvrirClarte])

  const demarrer = useCallback(() => { setActif(true); aller(0) }, [aller])
  const arreter = useCallback(() => { setActif(false); setRect(null) }, [])

  // trouver la zone à mettre en lumière
  useLayoutEffect(() => {
    if (!actif) return
    let essais = 0, raf = 0, t = 0
    const cible = ETAPES[etape].cible
    const chercher = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${cible}"]`)
      if (el) {
        el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        t = window.setTimeout(() => setRect(el.getBoundingClientRect()), 420)
      } else if (essais++ < 60) raf = requestAnimationFrame(chercher)
    }
    t = window.setTimeout(chercher, 120)
    const maj = () => { const el = document.querySelector(`[data-tour="${cible}"]`); if (el) setRect(el.getBoundingClientRect()) }
    window.addEventListener('resize', maj); window.addEventListener('scroll', maj, { passive: true })
    return () => { cancelAnimationFrame(raf); clearTimeout(t); window.removeEventListener('resize', maj); window.removeEventListener('scroll', maj) }
  }, [actif, etape, loc.pathname])

  useEffect(() => { if (actif && rect) carte.current?.focus({ preventScroll: true }) }, [actif, rect, etape])

  useEffect(() => {
    if (!actif) return
    const k = (e: KeyboardEvent) => {
      if (e.key === 'Escape') arreter()
      else if (e.key === 'ArrowRight') etape < ETAPES.length - 1 ? aller(etape + 1) : arreter()
      else if (e.key === 'ArrowLeft' && etape > 0) aller(etape - 1)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [actif, etape, aller, arreter])

  const e = ETAPES[etape]
  const pad = 10
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1200
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const r = rect ? { x: Math.max(6, rect.left - pad), y: Math.max(6, rect.top - pad), w: Math.min(vw - 12, rect.width + pad * 2), h: Math.min(vh - 12, rect.height + pad * 2) } : null
  const mobile = vw < 768
  const dessous = r ? r.y + r.h + 230 < vh : true
  const dessus = r ? r.y - 230 > 0 : false
  const carteStyle = mobile || !r
    ? { left: 12, right: 12, bottom: 16 }
    : dessous ? { left: Math.min(Math.max(16, r.x), vw - 396), top: r.y + r.h + 14 }
      : dessus ? { left: Math.min(Math.max(16, r.x), vw - 396), top: r.y - 214 }
        : { right: 28, bottom: 28 }

  return (
    <TourCtx.Provider value={{ actif, etape, demarrer, arreter }}>
      {children}
      <AnimatePresence>
        {actif && (
          <motion.div key="tour" className="no-print fixed inset-0 z-[90]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {r ? (
              <motion.div className="pointer-events-none absolute rounded-[22px] ring-2 ring-or"
                style={{ boxShadow: '0 0 0 9999px rgba(6,23,54,.58)' }}
                initial={false} animate={{ left: r.x, top: r.y, width: r.w, height: r.h }} transition={{ duration: 0.35, ease: [0.22, 0.8, 0.24, 1] }} />
            ) : <div className="absolute inset-0 bg-marine-950/40" />}
            <motion.div ref={carte} tabIndex={-1} role="dialog" aria-modal="true" aria-label={`Mode présentation, étape ${etape + 1} sur ${ETAPES.length}`}
              key={etape} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute w-auto rounded-2xl bg-papier p-5 shadow-2xl outline-none md:w-[380px]" style={carteStyle}>
              <div className="mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] text-or-texte"><ClarteMark /> Étape {etape + 1} sur {ETAPES.length}</span>
                <button type="button" onClick={arreter} className="min-h-[36px] rounded-full px-2 text-[12.5px] text-encre-3 hover:text-marine">Quitter</button>
              </div>
              <h2 className="font-display text-[22px] leading-tight">{e.titre}</h2>
              <p className="mt-1.5 text-[14px] leading-relaxed text-encre-2">{e.texte}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <div className="flex gap-1" aria-hidden>{ETAPES.map((_, i) => <span key={i} className={`h-1 rounded-full transition-all ${i === etape ? 'w-5 bg-or' : 'w-1.5 bg-marine/15'}`} />)}</div>
                <div className="flex gap-2">
                  {etape > 0 && <button type="button" onClick={() => aller(etape - 1)} className="btn btn-ligne !min-h-[40px] !px-4">Retour</button>}
                  <button type="button" onClick={() => (etape < ETAPES.length - 1 ? aller(etape + 1) : arreter())} className="btn btn-primaire !min-h-[40px] !px-4">{etape < ETAPES.length - 1 ? 'Suivant' : 'Terminer'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </TourCtx.Provider>
  )
}
