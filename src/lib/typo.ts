/* Typographie française appliquée à tout le texte affiché :
   espace insécable avant « : », espace fine avant « ; ? ! » et à l'intérieur des
   guillemets, milliers séparés, unité jamais seule en début de ligne.
   Un observateur corrige aussi le texte qui s'écrit progressivement (Clarté). */
const NB = '\u00A0'
const FINE = '\u00A0' // l'espace fine U+202F n'est pas dessinée par les polices du projet
const UNITES = '(k€|€|%|j|h|pt|pts|mois|ans|jours|salariés|écritures|factures|clients|min)'
const RE_UNITE = new RegExp(`(\\d) ${UNITES}(?![\\p{L}])`, 'gu')

export function typoFr(s: string): string {
  if (!s || !/[ :;?!«»\d]/.test(s)) return s
  return s
    .replace(/ :/g, `${NB}:`)
    .replace(/ ([;?!])/g, `${FINE}$1`)
    .replace(/« /g, `«${FINE}`)
    .replace(/ »/g, `${FINE}»`)
    .replace(/(\d) (\d{3})(?!\d)/g, `$1${FINE}$2`)
    .replace(/(\d) (\d{3})(?!\d)/g, `$1${FINE}$2`)
    .replace(RE_UNITE, `$1${NB}$2`)
    .replace(/n° /g, `n°${NB}`)
    .replace(/(\d)\u00A0h (\d)/g, `$1${NB}h${NB}$2`)
    .replace(/ —/g, `${NB}—`)
    .replace(/([a-zé])\.\.(?!\.)/g, '$1.') // « 10 déc.. » → « 10 déc. »
}

const IGNORE = new Set(['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'CODE', 'PRE'])
function ignored(node: Node): boolean {
  let el = node.parentElement
  while (el) {
    if (IGNORE.has(el.tagName) || el.isContentEditable || el.hasAttribute('data-notypo')) return true
    el = el.parentElement
  }
  return false
}
function fixText(node: Text) {
  if (ignored(node)) return
  const v = node.nodeValue ?? ''
  const f = typoFr(v)
  if (f !== v) node.nodeValue = f
}
function walk(root: Node) {
  if (root.nodeType === 3) return fixText(root as Text)
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let n: Node | null
  while ((n = tw.nextNode())) fixText(n as Text)
}
export function installerTypo(root: HTMLElement) {
  walk(root)
  const obs = new MutationObserver((muts) => {
    for (const m of muts) {
      if (m.type === 'characterData') fixText(m.target as Text)
      else m.addedNodes.forEach((n) => walk(n))
    }
  })
  obs.observe(root, { subtree: true, childList: true, characterData: true })
  return () => obs.disconnect()
}
