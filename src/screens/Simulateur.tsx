import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useId, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SimChart } from '../components/charts/charts'
import { ClarteMark, Mention } from '../components/ui/ui'
import { DATES, MOREL, SIM_LABELS, SIM_MOIS, conseillerNom } from '../data/demo'
import {
  DEFAUT_INVESTIR, DEFAUT_PRIX, DEFAUT_RECRUTER, REF, coutsFinancement, simulerInvestissement, simulerPrix, simulerRecrutement,
  type ParamsInvestir, type ParamsPrix, type ParamsRecruter, type SimResult,
} from '../data/model'
import { dateCourte, eur, keur, pct, signe } from '../lib/format'
import { useStore } from '../lib/store'

type Scenario = 'recruter' | 'investir' | 'prix'
const ONGLETS: { id: Scenario; label: string; sous: string }[] = [
  { id: 'recruter', label: 'Recruter', sous: 'un chargé d’affaires' },
  { id: 'investir', label: 'Investir', sous: 'dans une machine à commande numérique' },
  { id: 'prix', label: 'Augmenter mes prix', sous: 'pour retrouver votre marge' },
]
const r = Math.round

function Curseur({ label, value, min, max, step, onChange, format, aide }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; format: (v: number) => string; aide?: string }) {
  const id = useId()
  const p = ((value - min) / (max - min)) * 100
  return (
    <div className="py-3">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[14px] font-semibold">{label}</label>
        <output htmlFor={id} className="num text-[15px] font-semibold text-marine">{format(value)}</output>
      </div>
      {aide && <div className="text-[12px] text-encre-3">{aide}</div>}
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={format(value)} className="curseur mt-1" style={{ ['--p' as string]: `${p}%` }} />
      <div className="flex justify-between text-[11.5px] text-encre-3"><span>{format(min)}</span><span>{format(max)}</span></div>
    </div>
  )
}

