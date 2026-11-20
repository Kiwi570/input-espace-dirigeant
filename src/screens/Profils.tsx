import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Footer, useAllerProfil } from '../components/Shell'
import { Avatar } from '../components/ui/ui'
import { PROFILS, type ProfilId } from '../data/demo'

const ORDRE: ProfilId[] = ['lancer', 'evoluer', 'piloter', 'cabinet']
const DETAILS: Record<ProfilId, string[]> = {
  lancer: ['Questionnaire avec Clarté', 'Feuille de route et prévisionnel', 'Parcours My Oneee et mentor'],
  evoluer: ['Connexion à Pennylane', 'Seuil de TVA et plafond micro', 'Comparateur de statuts'],
  piloter: ['Connexion à Pennylane', 'Cockpit et trésorerie à 90 jours', 'Simulateur de décision'],
  cabinet: ['Alertes de l’IA par impact', 'Revenus de l’offre Piloter', 'Situation rédigée, puis validée'],
}

export default function Profils() {
  const aller = useAllerProfil()
  return (
    <div className="flex min-h-[calc(100svh-2rem)] flex-col">
      <header className="mx-auto flex w-full max-w-[1240px] items-center justify-between px-5 py-5 md:px-8">
        <Link to="/" aria-label="Retour à l’accueil"><img src="/brand/input-wordmark.png" alt="INPUT Expertise" width={540} height={50} className="h-[16px] w-auto md:h-[18px]" /></Link>
        <Link to="/" className="text-[13.5px] text-encre-2 hover:text-marine">← Accueil</Link>
      </header>
      <section className="mx-auto w-full max-w-[1240px] flex-1 px-5 pb-16 pt-6 md:px-8 md:pt-12">
        <div className="surtitre mb-4">Démonstration</div>
        <h1 className="max-w-[720px] text-[38px] leading-[1.06] md:text-[54px]">Quel dirigeant voulez-vous accompagner&nbsp;?</h1>
        <p className="mt-4 max-w-[560px] text-[16px] text-encre-2">Quatre points de vue sur le même espace. Vous pourrez changer de profil à tout moment, en haut de l’écran.</p>
        <div data-tour="profils" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ORDRE.map((id, i) => {
            const p = PROFILS[id]
            const cab = id === 'cabinet'
            return (
              <motion.button key={id} type="button" onClick={() => aller(id)}
                initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 * i, ease: [0.22, 0.8, 0.24, 1] }}
                whileHover={{ y: -4 }}
                className={`group relative flex min-h-[340px] flex-col overflow-hidden rounded-[22px] border p-6 text-left transition-shadow hover:shadow-[0_30px_60px_-30px_rgba(10,42,94,.45)] ${cab ? 'sur-marine border-marine bg-marine text-ivoire' : 'border-marine/10 bg-papier'}`}>
                <span className={`text-[11.5px] font-semibold uppercase tracking-[.18em] ${cab ? 'text-or-clair' : 'text-or-texte'}`}>{p.offre}</span>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar initiales={p.initiales} taille={48} or={cab} />
                  <div className="min-w-0">
                    <div className="font-display text-[22px] leading-tight">{id === 'piloter' ? 'Sophie Morel' : p.titre}</div>
                    <div className={`text-[13px] leading-snug ${cab ? 'text-brume' : 'text-encre-3'}`}>{id === 'piloter' ? p.titre : p.sousTitre}</div>
                  </div>
                </div>
                <p className={`mt-5 font-display text-[18px] italic leading-snug ${cab ? 'text-ivoire' : ''}`}>{p.accroche}</p>
                <ul className={`mt-auto space-y-1.5 pt-6 text-[13px] ${cab ? 'text-brume' : 'text-encre-2'}`}>
                  {DETAILS[id].map((d) => <li key={d} className="flex items-center gap-2"><span aria-hidden className="h-px w-3 bg-or" />{d}</li>)}
                </ul>
                <span className={`mt-5 inline-flex items-center gap-2 text-[14px] font-semibold ${cab ? 'text-or-clair' : 'text-marine'}`}>
                  {cab ? 'Ouvrir la vue cabinet' : 'Entrer dans cet espace'} <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                </span>
              </motion.button>
            )
          })}
        </div>
      </section>
      <Footer />
    </div>
  )
}
