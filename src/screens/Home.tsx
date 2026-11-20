import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Footer } from '../components/Shell'
import { useTour } from '../components/Tour'
import { ClarteMark, Reveal } from '../components/ui/ui'
import { Sparkline } from '../components/charts/charts'
import { MOREL, OFFRES, PERSONNES } from '../data/demo'
import { keur, pct } from '../lib/format'

const EASE = [0.22, 0.8, 0.24, 1] as const
const BRIEF = `Votre activité progresse de ${pct(MOREL.caVar)}, mais le bois pèse sur votre marge. Trésorerie au plus bas mi-février : relancez ${PERSONNES.premierClient} dès cette semaine.`

function Apercu() {
  const reduce = useReducedMotion()
  const [n, setN] = useState(reduce ? BRIEF.length : 0)
  useEffect(() => {
    if (reduce) return
    let i = 0
    const t0 = setTimeout(function tick() {
      i += 2; setN(Math.min(BRIEF.length, i))
      if (i < BRIEF.length) t = setTimeout(tick, 22)
    }, 1300)
    let t = t0
    return () => clearTimeout(t)
  }, [reduce])
  return (
    <div className="relative mx-auto h-[440px] w-full max-w-[520px] md:h-[500px]" aria-hidden>
      {/* carte cockpit */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
        className="carte absolute left-0 right-6 top-6 p-6 md:right-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[12px] text-encre-3">Mardi 1er décembre</div>
            <div className="font-display text-[30px] leading-tight">Bonjour {PERSONNES.sophie.prenom}</div>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-marine/10 px-3 py-1 text-[11.5px] text-encre-2"><span className="h-2 w-2 rounded-full bg-bon" />Pennylane</span>
        </div>
        <div className="mt-4 rounded-2xl bg-ivoire/80 p-4">
          <div className="mb-1.5 flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[.18em] text-or-texte"><ClarteMark actif={n < BRIEF.length} /> Brief de Clarté</div>
          <p className={`min-h-[72px] font-display text-[17px] leading-snug ${n < BRIEF.length ? 'curseur-texte' : ''}`}>{BRIEF.slice(0, n)}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-marine/10 p-3.5">
            <div className="text-[11.5px] text-encre-3">Chiffre d’affaires</div>
            <div className="display-num text-[26px] leading-tight">{keur(MOREL.ca10m)}</div>
            <Sparkline values={[...MOREL.caMensuel]} width={150} height={30} label="" />
          </div>
          <div className="rounded-2xl border border-marine/10 p-3.5">
            <div className="text-[11.5px] text-encre-3">Trésorerie</div>
            <div className="display-num text-[26px] leading-tight">{keur(MOREL.tresorerie)}</div>
            <Sparkline values={[...MOREL.tresoFinMois, MOREL.tresorerie]} width={150} height={30} label="" />
          </div>
        </div>
      </motion.div>
      {/* bulle expert */}
      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 1.1, ease: EASE }}
        className="absolute bottom-6 right-0 flex max-w-[290px] items-center gap-3 rounded-2xl bg-marine px-4 py-3 text-ivoire shadow-2xl md:bottom-2">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-or font-display text-[15px] text-marine-950">CA</span>
        <div className="text-[13px] leading-snug"><span className="font-semibold">Validé par {PERSONNES.conseiller.prenom} {PERSONNES.conseiller.nom}</span><br /><span className="text-brume">votre conseillère INPUT</span></div>
      </motion.div>
      <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1, delay: 0.2, ease: EASE }} className="absolute -left-6 top-0 h-px w-24 origin-left bg-or" />
    </div>
  )
}

