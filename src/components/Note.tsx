import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { NOTE, NOTE_ENTREPRISE, NOTE_KPIS, NOTE_SIGNATURE, NOTE_TITRE } from '../data/situation'
import { typoFr } from '../lib/typo'
import { ClarteMark } from './ui/ui'

type Props = {
  edits: Record<string, string>
  mode: 'lecture' | 'redaction' | 'edition' | 'impression'
  onEdit?: (id: string, texte: string) => void
  onFini?: () => void
  signature?: string
}

const tousLesParas = NOTE.flatMap((s) => s.paras.map((p) => p.id))

/** La note trimestrielle : lue par le dirigeant, rédigée en direct par Clarté, puis modifiable par le conseiller. */
export function NoteSituation({ edits, mode, onEdit, onFini, signature = NOTE_SIGNATURE }: Props) {
  const reduce = useReducedMotion()
  const redaction = mode === 'redaction' && !reduce
  const total = useMemo(() => NOTE.flatMap((s) => s.paras).reduce((a, p) => a + (edits[p.id] ?? p.texte).length, 0), [edits])
  const [n, setN] = useState(redaction ? 0 : Infinity)
  const fini = n >= total
  useEffect(() => {
    if (!redaction || fini) return
    const t = setTimeout(() => setN((v) => v + 7), n === 0 ? 500 : 14)
    return () => clearTimeout(t)
  }, [n, redaction, fini])
  const prevenu = useRef(false)
  useEffect(() => { if (fini && !prevenu.current) { prevenu.current = true; onFini?.() } }, [fini, onFini])

  let reste = n
  const visible = (texte: string) => { const s = texte.slice(0, Math.max(0, reste)); reste -= texte.length; return s }
  const editable = mode === 'edition'

  return (
    <article className="text-marine" aria-busy={redaction && !fini}>
      <header className="border-b border-marine/10 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <img src="/brand/input-wordmark.png" alt="INPUT Expertise" width={540} height={50} className="h-[14px] w-auto" />
          <span className="text-[12px] text-encre-3">Offre Piloter · situation trimestrielle</span>
        </div>
        <h2 className="mt-5 text-[30px] leading-tight md:text-[36px]">{NOTE_TITRE}</h2>
        <div className="mt-1 text-[15px] text-encre-2">{NOTE_ENTREPRISE}</div>
      </header>
      <div className="grid grid-cols-2 gap-2 py-5 md:grid-cols-4">
        {NOTE_KPIS.map((k) => (
          <div key={k.label} className="rounded-xl border border-marine/10 bg-ivoire/60 px-3 py-2.5 print-avoid">
            <div className="text-[11.5px] leading-tight text-encre-2">{k.label}</div>
            <div className="display-num text-[22px] leading-tight">{k.valeur}</div>
            <div className="text-[11.5px] leading-tight text-encre-3">{k.note}</div>
          </div>
        ))}
      </div>
      <div className="space-y-6">
        {NOTE.map((s) => {
          const textes = s.paras.map((p) => ({ id: p.id, plein: edits[p.id] ?? p.texte, vu: visible(edits[p.id] ?? p.texte) }))
          if (redaction && textes.every((t) => t.vu.length === 0)) return null
          const mot = s.id === 'mot'
          return (
            <motion.section key={s.id} initial={redaction ? { opacity: 0, y: 6 } : false} animate={{ opacity: 1, y: 0 }} className={`print-avoid ${mot ? 'rounded-2xl border border-or/40 bg-[#FBF5E8] p-4 md:p-5' : ''}`}>
              {s.etape && <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.2em] text-or-texte"><span className="h-px w-4 bg-or" />{s.etape}</div>}
              <h3 className="text-[21px] leading-tight">{s.titre}</h3>
              <div className={`mt-2 ${s.liste ? 'space-y-2' : ''}`}>
                {textes.map((t) => {
                  const enCours = redaction && t.vu.length > 0 && t.vu.length < t.plein.length
                  const contenu = (
                    <Para key={`${t.id}-${(edits[t.id] ?? '').length}`} id={t.id} texte={redaction ? t.vu : t.plein} editable={editable} enCours={enCours} onEdit={onEdit} modifie={edits[t.id] !== undefined} mot={mot} />
                  )
                  return s.liste ? (
                    <div key={t.id} className="flex gap-3"><span aria-hidden className="mt-[11px] h-px w-3 shrink-0 bg-or" />{contenu}</div>
                  ) : contenu
                })}
              </div>
            </motion.section>
          )
        })}
      </div>
      {(fini || !redaction) && (
        <footer className="mt-7 flex items-start gap-2.5 border-t border-marine/10 pt-4 text-[12.5px] leading-snug text-encre-3">
          <ClarteMark className="mt-1.5" /> <span>{signature}</span>
        </footer>
      )}
    </article>
  )
}

function Para({ id, texte, editable, enCours, onEdit, modifie, mot }: { id: string; texte: string; editable: boolean; enCours: boolean; onEdit?: (id: string, t: string) => void; modifie: boolean; mot: boolean }) {
  const cls = `text-[15px] leading-relaxed ${mot ? 'font-display text-[17px] italic' : ''} ${enCours ? 'curseur-texte' : ''}`
  if (!editable) return <p className={cls}>{texte}</p>
  const propre = typoFr(texte)
  return (
    <p
      className={`${cls} -mx-2 rounded-lg px-2 py-1 outline-none transition hover:bg-[#FBF5E8] focus:bg-papier focus:ring-2 focus:ring-or/60 ${modifie ? 'border-l-2 border-or' : ''}`}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-multiline="true"
      aria-label={`Modifier le paragraphe ${id}`}
      spellCheck
      onBlur={(e) => { const v = typoFr((e.currentTarget.textContent ?? '').replace(/[ \t\n\r]+/g, ' ').trim()); if (v && v !== propre) onEdit?.(id, v) }}
    >
      {propre}
    </p>
  )
}

export const NOTE_PARAS = tousLesParas
