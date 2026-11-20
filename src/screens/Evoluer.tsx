import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { BoutonClarte } from './Cockpit'
import { useWidth } from '../components/charts/charts'
import { Avatar, ClarteMark, CountUp, Mention, PennylaneBadge, Reveal } from '../components/ui/ui'
import { DATES, JULIEN, PERSONNES, conseillerNom } from '../data/demo'
import { dateCourte, eur, heure, pct } from '../lib/format'
import { useStore } from '../lib/store'

const J = JULIEN
const P = PERSONNES.julien
const pctTVA = (J.ca12m / J.seuilTVA) * 100
const pctMicro = (J.ca12m / J.plafondMicro) * 100
const BRIEF = [
  `Vos encaissements progressent : ${eur(J.ca12m)} sur 12 mois, soit ${pct(pctTVA, 0)} du seuil de franchise de TVA.`,
  `À ce rythme, vous le franchirez en ${J.depassement} : c’est le moment de préparer vos prix.`,
  'Votre statut peut attendre, sauf si vous embauchez un apprenti.',
]

/* Projection des 12 mois glissants face au seuil */
function ProjectionTVA() {
  const reduce = useReducedMotion()
  const [ref, W] = useWidth<HTMLDivElement>(560)
  const H = 210, m = { l: 8, r: 8, t: 30, b: 28 }
  const pts = J.projection
  const lo = 33000, hi = 39000
  const x = (i: number) => m.l + (i * (W - m.l - m.r)) / (pts.length - 1)
  const y = (v: number) => m.t + (1 - (v - lo) / (hi - lo)) * (H - m.t - m.b)
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.v)}`).join('')
  const ix = pts.findIndex((p) => p.v >= J.seuilTVA)
  return (
    <div ref={ref} className="relative">
      <svg width={W} height={H} role="img" aria-label={`Projection des 12 derniers mois : ${eur(J.ca12m)} en octobre 2026, seuil de ${eur(J.seuilTVA)} franchi en ${J.depassement}`}>
        <line x1={m.l} x2={W - m.r} y1={y(J.seuilTVA)} y2={y(J.seuilTVA)} stroke="#C9993F" strokeWidth={1.5} strokeDasharray="5 4" />
        <text x={m.l} y={y(J.seuilTVA) - 8} fontSize="11.5" fill="#8A6420" fontWeight={600}>Seuil {eur(J.seuilTVA)}</text>
        <motion.path d={d} fill="none" stroke="#0A2A5E" strokeWidth={2} strokeDasharray={undefined} initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.3 }} />
        {pts.map((p, i) => (
          <g key={p.mois}>
            <circle cx={x(i)} cy={y(p.v)} r={i === 0 ? 4.5 : 3} fill={i === 0 ? '#0A2A5E' : '#FFFDF8'} stroke="#0A2A5E" strokeWidth={1.5} />
            {(i === 0 || i === pts.length - 1 || i === 3) && <text x={x(i)} y={H - 8} fontSize="11" fill="#5B6680" textAnchor={i === 0 ? 'start' : i === pts.length - 1 ? 'end' : 'middle'}>{p.mois}</text>}
          </g>
        ))}
        {ix > 0 && (
          <motion.g initial={reduce ? false : { opacity: 0, scale: 0.6 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.2 }} style={{ transformOrigin: `${x(ix)}px ${y(pts[ix].v)}px` }}>
            <circle cx={x(ix)} cy={y(pts[ix].v)} r={10} fill="#C9993F" fillOpacity={0.2} />
            <circle cx={x(ix)} cy={y(pts[ix].v)} r={5} fill="#C9993F" stroke="#FFFDF8" strokeWidth={2} />
          </motion.g>
        )}
      </svg>
      {ix > 0 && <div className="absolute rounded-md bg-marine px-2 py-0.5 text-[11.5px] font-semibold text-ivoire" style={{ left: Math.min(x(ix) - 70, W - 160), top: y(pts[ix].v) + 14 }}>Dépassement · {J.depassement}</div>}
      <p className="text-[12px] text-encre-3">Encaissements des 12 derniers mois, projetés au rythme actuel · points creux : projection</p>
    </div>
  )
}

function Seuil({ titre, valeur, max, pctV, note, projection, accent }: { titre: string; valeur: number; max: number; pctV: number; note: string; projection?: number; accent?: boolean }) {
  const reduce = useReducedMotion()
  const k = Math.min(1, valeur / max)
  return (
    <div className={`carte p-5 md:p-6 ${accent ? 'ring-1 ring-or/50' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[20px] leading-tight">{titre}</h3>
        <span className={`display-num text-[30px] leading-none ${accent ? 'text-or-texte' : ''}`}><CountUp value={Math.round(pctV)} format={(n) => pct(n, 0)} /></span>
      </div>
      <div className="mt-1 text-[13px] text-encre-3"><span className="num font-semibold text-marine">{eur(valeur)}</span> sur {eur(max)}</div>
      <div className="relative mt-4 h-3 rounded-full bg-marine/[.08]">
        {projection && <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ width: '100%', background: 'repeating-linear-gradient(135deg, rgba(201,153,63,.45) 0 4px, transparent 4px 8px)', transformOrigin: 'left' }} initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: Math.min(1, projection / max) }} viewport={{ once: true }} transition={{ duration: 1.1, delay: 0.6 }} />}
        <motion.div className="absolute inset-y-0 left-0 w-full rounded-full bg-marine" style={{ transformOrigin: 'left' }} initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: k }} viewport={{ once: true }} transition={{ duration: 1, ease: [0.22, 0.8, 0.24, 1] }} />
      </div>
      <div className={`mt-3 text-[13.5px] ${accent ? 'font-semibold text-or-texte' : 'text-encre-2'}`}>{note}</div>
      <Mention className="mt-2">Seuil illustratif · à valider par votre conseiller</Mention>
    </div>
  )
}

