/* Note de synthèse trimestrielle d'Ateliers Morel, construite à partir des
   mêmes données que le cockpit, Clarté et le simulateur. */
import { DATES, LEVIERS, MOREL, PERSONNES, SITUATION, conseillerNom } from './demo'
import { REF } from './model'
import { dateCourte, keur, pct } from '../lib/format'

const pb = MOREL.pointBas
const r = Math.round

export type ParaNote = { id: string; texte: string }
export type SectionNote = { id: string; etape?: 'Comprendre' | 'Décider' | 'Avancer'; titre: string; paras: ParaNote[]; liste?: boolean }

export const NOTE_TITRE = SITUATION.titre
export const NOTE_ENTREPRISE = PERSONNES.sophie.entreprise

export const NOTE_KPIS = [
  { label: 'Chiffre d’affaires · 10 mois', valeur: keur(MOREL.ca10m), note: `+${pct(MOREL.caVar)} sur un an` },
  { label: 'Marge brute', valeur: pct(MOREL.margeBrute), note: `${pct(MOREL.margeBruteN1)} un an plus tôt` },
  { label: 'Excédent brut d’exploitation', valeur: keur(MOREL.ebe), note: `${pct(MOREL.ebePct)} du chiffre d’affaires` },
  { label: 'Trésorerie', valeur: keur(MOREL.tresorerie), note: `point bas ${keur(pb.valeur)} le ${dateCourte(pb.date, false)}` },
]

export const NOTE: SectionNote[] = [
  {
    id: 'essentiel', titre: 'L’essentiel', paras: [{
      id: 'essentiel',
      texte: `${PERSONNES.sophie.entreprise} poursuit sa croissance : ${keur(MOREL.ca10m)} de chiffre d’affaires sur dix mois, soit +${pct(MOREL.caVar)} sur un an. La rentabilité reste solide, mais la marge recule et la trésorerie traversera un point bas mi-février. Rien d’alarmant : c’est un calendrier à préparer.`,
    }],
  },
  {
    id: 'activite', etape: 'Comprendre', titre: 'Activité et rentabilité', paras: [{
      id: 'activite',
      texte: `Le chiffre d’affaires atteint ${keur(MOREL.ca10m)}, contre ${keur(MOREL.ca10mN1)} un an plus tôt. La marge brute passe de ${pct(MOREL.margeBruteN1)} à ${pct(MOREL.margeBrute)} : la hausse du bois (environ +${pct(MOREL.hausseBois, 0)}) n’a pas été répercutée dans les devis, soit environ ${keur(MOREL.margeEffet)} de marge en moins. L’excédent brut d’exploitation s’établit à ${keur(MOREL.ebe)} (${pct(MOREL.ebePct)} du chiffre d’affaires) ; le résultat net de l’année est estimé à ${keur(MOREL.resultatNet)}.`,
    }],
  },
  {
    id: 'tresorerie', etape: 'Comprendre', titre: 'Trésorerie et clients', paras: [{
      id: 'tresorerie',
      texte: `La trésorerie s’élève à ${keur(MOREL.tresorerie)}. Elle descendra à ${keur(pb.valeur)} le ${dateCourte(pb.date)} : l’URSSAF, la TVA de janvier et l’échéance trimestrielle d’emprunt tombent la même semaine. Vos clients vous paient en ${MOREL.dso} jours en moyenne (objectif ${MOREL.dsoObjectif}) ; six factures de plus de 60 jours représentent ${keur(MOREL.retards.total)}, dont ${keur(MOREL.retards.principal)} chez ${PERSONNES.premierClient}, qui pèse ${pct(MOREL.dependance, 0)} du chiffre d’affaires.`,
    }],
  },
  {
    id: 'decider', etape: 'Décider', titre: 'Les décisions à préparer', liste: true, paras: [
      { id: 'd1', texte: `Réviser vos prix de 3 % au 1er janvier : la marge reviendrait à ${pct(REF.prix3.extra.tauxMarge)} et le résultat annuel à environ ${keur(r(REF.prix3.resultat))}, même avec 1 % de volume perdu.` },
      { id: 'd2', texte: `Recruter un chargé d’affaires plutôt en mars qu’en janvier : le point bas reste à ${keur(r(REF.recrutementMars.pointBas.valeur))}, contre ${keur(r(REF.recrutementJanvier.pointBas.valeur))} avec une arrivée en janvier.` },
      { id: 'd3', texte: `Machine à commande numérique (${keur(120)}) : un crédit si elle est livrée à partir d’avril, environ ${keur(r(REF.couts.creditBail.total - REF.couts.credit.total))} d’économie sur 5 ans ; un crédit-bail si elle arrive avant mars.` },
    ],
  },
  {
    id: 'avancer', etape: 'Avancer', titre: 'Le plan d’action du trimestre', liste: true, paras: [
      { id: 'a1', texte: `Cette semaine : relancer ${PERSONNES.premierClient} (${keur(MOREL.retards.principal)}). Encaissée avant fin janvier, cette somme remonte le point bas à ${keur(LEVIERS.hestia.pointBas)}.` },
      { id: 'a2', texte: 'En décembre : nouvelle grille de prix et clause d’indexation du bois dans les devis.' },
      { id: 'a3', texte: `Le ${dateCourte(DATES.rdvSophie)} : rendez-vous trimestriel avec ${conseillerNom} pour arbitrer le recrutement et la machine.` },
    ],
  },
  {
    id: 'mot', titre: 'Le mot de votre conseillère', paras: [{
      id: 'mot',
      texte: `${PERSONNES.sophie.prenom}, l’année est bonne : votre croissance de ${pct(MOREL.caVar)} se fait sans dégrader votre rentabilité de fond. Le creux de février se prépare dès maintenant, et l’essentiel tient en un appel à ${PERSONNES.premierClient}. On en parle le ${dateCourte(DATES.rdvSophie, false)}.`,
    }],
  },
]

export const NOTE_SIGNATURE = `Note préparée par Clarté à partir de Pennylane (balance au ${DATES.arreteTexte}) · relue et validée par ${conseillerNom}, conseillère INPUT.`

export const texteDe = (id: string, edits: Record<string, string>) => {
  for (const s of NOTE) for (const p of s.paras) if (p.id === id) return edits[id] ?? p.texte
  return ''
}
