import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { TreasuryChart } from '../components/charts/charts'
import { Avatar, ClarteMark, CountUp, Mention, PennylaneBadge, Reveal } from '../components/ui/ui'
import { Sparkline } from '../components/charts/charts'
import { answerById } from '../data/clarte'
import { APRES_FENETRE, CAUSES_POINT_BAS, DATES, ECHEANCES, LEVIERS, MOREL, PERSONNES, SITUATION, TRESO_90, conseillerNom } from '../data/demo'
import { dateCourte, dateLongue, heure, keur, nombre, pct } from '../lib/format'
import { useStore } from '../lib/store'

const S = PERSONNES.sophie
const pb = MOREL.pointBas

export const BRIEF = [
  `Votre activité progresse de ${pct(MOREL.caVar)} sur dix mois, mais votre marge recule : la hausse du bois vous a coûté environ ${keur(MOREL.margeEffet)} depuis janvier.`,
  `Votre trésorerie descendra à ${keur(pb.valeur)} le ${dateCourte(pb.date)}, quand l’URSSAF, la TVA et votre emprunt tomberont la même semaine.`,
  `Priorité de la semaine : relancer ${PERSONNES.premierClient}, qui vous doit ${keur(MOREL.retards.principal)} ; ce seul encaissement remonterait votre point bas à ${keur(LEVIERS.hestia.pointBas)}.`,
]

let briefDejaVu = false
function Brief() {
  const reduce = useReducedMotion()
  const texte = BRIEF.join(' ')
  const [n, setN] = useState(reduce || briefDejaVu ? texte.length : 0)
  useEffect(() => {
    if (n >= texte.length) { briefDejaVu = true; return }
    const t = setTimeout(() => setN((v) => Math.min(texte.length, v + 3)), n === 0 ? 700 : 16)
    return () => clearTimeout(t)
  }, [n, texte.length])
  // reconstituer les trois phrases à partir du texte tapé
  let reste = n
  const phrases = BRIEF.map((p) => { const s = p.slice(0, Math.max(0, reste)); reste -= p.length + 1; return s })
  return (
    <motion.section data-tour="brief" aria-labelledby="brief-titre" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
      className="sur-marine relative overflow-hidden rounded-[24px] bg-marine p-6 text-ivoire shadow-[0_30px_60px_-30px_rgba(6,23,54,.8)] md:p-8">
      <div aria-hidden className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-or/10 blur-2xl" />
      <div className="relative flex items-center justify-between gap-3">
        <h2 id="brief-titre" className="flex items-center gap-2.5 font-sans text-[11.5px] font-semibold uppercase tracking-[.2em] text-or-clair"><ClarteMark actif={n < texte.length} /> Le brief du jour</h2>
        <span className="text-[12px] text-brume">rédigé par Clarté</span>
      </div>
      <p className="sr-only">{texte}</p>
      <div className="relative mt-4 space-y-3 font-display text-[18.5px] leading-snug md:text-[20px]" aria-hidden>
        {phrases.map((p, i) => <p key={i} className={p.length && p.length < BRIEF[i].length ? 'curseur-texte' : ''}>{p}</p>)}
      </div>
      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ivoire/10 pt-4">
        <span className="text-[12px] text-brume">À valider avec {conseillerNom} · rendez-vous le {dateCourte(DATES.rdvSophie, false)}</span>
        <BoutonClarte id="creux" label="Approfondir" clair />
      </div>
    </motion.section>
  )
}

export function BoutonClarte({ id, label = 'Comprendre', clair = false, className = '' }: { id: string; label?: string; clair?: boolean; className?: string }) {
  const { demanderClarte } = useStore()
  const a = answerById(id)!
  return (
    <button type="button" onClick={() => demanderClarte(id, a.question)}
      className={`inline-flex min-h-[40px] items-center gap-2 rounded-full border px-3.5 text-[13px] font-semibold transition ${clair ? 'border-or/50 text-ivoire hover:bg-ivoire/10' : 'border-marine/15 text-marine hover:border-or hover:bg-[#FBF5E8]'} ${className}`}>
      <ClarteMark clair={clair} /> {label}
    </button>
  )
}