function ImpactPrix() {
  const [taux, setTaux] = useState(10)
  const [part, setPart] = useState(50)
  const ht = J.interventionType.ht
  const repercute = (ht * taux / 100) * (part / 100)
  const ttc = ht + repercute
  const garde = ttc / (1 + taux / 100)
  const perte = ht - garde
  return (
    <div className="carte grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-7">
      <div>
        <div className="text-[13px] text-encre-3">Intervention type</div>
        <div className="font-display text-[22px] leading-tight">{J.interventionType.libelle}</div>
        <div className="mt-1 text-[14px] text-encre-2">Facturée <span className="num font-semibold">{eur(ht)}</span> aujourd’hui, sans TVA</div>
        <div className="mt-5">
          <div className="mb-2 text-[14px] font-semibold">Taux de TVA</div>
          <div className="inline-grid grid-cols-2 gap-1 rounded-xl bg-ivoire p-1" role="radiogroup" aria-label="Taux de TVA">
            {[10, 20].map((t) => (
              <button key={t} type="button" role="radio" aria-checked={taux === t} onClick={() => setTaux(t)} className={`min-h-[42px] rounded-lg px-5 text-[14px] font-semibold transition ${taux === t ? 'bg-papier shadow-sm' : 'text-encre-2'}`}>{pct(t, 0)}</button>
            ))}
          </div>
          <p className="mt-2 text-[12.5px] text-encre-3">10 % pour certains travaux de rénovation dans un logement de plus de deux ans, 20 % sinon.</p>
        </div>
        <div className="mt-5">
          <div className="flex items-baseline justify-between"><label htmlFor="part" className="text-[14px] font-semibold">Part de la TVA ajoutée à votre prix</label><span className="num text-[15px] font-semibold">{pct(part, 0)}</span></div>
          <input id="part" type="range" min={0} max={100} step={10} value={part} onChange={(e) => setPart(+e.target.value)} aria-valuetext={pct(part, 0)} className="curseur mt-1" style={{ ['--p' as string]: `${part}%` }} />
          <div className="flex justify-between text-[11.5px] text-encre-3"><span>Vous absorbez tout</span><span>Le client paie tout</span></div>
        </div>
      </div>
      <div className="rounded-2xl bg-ivoire/70 p-5">
        <div className="grid grid-cols-2 gap-3">
          <div><div className="text-[12.5px] text-encre-2">Votre client paie</div><div className="display-num text-[34px] leading-tight">{eur(ttc)}</div><div className="text-[12px] text-encre-3">TVA comprise · +{pct(((ttc - ht) / ht) * 100, 1)}</div></div>
          <div><div className="text-[12.5px] text-encre-2">Vous gardez</div><div className={`display-num text-[34px] leading-tight ${perte > 1 ? 'text-alerte' : ''}`}>{eur(garde)}</div><div className="text-[12px] text-encre-3">{perte > 1 ? `−${eur(perte)} par intervention` : 'votre prix est préservé'}</div></div>
        </div>
        <div className="filet-or my-4" />
        <div className="flex items-start gap-3 text-[14px] leading-relaxed">
          <ClarteMark className="mt-2" />
          <p>{part === 100 ? 'Vos clients professionnels récupèrent la TVA : pour eux, rien ne change.' : part === 0 ? 'En absorbant la TVA, vous perdez près d’un dixième de votre prix. À réserver aux clients fidèles.' : 'Répartir l’effort garde vos prix compétitifs pour les particuliers.'} En contrepartie, vous récupérerez environ <span className="num font-semibold">{eur(J.tvaRecuperable)}</span> de TVA par an sur vos achats de matériel.</p>
        </div>
        <Mention className="mt-3">Taux et montants illustratifs · à valider</Mention>
      </div>
    </div>
  )
}

