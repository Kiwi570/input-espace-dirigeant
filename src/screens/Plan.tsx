import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BoutonClarte } from './Cockpit'
import { Avatar, Reveal } from '../components/ui/ui'
import { DATES, conseillerNom } from '../data/demo'
import { dateCourte, heure } from '../lib/format'
import { useStore } from '../lib/store'

export default function Plan() {
  const { plan, demandes, basculerPlan } = useStore()
  const items = [...plan.piloter].sort((a, b) => (a.echeance ?? '9').localeCompare(b.echeance ?? '9'))
  const faits = items.filter((i) => i.fait).length
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <div className="surtitre mb-3">Avancer</div>
      <h1 className="text-[38px] leading-[1.05] md:text-[54px]">Plan d’action</h1>
      <p className="mt-3 max-w-[620px] text-[15.5px] text-encre-2">Les actions que vous avez retenues avec Clarté et le simulateur. Votre conseillère les reprend à chaque rendez-vous.</p>
      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="carte p-5 md:p-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-[22px]">Mes actions</h2>
            <span className="num text-[13px] text-encre-3">{faits} sur {items.length} faites</span>
          </div>
          <div className="mb-4 h-1.5 rounded-full bg-marine/[.07]"><motion.div className="h-1.5 rounded-full bg-or" animate={{ width: `${items.length ? (faits / items.length) * 100 : 0}%` }} /></div>
          <ul className="divide-y divide-marine/[.07]">
            <AnimatePresence initial={false}>
              {items.map((it) => (
                <motion.li key={it.id} layout initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
                  <label className="flex min-h-[56px] cursor-pointer items-center gap-4 py-3">
                    <input type="checkbox" checked={!!it.fait} onChange={() => basculerPlan('piloter', it.id)} className="h-5 w-5 accent-[#0A2A5E]" />
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[15px] leading-snug ${it.fait ? 'text-encre-3 line-through' : 'font-semibold'}`}>{it.titre}</span>
                      <span className="block text-[12.5px] text-encre-3">{it.origine}{it.qui === 'conseiller' ? ` · avec ${conseillerNom}` : ''}</span>
                    </span>
                    {it.echeance && <span className="num shrink-0 rounded-full bg-ivoire px-2.5 py-1 text-[12px] text-encre-2">{dateCourte(it.echeance, false)}</span>}
                  </label>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-marine/[.07] pt-4">
            <BoutonClarte id="priorites" label="Que faire en priorité ?" />
            <Link to="/piloter/decider" className="btn btn-ligne !min-h-[40px] !text-[13px]">Simuler une décision</Link>
          </div>
        </div>
        <div className="space-y-5">
          <Reveal className="carte flex items-center gap-4 p-5">
            <Avatar initiales="CA" taille={48} or />
            <div>
              <div className="text-[12px] text-encre-3">Rendez-vous trimestriel</div>
              <div className="font-display text-[19px] leading-tight">{dateCourte(DATES.rdvSophie)} · {heure(DATES.rdvSophie)}</div>
              <div className="text-[13px] text-encre-2">avec {conseillerNom}</div>
            </div>
          </Reveal>
          <Reveal delay={0.05} className="carte p-5">
            <h2 className="text-[20px]">Questions à ma conseillère</h2>
            {demandes.piloter.length === 0 ? (
              <p className="mt-2 text-[14px] text-encre-2">Aucune question pour l’instant. Depuis Clarté, « Demander l’avis de mon conseiller » les ajoute ici.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {demandes.piloter.map((d) => (
                  <li key={d.id} className="rounded-xl bg-ivoire px-3 py-2 text-[14px]"><span className="font-semibold">{d.sujet}</span><span className="block text-[12px] text-encre-3">Transmise {d.quand} · réponse avant le rendez-vous</span></li>
                ))}
              </ul>
            )}
          </Reveal>
        </div>
      </div>
    </div>
  )
}
