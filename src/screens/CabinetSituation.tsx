import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { NoteSituation } from '../components/Note'
import { Avatar, ClarteMark } from '../components/ui/ui'
import { DATES, PERSONNES, conseillerNom } from '../data/demo'
import { dateCourte } from '../lib/format'
import { useStore } from '../lib/store'

const ETAPES = [
  `Lecture de la balance Pennylane au ${DATES.arreteTexte}…`,
  'Comparaison avec la situation de juillet et l’an dernier…',
  'Projection de la trésorerie à 90 jours…',
  'Rédaction de la synthèse…',
]
let dejaRedige = false

export default function CabinetSituation() {
  const reduce = useReducedMotion()
  const nav = useNavigate()
  const { situation, setSituation, setProfil, toast } = useStore()
  const envoyee = situation.statut === 'envoyee'
  const [etape, setEtape] = useState(reduce || dejaRedige || envoyee ? ETAPES.length : 0)
  const [ecrit, setEcrit] = useState(reduce || dejaRedige || envoyee)
  const [envoi, setEnvoi] = useState<'idle' | 'cours' | 'ok'>(envoyee ? 'ok' : 'idle')
  const debut = useState(() => performance.now())[0]
  const [duree, setDuree] = useState<number | null>(null)

  useEffect(() => {
    if (etape >= ETAPES.length) return
    const t = setTimeout(() => setEtape((e) => e + 1), 650)
    return () => clearTimeout(t)
  }, [etape])

  const onEdit = (id: string, texte: string) => setSituation({ edits: { ...situation.edits, [id]: texte } })
  const nbModifs = Object.keys(situation.edits).length
  const valider = () => {
    setEnvoi('cours')
    setTimeout(() => {
      setSituation({ statut: 'envoyee' })
      setEnvoi('ok')
      setDuree(Math.max(1, Math.round((performance.now() - debut) / 60000)))
      toast(`Situation envoyée à ${PERSONNES.sophie.prenom} ${PERSONNES.sophie.nom}`, 'Elle la retrouve dans son espace dirigeant.')
    }, reduce ? 0 : 900)
  }
  const voirCoteDirigeant = () => { setProfil('piloter'); nav('/piloter/situation') }
  const recommencer = () => { dejaRedige = false; setSituation({ statut: 'pre', edits: {} }); setEnvoi('idle'); setEtape(0); setEcrit(false) }

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <Link to="/cabinet" className="text-[13.5px] text-encre-2 hover:text-marine">← Portefeuille</Link>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="surtitre mb-3">Offre Piloter · situation trimestrielle</div>
          <h1 className="text-[36px] leading-[1.05] md:text-[50px]">{PERSONNES.sophie.entreprise}</h1>
          <p className="mt-2 text-[15px] text-encre-2">{PERSONNES.sophie.prenom} {PERSONNES.sophie.nom} · {PERSONNES.sophie.forme} à {PERSONNES.sophie.ville} · comptes au {DATES.arreteTexte}</p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-papier px-4 py-2 text-[13px] ring-1 ring-marine/10"><ClarteMark actif={!ecrit} /> L’IA prépare · l’expert valide</span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div data-tour="note" className="carte relative p-5 md:p-10">
          {etape < ETAPES.length ? (
            <ul className="space-y-2 py-6" aria-live="polite">
              {ETAPES.map((e, i) => (
                <li key={e} className={`flex items-center gap-3 text-[15px] transition-opacity duration-300 ${i <= etape ? 'opacity-100' : 'opacity-0'}`}>
                  {i < etape ? <span aria-hidden className="grid h-5 w-5 place-items-center rounded-full bg-bon-fond text-[11px] text-bon">✓</span> : <span aria-hidden className="h-5 w-5 animate-spin rounded-full border-2 border-or/30 border-t-or" />}
                  <span className={i < etape ? 'text-encre-3' : ''}>{e}</span>
                </li>
              ))}
            </ul>
          ) : (
            <>
              {ecrit && envoi !== 'ok' && (
                <div className="no-print mb-5 flex items-center gap-2 rounded-xl bg-ivoire px-3 py-2 text-[13px] text-encre-2">
                  <svg aria-hidden width="14" height="14" viewBox="0 0 14 14"><path d="M2 10.5V12h1.5l6.6-6.6-1.5-1.5L2 10.5zM11.3 4.2a.8.8 0 000-1.1l-.9-.9a.8.8 0 00-1.1 0l-.8.8 2 2 .8-.8z" fill="currentColor" /></svg>
                  Cliquez sur un paragraphe pour le modifier.{nbModifs > 0 && <span className="font-semibold text-or-texte"> {nbModifs} modification{nbModifs > 1 ? 's' : ''} enregistrée{nbModifs > 1 ? 's' : ''}.</span>}
                </div>
              )}
              <NoteSituation edits={situation.edits} mode={ecrit ? (envoi === 'ok' ? 'lecture' : 'edition') : 'redaction'} onEdit={onEdit} onFini={() => { dejaRedige = true; setEcrit(true) }} />
            </>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[92px] lg:h-fit">
          <div className="carte p-5">
            <div className="flex items-center gap-3">
              <Avatar initiales="CA" taille={42} or />
              <div><div className="text-[14.5px] font-semibold">{conseillerNom}</div><div className="text-[12.5px] text-encre-3">relecture et validation</div></div>
            </div>
            <ul className="mt-4 space-y-2.5 text-[13.5px]">
              {[
                ['Chiffres repris de Pennylane', ecrit],
                ['Cohérence avec le cockpit et le simulateur', ecrit],
                ['Seuils et taux à confirmer', ecrit],
                ['Mot personnel relu', ecrit && (nbModifs > 0 || envoi === 'ok')],
              ].map(([l, ok]) => (
                <li key={l as string} className="flex items-center gap-2.5">
                  <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${ok ? 'bg-bon-fond text-bon' : 'border border-marine/20 text-transparent'}`}>✓</span>
                  <span className={ok ? '' : 'text-encre-3'}>{l as string}</span>
                </li>
              ))}
            </ul>
            <div className="filet-or my-4" />
            <AnimatePresence mode="wait">
              {envoi !== 'ok' ? (
                <motion.button key="v" type="button" disabled={!ecrit || envoi === 'cours'} onClick={valider} exit={{ opacity: 0 }}
                  className="btn btn-primaire w-full !min-h-[52px] !text-[15px] disabled:opacity-50">
                  {envoi === 'cours' ? <><span aria-hidden className="h-4 w-4 animate-spin rounded-full border-2 border-ivoire/30 border-t-ivoire" /> Envoi…</> : 'Valider et envoyer au client'}
                </motion.button>
              ) : (
                <motion.div key="ok" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-bon-fond p-3 text-bon">
                    <svg aria-hidden width="22" height="22" viewBox="0 0 22 22"><circle cx="11" cy="11" r="10" fill="currentColor" opacity=".15" /><path d="M6.5 11.4l3 3 6-6.6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" /></svg>
                    <div className="text-[14px] font-semibold leading-snug">Validée et envoyée à {PERSONNES.sophie.prenom}<span className="block text-[12.5px] font-normal">{duree ? `Préparée en ${duree} min au lieu de 3 h 30` : 'Disponible dans son espace dirigeant'}</span></div>
                  </div>
                  <button type="button" onClick={voirCoteDirigeant} className="btn btn-ligne w-full">Voir côté dirigeant</button>
                  <button type="button" onClick={recommencer} className="w-full text-center text-[12.5px] text-encre-3 underline decoration-or/50 underline-offset-2 hover:text-marine">Rejouer la rédaction</button>
                </motion.div>
              )}
            </AnimatePresence>
            {envoi !== 'ok' && <p className="mt-3 text-center text-[12px] text-encre-3">Rendez-vous trimestriel le {dateCourte(DATES.rdvSophie)}</p>}
          </div>
          <div className="rounded-2xl border border-or/40 bg-[#FBF5E8] p-4 text-[13.5px] leading-relaxed">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] text-or-texte"><ClarteMark /> Pourquoi c’est rentable</div>
            Sans Clarté, une situation demande environ 3 h 30. Ici, le conseiller relit, ajuste et signe : la valeur de son expertise, sans la saisie.
          </div>
        </aside>
      </div>
    </div>
  )
}
