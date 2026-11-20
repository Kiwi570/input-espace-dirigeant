import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useStore } from '../../lib/store'

/* ---------------------------------------------------------------- Clarté */
export function ClarteMark({ actif = false, className = '', clair = false }: { actif?: boolean; className?: string; clair?: boolean }) {
  const c = clair ? 'bg-or-clair' : 'bg-or'
  return (
    <span aria-hidden className={`clarte-motif inline-flex flex-col items-center justify-center gap-[3px] ${actif ? 'actif' : ''} ${className}`}>
      <span className={`block h-[2px] w-[10px] rounded-full ${c}`} />
      <span className={`block h-[2px] w-[16px] rounded-full ${c}`} />
      <span className={`block h-[2px] w-[7px] rounded-full ${c}`} />
    </span>
  )
}

/* ------------------------------------------------------- Apparitions */
export function Reveal({ children, delay = 0, y = 14, className = '', as = 'div' }: { children: ReactNode; delay?: number; y?: number; className?: string; as?: 'div' | 'section' | 'li' | 'article' }) {
  const reduce = useReducedMotion()
  const M = motion[as]
  return (
    <M
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{ duration: 0.38, delay, ease: [0.22, 0.8, 0.24, 1] }}
    >
      {children}
    </M>
  )
}

/* ------------------------------------------------------------ Compteur */
export function useCountUp(target: number, { duration = 900, start = true, decimals = 0 } = {}) {
  const reduce = useReducedMotion()
  const [v, setV] = useState(reduce || !start ? target : 0)
  const from = useRef(0)
  useEffect(() => {
    if (!start) return
    if (reduce) { setV(target); return }
    const t0 = performance.now()
    const a = from.current
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - t0) / duration)
      const e = 1 - Math.pow(1 - k, 3)
      const val = a + (target - a) * e
      setV(Number(val.toFixed(decimals)))
      if (k < 1) raf = requestAnimationFrame(tick)
      else from.current = target
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, start, duration, decimals, reduce])
  return v
}

export function CountUp({ value, format, duration, className = '' }: { value: number; format: (n: number) => string; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [vu, setVu] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVu(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const dec = Number.isInteger(value) ? 0 : 1
  const v = useCountUp(value, { start: vu, duration, decimals: dec })
  return (
    <span ref={ref} className={`num ${className}`}>
      <span aria-hidden>{format(v)}</span>
      <span className="sr-only">{format(value)}</span>
    </span>
  )
}

/* ------------------------------------------------- Explication au survol */
export function InfoPop({ label, children, className = '', align = 'left' }: { label: ReactNode; children: ReactNode; className?: string; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | TouchEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', close)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', esc) }
  }, [open])
  return (
    <div ref={ref} className={`relative ${className}`} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-expanded={open} aria-describedby={open ? id : undefined} onClick={() => setOpen(true)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)} className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full text-encre-3 transition hover:text-marine -m-3">
        <span className="sr-only">Explication : </span>
        <span aria-hidden className="grid h-[22px] w-[22px] place-items-center rounded-full border border-marine/20 font-display text-[13px] italic">i</span>
        <span className="sr-only">{label}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18 }}
            className={`absolute top-full z-40 mt-1 w-[min(300px,78vw)] rounded-2xl bg-marine p-4 text-[13.5px] leading-relaxed text-ivoire shadow-2xl ${align === 'right' ? 'right-0' : 'left-0'}`}
          >
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.16em] text-or-clair"><ClarteMark clair /> En clair</div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ----------------------------------------------------- Badge Pennylane */
export function PennylaneBadge({ compact = false, clair = false }: { compact?: boolean; clair?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[12px] font-medium ${clair ? 'border-ivoire/20 text-ivoire/90' : 'border-marine/12 bg-papier text-encre-2'}`}>
      <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-bon/40" /><span className="relative inline-flex h-2 w-2 rounded-full bg-bon" /></span>
      {compact ? <>Pennylane · Connecté</> : <>Synchronisé avec Pennylane · il y a 2 min</>}
    </span>
  )
}

/* --------------------------------------------------------------- Toasts */
export function Toasts() {
  const { toasts } = useStore()
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 px-4 md:bottom-8 md:left-auto md:right-8 md:items-end">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div key={t.id} layout initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.25 }}
            className="pointer-events-auto flex max-w-sm items-start gap-3 rounded-2xl bg-marine px-4 py-3 text-ivoire shadow-2xl">
            <span className="mt-1.5"><ClarteMark /></span>
            <div>
              <div className="text-[14px] font-semibold">{t.titre}</div>
              {t.texte && <div className="text-[13px] text-brume">{t.texte}</div>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------- Section titrée */
export function Titre({ surtitre, titre, children, id, className = '' }: { surtitre?: string; titre: ReactNode; children?: ReactNode; id?: string; className?: string }) {
  return (
    <div className={`mb-5 flex flex-wrap items-end justify-between gap-3 ${className}`}>
      <div>
        {surtitre && <div className="surtitre mb-2">{surtitre}</div>}
        <h2 id={id} className="text-[26px] leading-tight md:text-[30px]">{titre}</h2>
      </div>
      {children}
    </div>
  )
}

export function Mention({ children = 'Valeur illustrative · à valider par votre conseiller', className = '' }: { children?: ReactNode; className?: string }) {
  return <span className={`inline-flex items-center gap-1.5 text-[12px] text-encre-3 ${className}`}><span aria-hidden className="h-1 w-1 rounded-full bg-or" />{children}</span>
}

export function Avatar({ initiales, taille = 40, or = false }: { initiales: string; taille?: number; or?: boolean }) {
  return (
    <span aria-hidden style={{ width: taille, height: taille, fontSize: taille * 0.38 }}
      className={`inline-grid shrink-0 place-items-center rounded-full font-display ${or ? 'bg-or text-marine-950' : 'bg-marine text-ivoire'}`}>
      {initiales}
    </span>
  )
}