export default function Home() {
  const tour = useTour()
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-5 py-5 md:px-8">
        <img src="/brand/input-wordmark.png" alt="INPUT Expertise" width={540} height={50} className="h-[16px] w-auto md:h-[20px]" />
        <span className="hidden text-[13px] text-encre-3 md:block">Expertise comptable et conseil · Jarville-la-Malgrange · Saint-Dizier</span>
      </header>

      {/* promesse */}
      <section className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 pb-16 pt-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:px-8 md:pb-24 md:pt-10">
        <div data-tour="promesse">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="surtitre mb-5">INPUT · Espace dirigeant</motion.div>
          <h1 className="text-[42px] leading-[1.04] md:text-[64px]">
            {['De la ', <em key="c" className="text-or-texte">clarté</em>, ', de l’anticipation et de la capacité à décider.'].map((part, i) => (
              <motion.span key={i} className="inline" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 + i * 0.12, ease: EASE }}>{part}</motion.span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="mt-6 max-w-[540px] text-[17px] leading-relaxed text-encre-2 md:text-[18px]">
            Vos chiffres Pennylane traduits en langage clair. Clarté, notre assistante, prépare vos décisions ; votre conseiller INPUT les valide.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.65 }} className="mt-8 flex flex-wrap items-center gap-4">
            <Link to="/demo" className="btn btn-primaire !min-h-[52px] !px-7 !text-[15px]">Entrer dans la démo <span aria-hidden>→</span></Link>
            <button type="button" onClick={tour.demarrer} className="lien text-[14px] text-encre-2">ou suivre le mode présentation</button>
          </motion.div>
          {/* méthode */}
          <motion.ol initial="h" animate="v" variants={{ v: { transition: { staggerChildren: 0.18, delayChildren: 0.9 } } }} className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12px] font-semibold uppercase tracking-[.2em]">
            {['Comprendre', 'Décider', 'Avancer'].map((m, i) => (
              <motion.li key={m} variants={{ h: { opacity: 0, x: -8 }, v: { opacity: 1, x: 0 } }} className="flex items-center gap-3">
                {i > 0 && <span aria-hidden className="h-px w-8 bg-or" />}
                <span className={i === 2 ? 'text-or-texte' : 'text-marine'}>{m}</span>
              </motion.li>
            ))}
          </motion.ol>
        </div>
        <Apercu />
      </section>

      {/* trois offres */}
      <section className="mx-auto max-w-[1240px] px-5 pb-20 md:px-8" aria-labelledby="offres">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="surtitre mb-3">Trois offres, trois moments</div>
            <h2 id="offres" className="text-[32px] leading-tight md:text-[40px]">Un accompagnement à chaque étape</h2>
          </div>
          <p className="max-w-[420px] text-[15px] text-encre-2">On devient dirigeant parce qu’on maîtrise un métier. INPUT apporte le reste : la lecture des chiffres, l’anticipation, le regard d’un expert.</p>
        </Reveal>
        <div className="grid gap-5 md:grid-cols-3">
          {OFFRES.map((o, i) => (
            <Reveal key={o.id} delay={i * 0.08} as="article" className="carte flex flex-col p-7">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold uppercase tracking-[.16em] text-or-texte">0{i + 1}</span>
                {o.id === 'piloter' && <span className="pastille !bg-marine !text-ivoire">600 € par an</span>}
              </div>
              <h3 className="mt-4 text-[34px] leading-none">{o.nom}</h3>
              <div className="mt-2 text-[14px] text-encre-3">{o.cible}</div>
              <div className="filet-or my-5" />
              <p className="font-display text-[20px] italic leading-snug">{o.message}</p>
              <p className="mt-4 text-[14px] leading-relaxed text-encre-2">{o.format}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* IA prépare, expert valide */}
      <section className="sur-marine bg-marine text-ivoire">
        <div className="mx-auto grid max-w-[1240px] items-center gap-10 px-5 py-16 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] md:px-8 md:py-20">
          <Reveal>
            <div className="surtitre mb-4">La méthode</div>
            <h2 className="text-[34px] leading-tight md:text-[46px]">L’IA prépare. <em className="text-or-clair">L’expert valide.</em></h2>
            <p className="mt-5 max-w-[520px] text-[16px] leading-relaxed text-brume">Clarté lit la comptabilité, détecte ce qui compte et prépare les options. Votre conseiller INPUT relit, corrige et vous accompagne dans la décision.</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="grid grid-cols-2 gap-3">
              {[['Rigueur', 'Parce que chaque décision compte.'], ['Clarté', 'Parce que comprendre, c’est pouvoir agir.'], ['Anticipation', 'Parce que demain se prépare aujourd’hui.'], ['Proximité', 'Parce que comprendre un dirigeant, c’est comprendre sa réalité.']].map(([v, t]) => (
                <li key={v} className="rounded-2xl border border-ivoire/12 p-4">
                  <div className="font-display text-[21px]">{v}</div>
                  <div className="mt-1 text-[13px] leading-snug text-brume">{t}</div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-8 px-5 pb-14 md:px-8">
          <Link to="/demo" className="btn btn-or !min-h-[50px] !px-7">Entrer dans la démo <span aria-hidden>→</span></Link>
          <img src="/brand/input-logo-clair.png" alt="INPUT Expertise · Expertise & Conseil · La rigueur de l’expertise, la pertinence du conseil" width={1079} height={329} loading="lazy" className="h-auto w-[240px] opacity-95 md:w-[300px]" />
        </div>
      </section>
      <Footer sombre />
    </div>
  )
}
