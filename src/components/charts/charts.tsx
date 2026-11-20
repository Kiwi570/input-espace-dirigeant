import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { dateCourte, keur, parseDate } from '../../lib/format'

const MARINE = '#0A2A5E'
const OR = '#C9993F'
const ARDOISE = '#8E9BB8'
const ALERTE = '#A6402E'
const EASE = [0.22, 0.8, 0.24, 1] as const

export function useWidth<T extends HTMLElement>(initial = 600) {
  const ref = useRef<T>(null)
  const [w, setW] = useState(initial)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    setW(el.clientWidth || initial)
    const ro = new ResizeObserver(([e]) => setW(Math.max(200, Math.round(e.contentRect.width))))
    ro.observe(el)
    return () => ro.disconnect()
  }, [initial])
  return [ref, w] as const
}

const linePath = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')

/* ------------------------------------------------------------ Sparkline */
export function Sparkline({ values, width = 132, height = 38, ton = 'marine', label }: { values: number[]; width?: number; height?: number; ton?: 'marine' | 'or' | 'alerte'; label: string }) {
  const reduce = useReducedMotion()
  const min = Math.min(...values), max = Math.max(...values)
  const pad = 4
  const pts = values.map((v, i) => [pad + (i * (width - pad * 2)) / (values.length - 1), pad + (1 - (v - min) / (max - min || 1)) * (height - pad * 2)] as [number, number])
  const d = linePath(pts)
  const last = pts[pts.length - 1]
  const c = ton === 'or' ? OR : ton === 'alerte' ? ALERTE : MARINE
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label} className="overflow-visible">
      <motion.path d={d} fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.1, ease: EASE }} />
      <motion.circle cx={last[0]} cy={last[1]} r={3.5} fill={c} stroke="#FFFDF8" strokeWidth={2}
        initial={reduce ? false : { scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1, duration: 0.3 }} />
    </svg>
  )
}

/* ----------------------------------------------- Tooltip générique */
function Bulle({ x, y, w, children }: { x: number; y: number; w: number; children: ReactNode }) {
  const left = Math.min(Math.max(x - 90, 0), w - 180)
  return (
    <div className="pointer-events-none absolute z-10 w-[180px] rounded-xl bg-marine px-3 py-2 text-[12.5px] leading-snug text-ivoire shadow-xl" style={{ left, top: Math.max(0, y - 74) }}>
      {children}
    </div>
  )
}

