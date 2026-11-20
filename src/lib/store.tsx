import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { ProfilId } from '../data/demo'
import { CAMILLE } from '../data/demo'

export type PlanItem = { id: string; titre: string; echeance?: string; qui: 'vous' | 'conseiller'; origine: string; fait?: boolean }
export type Demande = { id: string; sujet: string; quand: string }
export type Message = { id: string; role: 'user'; text: string } | { id: string; role: 'clarte'; answerId: string; free?: string }
export type Toast = { id: string; titre: string; texte?: string }

type State = {
  profil: ProfilId | null
  synced: { evoluer: boolean; piloter: boolean }
  plan: Record<ProfilId, PlanItem[]>
  demandes: Record<ProfilId, Demande[]>
  situation: { statut: 'pre' | 'envoyee'; edits: Record<string, string> }
  camille: { reponses: Record<string, string>; fini: boolean; demarches: Record<string, boolean> }
}

const PLAN_INITIAL: State['plan'] = {
  piloter: [
    { id: 'p0', titre: 'Envoyer les devis des deux chantiers de janvier', echeance: '2026-12-11', qui: 'vous', origine: 'Plan du trimestre' },
    { id: 'p1', titre: 'Préparer le rendez-vous trimestriel', echeance: '2026-12-10', qui: 'conseiller', origine: 'Offre Piloter' },
  ],
  evoluer: [], lancer: [], cabinet: [],
}

const INITIAL: State = {
  profil: null,
  synced: { evoluer: false, piloter: false },
  plan: PLAN_INITIAL,
  demandes: { piloter: [], evoluer: [], lancer: [], cabinet: [] },
  situation: { statut: 'pre', edits: {} },
  camille: { reponses: {}, fini: false, demarches: Object.fromEntries(CAMILLE.demarches.map((d) => [d.id, d.fait])) },
}

const CLE = 'input-demo-v1'
function charger(): State {
  try {
    const raw = sessionStorage.getItem(CLE)
    if (!raw) return INITIAL
    const s = JSON.parse(raw)
    return { ...INITIAL, ...s, profil: s.profil ?? null }
  } catch {
    try { sessionStorage.removeItem(CLE) } catch { /* stockage indisponible */ }
    return INITIAL
  }
}

type Ctx = State & {
  setProfil: (p: ProfilId) => void
  setSynced: (p: 'evoluer' | 'piloter') => void
  ajouterPlan: (p: ProfilId, item: Omit<PlanItem, 'id'>) => boolean
  basculerPlan: (p: ProfilId, id: string) => void
  demander: (p: ProfilId, sujet: string) => void
  setSituation: (s: Partial<State['situation']>) => void
  setCamille: (c: Partial<State['camille']>) => void
  reinitialiser: () => void
  toasts: Toast[]
  toast: (titre: string, texte?: string) => void
  // Clarté
  clarteOuvert: boolean
  ouvrirClarte: (ouvert?: boolean) => void
  fil: Message[]
  demanderClarte: (answerId: string, question: string) => void
  questionLibre: (texte: string, answerId: string) => void
  viderFil: () => void
}

const StoreCtx = createContext<Ctx | null>(null)
let uid = 0
const nid = () => `m${Date.now().toString(36)}${(uid++).toString(36)}`

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(charger)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [clarteOuvert, setClarteOuvert] = useState(false)
  const [fil, setFil] = useState<Message[]>([])
  const timers = useRef<number[]>([])

  useEffect(() => {
    try { sessionStorage.setItem(CLE, JSON.stringify(state)) } catch { /* navigation privée */ }
  }, [state])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const toast = useCallback((titre: string, texte?: string) => {
    const id = nid()
    setToasts((t) => [...t.slice(-2), { id, titre, texte }])
    timers.current.push(window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200))
  }, [])

  const etat = useRef(state)
  etat.current = state

  const actions = useMemo(() => ({
    setProfil: (p: ProfilId) => setState((s) => (s.profil === p ? s : { ...s, profil: p })),
    setSynced: (p: 'evoluer' | 'piloter') => setState((s) => (s.synced[p] ? s : { ...s, synced: { ...s.synced, [p]: true } })),
    ajouterPlan: (p: ProfilId, item: Omit<PlanItem, 'id'>) => {
      if (etat.current.plan[p].some((x) => x.titre === item.titre)) return false
      setState((s) => ({ ...s, plan: { ...s.plan, [p]: [...s.plan[p], { ...item, id: nid() }] } }))
      return true
    },
    basculerPlan: (p: ProfilId, id: string) => setState((s) => ({ ...s, plan: { ...s.plan, [p]: s.plan[p].map((x) => (x.id === id ? { ...x, fait: !x.fait } : x)) } })),
    demander: (p: ProfilId, sujet: string) => setState((s) => (s.demandes[p].some((d) => d.sujet === sujet) ? s : { ...s, demandes: { ...s.demandes, [p]: [...s.demandes[p], { id: nid(), sujet, quand: 'à l’instant' }] } })),
    setSituation: (x: Partial<State['situation']>) => setState((s) => ({ ...s, situation: { ...s.situation, ...x } })),
    setCamille: (x: Partial<State['camille']>) => setState((s) => ({ ...s, camille: { ...s.camille, ...x } })),
    reinitialiser: () => { setState((s) => ({ ...INITIAL, profil: s.profil })); setFil([]) },
    ouvrirClarte: (o?: boolean) => setClarteOuvert((v) => (o === undefined ? !v : o)),
    demanderClarte: (answerId: string, question: string) => {
      setClarteOuvert(true)
      setFil((f) => [...f, { id: nid(), role: 'user', text: question }, { id: nid(), role: 'clarte', answerId }])
    },
    questionLibre: (texte: string, answerId: string) => {
      setClarteOuvert(true)
      setFil((f) => [...f, { id: nid(), role: 'user', text: texte }, { id: nid(), role: 'clarte', answerId, free: texte }])
    },
    viderFil: () => setFil([]),
  }), [])

  const api = useMemo<Ctx>(() => ({ ...state, ...actions, toasts, toast, clarteOuvert, fil }), [state, actions, toasts, toast, clarteOuvert, fil])

  return <StoreCtx.Provider value={api}>{children}</StoreCtx.Provider>
}

export function useStore() {
  const c = useContext(StoreCtx)
  if (!c) throw new Error('StoreProvider manquant')
  return c
}
