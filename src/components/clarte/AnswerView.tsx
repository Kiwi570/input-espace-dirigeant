import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { answerById, REPONSE_INCONNUE, suggestions, type Action, type Answer, type Block } from '../../data/clarte'
import { DATES, STATUT_CLARTE, conseillerNom } from '../../data/demo'
import { dateCourte } from '../../lib/format'
import { useStore } from '../../lib/store'
import { Gauge, HBars, MiniCurve } from '../charts/charts'
import { ClarteMark } from '../ui/ui'

type Item = { kind: 'section'; label: string } | { kind: 'block'; block: Block }
const SECTIONS: [keyof Pick<Answer, 'comprendre' | 'decider' | 'avancer'>, string][] = [['comprendre', 'Comprendre'], ['decider', 'Décider'], ['avancer', 'Avancer']]

function flatten(a: Answer): Item[] {
  const out: Item[] = []
  for (const [k, label] of SECTIONS) {
    out.push({ kind: 'section', label })
    a[k].forEach((block) => out.push({ kind: 'block', block }))
  }
  return out
}

/* --------------------------------------------------------- Blocs visuels */
function BlockView({ b, typed, onDone }: { b: Block; typed?: number; onDone?: () => void }) {
  const reduce = useReducedMotion()
  const enter = { initial: reduce ? false : { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.32 } } as const
  useEffect(() => {
    if (b.t !== 'p' && onDone) { const t = setTimeout(onDone, reduce ? 0 : 380); return () => clearTimeout(t) }
  }, [b, onDone, reduce])
  switch (b.t) {
    case 'p': {
      const n = typed ?? b.text.length
      return <p className={`text-[14.5px] leading-relaxed text-marine ${n < b.text.length ? 'curseur-texte' : ''}`}>{b.text.slice(0, n)}</p>
    }
    case 'kpis':
      return (
        <motion.div {...enter} className={`grid gap-2 ${b.items.length >= 3 ? 'grid-cols-3' : b.items.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
          {b.items.map((k) => (
            <div key={k.label} className={`rounded-xl border px-3 py-2.5 ${k.tone === 'gold' ? 'border-or/50 bg-[#FBF5E8]' : k.tone === 'alert' ? 'border-alerte/25 bg-alerte-fond/60' : k.tone === 'good' ? 'border-bon/25 bg-bon-fond/60' : 'border-marine/10 bg-ivoire/60'}`}>
              <div className="text-[11.5px] leading-tight text-encre-2">{k.label}</div>
              <div className="display-num mt-0.5 text-[20px] leading-tight">{k.value}</div>
              {k.note && <div className="mt-0.5 text-[11.5px] leading-tight text-encre-3">{k.note}</div>}
            </div>
          ))}
        </motion.div>
      )
    case 'bars':
      return <motion.div {...enter} className="rounded-xl border border-marine/10 bg-ivoire/50 p-3"><HBars items={b.items} max={b.max} /></motion.div>
    case 'table':
      return (
        <motion.div {...enter} className="overflow-hidden rounded-xl border border-marine/10">
          <table className="w-full text-[12.5px]">
            <thead><tr className="bg-ivoire text-left text-encre-2">{b.head.map((h, i) => <th key={i} scope="col" className={`px-3 py-2 font-semibold ${i > 0 ? 'text-right' : ''}`}>{h}</th>)}</tr></thead>
            <tbody>
              {b.rows.map((r, i) => (
                <tr key={i} className="border-t border-marine/[.07]">{r.map((c, j) => <td key={j} className={`px-3 py-2 ${j > 0 ? 'num text-right' : ''}`}>{c}</td>)}</tr>
              ))}
            </tbody>
            {b.foot && <tfoot><tr className="border-t border-marine/15 bg-ivoire/70 font-semibold">{b.foot.map((c, j) => <td key={j} className={`px-3 py-2 ${j > 0 ? 'num text-right' : ''}`}>{c}</td>)}</tr></tfoot>}
          </table>
        </motion.div>
      )
    case 'gauge':
      return (
        <motion.div {...enter} className="rounded-xl border border-marine/10 bg-ivoire/50 p-3">
          <div className="mb-1 flex items-baseline justify-between gap-2 text-[12.5px]"><span className="text-encre-2">{b.label}</span><span className="num font-semibold">{b.display}</span></div>
          <Gauge value={b.value} max={b.max} projection={b.projection} />
          <div className="mt-2 text-[12px] text-or-texte">{b.note}</div>
        </motion.div>
      )
    case 'curve':
      return <motion.div {...enter} className="rounded-xl border border-marine/10 bg-ivoire/50 p-3"><MiniCurve values={b.values} labels={b.labels} low={b.low} lowLabel={b.lowLabel} unit={b.unit} /></motion.div>
    case 'options':
      return (
        <motion.ul {...enter} className="space-y-2">
          {b.items.map((o) => (
            <li key={o.titre} className={`rounded-xl border p-3 ${o.reco ? 'border-or/60 bg-[#FBF5E8]' : 'border-marine/10 bg-papier'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="text-[13.5px] font-semibold leading-snug">{o.titre}</div>
                {o.reco && <span className="shrink-0 rounded-full bg-marine px-2 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-ivoire">Piste privilégiée</span>}
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-encre-2">{o.texte}</p>
              {o.impact && <div className="num mt-1.5 text-[12.5px] font-semibold text-marine">{o.impact}</div>}
            </li>
          ))}
        </motion.ul>
      )
    case 'steps':
      return (
        <motion.ol {...enter} className="relative space-y-2.5 border-l border-or/50 pl-4">
          {b.items.map((s, i) => (
            <li key={i} className="relative">
              <span aria-hidden className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-papier bg-or" />
              <div className="text-[11.5px] font-semibold uppercase tracking-[.12em] text-or-texte">{s.quand}{s.qui === 'conseiller' ? ' · avec votre conseillère' : ''}</div>
              <div className="text-[13.5px] leading-snug">{s.texte}</div>
            </li>
          ))}
        </motion.ol>
      )
  }
}

