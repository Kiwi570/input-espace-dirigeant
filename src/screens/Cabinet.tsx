import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAllerProfil } from '../components/Shell'
import { ClarteMark, CountUp, Mention, Reveal } from '../components/ui/ui'
import { ALERTES_CABINET, CABINET, CLIENTS, PERSONNES, type Offre, type ProfilId } from '../data/demo'
import { eur, nombre } from '../lib/format'
import { useStore } from '../lib/store'

const K = CABINET
const OFFRE_LABEL: Record<Offre, string> = { lancer: 'Se lancer', evoluer: 'Évoluer', piloter: 'Piloter' }
const heures = (t: number) => 4 * t + 4 * K.rdvHeures

function Economie() {
  const [n, setN] = useState<number>(K.parOffre.piloter)
  const revenu = n * K.prixPiloter
  const hSans = n * heures(K.tempsSans)
  const hAvec = n * heures(K.tempsAvec)
  const tauxSans = K.prixPiloter / heures(K.tempsSans)
  const tauxAvec = K.prixPiloter / heures(K.tempsAvec)
  const p = ((n - 13) / (60 - 13)) * 100
  return (
    <div className="carte grid gap-6 p-5 md:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div>
        <div className="surtitre mb-2">Revenus récurrents · offre Piloter</div>
        <div className="display-num text-[48px] leading-none md:text-[56px]"><CountUp value={revenu} format={(v) => eur(v)} /></div>
        <div className="mt-1 text-[14px] text-encre-2">par an · {n} abonnements à {eur(K.prixPiloter)}</div>
        <div className="mt-6">
          <div className="flex items-baseline justify-between gap-3"><label htmlFor="n-piloter" className="text-[14px] font-semibold">Et avec plus de clients Piloter&nbsp;?</label><span className="num text-[15px] font-semibold">{n} clients</span></div>
          <input id="n-piloter" type="range" min={13} max={60} step={1} value={n} onChange={(e) => setN(+e.target.value)} aria-valuetext={`${n} clients`} className="curseur mt-1" style={{ ['--p' as string]: `${p}%` }} />
          <div className="flex justify-between text-[11.5px] text-encre-3"><span>aujourd’hui</span><span>60 clients</span></div>
        </div>
        <div className="mt-5 rounded-2xl border border-or/40 bg-[#FBF5E8] p-4 text-[14px] leading-relaxed">
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.18em] text-or-texte"><ClarteMark /> Ce qui rend l’offre rentable</div>
          Clarté pré-rédige les situations : le conseiller relit, ajuste et valide. Elle a aussi repéré {K.missionsDetectees} missions complémentaires ce trimestre, pour environ {eur(K.missionsValeur)}.
        </div>
      </div>
      <div className="grid content-start gap-3 sm:grid-cols-2">
        {[
          { t: 'Sans Clarté', taux: tauxSans, h: hSans, sit: '3 h 30 par situation', ton: 'alerte' as const },
          { t: 'Avec Clarté', taux: tauxAvec, h: hAvec, sit: '50 min de relecture par situation', ton: 'or' as const },
        ].map((c) => (
          <div key={c.t} className={`rounded-2xl border p-5 ${c.ton === 'or' ? 'border-or bg-papier shadow-[0_20px_40px_-26px_rgba(10,42,94,.5)]' : 'border-marine/10 bg-ivoire/60'}`}>
            <div className="text-[13px] font-semibold">{c.t}</div>
            <div className={`display-num mt-2 text-[40px] leading-none ${c.ton === 'alerte' ? 'text-alerte' : 'text-marine'}`}>{nombre(Math.round(c.taux))}<span className="text-[20px]"> €/h</span></div>
            <div className="mt-1 text-[12.5px] text-encre-3">revenu par heure passée</div>
            <div className="filet-or my-4" />
            <div className="text-[13.5px]"><span className="num font-semibold">{nombre(Math.round(c.h))} h</span> par an pour {n} clients</div>
            <div className="text-[12.5px] text-encre-3">{c.sit} · 4 rendez-vous d’une heure</div>
          </div>
        ))}
        <div className="rounded-2xl bg-marine p-5 text-ivoire sm:col-span-2">
          <div className="text-[13px] text-brume">Temps libéré sur le portefeuille Piloter</div>
          <div className="display-num mt-1 text-[36px] leading-none text-or-clair">{nombre(Math.round(hSans - hAvec))} h par an</div>
          <div className="mt-1 text-[12.5px] text-brume">soit environ {nombre(Math.round((hSans - hAvec) / 7))} journées de travail</div>
        </div>
        <Mention className="sm:col-span-2">Estimations de démonstration · à ajuster avec les temps réels du cabinet</Mention>
      </div>
    </div>
  )
}

