import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { BoutonClarte } from './Cockpit'
import { MiniCurve } from '../components/charts/charts'
import { Avatar, ClarteMark, Mention } from '../components/ui/ui'
import { CAMILLE, DATES, PERSONNES, conseillerNom } from '../data/demo'
import { dateCourte, dateLongue, eur, heure, pct } from '../lib/format'
import { useStore } from '../lib/store'

const C = CAMILLE
const P = PERSONNES.camille
const M = PERSONNES.mentor

/* Prévisionnel recalculé selon l'objectif choisi (48 000 € = valeurs de référence) */
function previsionnel(caAn1: number) {
  const k = caAn1 / C.caAn1
  const fixes = [22800, 23600, 24400]
  const cas = [caAn1, Math.round(61000 * k), Math.round(72000 * k)]
  const ans = cas.map((ca, i) => { const charges = fixes[i] + Math.round(ca * 0.06); return { annee: `Année ${i + 1}`, ca, charges, resultat: ca - charges } })
  const mensuel = C.caMensuelAn1.map((v) => Math.round(v * k))
  const cumul = mensuel.reduce<number[]>((a, v) => [...a, (a.at(-1) ?? 0) + v], [])
  const pointMort = Math.round(fixes[0] / 0.94 / 100) * 100
  const mois = cumul.findIndex((v) => v >= fixes[0] / 0.94)
  return { ans, cumul, pointMort, mois }
}

function statutConseille(r: Record<string, string>) {
  if (r.associe === 'associee') return { nom: 'SARL à l’impôt sur les sociétés', pourquoi: ['Deux associées : un cadre clair pour les apports et les décisions.', 'Charges déductibles : loyer, matériel, assurances.', 'Patrimoine personnel séparé de celui du studio.'] }
  if (r.local === 'non') return { nom: 'Micro-entreprise', pourquoi: ['Sans local, vos charges resteront faibles.', 'Formalités très légères pour démarrer.', 'Un passage en société restera possible si le studio voit le jour.'] }
  return {
    nom: 'EURL à l’impôt sur les sociétés',
    pourquoi: [
      'Votre loyer et votre matériel pèseront plus de la moitié de votre chiffre d’affaires : en société, ils sont déduits.',
      r.revenu === 'are' ? 'Sans rémunération la première année, vos allocations peuvent continuer (à vérifier avec France Travail).' : 'Vous pourrez fixer votre rémunération selon les résultats du studio.',
      'Un cadre rassurant pour le bailleur et la banque.',
    ],
  }
}