/* --------------------------------------------------------- Réponse */
export function AnswerView({ answerId, free, instant, onProgress, onFini }: { answerId: string; free?: string; instant?: boolean; onProgress?: () => void; onFini?: () => void }) {
  const reduce = useReducedMotion()
  const a = answerById(answerId)
  const items = useMemo(() => (a ? flatten(a) : []), [a])
  const etapes = a ? a.etapes : ['Recherche dans vos données…', 'Comparaison avec les questions connues…']
  const sansAnim = instant || reduce
  const [step, setStep] = useState(sansAnim ? etapes.length : 0)
  const [idx, setIdx] = useState(sansAnim ? items.length : 0)
  const [chars, setChars] = useState(0)
  const ecrit = step >= etapes.length
  const fini = ecrit && idx >= items.length

  useEffect(() => {
    if (step >= etapes.length) return
    const t = setTimeout(() => setStep((s) => s + 1), 620)
    return () => clearTimeout(t)
  }, [step, etapes.length])

  const courant = items[idx]
  useEffect(() => {
    if (!ecrit || idx >= items.length) return
    if (courant.kind === 'section') { const t = setTimeout(() => { setIdx((i) => i + 1); setChars(0) }, 160); return () => clearTimeout(t) }
    if (courant.block.t === 'p') {
      const len = courant.block.text.length
      if (chars >= len) { const t = setTimeout(() => { setIdx((i) => i + 1); setChars(0) }, 120); return () => clearTimeout(t) }
      let raf = 0
      const tick = () => setChars((c) => Math.min(len, c + 4))
      raf = requestAnimationFrame(tick)
      return () => cancelAnimationFrame(raf)
    }
  }, [ecrit, idx, chars, courant, items.length])

  useEffect(() => { onProgress?.() }, [step, idx, chars, onProgress])
  useEffect(() => { if (fini || (ecrit && !a)) onFini?.() }, [fini, ecrit, a, onFini])

  const toutAfficher = () => { setStep(etapes.length); setIdx(items.length) }
  const blockDone = useRef(() => { setIdx((i) => i + 1); setChars(0) }).current

  return (
    <div className="space-y-3">
      {/* étapes de travail */}
      <ul aria-label="Étapes de l’analyse" className="space-y-1.5">
        {etapes.map((e, i) => (
          <li key={e} className={`flex items-center gap-2 text-[12.5px] transition-opacity duration-300 ${i <= step ? 'opacity-100' : 'opacity-0'}`}>
            {i < step ? (
              <svg aria-hidden width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="6.5" fill="#E1EDE5" /><path d="M4 7.2l2 2 4-4.4" stroke="#2F6B4F" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
            ) : (
              <span aria-hidden className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-or/30 border-t-or" />
            )}
            <span className={i < step ? 'text-encre-3' : 'text-encre-2'}>{e}</span>
          </li>
        ))}
      </ul>

      {ecrit && a && (
        <div className="space-y-3" aria-live="off">
          {items.slice(0, idx + 1).map((it, i) => {
            if (it.kind === 'section') return (
              <div key={i} className="flex items-center gap-2 pt-1 text-[11px] font-semibold uppercase tracking-[.2em] text-or-texte">
                <span className="h-px w-4 bg-or" />{it.label}
              </div>
            )
            const enCours = i === idx
            return <BlockView key={i} b={it.block} typed={enCours && it.block.t === 'p' ? chars : undefined} onDone={enCours && it.block.t !== 'p' ? blockDone : undefined} />
          })}
        </div>
      )}
      {ecrit && !a && <Inconnue free={free ?? ''} />}

      {!fini && ecrit && a && (
        <button type="button" onClick={toutAfficher} className="text-[12px] text-encre-3 underline decoration-or/60 underline-offset-2 hover:text-marine">Afficher la réponse complète</button>
      )}
      {fini && a && <Actions a={a} />}
      {fini && a && (
        <div className="space-y-0.5 border-t border-marine/10 pt-2.5 text-[11.5px] leading-snug text-encre-3">
          <div>Source : {a.source}</div>
          <div className="flex items-center gap-1.5 text-or-texte"><ClarteMark className="scale-75" /> {STATUT_CLARTE}</div>
        </div>
      )}
      <span className="sr-only" aria-live="polite">{fini ? 'Réponse de Clarté prête.' : ''}</span>
    </div>
  )
}