/* ---------------------------------------------------------- Indicateurs */
type Kpi = { id: string; label: string; valeur: number; format: (n: number) => string; variation: string; ton: 'bon' | 'alerte' | 'neutre'; serie: number[]; clair: string }
const KPIS: Kpi[] = [
  { id: 'ca', label: 'Chiffre d’affaires', valeur: MOREL.ca10m, format: (n) => keur(n), variation: `+${pct(MOREL.caVar)} sur un an`, ton: 'bon', serie: [...MOREL.caMensuel],
    clair: `Ce que vous avez facturé depuis janvier, hors TVA. ${keur(MOREL.ca10mN1)} un an plus tôt : votre activité progresse.` },
  { id: 'marge', label: 'Marge brute', valeur: MOREL.margeBrute, format: (n) => pct(n), variation: `−${nombre(MOREL.margeBruteN1 - MOREL.margeBrute, 1)} pt (${pct(MOREL.margeBruteN1)})`, ton: 'alerte', serie: [...MOREL.margeMensuelle],
    clair: 'Ce qu’il vous reste sur 100 € facturés, une fois le bois, les panneaux et la quincaillerie payés. Le prix du bois en a pris une partie.' },
  { id: 'ebe', label: 'Excédent brut d’exploitation', valeur: MOREL.ebe, format: (n) => keur(n), variation: `${pct(MOREL.ebePct)} du chiffre d’affaires`, ton: 'neutre', serie: [...MOREL.ebeCumule],
    clair: `Ce que gagne l’entreprise par son activité, avant amortissements, intérêts et impôt : environ 7 € sur 100 € facturés. Résultat net estimé sur l’année : ${keur(MOREL.resultatNet)}.` },
  { id: 'treso', label: 'Trésorerie', valeur: MOREL.tresorerie, format: (n) => keur(n), variation: `point bas ${keur(pb.valeur)} mi-févr.`, ton: 'alerte', serie: [...MOREL.tresoFinMois, MOREL.tresorerie],
    clair: 'L’argent disponible sur vos comptes aujourd’hui, d’après vos relevés bancaires synchronisés. Elle va baisser jusqu’à mi-février, puis remonter.' },
  { id: 'dso', label: 'Délai de paiement clients', valeur: MOREL.dso, format: (n) => `${nombre(n)} j`, variation: `objectif ${MOREL.dsoObjectif} j`, ton: 'alerte', serie: [...MOREL.dsoMensuel],
    clair: `Le temps que mettent vos clients à vous payer, en moyenne. Chaque jour gagné libère environ ${keur(MOREL.parJour)} de trésorerie.` },
]