/* ------------------------------------------------------ Questionnaire */
function Questionnaire({ onFini }: { onFini: (r: Record<string, string>) => void }) {
  const reduce = useReducedMotion()
  const [rep, setRep] = useState<Record<string, string>>({})
  const [i, setI] = useState(0)
  const [tape, setTape] = useState(false)
  const [prep, setPrep] = useState(-1)
  const bas = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (i >= C.questions.length) return
    setTape(true)
    const t = setTimeout(() => setTape(false), reduce ? 0 : 650)
    return () => clearTimeout(t)
  }, [i, reduce])
  useEffect(() => { bas.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }) }, [i, tape, prep])
  const ETAPES = ['Lecture de vos réponses…', 'Choix du statut le plus adapté…', 'Construction du prévisionnel sur 3 ans…']
  useEffect(() => {
    if (prep < 0) return
    if (prep >= ETAPES.length) { const t = setTimeout(() => onFini(rep), 300); return () => clearTimeout(t) }
    const t = setTimeout(() => setPrep((p) => p + 1), reduce ? 0 : 600)
    return () => clearTimeout(t)
  }, [prep]) // eslint-disable-line react-hooks/exhaustive-deps
  const choisir = (qid: string, c: string) => {
    const r = { ...rep, [qid]: c }
    setRep(r)
    if (i + 1 >= C.questions.length) { setI(i + 1); setPrep(0) } else setI(i + 1)
  }
  const auto = () => {
    const r = Object.fromEntries(C.questions.map((q) => [q.id, q.defaut]))
    setRep(r); setI(C.questions.length); setPrep(0)
  }
  return (
    <div className="carte mx-auto max-w-[760px] p-5 md:p-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-marine"><ClarteMark actif={tape || (prep >= 0 && prep < 3)} /></span>
          <div>
            <div className="font-display text-[20px] italic leading-none">Clarté</div>
            <div className="text-[12px] text-encre-3">Cinq questions pour construire votre feuille de route</div>
          </div>
        </div>
        <span className="num text-[13px] text-encre-3">{Math.min(i + 1, 5)} sur 5</span>
      </div>
      <div className="mb-5 h-1 rounded-full bg-marine/[.07]"><motion.div className="h-1 rounded-full bg-or" animate={{ width: `${(Math.min(i, 5) / 5) * 100}%` }} /></div>
      <div className="space-y-4" aria-live="polite">
        <p className="font-display text-[20px] leading-snug">Bonjour {P.prenom}. Vous connaissez le pilates ; je m’occupe de traduire votre projet en chiffres et en démarches.</p>
        {C.questions.slice(0, i + 1).map((q, qi) => {
          const r = rep[q.id]
          const courant = qi === i
          return (
            <div key={q.id} className="space-y-3">
              {courant && tape ? (
                <div className="flex gap-1.5 py-2" aria-label="Clarté écrit"><span className="h-2 w-2 animate-bounce rounded-full bg-or [animation-delay:-.2s]" /><span className="h-2 w-2 animate-bounce rounded-full bg-or [animation-delay:-.1s]" /><span className="h-2 w-2 animate-bounce rounded-full bg-or" /></div>
              ) : (
                <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="text-[16px] font-semibold">{q.q}</motion.p>
              )}
              {r ? (
                <div className="flex justify-end"><span className="rounded-2xl rounded-br-md bg-marine px-4 py-2.5 text-[14.5px] text-ivoire">{q.choix.find((c) => c.id === r)?.label}</span></div>
              ) : courant && !tape && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2">
                  {q.choix.map((c) => (
                    <button key={c.id} type="button" onClick={() => choisir(q.id, c.id)}
                      className={`min-h-[46px] rounded-full border px-4 text-[14.5px] transition hover:border-marine ${c.id === q.defaut ? 'border-or bg-[#FBF5E8] font-semibold' : 'border-marine/15 bg-papier'}`}>
                      {c.label}{c.id === q.defaut && <span className="sr-only"> (réponse de {P.prenom})</span>}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )
        })}
        {prep >= 0 && (
          <ul className="space-y-1.5 pt-2">
            {ETAPES.map((e, k) => (
              <li key={e} className={`flex items-center gap-2 text-[13px] transition-opacity ${k <= prep ? 'opacity-100' : 'opacity-0'}`}>
                {k < prep ? <span aria-hidden className="grid h-3.5 w-3.5 place-items-center rounded-full bg-bon-fond text-[9px] text-bon">✓</span> : <span aria-hidden className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-or/30 border-t-or" />}
                <span className="text-encre-2">{e}</span>
              </li>
            ))}
          </ul>
        )}
        <div ref={bas} />
      </div>
      {i < C.questions.length && (
        <div className="mt-6 flex items-center justify-between gap-3 border-t border-marine/[.07] pt-4">
          <span className="text-[12.5px] text-encre-3">Les réponses de {P.prenom} sont signalées en doré.</span>
          <button type="button" onClick={auto} className="lien text-[13px] text-encre-2">Répondre comme {P.prenom}</button>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------- Feuille de route */
function Bloc({ i, children, className = '' }: { i: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.section initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 + i * 0.45, ease: [0.22, 0.8, 0.24, 1] }} className={className}>
      {children}
    </motion.section>
  )
}

function FeuilleDeRoute({ rep, refaire }: { rep: Record<string, string>; refaire: () => void }) {
  const { camille, setCamille, demander, toast } = useStore()
  const caChoisi = rep.ca === '30' ? 30000 : rep.ca === '70' ? 72000 : C.caAn1
  const prev = useMemo(() => previsionnel(caChoisi), [caChoisi])
  const statut = statutConseille(rep)
  const faits = C.demarches.filter((d) => camille.demarches[d.id]).length
  const apport = rep.apport === '5' ? 5000 : rep.apport === '30' ? 30000 : C.apport
  const besoin = C.usageApport.reduce((s, u) => s + u.montant, 0)
  const [rdv, setRdv] = useState(false)
  return (
    <div className="space-y-5">
      <Bloc i={0} className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="sur-marine rounded-[24px] bg-marine p-6 text-ivoire md:p-8">
          <div className="surtitre mb-3">Statut conseillé</div>
          <h2 className="text-[32px] leading-tight md:text-[38px]">{statut.nom}</h2>
          <ul className="mt-5 space-y-2.5">
            {statut.pourquoi.map((p) => <li key={p} className="flex gap-3 text-[15px] leading-snug text-ivoire/90"><span aria-hidden className="mt-2.5 h-px w-4 shrink-0 bg-or" />{p}</li>)}
          </ul>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ivoire/10 pt-4">
            <span className="text-[12px] text-brume">Préparé par Clarté · à valider par {conseillerNom}</span>
            <BoutonClarte id="statut-camille" label="Pourquoi ce statut ?" clair />
          </div>
        </div>
        <div className="carte p-6">
          <div className="surtitre mb-3">Votre apport</div>
          <div className="display-num text-[40px] leading-none">{eur(apport)}</div>
          <ul className="mt-4 space-y-2 text-[14px]">
            {C.usageApport.map((u) => <li key={u.label} className="flex justify-between gap-3 border-b border-marine/[.06] pb-2"><span className="text-encre-2">{u.label}</span><span className="num font-semibold">{eur(u.montant)}</span></li>)}
          </ul>
          <p className="mt-3 text-[13.5px] text-encre-2">{apport < besoin ? `Il manque environ ${eur(besoin - apport)} : un prêt d’honneur ou un prêt bancaire, à préparer avec votre conseillère.` : apport > besoin ? 'Votre apport couvre le démarrage et plusieurs mois de loyer.' : 'Votre apport couvre exactement le démarrage. Le diplôme du parcours rassurera aussi votre banque.'}</p>
        </div>
      </Bloc>

      <Bloc i={1} className="carte p-5 md:p-7">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><div className="surtitre mb-2">Vos démarches</div><h2 className="text-[26px] leading-tight">À cocher, dans l’ordre</h2></div>
          <span className="num text-[13px] text-encre-3">{faits} sur {C.demarches.length} faites</span>
        </div>
        <div className="mb-4 h-1.5 rounded-full bg-marine/[.07]"><motion.div className="h-1.5 rounded-full bg-or" animate={{ width: `${(faits / C.demarches.length) * 100}%` }} /></div>
        <ul className="grid gap-x-6 md:grid-cols-2">
          {C.demarches.map((d, k) => (
            <motion.li key={d.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + k * 0.05 }}>
              <label className="flex min-h-[48px] cursor-pointer items-center gap-3 border-b border-marine/[.06] py-2">
                <input type="checkbox" checked={!!camille.demarches[d.id]} onChange={() => setCamille({ demarches: { ...camille.demarches, [d.id]: !camille.demarches[d.id] } })} className="h-[18px] w-[18px] shrink-0 accent-[#0A2A5E]" />
                <span className={`text-[14.5px] leading-snug ${camille.demarches[d.id] ? 'text-encre-3 line-through' : ''}`}>{d.label}</span>
              </label>
            </motion.li>
          ))}
        </ul>
      </Bloc>

      <Bloc i={2} className="carte grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          <div className="surtitre mb-2">Prévisionnel simplifié</div>
          <h2 className="text-[26px] leading-tight">Trois ans, en grandes lignes</h2>
          <table className="mt-4 w-full text-[14px]">
            <thead><tr className="text-left text-[12.5px] text-encre-3"><th className="pb-2 font-normal" scope="col"><span className="sr-only">Année</span></th><th className="pb-2 text-right font-normal" scope="col">Chiffre d’affaires</th><th className="pb-2 text-right font-normal" scope="col">Charges</th><th className="pb-2 text-right font-normal" scope="col">Résultat</th></tr></thead>
            <tbody>
              {prev.ans.map((a) => (
                <tr key={a.annee} className="border-t border-marine/[.07]">
                  <th scope="row" className="py-2.5 text-left font-semibold">{a.annee}</th>
                  <td className="num py-2.5 text-right">{eur(a.ca)}</td>
                  <td className="num py-2.5 text-right text-encre-2">{eur(a.charges)}</td>
                  <td className="num py-2.5 text-right font-semibold">{eur(a.resultat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-[12.5px] text-encre-3">Résultat avant votre rémunération et l’impôt.</p>
          <Mention className="mt-2">Prévisionnel illustratif · à affiner avec votre conseillère</Mention>
        </div>
        <div className="rounded-2xl bg-ivoire/70 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-[13px] text-encre-2">Chiffre d’affaires cumulé · année 1</div>
            <div className="text-right"><div className="text-[12px] text-encre-3">Point mort</div><div className="display-num text-[24px] leading-none">{eur(prev.pointMort)}</div></div>
          </div>
          <div className="mt-2"><MiniCurve values={prev.cumul} labels={C.moisAn1} low={prev.mois >= 0 ? prev.mois : undefined} lowLabel={prev.mois >= 0 ? `point mort · ${prev.mois + 1}e mois` : undefined} unit="€" /></div>
          <p className="mt-2 text-[13.5px] leading-snug">{prev.mois >= 0 ? <>Vos charges sont couvertes à partir du <strong>{prev.mois + 1}e mois</strong> d’activité, en {C.moisAn1[prev.mois].replace('.', '')}.</> : 'À ce niveau, le point mort n’est pas atteint la première année.'} Ouverture prévue en {C.ouverture}.</p>
        </div>
      </Bloc>

      <Bloc i={3} className="carte p-5 md:p-7" >
        <div id="parcours" className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><div className="surtitre mb-2">Parcours de 6 mois sur My Oneee</div><h2 className="text-[26px] leading-tight">Module {C.parcours.module} sur {C.parcours.total} · {pct(C.parcours.progressionModule, 0)} du module</h2></div>
          <BoutonClarte id="parcours" label="Où en suis-je ?" />
        </div>
        <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {C.parcours.modules.map((m, k) => {
            const etat = k + 1 < C.parcours.module ? 'fait' : k + 1 === C.parcours.module ? 'cours' : 'avenir'
            return (
              <li key={m} className={`relative overflow-hidden rounded-2xl border p-4 ${etat === 'cours' ? 'border-or bg-[#FBF5E8]' : etat === 'fait' ? 'border-marine/10 bg-ivoire/70' : 'border-marine/10 bg-papier'}`}>
                <div className="flex items-center justify-between text-[11.5px] font-semibold uppercase tracking-[.14em]">
                  <span className={etat === 'avenir' ? 'text-encre-3' : 'text-or-texte'}>Module {k + 1}</span>
                  <span className={etat === 'fait' ? 'text-bon' : etat === 'cours' ? 'text-marine' : 'text-encre-3'}>{etat === 'fait' ? 'Terminé' : etat === 'cours' ? 'En cours' : 'À venir'}</span>
                </div>
                <div className="mt-2 text-[14.5px] font-semibold leading-snug">{m}</div>
                {etat === 'cours' && <div className="mt-3 h-1.5 rounded-full bg-marine/10"><motion.div className="h-1.5 rounded-full bg-marine" initial={{ width: 0 }} animate={{ width: `${C.parcours.progressionModule}%` }} transition={{ delay: 1.8, duration: 0.8 }} /></div>}
              </li>
            )
          })}
        </ol>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="flex items-center gap-4 rounded-2xl border border-marine/10 p-4">
            <span aria-hidden className="grid h-11 w-11 place-items-center rounded-full border border-or font-display text-[18px] text-or-texte">É</span>
            <div><div className="text-[12px] text-encre-3">Examen final</div><div className="text-[15px] font-semibold">{dateLongue(DATES.examenCamille)}</div></div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-marine/10 p-4">
            <span aria-hidden className="grid h-11 w-11 place-items-center rounded-full bg-marine font-display text-[18px] text-or-clair">D</span>
            <div><div className="text-[12px] text-encre-3">À la clé</div><div className="text-[15px] font-semibold">Diplôme d’aptitude à l’entrepreneuriat</div><div className="text-[12.5px] text-encre-3">qui rassure aussi les banques et les premiers clients</div></div>
          </div>
        </div>
      </Bloc>

      <Bloc i={4} className="grid gap-5 md:grid-cols-2">
        <div className="carte flex items-start gap-4 p-5 md:p-6">
          <Avatar initiales="HM" taille={54} />
          <div className="min-w-0">
            <div className="surtitre mb-1">Votre mentor</div>
            <div className="font-display text-[22px] leading-tight">{M.prenom} {M.nom}</div>
            <p className="mt-1 text-[14px] text-encre-2">Elle {M.bio}. Membre du réseau de dirigeants INPUT.</p>
          </div>
        </div>
        <div className="carte p-5 md:p-6">
          <div className="surtitre mb-1">Prochain rendez-vous</div>
          <div className="font-display text-[22px] leading-tight">{dateLongue(DATES.rdvCamille, false).replace(/^./, (c) => c.toUpperCase())} · {heure(DATES.rdvCamille)}</div>
          <p className="mt-1 text-[14px] text-encre-2">Visio avec {M.prenom}, puis point statut avec {conseillerNom}.</p>
          {!rdv ? (
            <button type="button" className="btn btn-primaire mt-4" onClick={() => { setRdv(true); demander('lancer', 'Rendez-vous de mentorat et validation du statut'); toast('Rendez-vous confirmé', `${M.prenom} ${M.nom} vous attend le ${dateCourte(DATES.rdvCamille, false)} à ${heure(DATES.rdvCamille)}.`) }}>Confirmer le rendez-vous</button>
          ) : <div className="mt-4 inline-flex rounded-full bg-bon-fond px-4 py-2.5 text-[14px] font-semibold text-bon">Rendez-vous confirmé</div>}
        </div>
      </Bloc>
      <div className="pt-2 text-center"><button type="button" onClick={refaire} className="lien text-[13.5px] text-encre-2">Refaire le questionnaire</button></div>
    </div>
  )
}

export default function Lancer() {
  const { camille, setCamille } = useStore()
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <div className="mb-8 max-w-[720px]">
        <div className="surtitre mb-3">Se lancer · {P.projet}, {P.ville}</div>
        <h1 className="text-[44px] leading-[1.03] md:text-[62px]">{camille.fini ? <>Votre feuille de route, <em className="text-or-texte">{P.prenom}</em></> : <>Bonjour <em className="text-or-texte">{P.prenom}</em></>}</h1>
        <p className="mt-3 font-display text-[20px] italic leading-snug text-encre-2">Vous maîtrisez votre métier. Apprenez à en faire une activité pérenne.</p>
      </div>
      <AnimatePresence mode="wait">
        {!camille.fini ? (
          <motion.div key="q" exit={{ opacity: 0, y: -10 }}><Questionnaire onFini={(r) => setCamille({ reponses: r, fini: true })} /></motion.div>
        ) : (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }}><FeuilleDeRoute rep={{ ...Object.fromEntries(C.questions.map((q) => [q.id, q.defaut])), ...camille.reponses }} refaire={() => setCamille({ fini: false, reponses: {} })} /></motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