/* ------------------------------------------- Trésorerie à 90 jours */
type PointT = { date: string; v: number; evt?: string }
export function TreasuryChart({ points, echeances = [], height = 300 }: { points: PointT[]; echeances?: { date: string; libelle: string; montant: number }[]; height?: number }) {
  const reduce = useReducedMotion()
  const [ref, W] = useWidth<HTMLDivElement>(720)
  const [hover, setHover] = useState<number | null>(null)
  const m = { l: 44, r: 16, t: 28, b: 40 }
  const t0 = parseDate(points[0].date).getTime()
  const t1 = parseDate(points[points.length - 1].date).getTime()
  const x = (iso: string) => m.l + ((parseDate(iso).getTime() - t0) / (t1 - t0)) * (W - m.l - m.r)
  const yMax = 200
  const y = (v: number) => m.t + (1 - v / yMax) * (height - m.t - m.b)
  const pts = points.map((p) => [x(p.date), y(p.v)] as [number, number])
  const d = linePath(pts)
  const area = `${d}L${pts[pts.length - 1][0]},${y(0)}L${pts[0][0]},${y(0)}Z`
  const lowI = points.reduce((b, p, i) => (p.v < points[b].v ? i : b), 0)
  const low = points[lowI]
  const mois = useMemo(() => {
    const out: { iso: string; label: string }[] = []
    const d0 = parseDate(points[0].date)
    for (let k = 0; k < 4; k++) {
      const dd = new Date(d0.getFullYear(), d0.getMonth() + k, 1)
      const iso = `${dd.getFullYear()}-${String(dd.getMonth() + 1).padStart(2, '0')}-01`
      if (dd.getTime() <= t1) out.push({ iso, label: dd.toLocaleDateString('fr-FR', { month: 'short' }) })
    }
    return out
  }, [points, t1])
  const onMove = (e: React.PointerEvent) => {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect()
    const px = e.clientX - r.left
    let best = 0
    pts.forEach((p, i) => { if (Math.abs(p[0] - px) < Math.abs(pts[best][0] - px)) best = i })
    setHover(best)
  }
  const lx = x(low.date), ly = y(low.v)
  // l'étiquette du point bas se place au-dessus de la courbe, reliée au point
  const calloutX = Math.min(Math.max(m.l, lx - 78), W - m.r - 156)
  const calloutY = 6
  return (
    <div ref={ref} className="relative w-full select-none">
      <svg width={W} height={height} role="img" aria-label={`Trésorerie prévisionnelle à 90 jours, de ${keur(points[0].v)} aujourd’hui à un point bas de ${keur(low.v)} le ${dateCourte(low.date)}`}
        onPointerMove={onMove} onPointerLeave={() => setHover(null)} className="touch-pan-y">
        <defs>
          <linearGradient id="aire-treso" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={MARINE} stopOpacity=".14" />
            <stop offset="1" stopColor={MARINE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 50, 100, 150, 200].map((g) => (
          <g key={g}>
            <line x1={m.l} x2={W - m.r} y1={y(g)} y2={y(g)} stroke={MARINE} strokeOpacity={g === 0 ? 0.25 : 0.07} />
            <text x={m.l - 10} y={y(g) + 4} textAnchor="end" fontSize="11" fill="#5B6680" className="num">{g}</text>
          </g>
        ))}
        <text x={m.l - 10} y={m.t - 12} textAnchor="end" fontSize="11" fill="#5B6680">k€</text>
        {mois.map((mo) => (
          <text key={mo.iso} x={Math.max(m.l + 12, x(mo.iso))} y={height - 14} fontSize="12" fill="#4A5A78" textAnchor="middle">{mo.label}</text>
        ))}
        {/* échéances */}
        {echeances.map((e, i) => (
          <g key={i}>
            <line x1={x(e.date)} x2={x(e.date)} y1={height - m.b + 4} y2={height - m.b + 10} stroke={OR} strokeWidth={2} strokeLinecap="round" />
          </g>
        ))}
        <motion.path d={area} fill="url(#aire-treso)" initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6, duration: 0.6 }} />
        <motion.path d={d} fill="none" stroke={MARINE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.6, ease: EASE }} />
        {/* point bas */}
        <motion.g initial={reduce ? false : { opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.5, duration: 0.4 }}>
          <line x1={lx} x2={lx} y1={calloutY + 74} y2={y(0)} stroke={OR} strokeDasharray="3 4" strokeWidth={1.5} />
          <circle cx={lx} cy={ly} r={11} fill={OR} fillOpacity={0.18} />
          <circle cx={lx} cy={ly} r={5.5} fill={OR} stroke="#FFFDF8" strokeWidth={2} />
        </motion.g>
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={pts[hover][0]} x2={pts[hover][0]} y1={m.t} y2={y(0)} stroke={MARINE} strokeOpacity={0.25} />
            <circle cx={pts[hover][0]} cy={pts[hover][1]} r={4.5} fill={MARINE} stroke="#FFFDF8" strokeWidth={2} />
          </g>
        )}
      </svg>
      <motion.div initial={reduce ? false : { opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 1.7, duration: 0.4 }}
        className="pointer-events-none absolute w-[156px] rounded-xl border border-or/50 bg-papier px-3 py-2 shadow-lg"
        style={{ left: calloutX, top: calloutY }}>
        <div className="text-[10.5px] font-semibold uppercase tracking-[.14em] text-or-texte">Point bas</div>
        <div className="display-num text-[22px] leading-tight">{keur(low.v)}</div>
        <div className="text-[12px] text-encre-2">{dateCourte(low.date)}</div>
      </motion.div>
      {hover !== null && (
        <Bulle x={pts[hover][0]} y={pts[hover][1]} w={W}>
          <div className="font-semibold">{dateCourte(points[hover].date)} · <span className="num">{keur(points[hover].v)}</span></div>
          {points[hover].evt && <div className="text-brume">{points[hover].evt}</div>}
        </Bulle>
      )}
    </div>
  )
}