function Statuts() {
  const [apprenti, setApprenti] = useState(false)
  const val = (s: (typeof J.statuts)[number]) => (apprenti ? s.avec : s.sans)
  const meilleur = [...J.statuts].sort((a, b) => val(b) - val(a))[0].id
  const max = Math.max(...J.statuts.map((s) => s.sans))
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-encre-2">Revenu disponible estimé pour vous en 2027 · {eur(J.caPrevu2027)} de chiffre d’affaires, charges réelles de {pct(J.chargesPct, 0)}</p>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-full border border-marine/12 bg-papier px-4">
          <span className="text-[14px] font-semibold">Avec un apprenti en septembre</span>
          <button type="button" role="switch" aria-checked={apprenti} onClick={() => setApprenti((a) => !a)} className={`relative h-6 w-11 rounded-full transition ${apprenti ? 'bg-marine' : 'bg-marine/20'}`}>
            <span className="sr-only">Avec un apprenti</span>
            <motion.span layout className={`absolute top-0.5 h-5 w-5 rounded-full bg-papier shadow ${apprenti ? 'left-[22px]' : 'left-0.5'}`} />
          </button>
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {J.statuts.map((s, i) => {
          const best = s.id === meilleur
          const reserve = s.reserve[apprenti ? 1 : 0]
          return (
            <Reveal key={s.id} delay={i * 0.06} className={`relative flex flex-col rounded-[20px] border p-5 transition-colors ${best ? 'border-or bg-[#FBF5E8]' : 'border-marine/10 bg-papier'}`}>
              {best && <span className="absolute -top-3 left-5 rounded-full bg-marine px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-ivoire">Le plus favorable</span>}
              <h3 className="text-[21px] leading-tight">{s.nom}</h3>
              <motion.div key={`${s.id}-${apprenti}`} initial={{ opacity: 0.3, y: 4 }} animate={{ opacity: 1, y: 0 }} className="display-num mt-3 text-[32px] leading-none">{eur(val(s))}</motion.div>
              <div className="mt-1 h-4 text-[12.5px] text-encre-3">{reserve ? `+ ${eur(reserve)} en réserve dans la société` : 'par an, pour vous'}</div>
              <div className="mt-3 h-1.5 rounded-full bg-marine/[.07]"><motion.div className={`h-1.5 rounded-full ${best ? 'bg-or' : 'bg-ardoise'}`} animate={{ width: `${(val(s) / max) * 100}%` }} transition={{ duration: 0.5 }} /></div>
              <dl className="mt-4 space-y-1.5 text-[12.5px]">
                <div><dt className="inline text-encre-3">Protection sociale : </dt><dd className="inline">{s.protection}</dd></div>
                <div><dt className="inline text-encre-3">Charges : </dt><dd className="inline">{s.charges}</dd></div>
                <div><dt className="inline text-encre-3">Formalités : </dt><dd className="inline">{s.formalites}</dd></div>
              </dl>
            </Reveal>
          )
        })}
      </div>
      <div className="mt-4 flex flex-wrap items-start gap-3 rounded-2xl border border-or/40 bg-papier p-4 text-[14.5px] leading-relaxed">
        <ClarteMark className="mt-2" />
        <p className="flex-1">{apprenti
          ? `Avec un apprenti, le réel prend l’avantage : environ ${eur(J.statuts[1].avec - J.statuts[0].avec)} de plus par an, car son coût devient déductible. En micro, il ne réduit ni vos cotisations ni votre impôt.`
          : `Sans embauche, micro et réel se valent à ${eur(J.statuts[1].sans - J.statuts[0].sans)} près. Ce qui change en mars, c’est la TVA, pas votre statut.`}</p>
        <Mention>Estimations illustratives · à valider</Mention>
      </div>
    </div>
  )
}

