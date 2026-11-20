import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ClarteMark, PennylaneBadge, useCountUp } from '../components/ui/ui'
import { JULIEN, MOREL, PERSONNES } from '../data/demo'
import { dateCourte, eur, keur, nombre, pct } from '../lib/format'
import { useStore } from '../lib/store'

type Ligne = { compte: string; libelle: string; montant: string; tag: number }
type Config = {
  nom: string; ecritures: number; dest: string; cta: string
  tuiles: { label: string; cible: number; format: (n: number) => string }[]
  lignes: Ligne[]
  constats: string[]
}

const CONFIGS: Record<'piloter' | 'evoluer', Config> = {
  piloter: {
    nom: PERSONNES.sophie.entreprise, ecritures: MOREL.ecritures, dest: '/piloter', cta: 'Ouvrir mon cockpit',
    tuiles: [
      { label: 'Chiffre d’affaires · 10 mois', cible: MOREL.ca10m, format: (n) => keur(n) },
      { label: 'Marge brute', cible: MOREL.margeBrute, format: (n) => pct(n) },
      { label: 'Trésorerie', cible: MOREL.tresorerie, format: (n) => keur(n) },
      { label: 'Délai de paiement clients', cible: MOREL.dso, format: (n) => `${nombre(n)} j` },
    ],
    lignes: [
      { compte: '706100', libelle: `Travaux d’agencement · ${PERSONNES.premierClient}`, montant: '28 400,00', tag: 0 },
      { compte: '601100', libelle: 'Achats de bois massif · chêne', montant: '12 860,00', tag: 1 },
      { compte: '512000', libelle: 'Virement reçu · Brasserie du Sablon', montant: '9 600,00', tag: 2 },
      { compte: '411000', libelle: 'Client · facture F-2026-0388', montant: '29 000,00', tag: 3 },
      { compte: '602200', libelle: 'Panneaux et placages', montant: '6 240,00', tag: 1 },
      { compte: '706100', libelle: 'Bibliothèques sur mesure · Agence Lumen', montant: '11 000,00', tag: 0 },
      { compte: '641000', libelle: 'Salaires · octobre', montant: '38 920,00', tag: 2 },
      { compte: '445710', libelle: 'TVA collectée · octobre', montant: '41 600,00', tag: 2 },
      { compte: '411000', libelle: 'Client · facture F-2026-0415', montant: '18 000,00', tag: 3 },
      { compte: '601100', libelle: 'Achats de bois massif · noyer', montant: '4 180,00', tag: 1 },
      { compte: '706200', libelle: 'Pose et finitions · Cabinet des Arènes', montant: '7 000,00', tag: 0 },
      { compte: '512000', libelle: 'Prélèvement URSSAF', montant: '16 940,00', tag: 2 },
      { compte: '606100', libelle: 'Énergie de l’atelier', montant: '2 310,00', tag: 1 },
      { compte: '411000', libelle: 'Client · Boutique Linéa', montant: '5 000,00', tag: 3 },
      { compte: '706100', libelle: 'Comptoir d’accueil · hôtel', montant: '18 000,00', tag: 0 },
      { compte: '164000', libelle: 'Échéance d’emprunt', montant: '18 000,00', tag: 2 },
    ],
    constats: [
      `Activité en hausse de ${pct(MOREL.caVar)} sur dix mois.`,
      `Marge brute en recul de ${nombre(MOREL.margeBruteN1 - MOREL.margeBrute, 1)} point : le prix du bois.`,
      `Point bas de trésorerie à ${keur(MOREL.pointBas.valeur)} le ${dateCourte(MOREL.pointBas.date)}.`,
    ],
  },
  evoluer: {
    nom: `${PERSONNES.julien.prenom} ${PERSONNES.julien.nom}`, ecritures: JULIEN.ecritures, dest: '/evoluer', cta: 'Ouvrir mon parcours',
    tuiles: [
      { label: 'Chiffre d’affaires · 12 mois', cible: JULIEN.ca12m, format: (n) => eur(n) },
      { label: 'Seuil de TVA atteint', cible: Math.round((JULIEN.ca12m / JULIEN.seuilTVA) * 100), format: (n) => pct(n, 0) },
      { label: 'Plafond micro atteint', cible: Math.round((JULIEN.ca12m / JULIEN.plafondMicro) * 100), format: (n) => pct(n, 0) },
      { label: 'Encaissé en octobre', cible: 3450, format: (n) => eur(n) },
    ],
    lignes: [
      { compte: '706000', libelle: 'Mise aux normes · maison à Ligny', montant: '1 850,00', tag: 0 },
      { compte: '607000', libelle: 'Matériel électrique · grossiste', montant: '640,00', tag: 3 },
      { compte: '512000', libelle: 'Virement reçu · M. et Mme Collet', montant: '1 200,00', tag: 0 },
      { compte: '706000', libelle: 'Dépannage · boulangerie', montant: '320,00', tag: 0 },
      { compte: '625100', libelle: 'Carburant · utilitaire', montant: '96,40', tag: 3 },
      { compte: '512000', libelle: 'Cotisations URSSAF · trimestre', montant: '1 980,00', tag: 3 },
      { compte: '706000', libelle: 'Tableau électrique · appartement', montant: '1 200,00', tag: 0 },
      { compte: '607000', libelle: 'Câbles et disjoncteurs', montant: '412,00', tag: 3 },
      { compte: '706000', libelle: 'Borne de recharge · particulier', montant: '1 450,00', tag: 0 },
      { compte: '616000', libelle: 'Assurance décennale', montant: '118,00', tag: 3 },
    ],
    constats: [
      `${eur(JULIEN.ca12m)} encaissés sur 12 mois, en hausse régulière.`,
      `Seuil de franchise de TVA atteint à ${pct((JULIEN.ca12m / JULIEN.seuilTVA) * 100, 0)}.`,
      `Dépassement estimé en ${JULIEN.depassement} : vos prix sont à préparer.`,
    ],
  },
}
const TAGS = ['Chiffre d’affaires', 'Marge', 'Trésorerie', 'Clients']
const PHASES = ['Connexion sécurisée à Pennylane', 'Lecture du grand livre', 'Traduction en indicateurs', 'Constats de Clarté']

