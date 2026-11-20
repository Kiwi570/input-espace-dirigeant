import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { PROFILS, type ProfilId } from '../data/demo'
import { useStore } from '../lib/store'
import { useTour } from './Tour'
import { Avatar, PennylaneBadge } from './ui/ui'

export const NAV: Record<ProfilId, { to: string; label: string; end?: boolean }[]> = {
  piloter: [
    { to: '/piloter', label: 'Cockpit', end: true },
    { to: '/piloter/decider', label: 'Décider' },
    { to: '/piloter/plan', label: 'Plan d’action' },
    { to: '/piloter/situation', label: 'Situation' },
  ],
  evoluer: [{ to: '/evoluer', label: 'Mon parcours Évoluer', end: true }],
  lancer: [{ to: '/se-lancer', label: 'Ma feuille de route', end: true }],
  cabinet: [
    { to: '/cabinet', label: 'Portefeuille', end: true },
    { to: '/cabinet/situation', label: 'Situation à valider' },
  ],
}

export function useAllerProfil() {
  const nav = useNavigate()
  const { synced } = useStore()
  return (id: ProfilId) => {
    const p = PROFILS[id]
    if (p.pennylane && !synced[id as 'evoluer' | 'piloter']) nav(`/connexion/${id}`)
    else nav(p.route)
  }
}

export function DemoBand() {
  const tour = useTour()
  return (
    <div className="no-print sur-marine relative z-40 flex h-8 items-center justify-between gap-3 bg-marine-950 px-4 text-[11.5px] text-brume md:px-6">
      <span className="flex items-center gap-2"><span aria-hidden className="h-1.5 w-1.5 rounded-full bg-or" /><span className="font-semibold tracking-[.12em] uppercase">Démo · données fictives</span></span>
      <button type="button" onClick={() => tour.demarrer()} className="flex min-h-8 items-center gap-1.5 rounded-full px-2 text-ivoire/90 transition hover:text-ivoire" data-tour-skip>
        <svg aria-hidden width="11" height="11" viewBox="0 0 12 12"><path d="M3 2l7 4-7 4z" fill="currentColor" /></svg>
        <span>Mode présentation</span>
      </button>
    </div>
  )
}