export default function Evoluer() {
  const { demander, toast, ajouterPlan } = useStore()
  const [envoye, setEnvoye] = useState(false)
  const preparer = () => {
    demander('evoluer', 'Préparer le passage à la TVA et le choix du statut')
    J.plan.forEach((p) => ajouterPlan('evoluer', { titre: p.titre, echeance: p.date, qui: p.qui === 'conseiller' ? 'conseiller' : 'vous', origine: 'Plan Évoluer' }))
    setEnvoye(true)
    toast(`Demande transmise à ${conseillerNom}`, `Rendez-vous confirmé le ${dateCourte(DATES.rdvJulien, false)} à ${heure(DATES.rdvJulien)}.`)
  }
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end">
        <div>
          <div className="surtitre mb-3">Évoluer · {P.metier}, {P.ville}</div>
          <h1 className="text-[46px] leading-[1.02] md:text-[64px]">Bonjour <em className="text-or-texte">{P.prenom}</em></h1>
          <p className="mt-3 max-w-[480px] font-display text-[20px] italic leading-snug text-encre-2">Votre activité grandit. Faites évoluer votre entreprise au bon moment.</p>
          <div className="mt-4"><PennylaneBadge /></div>
        </div>
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="sur-marine rounded-[24px] bg-marine p-6 text-ivoire md:p-8" aria-label="Le brief de Clarté">
          <div className="flex items-center gap-2.5 text-[11.5px] font-semibold uppercase tracking-[.2em] text-or-clair"><ClarteMark /> Le brief de Clarté</div>
          <div className="mt-4 space-y-2.5 font-display text-[19px] leading-snug">{BRIEF.map((b) => <p key={b}>{b}</p>)}</div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-ivoire/10 pt-4">
            <span className="text-[12px] text-brume">Pennylane · encaissements au {DATES.arreteTexte}</span>
            <BoutonClarte id="tva-date" label="Approfondir" clair />
          </div>
        </motion.section>
      </div>

      <section className="mt-12" aria-labelledby="t-seuils">
        <div className="surtitre mb-2">Comprendre</div>
        <h2 id="t-seuils" className="mb-5 text-[28px] leading-tight md:text-[32px]">Où en sont vos seuils</h2>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
          <Seuil titre="Seuil de franchise de TVA" valeur={J.ca12m} max={J.seuilTVA} pctV={pctTVA} projection={37550} note={`Dépassement estimé : ${J.depassement}`} accent />
          <Seuil titre="Plafond de la micro-entreprise" valeur={J.ca12m} max={J.plafondMicro} pctV={pctMicro} note="Aucun enjeu avant plusieurs années à ce rythme." />
          <div className="carte p-5 md:p-6"><h3 className="mb-2 text-[20px]">Votre trajectoire</h3><ProjectionTVA /></div>
        </div>
        <p className="mt-3 text-[13px] text-encre-3">Clarté suit vos 12 derniers mois pour vous prévenir tôt. La règle s’apprécie sur l’année civile, avec un seuil majoré : votre conseillère confirmera la date exacte.</p>
      </section>

      <section id="prix" className="mt-14" aria-labelledby="t-prix">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><div className="surtitre mb-2">Décider</div><h2 id="t-prix" className="text-[28px] leading-tight md:text-[32px]">L’impact de la TVA sur vos prix</h2></div>
          <BoutonClarte id="tva-prix" label="Comprendre" />
        </div>
        <ImpactPrix />
      </section>

      <section id="statuts" className="mt-14" aria-labelledby="t-statuts">
        <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
          <div><div className="surtitre mb-2">Décider</div><h2 id="t-statuts" className="text-[28px] leading-tight md:text-[32px]">Faut-il changer de statut&nbsp;?</h2></div>
          <BoutonClarte id="apprenti" label="Et avec un apprenti ?" />
        </div>
        <Statuts />
      </section>

      <section className="mt-14" aria-labelledby="t-plan">
        <div className="surtitre mb-2">Avancer</div>
        <h2 id="t-plan" className="mb-5 text-[28px] leading-tight md:text-[32px]">Votre plan d’action daté</h2>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <ol className="carte relative p-5 md:p-7">
            {J.plan.map((p, i) => (
              <Reveal as="li" key={p.titre} delay={i * 0.05} className="relative grid grid-cols-[92px_minmax(0,1fr)] gap-4 pb-5 last:pb-0">
                <div className="text-right">
                  <div className="num text-[13px] font-semibold text-marine">{dateCourte(p.date)}</div>
                  <div className="text-[11.5px] text-encre-3">{p.qui === 'conseiller' ? 'avec votre conseillère' : 'vous'}</div>
                </div>
                <div className="relative border-l border-or/50 pl-5">
                  <span aria-hidden className={`absolute -left-[6px] top-1 h-[11px] w-[11px] rounded-full border-2 border-papier ${p.date === '2027-03-31' ? 'bg-alerte' : 'bg-or'}`} />
                  <div className="text-[15px] font-semibold leading-snug">{p.titre}</div>
                  <div className="text-[13.5px] text-encre-2">{p.texte}</div>
                </div>
              </Reveal>
            ))}
          </ol>
          <div className="space-y-4">
            <Reveal className="carte flex items-center gap-4 p-5">
              <Avatar initiales="CA" taille={50} or />
              <div>
                <div className="text-[12px] text-encre-3">Prochain rendez-vous Évoluer</div>
                <div className="font-display text-[20px] leading-tight">{dateCourte(DATES.rdvJulien)} · {heure(DATES.rdvJulien)}</div>
                <div className="text-[13px] text-encre-2">{conseillerNom} · Bar-le-Duc ou visio</div>
              </div>
            </Reveal>
            <Reveal delay={0.05} className="carte p-5">
              <p className="text-[14.5px] leading-relaxed">Clarté a préparé le dossier : seuils, prix, statuts. Votre conseillère valide la date réelle et vos nouveaux tarifs.</p>
              {!envoye ? (
                <button type="button" onClick={preparer} className="btn btn-primaire mt-4 w-full !min-h-[50px]">Préparer ce passage avec mon conseiller</button>
              ) : (
                <div className="mt-4 rounded-full bg-bon-fond px-4 py-3 text-center text-[14px] font-semibold text-bon">Transmis · plan ajouté à votre espace</div>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </div>
  )
}
