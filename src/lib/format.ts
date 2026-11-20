/* Formats français — Intl.NumberFormat('fr-FR') partout.
   Espace insécable avant €, k€ et % ; espace fine dans les milliers. */
const NBSP = ' '
const nf0 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 })
const nf1 = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const nfs = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

// Espace insécable « classique » (U+00A0) : l'espace fine U+202F n'est pas dessinée par les polices du projet.
const fix = (s: string) => s.replace(/[\u202F\u2009]/g, NBSP).replace('-', '−')
export const nombre = (v: number, dec = 0) => fix((dec === 0 ? nf0 : dec === 1 ? nf1 : new Intl.NumberFormat('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec })).format(v))
export const keur = (v: number, dec = 0) => `${nombre(v, dec)}${NBSP}k€`
export const eur = (v: number) => `${nombre(Math.round(v))}${NBSP}€`
export const eur2 = (v: number) => `${nombre(v, 2)}${NBSP}€`
export const pct = (v: number, dec = 1) => `${nombre(v, dec)}${NBSP}%`
export const pts = (v: number) => `${fix(nfs.format(v))}${NBSP}pt`
export const signe = (v: number, f: (n: number) => string) => (v > 0 ? `+${f(v)}` : v < 0 ? `−${f(-v)}` : f(0))
export const jours = (v: number) => `${nombre(v)}${NBSP}j`

const MOIS_COURT = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const MOIS_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']

const parse = (iso: string) => {
  const [d, t] = iso.split('T')
  const [y, m, j] = d.split('-').map(Number)
  const [h, mi] = (t ?? '00:00').split(':').map(Number)
  return new Date(y, m - 1, j, h, mi)
}
const jourTxt = (d: Date) => (d.getDate() === 1 ? '1er' : String(d.getDate()))

/** « 15 févr. 2027 » */
export const dateCourte = (iso: string, annee = true) => {
  const d = parse(iso)
  return `${jourTxt(d)}${NBSP}${MOIS_COURT[d.getMonth()]}${annee ? `${NBSP}${d.getFullYear()}` : ''}`
}
/** « mardi 1er décembre 2026 » */
export const dateLongue = (iso: string, annee = true) => {
  const d = parse(iso)
  return `${JOURS[d.getDay()]} ${jourTxt(d)}${NBSP}${MOIS_LONG[d.getMonth()]}${annee ? ` ${d.getFullYear()}` : ''}`
}
export const jourSemaine = (iso: string) => JOURS[parse(iso).getDay()]
export const heure = (iso: string) => {
  const d = parse(iso)
  return `${d.getHours()}${NBSP}h${d.getMinutes() ? `${NBSP}${String(d.getMinutes()).padStart(2, '0')}` : ''}`
}
export const moisAnnee = (iso: string) => {
  const d = parse(iso)
  return `${MOIS_COURT[d.getMonth()]}${NBSP}${d.getFullYear()}`
}
export const joursEntre = (a: string, b: string) => Math.round((parse(b).getTime() - parse(a).getTime()) / 86400000)
export const parseDate = parse