function Tuile({ t, actif }: { t: Config['tuiles'][number]; actif: boolean }) {
  const v = useCountUp(t.cible, { start: actif, duration: 2300, decimals: Number.isInteger(t.cible) ? 0 : 1 })
  return (
    <div className={`rounded-2xl border p-4 transition-colors duration-500 md:p-5 ${actif ? 'border-or/40 bg-ivoire/[.06]' : 'border-ivoire/10'}`}>
      <div className="text-[12px] text-brume">{t.label}</div>
      <div className="display-num mt-1 text-[28px] leading-none text-ivoire md:text-[36px]">{actif ? t.format(v) : '—'}</div>
    </div>
  )
}

export default function Sync() {
  const { profil: param } = useParams()
  const id = param === 'evoluer' ? 'evoluer' : param === 'piloter' ? 'piloter' : null
  const reduce = useReducedMotion()
  const nav = useNavigate()
  const { setSynced, setProfil } = useStore()
  const [t, setT] = useState(reduce ? 99999 : 0)

  useEffect(() => { if (id) setProfil(id) }, [id, setProfil])
  useEffect(() => {
    if (reduce || !id) return
    const t0 = performance.now()
    let raf = 0
    const tick = () => { const e = performance.now() - t0; setT(e); if (e < 7200) raf = requestAnimationFrame(tick) }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduce, id])

  const c = id ? CONFIGS[id] : null
  const fini = t >= 6800
  useEffect(() => { if (fini && id) setSynced(id) }, [fini, id, setSynced])
  const compteur = useCountUp(c?.ecritures ?? 0, { start: t >= 700, duration: 3600 })
  const nbLignes = Math.max(0, Math.min(40, Math.floor((t - 700) / 190)))
  const lignes = useMemo(() => (c ? Array.from({ length: nbLignes }, (_, i) => ({ ...c.lignes[i % c.lignes.length], k: i })) : []), [c, nbLignes])
  if (!c || !id) return <Navigate to="/demo" replace />

  const phase = t < 700 ? 0 : t < 2000 ? 1 : t < 4500 ? 2 : 3
  const nConstats = t < 4600 ? 0 : t < 5200 ? 1 : t < 5800 ? 2 : 3
  const ouvrir = () => { setSynced(id); nav(c.dest) }

  return (
    <div className="sur-marine relative min-h-[calc(100svh-2rem)] overflow-hidden bg-marine-900 text-ivoire">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[.5]" style={{ background: 'radial-gradient(1200px 500px at 70% -10%, rgba(201,153,63,.14), transparent 60%), radial-gradient(900px 600px at -10% 110%, rgba(26,67,132,.6), transparent 60%)' }} />
      <div className="relative mx-auto flex min-h-[calc(100svh-2rem)] max-w-[1240px] flex-col px-5 py-5 md:px-8">
        <div className="flex items-center justify-between">
          <img src="/brand/input-wordmark-clair.png" alt="INPUT Expertise" width={540} height={50} className="h-[15px] w-auto md:h-[17px]" />
          {!fini && <button type="button" onClick={ouvrir} className="btn btn-ligne !min-h-[40px] !px-4 !text-[13px]">Passer <span aria-hidden>→</span></button>}
        </div>

        <div data-tour="sync" className="flex flex-1 flex-col justify-center py-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="surtitre">{c.nom}</span>
            <span aria-live="polite" className="flex items-center gap-2 text-[13px] text-brume">
              {!fini ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-or/30 border-t-or" aria-hidden /> : <span className="h-2 w-2 rounded-full bg-[#7FC4A0]" aria-hidden />}
              {fini ? 'Synchronisation terminée' : PHASES[phase]}
            </span>
          </div>
          <h1 className="mt-4 text-[34px] leading-[1.05] md:text-[56px]">
            <span className="display-num text-or">{nombre(compteur)}</span> écritures analysées
          </h1>
          <p className="mt-3 max-w-[560px] text-[15px] text-brume">Les lignes du grand livre Pennylane deviennent des indicateurs, puis des constats en langage clair.</p>

          <div className="mt-8 grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
            {/* grand livre */}
            <div className="relative h-[220px] overflow-hidden rounded-2xl border border-ivoire/10 bg-marine-950/40 md:h-[300px]" aria-hidden>
              <div className="absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-marine-950/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col-reverse gap-1 p-3">
                <AnimatePresence initial={false}>
                  {lignes.slice(-12).reverse().map((l) => (
                    <motion.div key={l.k} layout initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}
                      className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-1 text-[12px] md:grid-cols-[64px_minmax(0,1fr)_auto_112px] md:text-[12.5px]">
                      <span className="num text-brume/70">{l.compte}</span>
                      <span className="truncate text-ivoire/85">{l.libelle}</span>
                      <span className="num text-right text-ivoire/80">{l.montant}</span>
                      <motion.span initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }} className="hidden justify-self-end rounded-full border border-or/40 px-2 py-0.5 text-[10.5px] text-or-clair md:inline">{TAGS[l.tag]}</motion.span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
            {/* indicateurs */}
            <div className="grid grid-cols-2 gap-3">
              {c.tuiles.map((tu, i) => <Tuile key={tu.label} t={tu} actif={t >= 2000 + i * 260} />)}
            </div>
          </div>

          {/* constats */}
          <div className="mt-8">
            <div className={`mb-3 flex items-center gap-2 text-[11.5px] font-semibold uppercase tracking-[.2em] text-or-clair transition-opacity duration-500 ${nConstats ? 'opacity-100' : 'opacity-0'}`}><ClarteMark actif={nConstats < 3} /> Trois constats de Clarté</div>
            <ol className="grid gap-3 md:grid-cols-3">
              {c.constats.map((k, i) => (
                <motion.li key={k} initial={false} animate={i < nConstats ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }} transition={{ duration: 0.4, ease: [0.22, 0.8, 0.24, 1] }}
                  className="flex gap-3 rounded-2xl bg-ivoire px-4 py-4 text-marine">
                  <span className="display-num text-[22px] leading-none text-or-texte">{i + 1}</span>
                  <span className="text-[15px] leading-snug">{k}</span>
                </motion.li>
              ))}
            </ol>
          </div>

          <div className="mt-8 flex min-h-[52px] flex-wrap items-center gap-4">
            <AnimatePresence>
              {fini && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-4">
                  <button type="button" onClick={ouvrir} className="btn btn-or !min-h-[52px] !px-7 !text-[15px]">{c.cta} <span aria-hidden>→</span></button>
                  <PennylaneBadge clair />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