function ProfileSwitcher() {
  const { profil } = useStore()
  const aller = useAllerProfil()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const c = (e: PointerEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', c); document.addEventListener('keydown', k)
    return () => { document.removeEventListener('pointerdown', c); document.removeEventListener('keydown', k) }
  }, [open])
  const p = profil ? PROFILS[profil] : null
  return (
    <div ref={ref} className="relative" data-tour="profil">
      <button type="button" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className="flex min-h-[44px] items-center gap-2.5 rounded-full border border-marine/12 bg-papier py-1 pl-1 pr-3 transition hover:border-marine/30">
        <Avatar initiales={p?.initiales ?? '··'} taille={34} or={profil === 'cabinet'} />
        <span className="hidden text-left leading-tight lg:block">
          <span className="block text-[11px] text-encre-3">Profil · {p?.offre ?? 'démo'}</span>
          <span className="block max-w-[170px] truncate text-[13px] font-semibold">{p?.titre ?? 'Choisir'}</span>
        </span>
        <svg aria-hidden width="12" height="12" viewBox="0 0 12 12" className={`transition ${open ? 'rotate-180' : ''}`}><path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>
        <span className="sr-only">Changer de profil</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div role="menu" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}
            className="absolute right-0 top-full z-50 mt-2 w-[300px] overflow-hidden rounded-2xl border border-marine/10 bg-papier p-1.5 shadow-2xl">
            <div className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[.16em] text-encre-3">Changer de profil</div>
            {(Object.keys(PROFILS) as ProfilId[]).map((id) => {
              const x = PROFILS[id]
              return (
                <button key={id} role="menuitem" type="button" onClick={() => { setOpen(false); aller(id) }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-ivoire ${profil === id ? 'bg-ivoire' : ''}`}>
                  <Avatar initiales={x.initiales} taille={32} or={id === 'cabinet'} />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block text-[11px] font-semibold uppercase tracking-[.12em] text-or-texte">{x.offre}</span>
                    <span className="block truncate text-[13.5px] font-semibold">{x.titre}</span>
                  </span>
                  {profil === id && <span aria-label="profil actuel" className="h-2 w-2 rounded-full bg-or" />}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AppHeader() {
  const { profil, synced } = useStore()
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)
  useEffect(() => setMenu(false), [pathname])
  const liens = profil ? NAV[profil] : []
  const montrerBadge = profil && PROFILS[profil].pennylane && synced[profil as 'evoluer' | 'piloter']
  return (
    <header className="no-print sticky top-0 z-30 border-b border-marine/[.08] bg-ivoire">
      <div className="mx-auto flex h-[68px] max-w-[1320px] items-center gap-4 px-4 md:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3" aria-label="INPUT Expertise, retour à l’accueil">
          <img src="/brand/input-wordmark.png" alt="" width={540} height={50} className="h-[15px] w-auto md:h-[17px]" />
          <span aria-hidden className="hidden h-5 w-px bg-marine/15 sm:block" />
          <span className="hidden font-display text-[16px] italic text-encre-2 sm:block">Espace dirigeant</span>
        </Link>
        <nav aria-label="Navigation principale" className="ml-4 hidden flex-1 items-center gap-1 md:flex">
          {liens.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `relative rounded-full px-3.5 py-2 text-[14px] transition ${isActive ? 'font-semibold text-marine' : 'text-encre-2 hover:text-marine'}`}>
              {({ isActive }) => (<>{l.label}{isActive && <motion.span layoutId="nav-filet" className="absolute inset-x-3.5 -bottom-[13px] h-[2px] rounded-full bg-or" />}</>)}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 md:gap-3">
          {montrerBadge && <span className="hidden xl:block"><PennylaneBadge compact /></span>}
          <ProfileSwitcher />
          {liens.length > 1 && (
            <button type="button" className="grid h-11 w-11 place-items-center rounded-full border border-marine/12 md:hidden" aria-expanded={menu} aria-controls="menu-mobile" onClick={() => setMenu((m) => !m)}>
              <span className="sr-only">{menu ? 'Fermer le menu' : 'Menu'}</span>
              <svg aria-hidden width="18" height="18" viewBox="0 0 18 18">{menu ? <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /> : <path d="M3 6h12M3 12h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}</svg>
            </button>
          )}
        </div>
      </div>
      <AnimatePresence>
        {menu && (
          <motion.nav id="menu-mobile" aria-label="Navigation" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-marine/10 md:hidden">
            <ul className="space-y-1 px-4 py-3">
              {liens.map((l) => (
                <li key={l.to}><NavLink to={l.to} end={l.end} className={({ isActive }) => `flex min-h-[48px] items-center rounded-xl px-3 text-[15px] ${isActive ? 'bg-papier font-semibold' : ''}`}>{l.label}</NavLink></li>
              ))}
              {montrerBadge && <li className="px-3 pt-2"><PennylaneBadge compact /></li>}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

export function Footer({ sombre = false }: { sombre?: boolean }) {
  return (
    <footer className={`no-print mt-auto ${sombre ? 'sur-marine bg-marine-950 text-brume' : 'border-t border-marine/[.08] text-encre-3'}`}>
      <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-4 py-6 pb-24 text-[12.5px] md:flex-row md:items-center md:justify-between md:px-8 md:pb-6">
        <div className="flex items-center gap-3">
          <img src={sombre ? '/brand/input-wordmark-clair.png' : '/brand/input-wordmark.png'} alt="INPUT Expertise" width={540} height={50} className="h-3 w-auto opacity-90" />
          <span>Jarville-la-Malgrange · Saint-Dizier</span>
        </div>
        <p>Maquette de démonstration réalisée par P’tit Kiwi · données fictives</p>
      </div>
    </footer>
  )
}