function Portefeuille() {
  const [filtre, setFiltre] = useState<Offre | 'tous'>('tous')
  const [q, setQ] = useState('')
  const aller = useAllerProfil()
  const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const liste = useMemo(() => CLIENTS.filter((c) => (filtre === 'tous' || c.offre === filtre) && (!q || norm(`${c.nom} ${c.ville} ${c.activite}`).includes(norm(q)))), [filtre, q])
  const ouvrable: Record<string, ProfilId> = { [PERSONNES.sophie.entreprise]: 'piloter', [`${PERSONNES.julien.prenom} ${PERSONNES.julien.nom}`]: 'evoluer', [`${PERSONNES.camille.prenom} ${PERSONNES.camille.nom}`]: 'lancer' }
  return (
    <div className="carte p-5 md:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="group" aria-label="Filtrer par offre" className="flex flex-wrap gap-1 rounded-xl bg-ivoire p-1">
          {(['tous', 'lancer', 'evoluer', 'piloter'] as const).map((f) => (
            <button key={f} type="button" aria-pressed={filtre === f} onClick={() => setFiltre(f)} className={`min-h-[40px] rounded-lg px-3.5 text-[13.5px] font-semibold transition ${filtre === f ? 'bg-papier shadow-sm' : 'text-encre-2'}`}>
              {f === 'tous' ? `Tous · ${K.clients}` : `${OFFRE_LABEL[f]} · ${K.parOffre[f]}`}
            </button>
          ))}
        </div>
        <label className="ml-auto flex min-h-[44px] w-full items-center gap-2 rounded-xl border border-marine/12 bg-papier px-3 sm:w-[240px]">
          <svg aria-hidden width="14" height="14" viewBox="0 0 14 14"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.4" fill="none" /><path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
          <span className="sr-only">Rechercher un client</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher un client" className="w-full bg-transparent text-[14px] outline-none placeholder:text-encre-3" />
        </label>
      </div>
      <div className="defile-fin max-h-[460px] overflow-y-auto">
        <table className="w-full text-[14px]">
          <thead className="sticky top-0 bg-papier text-left text-[12px] text-encre-3">
            <tr><th scope="col" className="py-2 font-normal">Client</th><th scope="col" className="hidden py-2 font-normal md:table-cell">Ville</th><th scope="col" className="py-2 font-normal">Offre</th><th scope="col" className="hidden py-2 font-normal sm:table-cell">Signal de Clarté</th></tr>
          </thead>
          <tbody>
            {liste.map((c) => {
              const id = ouvrable[c.nom]
              return (
                <tr key={c.nom} className="border-t border-marine/[.06]">
                  <td className="py-2.5 pr-3">
                    {id ? <button type="button" onClick={() => aller(id)} className="lien text-left font-semibold">{c.nom}</button> : <span className="font-semibold">{c.nom}</span>}
                    <div className="text-[12px] text-encre-3">{c.activite}<span className="md:hidden"> · {c.ville}</span></div>
                  </td>
                  <td className="hidden py-2.5 pr-3 text-encre-2 md:table-cell">{c.ville}</td>
                  <td className="py-2.5 pr-3"><span className="pastille">{OFFRE_LABEL[c.offre]}</span></td>
                  <td className="hidden py-2.5 sm:table-cell">
                    <span className="flex items-center gap-2 text-[13px]"><span aria-hidden className={`h-2 w-2 rounded-full ${c.niveau === 'alerte' ? 'bg-alerte' : c.niveau === 'attention' ? 'bg-or' : 'bg-bon'}`} /><span className="sr-only">{c.niveau === 'alerte' ? 'Alerte : ' : c.niveau === 'attention' ? 'Attention : ' : ''}</span>{c.signal}</span>
                  </td>
                </tr>
              )
            })}
            {liste.length === 0 && <tr><td colSpan={4} className="py-6 text-center text-encre-3">Aucun client ne correspond.</td></tr>}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[12.5px] text-encre-3">Les profils de démonstration (Sophie Morel, Julien Marchal, Camille Renaud) s’ouvrent d’un clic.</p>
    </div>
  )
}