function Inconnue({ free }: { free: string }) {
  const { profil, demanderClarte } = useStore()
  const { pathname } = useLocation()
  const ids = suggestions(profil, pathname).slice(0, 3)
  return (
    <div className="space-y-3">
      <p className="text-[14.5px] leading-relaxed">{REPONSE_INCONNUE.texte}</p>
      {free && <p className="rounded-xl bg-ivoire px-3 py-2 text-[13px] italic text-encre-2">« {free} » sera transmise telle quelle à votre conseiller dans la version finale.</p>}
      <div className="text-[11px] font-semibold uppercase tracking-[.18em] text-or-texte">Trois questions que je sais traiter</div>
      <div className="flex flex-col gap-2">
        {ids.map((id) => { const q = answerById(id)!; return (
          <button key={id} type="button" onClick={() => demanderClarte(id, q.question)} className="min-h-[44px] rounded-xl border border-marine/12 bg-papier px-3 py-2 text-left text-[13.5px] transition hover:border-or">{q.question}</button>
        ) })}
      </div>
    </div>
  )
}

export function useActionClarte() {
  const nav = useNavigate()
  const { profil, ajouterPlan, demander, toast, demanderClarte, ouvrirClarte } = useStore()
  return (act: Action) => {
    const p = profil ?? 'piloter'
    const mobile = window.matchMedia('(max-width: 767px)').matches
    switch (act.kind) {
      case 'simuler':
        nav(`/piloter/decider?scenario=${act.scenario}`)
        if (mobile) ouvrirClarte(false)
        break
      case 'plan': {
        const ok = ajouterPlan(p === 'cabinet' ? 'piloter' : p, { titre: act.titre, echeance: act.echeance, qui: 'vous', origine: 'Proposé par Clarté' })
        toast(ok ? 'Ajouté au plan d’action' : 'Déjà dans votre plan d’action', act.titre)
        break
      }
      case 'conseiller':
        demander(p, act.sujet)
        toast(`Question transmise à ${conseillerNom}`, `Elle vous répondra avant le rendez-vous du ${dateCourte(DATES.rdvSophie, false)}.`)
        break
      case 'aller':
        nav(act.to)
        if (mobile) ouvrirClarte(false)
        break
      case 'question':
        demanderClarte(act.answerId, act.label)
        break
    }
  }
}

function Actions({ a }: { a: Answer }) {
  const run = useActionClarte()
  const label = (act: Action) => act.label ?? (act.kind === 'plan' ? 'Ajouter au plan d’action' : act.kind === 'conseiller' ? 'Demander l’avis de mon conseiller' : act.kind === 'simuler' ? 'Simuler' : '')
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap gap-2 pt-1">
      {a.actions.map((act, i) => (
        <button key={i} type="button" onClick={() => run(act)}
          className={`min-h-[40px] rounded-full px-3.5 text-[13px] font-semibold transition ${i === 0 ? 'bg-marine text-ivoire hover:bg-marine-800' : 'border border-marine/18 text-marine hover:border-marine'}`}>
          {label(act)}
        </button>
      ))}
    </motion.div>
  )
}