/* --------------------------------------------- Simulateur : avant / après */
export function SimChart({ base, serie, labels, height = 300 }: { base: number[]; serie: number[]; labels: string[]; height?: number }) {
  const reduce = useReducedMotion()
  const [ref, W] = useWidth<HTMLDivElement>(640)
  const [hover, setHover] = useState<number | null>(null)
  const m = { l: 44, r: 14, t: 18, b: 34 }
  const lo = Math.min(0, ...base, ...serie)
  const hi = Math.max(200, ...base, ...serie)
  const yMin = Math.floor(lo / 50) * 50, yMax = Math.ceil(hi / 50) * 50
  const x = (i: number) => m.l + (i * (W - m.l - m.r)) / (labels.length - 1)
  const y = (v: number) => m.t + (1 - (v - yMin) / (yMax - yMin)) * (height - m.t - m.b)
  const pB = base.map((v, i) => [x(i), y(v)] as [number, number])
  const pS = serie.map((v, i) => [x(i), y(v)] as [number, number])
  const dS = linePath(pS)
  const aire = `${dS}L${x(serie.length - 1)},${y(Math.max(yMin, 0))}L${x(0)},${y(Math.max(yMin, 0))}Z`
  const grid: number[] = []
  for (let g = yMin; g <= yMax; g += 50) grid.push(g)
  const lowI = serie.reduce((b, v, i) => (v < serie[b] ? i : b), 0)
  const diff = serie.some((v, i) => Math.abs(v - base[i]) > 0.05)
  const onMove = (e: React.PointerEvent) => {
    const r = (e.currentTarget as SVGElement).getBoundingClientRect()
    const i = Math.round(((e.clientX - r.left - m.l) / (W - m.l - m.r)) * (labels.length - 1))
    setHover(Math.max(0, Math.min(labels.length - 1, i)))
  }
  const tr = { duration: reduce ? 0 : 0.35, ease: EASE }
  return (
    <div ref={ref} className="relative w-full select-none">
      <svg width={W} height={height} role="img" aria-label="Trésorerie sur 12 mois, avant et après la décision" onPointerMove={onMove} onPointerLeave={() => setHover(null)} className="touch-pan-y">
        <defs>
          <linearGradient id="aire-sim" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={MARINE} stopOpacity=".12" /><stop offset="1" stopColor={MARINE} stopOpacity="0" />
          </linearGradient>
        </defs>
        {grid.map((g) => (
          <g key={g}>
            <line x1={m.l} x2={W - m.r} y1={y(g)} y2={y(g)} stroke={g === 0 && lo < 0 ? ALERTE : MARINE} strokeOpacity={g === 0 ? (lo < 0 ? 0.6 : 0.22) : 0.07} strokeDasharray={g === 0 && lo < 0 ? '4 4' : undefined} />
            <text x={m.l - 10} y={y(g) + 4} textAnchor="end" fontSize="11" fill="#5B6680" className="num">{g}</text>
          </g>
        ))}
        {labels.map((l, i) => (W > 520 || i % 2 === 0) && (
          <text key={i} x={x(i)} y={height - 10} fontSize="11.5" fill="#4A5A78" textAnchor="middle">{l}</text>
        ))}
        <motion.path animate={{ d: aire }} initial={false} transition={tr} fill="url(#aire-sim)" />
        <path d={linePath(pB)} fill="none" stroke={ARDOISE} strokeWidth={2} strokeDasharray="5 5" strokeLinecap="round" />
        <motion.path animate={{ d: dS }} initial={false} transition={tr} fill="none" stroke={MARINE} strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" />
        <motion.circle animate={{ cx: x(lowI), cy: y(serie[lowI]) }} initial={false} transition={tr} r={5.5} fill={serie[lowI] < 0 ? ALERTE : OR} stroke="#FFFDF8" strokeWidth={2} />
        {hover !== null && (
          <g pointerEvents="none">
            <line x1={x(hover)} x2={x(hover)} y1={m.t} y2={height - m.b} stroke={MARINE} strokeOpacity={0.2} />
            <circle cx={x(hover)} cy={y(base[hover])} r={4} fill={ARDOISE} stroke="#FFFDF8" strokeWidth={2} />
            <circle cx={x(hover)} cy={y(serie[hover])} r={4.5} fill={MARINE} stroke="#FFFDF8" strokeWidth={2} />
          </g>
        )}
      </svg>
      {hover !== null && (
        <Bulle x={x(hover)} y={Math.min(y(serie[hover]), y(base[hover]))} w={W}>
          <div className="font-semibold">{hover === 0 ? 'Aujourd’hui' : `Mi-${labels[hover]}`}</div>
          <div className="flex justify-between gap-2"><span className="text-brume">Sans décision</span><span className="num">{keur(Math.round(base[hover]))}</span></div>
          {diff && <div className="flex justify-between gap-2"><span className="text-brume">Avec</span><span className="num">{keur(Math.round(serie[hover]))}</span></div>}
        </Bulle>
      )}
    </div>
  )
}