export default function Cabinet() {
  const nav = useNavigate()
  const { demanderClarte, toast, situation } = useStore()
  const aller = useAllerProfil()
  const C = PERSONNES.conseiller
  const actionAlerte = (id: string) => {
    if (id === 'tva') aller('evoluer')
    else if (id === 'treso') nav('/cabinet/situation')
    else if (id === 'impayes') demanderClarte('appeler', 'Quels clients appeler en priorité ?')
    else if (id === 'statut') toast('Rendez-vous proposés', 'Nicolas Hubert et Antoine Leclerc reçoivent deux créneaux avant le 31 déc.')
    else toast('Mentors prévenus', 'Les 5 créateurs recevront un message de leur mentor cette semaine.')
  }
  const piloter = CLIENTS.filter((c) => c.offre === 'piloter')
  const total = K.clients
  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <div className="surtitre mb-3">Vue cabinet INPUT</div>
          <h1 className="text-[44px] leading-[1.03] md:text-[62px]">Bonjour <em className="text-or-texte">{C.prenom}</em></h1>
          <p className="mt-3 max-w-[560px] text-[16px] text-encre-2">Clarté a pré-rédigé {K.situationsPreRedigees} des {K.situationsAPreparer} situations trimestrielles et classé les alertes du portefeuille. À vous de valider.</p>
        </div>
        <Link to="/cabinet/situation" className="btn btn-primaire !min-h-[54px] !px-7 !text-[15px]" data-tour="cabinet-cta">Préparer la situation trimestrielle <span aria-hidden>→</span></Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal className="carte p-5">
          <div className="text-[13px] text-encre-2">Clients accompagnés</div>
          <div className="display-num mt-1 text-[40px] leading-none"><CountUp value={total} format={(v) => nombre(v)} /></div>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full" aria-hidden>
            <span style={{ width: `${(K.parOffre.lancer / total) * 100}%` }} className="bg-or-clair" />
            <span style={{ width: `${(K.parOffre.evoluer / total) * 100}%` }} className="ml-[2px] bg-ardoise" />
            <span style={{ width: `${(K.parOffre.piloter / total) * 100}%` }} className="ml-[2px] bg-marine" />
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 text-[12px] text-encre-2"><span>{K.parOffre.lancer} Se lancer</span><span>{K.parOffre.evoluer} Évoluer</span><span>{K.parOffre.piloter} Piloter</span></div>
        </Reveal>
        <Reveal delay={0.05} className="carte p-5">
          <div className="text-[13px] text-encre-2">Situations à préparer</div>
          <div className="display-num mt-1 text-[40px] leading-none"><CountUp value={K.situationsAPreparer} format={(v) => nombre(v)} /></div>
          <div className="mt-2 text-[13px] font-semibold text-or-texte">{K.situationsPreRedigees} déjà pré-rédigées par Clarté</div>
        </Reveal>
        <Reveal delay={0.1} className="carte p-5">
          <div className="text-[13px] text-encre-2">Revenus récurrents Piloter</div>
          <div className="display-num mt-1 text-[40px] leading-none"><CountUp value={K.parOffre.piloter * K.prixPiloter} format={(v) => eur(v)} /></div>
          <div className="mt-2 text-[13px] text-encre-2">par an · {K.parOffre.piloter} abonnements</div>
        </Reveal>
        <Reveal delay={0.15} className="carte p-5">
          <div className="text-[13px] text-encre-2">Missions détectées par Clarté</div>
          <div className="display-num mt-1 text-[40px] leading-none"><CountUp value={K.missionsDetectees} format={(v) => nombre(v)} /></div>
          <div className="mt-2 text-[13px] text-encre-2">environ {eur(K.missionsValeur)} ce trimestre</div>
        </Reveal>
      </div>

      <section className="mt-12" aria-labelledby="t-alertes">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><div className="surtitre mb-2">Comprendre</div><h2 id="t-alertes" className="text-[28px] leading-tight md:text-[32px]">Les alertes de l’IA, classées par impact</h2></div>
        </div>
        <ol className="space-y-3">
          {ALERTES_CABINET.map((a, i) => (
            <Reveal as="li" key={a.id} delay={i * 0.05} className="carte grid items-center gap-4 p-4 md:grid-cols-[110px_minmax(0,1fr)_auto] md:p-5">
              <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold ${a.impact === 'élevé' ? 'bg-alerte-fond text-alerte' : a.impact === 'moyen' ? 'bg-[#F6EBD3] text-or-texte' : 'bg-marine/[.06] text-encre-2'}`}>
                <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${a.impact === 'élevé' ? 'bg-alerte' : a.impact === 'moyen' ? 'bg-or' : 'bg-ardoise'}`} />Impact {a.impact}
              </span>
              <div>
                <div className="text-[16.5px] font-semibold leading-snug">{a.titre}</div>
                <div className="text-[13.5px] text-encre-2">{a.detail} · <span className="text-encre-3">{a.valeur}</span></div>
              </div>
              <button type="button" onClick={() => actionAlerte(a.id)} className="btn btn-ligne !min-h-[42px] !text-[13.5px]">{a.action}</button>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="mt-12" aria-labelledby="t-eco">
        <div className="surtitre mb-2">Décider</div>
        <h2 id="t-eco" className="mb-4 text-[28px] leading-tight md:text-[32px]">Comment l’offre à 600 € devient rentable</h2>
        <Economie />
      </section>

      <section id="situations" className="mt-12" aria-labelledby="t-sit">
        <div className="surtitre mb-2">Avancer</div>
        <h2 id="t-sit" className="mb-4 text-[28px] leading-tight md:text-[32px]">Situations trimestrielles au 31 octobre</h2>
        <div className="carte overflow-hidden">
          <ul className="divide-y divide-marine/[.06]">
            {piloter.map((c, i) => {
              const morel = i === 0
              const envoyee = morel && situation.statut === 'envoyee'
              return (
                <motion.li key={c.nom} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }} className={`flex flex-wrap items-center gap-3 px-5 py-3 ${morel ? 'bg-[#FBF5E8]' : ''}`}>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14.5px] font-semibold">{c.nom}</div>
                    <div className="text-[12.5px] text-encre-3">{c.ville} · {c.signal}</div>
                  </div>
                  {envoyee ? <span className="pastille !bg-bon-fond !text-bon">Validée et envoyée</span>
                    : c.situation === 'attente' ? <span className="pastille !bg-[#F6EBD3] !text-or-texte">En attente : {c.manque}</span>
                      : <span className="pastille"><ClarteMark className="scale-75" /> Pré-rédigée par Clarté</span>}
                  {morel && !envoyee && <Link to="/cabinet/situation" className="btn btn-ligne !min-h-[40px] !text-[13px]">Relire et valider</Link>}
                  {morel && envoyee && <Link to="/cabinet/situation" className="btn btn-ligne !min-h-[40px] !text-[13px]">Revoir</Link>}
                </motion.li>
              )
            })}
          </ul>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="t-port">
        <h2 id="t-port" className="mb-4 text-[28px] leading-tight md:text-[32px]">Le portefeuille</h2>
        <Portefeuille />
      </section>
    </div>
  )
}