function Chiffre({ label, base, valeur, format, alerte }: { label: string; base: number; valeur: number; format: (n: number) => string; alerte?: boolean }) {
  const d = valeur - base
  const same = Math.abs(d) < 0.5
  return (
    <div className="rounded-2xl border border-marine/10 bg-papier p-4">
      <div className="text-[12.5px] text-encre-2">{label}</div>
      <motion.div key={r(valeur)} initial={{ opacity: 0.4, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
        className={`display-num mt-1 text-[32px] leading-none md:text-[36px] ${alerte ? 'text-alerte' : ''}`}>{format(valeur)}</motion.div>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12.5px]">
        <span className="text-encre-3">sans décision {format(base)}</span>
        {!same && <span className={`num rounded-full px-2 py-0.5 font-semibold ${d > 0 ? 'bg-bon-fond text-bon' : 'bg-alerte-fond text-alerte'}`}>{signe(r(d), (n) => keur(n))}</span>}
      </div>
    </div>
  )
}

function commentaire(s: Scenario, res: SimResult, pr: ParamsRecruter, pi: ParamsInvestir, pp: ParamsPrix): string[] {
  const low = r(res.pointBas.valeur)
  const lowBase = r(res.pointBasBase.valeur)
  const moisLow = SIM_LABELS[res.pointBas.index]
  if (s === 'recruter') {
    const m = SIM_MOIS[pr.arrivee]
    const n = res.extra.rentableMois
    const out = [
      `Avec une arrivée en ${m}, votre point bas ${low < lowBase ? `descend à ${keur(low)} (contre ${keur(lowBase)})` : `reste à ${keur(low)}`}. Le poste coûte environ ${eur(Math.round(res.extra.coutMensuel * 100) * 10)} par mois, charges comprises.`,
      n ? `S’il apporte ${keur(pr.caMensuel)} de chiffre d’affaires par mois une fois lancé, il couvre son coût dès son ${n}e mois. Sur 12 mois, votre résultat ${res.resultat >= res.resultatBase ? 'passe' : 'baisse'} à ${keur(r(res.resultat))}.`
        : `À ${keur(pr.caMensuel)} de chiffre d’affaires par mois, le poste ne couvre pas son coût sur l’année : votre résultat baisse à ${keur(r(res.resultat))}.`,
    ]
    if (pr.arrivee < 3 && low < lowBase) out.push(`Une arrivée en mars, après le creux de février, garderait votre point bas à ${keur(r(REF.recrutementMars.pointBas.valeur))}.`)
    if (low < 0) out.push('Attention : votre trésorerie passerait sous zéro. Ce calendrier n’est pas tenable sans financement.')
    return out
  }
  if (s === 'investir') {
    const m = SIM_MOIS[pi.livraison]
    const c = coutsFinancement(pi.montant, pi.apport)
    const out: string[] = []
    if (pi.mode === 'credit') {
      out.push(`Livrée en ${m} et financée à crédit, la machine demande un apport de ${keur(r(c.credit.apport))} et une avance de TVA de ${keur(r(pi.montant * 0.2))} pendant un mois. Point bas : ${keur(low)} en ${moisLow}.`)
      if (low < 0) out.push('Votre trésorerie passerait sous zéro. Un crédit-bail, ou une livraison à partir d’avril, éviterait ce passage.')
      out.push(`Coût total sur 5 ans : ${keur(c.credit.total, 1)}, soit environ ${keur(r(c.creditBail.total - c.credit.total))} de moins qu’un crédit-bail.`)
    } else {
      out.push(`En crédit-bail, ni apport ni avance de TVA : un loyer d’environ ${eur(c.creditBail.mensualite * 1000)} par mois dès la livraison en ${m}. Point bas : ${keur(low)}.`)
      out.push(`Coût total sur 5 ans : ${keur(c.creditBail.total, 1)}, soit environ ${keur(r(c.creditBail.total - c.credit.total))} de plus qu’un crédit. C’est le prix de la sécurité.`)
    }
    out.push(`Avec un gain de marge de ${keur(pi.gain, 1)} par mois, votre résultat annuel atteint ${keur(r(res.resultat))}.`)
    return out
  }
  const m = SIM_MOIS[pp.debut]
  const taux = res.extra.tauxMarge
  const out = [
    `Une hausse de ${pct(pp.hausse)} appliquée aux devis de ${m} ramène votre marge brute à ${pct(taux)}${taux >= MOREL.margeBruteN1 ? ', au niveau de l’an dernier' : ''}.`,
    `Avec ${pct(pp.perteVolume)} de volume perdu, votre résultat annuel ${res.resultat >= res.resultatBase ? 'passe' : 'baisse'} à ${keur(r(res.resultat))}. La hausse reste gagnante tant que vous perdez moins de ${pct(res.extra.perteMax, 0)} de volume.`,
  ]
  if (pp.perteVolume > res.extra.perteMax) out.push('À ce niveau de perte de volume, la hausse vous coûterait plus qu’elle ne rapporte.')
  out.push('Elle ne règle pas le creux de février : ses effets arrivent en trésorerie à partir d’avril.')
  return out
}

export default function Simulateur() {
  const [sp, setSp] = useSearchParams()
  const s = (['recruter', 'investir', 'prix'].includes(sp.get('scenario') ?? '') ? sp.get('scenario') : 'recruter') as Scenario
  const [pr, setPr] = useState<ParamsRecruter>(DEFAUT_RECRUTER)
  const [pi, setPi] = useState<ParamsInvestir>(DEFAUT_INVESTIR)
  const [pp, setPp] = useState<ParamsPrix>(DEFAUT_PRIX)
  const [envoye, setEnvoye] = useState<Record<Scenario, boolean>>({ recruter: false, investir: false, prix: false })
  const { ajouterPlan, demander, toast } = useStore()

  const res = useMemo(() => (s === 'recruter' ? simulerRecrutement(pr) : s === 'investir' ? simulerInvestissement(pi) : simulerPrix(pp)), [s, pr, pi, pp])
  const texte = commentaire(s, res, pr, pi, pp)
  const [calcul, setCalcul] = useState(false)
  useEffect(() => { setCalcul(true); const t = setTimeout(() => setCalcul(false), 380); return () => clearTimeout(t) }, [pr, pi, pp, s])

  const titrePlan = s === 'recruter' ? `Recruter un chargé d’affaires · arrivée en ${SIM_MOIS[pr.arrivee]} 2027`
    : s === 'investir' ? `Financer la machine en ${pi.mode === 'credit' ? 'crédit' : 'crédit-bail'} · livraison en ${SIM_MOIS[pi.livraison]}`
      : `Hausse de prix de ${pct(pp.hausse)} sur les devis de ${SIM_MOIS[pp.debut]}`
  const preparer = () => {
    ajouterPlan('piloter', { titre: titrePlan, echeance: DATES.rdvSophie.slice(0, 10), qui: 'conseiller', origine: 'Simulateur' })
    demander('piloter', titrePlan)
    setEnvoye((e) => ({ ...e, [s]: true }))
    toast(`Décision transmise à ${conseillerNom}`, `Elle reprendra votre simulation au rendez-vous du ${dateCourte(DATES.rdvSophie, false)}.`)
  }
  const estDefaut = JSON.stringify(s === 'recruter' ? pr : s === 'investir' ? pi : pp) === JSON.stringify(s === 'recruter' ? DEFAUT_RECRUTER : s === 'investir' ? DEFAUT_INVESTIR : DEFAUT_PRIX)
  const reset = () => { if (s === 'recruter') setPr(DEFAUT_RECRUTER); else if (s === 'investir') setPi(DEFAUT_INVESTIR); else setPp(DEFAUT_PRIX) }
  const moisFmt = (v: number) => SIM_MOIS[v]

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <div className="surtitre mb-3">Décider</div>
      <h1 className="text-[38px] leading-[1.05] md:text-[54px]">Simulateur de décision</h1>
      <p className="mt-3 max-w-[640px] text-[15.5px] text-encre-2">Faites varier une hypothèse : votre trésorerie sur 12 mois et votre résultat se mettent à jour, et Clarté commente. Base : comptes au {DATES.arreteTexte}, trésorerie de {keur(MOREL.tresorerie)} aujourd’hui.</p>

      <div role="tablist" aria-label="Scénarios" className="mt-7 inline-flex w-full flex-wrap gap-1 rounded-2xl border border-marine/10 bg-papier p-1 md:w-auto">
        {ONGLETS.map((o) => (
          <button key={o.id} role="tab" aria-selected={s === o.id} aria-controls="sim-panneau" id={`onglet-${o.id}`} type="button"
            onClick={() => setSp({ scenario: o.id }, { replace: true })}
            className={`relative min-h-[48px] flex-1 rounded-xl px-4 text-left transition md:flex-none md:px-5 ${s === o.id ? 'text-ivoire' : 'text-marine hover:bg-ivoire'}`}>
            {s === o.id && <motion.span layoutId="onglet-sim" className="absolute inset-0 rounded-xl bg-marine" transition={{ duration: 0.3, ease: [0.22, 0.8, 0.24, 1] }} />}
            <span className="relative block text-[14.5px] font-semibold leading-tight">{o.label}</span>
            <span className={`relative hidden text-[11.5px] leading-tight md:block ${s === o.id ? 'text-brume' : 'text-encre-3'}`}>{o.sous}</span>
          </button>
        ))}
      </div>

      <div id="sim-panneau" role="tabpanel" aria-labelledby={`onglet-${s}`} data-tour="simulateur" className="mt-5 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* hypothèses */}
        <div className="carte h-fit p-5 md:p-6 lg:sticky lg:top-[92px]">
          <div className="flex items-center justify-between">
            <h2 className="font-sans text-[12px] font-semibold uppercase tracking-[.16em] text-or-texte">Vos hypothèses</h2>
            <button type="button" onClick={reset} disabled={estDefaut} className="min-h-[36px] rounded-full px-2 text-[12.5px] text-encre-3 hover:text-marine disabled:opacity-40">Réinitialiser</button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={s} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.2 }} className="divide-y divide-marine/[.07]">
              {s === 'recruter' && (<>
                <Curseur label="Mois d’arrivée" value={pr.arrivee} min={1} max={6} step={1} format={moisFmt} onChange={(v) => setPr({ ...pr, arrivee: v })} />
                <Curseur label="Salaire brut mensuel" value={pr.brut} min={2800} max={4200} step={100} format={eur} onChange={(v) => setPr({ ...pr, brut: v })} aide="Chargé d’affaires · charges patronales estimées à 42 %" />
                <Curseur label="Chiffre d’affaires apporté par mois" value={pr.caMensuel} min={0} max={30} step={1} format={(v) => keur(v)} onChange={(v) => setPr({ ...pr, caMensuel: v })} aide="Une fois le poste lancé" />
                <Curseur label="Montée en charge" value={pr.montee} min={3} max={9} step={1} format={(v) => `${v} mois`} onChange={(v) => setPr({ ...pr, montee: v })} />
              </>)}
              {s === 'investir' && (<>
                <div className="py-3">
                  <div className="mb-2 text-[14px] font-semibold">Financement</div>
                  <div className="grid grid-cols-2 gap-1 rounded-xl bg-ivoire p-1" role="radiogroup" aria-label="Financement">
                    {(['credit', 'credit-bail'] as const).map((m) => (
                      <button key={m} type="button" role="radio" aria-checked={pi.mode === m} onClick={() => setPi({ ...pi, mode: m })}
                        className={`min-h-[42px] rounded-lg text-[14px] font-semibold transition ${pi.mode === m ? 'bg-papier text-marine shadow-sm' : 'text-encre-2'}`}>{m === 'credit' ? 'Crédit 5 ans' : 'Crédit-bail 5 ans'}</button>
                    ))}
                  </div>
                </div>
                <Curseur label="Montant de la machine" value={pi.montant} min={80} max={160} step={10} format={(v) => keur(v)} onChange={(v) => setPi({ ...pi, montant: v })} aide="Hors taxes" />
                <Curseur label="Mois de livraison" value={pi.livraison} min={1} max={6} step={1} format={moisFmt} onChange={(v) => setPi({ ...pi, livraison: v })} />
                {pi.mode === 'credit' && <Curseur label="Apport demandé par la banque" value={pi.apport * 100} min={0} max={40} step={5} format={(v) => pct(v, 0)} onChange={(v) => setPi({ ...pi, apport: v / 100 })} />}
                <Curseur label="Gain de marge par mois" value={pi.gain} min={0} max={8} step={0.5} format={(v) => keur(v, 1)} onChange={(v) => setPi({ ...pi, gain: v })} aide="Heures d’usinage économisées, sous-traitance évitée" />
              </>)}
              {s === 'prix' && (<>
                <Curseur label="Hausse de vos prix" value={pp.hausse} min={0} max={8} step={0.5} format={(v) => pct(v)} onChange={(v) => setPp({ ...pp, hausse: v })} />
                <Curseur label="À partir des devis de" value={pp.debut} min={1} max={4} step={1} format={moisFmt} onChange={(v) => setPp({ ...pp, debut: v })} />
                <Curseur label="Volume perdu" value={pp.perteVolume} min={0} max={10} step={0.5} format={(v) => pct(v)} onChange={(v) => setPp({ ...pp, perteVolume: v })} aide="Clients qui renonceraient à cause de la hausse" />
              </>)}
            </motion.div>
          </AnimatePresence>
          <Mention className="mt-3">Hypothèses illustratives · à valider par votre conseiller</Mention>
        </div>

        {/* résultats */}
        <div className="min-w-0 space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Chiffre label="Trésorerie dans 12 mois" base={res.treso12Base} valeur={res.treso12} format={(n) => keur(r(n))} />
            <Chiffre label={`Point bas · ${res.pointBas.index === 0 ? 'aujourd’hui' : `mi-${SIM_LABELS[res.pointBas.index]}`}`} base={res.pointBasBase.valeur} valeur={res.pointBas.valeur} format={(n) => keur(r(n))} alerte={res.pointBas.valeur < 0} />
            <Chiffre label="Résultat net annuel" base={res.resultatBase} valeur={res.resultat} format={(n) => keur(r(n))} />
          </div>

          <div className="carte p-5 md:p-6">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[21px] leading-tight">Trésorerie sur 12 mois, avant et après</h2>
              <div className="flex items-center gap-4 text-[12.5px] text-encre-2" aria-hidden>
                <span className="flex items-center gap-2"><svg width="22" height="6"><line x1="0" x2="22" y1="3" y2="3" stroke="#8E9BB8" strokeWidth="2" strokeDasharray="5 4" /></svg>Sans décision</span>
                <span className="flex items-center gap-2"><svg width="22" height="6"><line x1="0" x2="22" y1="3" y2="3" stroke="#0A2A5E" strokeWidth="2.25" /></svg>Avec la décision</span>
              </div>
            </div>
            <SimChart base={res.base} serie={res.serie} labels={SIM_LABELS} />
            <p className="mt-1 text-[12px] text-encre-3">Valeurs vers le milieu de chaque mois, une fois l’URSSAF et la TVA payées · en k€</p>
          </div>

          <div className="relative overflow-hidden rounded-[20px] border border-or/50 bg-[#FBF5E8] p-5 md:p-6" aria-live="polite">
            <div className="mb-2 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[.18em] text-or-texte">
              <ClarteMark actif={calcul} /> {calcul ? 'Clarté recalcule…' : 'Le commentaire de Clarté'}
            </div>
            <div className={`space-y-2 font-display text-[18px] leading-snug transition-opacity duration-200 ${calcul ? 'opacity-60' : 'opacity-100'}`}>
              {texte.map((t) => <p key={t}>{t}</p>)}
            </div>
            <div className="mt-3 text-[12px] text-encre-3">Analyse préparée par Clarté · à valider par votre conseiller INPUT</div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <AnimatePresence mode="wait">
              {!envoye[s] ? (
                <motion.button key="go" type="button" onClick={preparer} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="btn btn-primaire w-full !min-h-[52px] !whitespace-normal !px-7 text-center !text-[15px] sm:w-auto">
                  Préparer cette décision avec mon conseiller <span aria-hidden>→</span>
                </motion.button>
              ) : (
                <motion.div key="ok" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-full bg-bon-fond px-5 py-3 text-[14px] font-semibold text-bon">
                  <svg aria-hidden width="16" height="16" viewBox="0 0 16 16"><path d="M3.5 8.4l3 3 6-6.6" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>
                  Transmise à {conseillerNom} · ajoutée à votre plan d’action
                </motion.div>
              )}
            </AnimatePresence>
            <span className="text-[13px] text-encre-3">Votre simulation sera reprise au rendez-vous du {dateCourte(DATES.rdvSophie, false)}.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