function KpiCard({ k, i }: { k: Kpi; i: number }) {
  const [ouvert, setOuvert] = useState(false)
  const parPointeur = useRef(false)
  const carte = useRef<HTMLDivElement>(null)
  const id = `kpi-${k.id}`
  useEffect(() => {
    if (!ouvert) return
    const dehors = (e: PointerEvent) => { if (carte.current && !carte.current.contains(e.target as Node)) setOuvert(false) }
    document.addEventListener('pointerdown', dehors)
    return () => document.removeEventListener('pointerdown', dehors)
  }, [ouvert])
  return (
    <motion.div ref={carte} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.25 + i * 0.07, ease: [0.22, 0.8, 0.24, 1] }}
      tabIndex={0} role="group" aria-labelledby={`${id}-l`} aria-describedby={`${id}-d`}
      onPointerDown={() => { parPointeur.current = true }}
      onMouseEnter={(e) => { if (e.nativeEvent instanceof MouseEvent && !('ontouchstart' in window)) setOuvert(true) }} onMouseLeave={() => { if (!('ontouchstart' in window)) setOuvert(false) }}
      onFocus={() => { if (!parPointeur.current) setOuvert(true) }} onBlur={() => setOuvert(false)}
      onClick={() => { parPointeur.current = false; if ('ontouchstart' in window) setOuvert((o) => !o) }}
      className={`carte group relative flex min-h-[178px] cursor-default flex-col overflow-hidden p-4 sm:p-5 outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-or ${i === 4 ? 'col-span-2 md:col-span-1' : ''}`}>
      <div id={`${id}-l`} className="flex items-start justify-between gap-2 text-[13px] leading-tight text-encre-2">
        <span>{k.label}</span>
        <span aria-hidden className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-marine/15 font-display text-[11px] italic text-encre-3">i</span>
      </div>
      <div className="display-num mt-2 text-[28px] leading-none sm:text-[34px] md:text-[38px]"><CountUp value={k.valeur} format={k.format} duration={1100} /></div>
      <div className={`mt-2 text-[12.5px] font-semibold ${k.ton === 'bon' ? 'text-bon' : k.ton === 'alerte' ? 'text-alerte' : 'text-encre-2'}`}>{k.variation}</div>
      <div className="mt-auto pt-3"><Sparkline values={k.serie} width={150} height={34} ton={k.ton === 'alerte' ? 'alerte' : 'marine'} label={`Évolution : ${k.label}`} /></div>
      <AnimatePresence>
        {ouvert && (
          <motion.div aria-hidden initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.22 }}
            className="absolute inset-0 overflow-y-auto rounded-2xl bg-marine p-3.5 text-[12.5px] leading-snug text-ivoire sm:top-[42%] sm:rounded-b-none sm:p-4 sm:text-[13px]">
            <div className="mb-1 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[.18em] text-or-clair"><ClarteMark clair /> En clair</div>
            {k.clair}
          </motion.div>
        )}
      </AnimatePresence>
      <span id={`${id}-d`} className="sr-only">{k.clair}</span>
    </motion.div>
  )
}

/* ------------------------------------------------------- Vigilance */
const VIGILANCES = [
  { id: 'creux', niveau: 'À anticiper', titre: `Point bas de trésorerie : ${keur(pb.valeur)}`, texte: `Le ${dateCourte(pb.date)}, l’URSSAF, la TVA de janvier et l’échéance d’emprunt tombent la même semaine.` },
  { id: 'retards', niveau: 'À traiter cette semaine', titre: `${keur(MOREL.retards.total)} de factures en retard`, texte: `Six factures de plus de 60 jours, dont ${keur(MOREL.retards.principal)} chez ${PERSONNES.premierClient}, votre premier client (${pct(MOREL.dependance, 0)} du chiffre d’affaires).` },
  { id: 'marge', niveau: 'À surveiller', titre: `Marge brute en recul de ${nombre(MOREL.margeBruteN1 - MOREL.margeBrute, 1)} point`, texte: `La hausse du bois n’a pas été répercutée dans vos devis : environ ${keur(MOREL.margeEffet)} de marge en moins depuis janvier.` },
]

