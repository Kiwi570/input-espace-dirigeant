import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { answerById, suggestions, trouverReponse } from '../../data/clarte'
import { conseillerNom } from '../../data/demo'
import { useStore } from '../../lib/store'
import { ClarteMark } from '../ui/ui'
import { AnswerView } from './AnswerView'

const termines = new Set<string>()
const estMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)
export const raccourci = estMac ? '⌘K' : 'Ctrl+K'

export function ClartePanel() {
  const { clarteOuvert, ouvrirClarte, fil, demanderClarte, questionLibre, viderFil, profil } = useStore()
  const { pathname } = useLocation()
  const [texte, setTexte] = useState('')
  const corps = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const retour = useRef<HTMLElement | null>(null)
  const suivreBas = useRef(true)

  // ⌘K / Ctrl+K, Échap
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); ouvrirClarte() }
      else if (e.key === 'Escape' && clarteOuvert) ouvrirClarte(false)
    }
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [clarteOuvert, ouvrirClarte])

  useEffect(() => {
    if (clarteOuvert) {
      retour.current = document.activeElement as HTMLElement
      const t = setTimeout(() => input.current?.focus({ preventScroll: true }), 260)
      return () => clearTimeout(t)
    } else if (retour.current && document.contains(retour.current)) {
      retour.current.focus({ preventScroll: true })
    }
  }, [clarteOuvert])

  // garder le bas de la conversation visible pendant l'écriture
  const auBas = useCallback(() => {
    const el = corps.current
    if (el && suivreBas.current) el.scrollTop = el.scrollHeight
  }, [])
  useEffect(() => { suivreBas.current = true; auBas() }, [fil.length, auBas])

  const ids = suggestions(profil, pathname)
  const deja = new Set(fil.filter((m) => m.role === 'clarte').map((m) => (m.role === 'clarte' ? m.answerId : '')))
  const proposees = ids.filter((id) => !deja.has(id)).slice(0, 4)

  const envoyer = (e: React.FormEvent) => {
    e.preventDefault()
    const q = texte.trim()
    if (!q) return
    const id = trouverReponse(q, profil)
    questionLibre(q, id ?? '__inconnue')
    setTexte('')
  }

  return (
    <AnimatePresence>
      {clarteOuvert && (
        <>
          <motion.div key="voile" className="fixed inset-0 z-[55] bg-marine-950/30 md:bg-marine-950/10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => ouvrirClarte(false)} aria-hidden />
          <motion.aside
            key="panneau"
            role="dialog"
            aria-modal="true"
            aria-labelledby="clarte-titre"
            className="fixed inset-y-0 right-0 z-[60] flex w-full flex-col bg-papier shadow-[-30px_0_60px_-30px_rgba(6,23,54,.45)] md:w-[468px] md:border-l md:border-marine/10"
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.34, ease: [0.22, 0.8, 0.24, 1] }}
            onKeyDown={(e) => {
              if (e.key !== 'Tab') return
              const f = (e.currentTarget as HTMLElement).querySelectorAll<HTMLElement>('button, input, a[href]')
              if (!f.length) return
              const first = f[0], last = f[f.length - 1]
              if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
              else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
            }}
          >
            {/* en-tête */}
            <header className="relative flex items-center gap-3 border-b border-marine/10 px-5 pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-marine"><ClarteMark actif={false} /></span>
              <div className="min-w-0 flex-1">
                <h2 id="clarte-titre" className="font-display text-[22px] italic leading-none">Clarté</h2>
                <p className="mt-1 truncate text-[12px] text-encre-3">L’IA prépare · {conseillerNom} valide</p>
              </div>
              {fil.length > 0 && (
                <button type="button" onClick={viderFil} className="min-h-[44px] rounded-full px-3 text-[12.5px] text-encre-2 hover:bg-marine/5">Nouvelle question</button>
              )}
              <button type="button" onClick={() => ouvrirClarte(false)} aria-label="Fermer Clarté" className="grid h-11 w-11 place-items-center rounded-full hover:bg-marine/5">
                <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              </button>
              <div className="filet-or absolute inset-x-0 bottom-0" />
            </header>

            {/* conversation */}
            <div ref={corps} className="defile-fin flex-1 space-y-5 overflow-y-auto px-5 py-5"
              onScroll={(e) => { const el = e.currentTarget; suivreBas.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60 }}>
              {fil.length === 0 && (
                <div className="space-y-3 pt-2">
                  <p className="font-display text-[24px] leading-snug">Bonjour. Que voulez-vous comprendre aujourd’hui ?</p>
                  <p className="text-[14px] leading-relaxed text-encre-2">Je lis vos chiffres Pennylane, je prépare l’analyse et les options. Votre conseillère INPUT valide avant toute décision.</p>
                </div>
              )}
              {fil.map((m) => m.role === 'user' ? (
                <div key={m.id} className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-br-md bg-marine px-4 py-2.5 text-[14px] text-ivoire">{m.text}</div>
                </div>
              ) : (
                <div key={m.id} className="flex gap-3">
                  <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-or/50"><ClarteMark className="scale-[.8]" /></span>
                  <div className="min-w-0 flex-1">
                    <AnswerView answerId={m.answerId} free={m.free} instant={termines.has(m.id)} onProgress={auBas} onFini={() => termines.add(m.id)} />
                  </div>
                </div>
              ))}
              {proposees.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-semibold uppercase tracking-[.18em] text-encre-3">{fil.length ? 'Autres questions' : 'Questions suggérées'}</div>
                  <div className="flex flex-col gap-2">
                    {proposees.map((id) => { const q = answerById(id)!; return (
                      <button key={id} type="button" onClick={() => demanderClarte(id, q.question)}
                        className="group flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-marine/12 bg-papier px-3.5 py-2 text-left text-[14px] transition hover:border-or hover:bg-[#FBF5E8]">
                        <span>{q.question}</span>
                        <span aria-hidden className="text-or transition group-hover:translate-x-0.5">→</span>
                      </button>
                    ) })}
                  </div>
                </div>
              )}
            </div>

            {/* saisie */}
            <form onSubmit={envoyer} className="border-t border-marine/10 px-4 pb-[max(.9rem,env(safe-area-inset-bottom))] pt-3">
              <label htmlFor="clarte-saisie" className="sr-only">Votre question à Clarté</label>
              <div className="flex items-center gap-2 rounded-2xl border border-marine/15 bg-ivoire/60 pl-4 pr-1.5 focus-within:border-or">
                <input id="clarte-saisie" ref={input} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="Posez votre question…" autoComplete="off"
                  className="min-h-[48px] flex-1 bg-transparent text-[15px] outline-none placeholder:text-encre-3" />
                <button type="submit" aria-label="Envoyer la question" disabled={!texte.trim()}
                  className="grid h-10 w-10 place-items-center rounded-xl bg-marine text-ivoire transition disabled:opacity-35">
                  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden><path d="M2.5 8h10M8.5 3.5L13 8l-4.5 4.5" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </div>
              <p className="mt-2 hidden text-center text-[11.5px] text-encre-3 md:block">{raccourci} pour ouvrir ou fermer · Échap pour fermer</p>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export function ClarteFab() {
  const { ouvrirClarte, clarteOuvert } = useStore()
  return (
    <AnimatePresence>
      {!clarteOuvert && (
        <motion.button type="button" onClick={() => ouvrirClarte(true)} data-tour="clarte-fab"
          initial={{ opacity: 0, y: 16, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3 }}
          className="no-print fixed bottom-[max(1.1rem,env(safe-area-inset-bottom))] right-4 z-50 flex h-14 items-center gap-3 rounded-full bg-marine pl-[19px] pr-5 text-ivoire shadow-[0_18px_40px_-14px_rgba(6,23,54,.7)] ring-1 ring-or/40 transition hover:bg-marine-800 md:right-8 md:bottom-8"
          aria-label={`Ouvrir Clarté, l’assistante (${raccourci})`}>
          <ClarteMark />
          <span className="font-display text-[17px] italic">Clarté</span>
          <kbd className="hidden rounded-md border border-ivoire/20 px-1.5 py-0.5 font-sans text-[11px] text-brume md:inline">{raccourci}</kbd>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