/* --------------------------------------------------- Mini courbe (Clarté) */
export function MiniCurve({ values, labels, low, lowLabel, unit = 'k€' }: { values: number[]; labels: string[]; low?: number; lowLabel?: string; unit?: string }) {
  const reduce = useReducedMotion()
  const [ref, W] = useWidth<HTMLDivElement>(340)
  const H = 130
  const m = { l: 6, r: 6, t: 26, b: 22 }
  const min = Math.min(...values), max = Math.max(...values)
  const lo = unit === 'k€' ? 0 : min * 0.9
  const x = (i: number) => m.l + (i * (W - m.l - m.r)) / (values.length - 1)
  const y = (v: number) => m.t + (1 - (v - lo) / (max - lo || 1)) * (H - m.t - m.b)
  const pts = values.map((v, i) => [x(i), y(v)] as [number, number])
  const d = linePath(pts)
  const li = low ?? -1
  return (
    <div ref={ref} className="relative w-full">
      <svg width={W} height={H} role="img" aria-label={`Courbe de ${labels[0]} à ${labels[labels.length - 1]}${lowLabel ? `, ${lowLabel}` : ''}`}>
        <line x1={m.l} x2={W - m.r} y1={H - m.b} y2={H - m.b} stroke={MARINE} strokeOpacity={0.15} />
        <motion.path d={`${d}L${x(values.length - 1)},${H - m.b}L${x(0)},${H - m.b}Z`} fill={MARINE} fillOpacity={0.06} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} />
        <motion.path d={d} fill="none" stroke={MARINE} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" initial={reduce ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1, ease: EASE }} />
        {li >= 0 && (
          <motion.g initial={reduce ? false : { opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1 }} style={{ transformOrigin: `${x(li)}px ${y(values[li])}px` }}>
            <circle cx={x(li)} cy={y(values[li])} r={9} fill={OR} fillOpacity={0.2} />
            <circle cx={x(li)} cy={y(values[li])} r={4.5} fill={OR} stroke="#FFFDF8" strokeWidth={2} />
          </motion.g>
        )}
        <text x={m.l} y={H - 6} fontSize="11" fill="#5B6680">{labels[0]}</text>
        <text x={W - m.r} y={H - 6} fontSize="11" fill="#5B6680" textAnchor="end">{labels[labels.length - 1]}</text>
      </svg>
      {li >= 0 && lowLabel && (
        <div className="absolute rounded-md bg-marine px-2 py-0.5 text-[11.5px] font-semibold text-ivoire" style={{ left: Math.min(Math.max(0, x(li) - 60), W - 150), top: Math.max(0, y(values[li]) - 30) }}>{lowLabel}</div>
      )}
    </div>
  )
}

/* -------------------------------------------------- Barres horizontales */
export function HBars({ items, max }: { items: { label: string; value: number; display: string; highlight?: boolean }[]; max?: number }) {
  const reduce = useReducedMotion()
  const mx = max ?? Math.max(...items.map((i) => i.value))
  return (
    <ul className="space-y-2.5">
      {items.map((it, i) => (
        <li key={it.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-encre-2">{it.label}</span>
            <span className={`num font-semibold ${it.highlight ? 'text-marine' : 'text-encre-2'}`}>{it.display}</span>
          </div>
          <div className="h-2 rounded-full bg-marine/[.07]">
            <motion.div className="h-2 rounded-full" style={{ background: it.highlight ? MARINE : ARDOISE, transformOrigin: 'left' }}
              initial={reduce ? false : { scaleX: 0 }} animate={{ scaleX: it.value / mx }} transition={{ duration: 0.8, delay: 0.1 * i, ease: EASE }} />
          </div>
        </li>
      ))}
    </ul>
  )
}

/* ------------------------------------------------------------ Jauge */
export function Gauge({ value, max, projection, height = 10, labelFin }: { value: number; max: number; projection?: number; height?: number; labelFin?: string }) {
  const reduce = useReducedMotion()
  const k = Math.min(1, value / max)
  const kp = projection ? Math.min(1.08, projection / max) : 0
  return (
    <div className="relative pt-1">
      <div className="relative rounded-full bg-marine/[.08]" style={{ height }}>
        {projection && (
          <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ background: `repeating-linear-gradient(135deg, ${OR}55 0 4px, transparent 4px 8px)`, transformOrigin: 'left', width: `${(kp / 1.08) * 100}%` }}
            initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.7, ease: EASE }} />
        )}
        <motion.div className="absolute inset-y-0 left-0 rounded-full bg-marine" style={{ width: `${(k / (projection ? 1.08 : 1)) * 100}%`, transformOrigin: 'left' }}
          initial={reduce ? false : { scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }} />
        <div className="absolute -top-1.5 w-[2px] rounded bg-or" style={{ left: `${(1 / (projection ? 1.08 : 1)) * 100}%`, height: height + 12 }} />
      </div>
      {labelFin && <div className="mt-2 text-right text-[11.5px] text-encre-3" style={{ marginRight: projection ? `${(1 - 1 / 1.08) * 100}%` : 0 }}>{labelFin}</div>}
    </div>
  )
}