/* --------------------------------------------------------- Échéancier */
function Echeancier() {
  const parDate = ECHEANCES.reduce<Record<string, typeof ECHEANCES>>((a, e) => { (a[e.date] ||= []).push(e); return a }, {})
  const total = ECHEANCES.reduce((s, e) => s + e.montant, 0)
  return (
    <div className="carte p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-[22px] leading-tight">Échéancier fiscal et social</h3>
          <p className="text-[13px] text-encre-3">Les 90 prochains jours · {keur(total)} au total</p>
        </div>
        <Mention>Montants illustratifs · à valider</Mention>
      </div>
      <ol className="relative">
        {Object.entries(parDate).map(([date, items], gi) => {
          const bas = date === pb.date || date === '2027-02-15'
          return (
            <Reveal as="li" key={date} delay={gi * 0.05} className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 border-t sm:grid-cols-[64px_minmax(0,1fr)] sm:gap-4 border-marine/[.07] py-3 first:border-t-0">
              <div className="leading-tight">
                <div className="display-num text-[24px]">{dateCourte(date, false).split(' ')[0]}</div>
                <div className="text-[12px] text-encre-3">{dateCourte(date, false).split(' ')[1]}</div>
              </div>
              <ul className="space-y-1.5">
                {items.map((e) => (
                  <li key={e.libelle} className="flex items-baseline justify-between gap-3">
                    <span className="flex min-w-0 items-baseline gap-2">
                      <span aria-hidden className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${e.type === 'fiscal' ? 'bg-marine' : e.type === 'social' ? 'bg-ardoise' : 'bg-or'}`} />
                      <span className="text-[14px] font-semibold">{e.libelle}</span>
                      <span className="truncate text-[13px] text-encre-3">{e.detail}</span>
                    </span>
                    <span className="num shrink-0 text-[14px]">{keur(e.montant)}</span>
                  </li>
                ))}
                {bas && date === pb.date && <li className="text-[12.5px] font-semibold text-or-texte">→ Point bas de trésorerie : {keur(pb.valeur)}</li>}
              </ul>
            </Reveal>
          )
        })}
      </ol>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-marine/[.07] pt-3 text-[12px] text-encre-3">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-marine" />Fiscal</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-ardoise" />Social</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-or" />Financement</span>
        <span className="ml-auto">{APRES_FENETRE}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- Page */
export default function Cockpit() {
  const { plan, basculerPlan, situation } = useStore()
  const items = plan.piloter
  const envoyee = situation.statut === 'envoyee'
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
      {/* accueil + brief */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:items-end">
        <div className="pb-1">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[14px] text-encre-3">{dateLongue(DATES.aujourdhui).replace(/^./, (c) => c.toUpperCase())}</motion.div>
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mt-1 text-[46px] leading-[1.02] md:text-[68px]">
            Bonjour <em className="text-or-texte">{S.prenom}</em>
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-4 flex flex-wrap items-center gap-3 text-[13.5px] text-encre-2">
            <span className="font-semibold text-marine">{S.entreprise}</span>
            <span aria-hidden className="h-1 w-1 rounded-full bg-or" />
            <span>Comptes au {DATES.arreteTexte}</span>
            <PennylaneBadge />
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-6 flex flex-wrap gap-2 text-[13px]">
            <li><a href="#t-decider" className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-alerte-fond px-3 font-semibold text-alerte"><span className="h-1.5 w-1.5 rounded-full bg-alerte" />3 points de vigilance</a></li>
            <li><a href="#t-avancer" className="inline-flex min-h-[36px] items-center gap-2 rounded-full bg-papier px-3 text-encre-2 ring-1 ring-marine/10">Rendez-vous le {dateCourte(DATES.rdvSophie, false)} avec {PERSONNES.conseiller.prenom}</a></li>
          </motion.ul>
        </div>
        <Brief />
      </div>

      {/* COMPRENDRE */}
      <section aria-labelledby="t-comprendre" className="mt-12">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div><div className="surtitre mb-2">Comprendre</div><h2 id="t-comprendre" className="text-[28px] leading-tight md:text-[32px]">Vos chiffres, en clair</h2></div>
          <span className="hidden text-[13px] text-encre-3 md:block">Survolez un indicateur pour son explication</span>
        </div>
        <div data-tour="kpis" className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-5">
          {KPIS.map((k, i) => <KpiCard key={k.id} k={k} i={i} />)}
        </div>

        <div data-tour="tresorerie" className="carte mt-5 grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-[24px] leading-tight">Trésorerie prévisionnelle à 90 jours</h3>
                <p className="text-[13.5px] text-encre-3">Du {dateCourte(TRESO_90[0].date)} au {dateCourte(TRESO_90[TRESO_90.length - 1].date)} · relevés bancaires et échéances connues</p>
              </div>
            </div>
            <TreasuryChart points={TRESO_90} echeances={ECHEANCES} />
          </div>
          <aside className="flex flex-col rounded-2xl bg-ivoire/70 p-5">
            <div className="surtitre mb-3">Ce qui creuse le point bas</div>
            <ul className="space-y-3">
              {CAUSES_POINT_BAS.map((c) => (
                <li key={c.titre} className="border-b border-marine/[.07] pb-3 last:border-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[14px] font-semibold leading-snug">{c.titre}</span>
                    {c.montant !== null && <span className="num shrink-0 text-[14px] font-semibold">{keur(c.montant)}</span>}
                  </div>
                  <div className="text-[12.5px] leading-snug text-encre-3">{c.detail}</div>
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-4"><BoutonClarte id="creux" label="Comprendre ce creux" className="w-full justify-center" /></div>
          </aside>
        </div>
      </section>

      {/* DÉCIDER */}
      <section aria-labelledby="t-decider" className="mt-14">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><div className="surtitre mb-2">Décider</div><h2 id="t-decider" className="text-[28px] leading-tight md:text-[32px]">Trois points de vigilance détectés par Clarté</h2></div>
          <Link to="/piloter/decider" className="btn btn-primaire">Simuler une décision <span aria-hidden>→</span></Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {VIGILANCES.map((v, i) => (
            <Reveal key={v.id} delay={i * 0.08} as="article" className="carte flex flex-col p-5 md:p-6">
              <span className="flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[.14em] text-alerte">
                <svg aria-hidden width="14" height="14" viewBox="0 0 14 14"><path d="M7 1.5l6 11H1z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><path d="M7 5.5v3M7 10.4v.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
                {v.niveau}
              </span>
              <h3 className="mt-3 text-[22px] leading-snug">{v.titre}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-encre-2">{v.texte}</p>
              <div className="mt-auto pt-5"><BoutonClarte id={v.id} /></div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* AVANCER */}
      <section aria-labelledby="t-avancer" className="mt-14">
        <div className="mb-4"><div className="surtitre mb-2">Avancer</div><h2 id="t-avancer" className="text-[28px] leading-tight md:text-[32px]">Les prochaines étapes</h2></div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <Echeancier />
          <div className="flex flex-col gap-5">
            <Reveal className="carte p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="surtitre">Situation trimestrielle</span>
                <span className={`pastille ${envoyee ? '!bg-bon-fond !text-bon' : ''}`}>{envoyee ? 'Disponible' : 'En préparation'}</span>
              </div>
              <h3 className="mt-3 text-[22px]">{SITUATION.titre}</h3>
              <p className="mt-1 text-[14px] text-encre-2">{envoyee ? `Relue et validée par ${conseillerNom}.` : `Pré-rédigée par Clarté, en relecture chez ${conseillerNom}. Remise prévue le ${dateCourte(DATES.remiseSituation)}.`}</p>
              <Link to="/piloter/situation" className="lien mt-3 inline-block text-[14px] font-semibold">{envoyee ? 'Lire ma situation' : 'Voir l’aperçu'} →</Link>
            </Reveal>
            <Reveal delay={0.06} className="carte flex items-center gap-4 p-5 md:p-6">
              <Avatar initiales="CA" taille={52} or />
              <div className="min-w-0 flex-1">
                <div className="text-[12px] text-encre-3">Prochain rendez-vous</div>
                <div className="font-display text-[21px] leading-tight">{dateLongue(DATES.rdvSophie, false).replace(/^./, (c) => c.toUpperCase())} · {heure(DATES.rdvSophie)}</div>
                <div className="text-[13px] text-encre-2">{conseillerNom}, conseillère INPUT · Jarville-la-Malgrange ou visio</div>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="carte p-5 md:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="surtitre">Plan d’action</span>
                <Link to="/piloter/plan" className="lien text-[13px]">Tout voir ({items.length})</Link>
              </div>
              <ul className="space-y-1">
                {items.slice(-4).map((it) => (
                  <li key={it.id}>
                    <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl px-2 hover:bg-ivoire">
                      <input type="checkbox" checked={!!it.fait} onChange={() => basculerPlan('piloter', it.id)} className="h-[18px] w-[18px] accent-[#0A2A5E]" />
                      <span className={`flex-1 text-[14px] leading-snug ${it.fait ? 'text-encre-3 line-through' : ''}`}>{it.titre}</span>
                      {it.echeance && <span className="num shrink-0 text-[12px] text-encre-3">{dateCourte(it.echeance, false)}</span>}
                    </label>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-[12.5px] text-encre-3">Ajoutez des actions depuis Clarté ou le simulateur.</p>
            </Reveal>
          </div>
        </div>
      </section>

      <p className="mt-10 text-center text-[12px] text-encre-3">
        Chiffres issus de Pennylane au {DATES.arreteTexte} et des relevés bancaires synchronisés · Analyses préparées par Clarté, à valider par votre conseiller INPUT
      </p>
    </div>
  )
}
