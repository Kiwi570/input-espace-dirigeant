/* Clarté — réponses scénarisées.
   Chaque réponse suit COMPRENDRE / DÉCIDER / AVANCER, contient au moins un
   élément visuel et se termine par des actions. Les chiffres viennent de
   demo.ts et model.ts : jamais recopiés à la main. */
import { CABINET, CAMILLE, DATES, JULIEN, LEVIERS, MOREL, PERSONNES, SIM_HYP, SOURCE_PENNYLANE, TRESO_90, conseillerNom, type ProfilId } from './demo'
import { REF } from './model'
import { dateCourte, eur, keur, pct, pts } from '../lib/format'

export type Block =
  | { t: 'p'; text: string }
  | { t: 'kpis'; items: { label: string; value: string; note?: string; tone?: 'gold' | 'alert' | 'good' }[] }
  | { t: 'bars'; items: { label: string; value: number; display: string; highlight?: boolean }[]; max?: number }
  | { t: 'table'; head: string[]; rows: string[][]; foot?: string[] }
  | { t: 'gauge'; label: string; value: number; max: number; display: string; note: string; projection?: number }
  | { t: 'curve'; values: number[]; labels: string[]; low?: number; lowLabel?: string; unit?: string }
  | { t: 'options'; items: { titre: string; texte: string; impact?: string; reco?: boolean }[] }
  | { t: 'steps'; items: { quand: string; texte: string; qui?: string }[] }

export type Action =
  | { kind: 'simuler'; label?: string; scenario: 'recruter' | 'investir' | 'prix'; params?: Record<string, number | string> }
  | { kind: 'plan'; label?: string; titre: string; echeance?: string }
  | { kind: 'conseiller'; label?: string; sujet: string }
  | { kind: 'aller'; label: string; to: string }
  | { kind: 'question'; label: string; answerId: string }

export type Answer = {
  id: string
  profil: ProfilId | 'tous'
  question: string
  mots: string[]
  etapes: string[]
  comprendre: Block[]
  decider: Block[]
  avancer: Block[]
  actions: Action[]
  source: string
}

const P = PERSONNES
const pb = MOREL.pointBas
const pbDate = dateCourte(pb.date)
const hestia = P.premierClient
const rdvSophie = dateCourte(DATES.rdvSophie, false)
const r1 = (v: number) => Math.round(v)

/* ------------------------------------------------------------- PILOTER */
const recJ = REF.recrutementJanvier
const recM = REF.recrutementMars
const prix3 = REF.prix3
const couts = REF.couts
const ecartCout = couts.creditBail.total - couts.credit.total

const treso90Courbe = (() => {
  const pts = TRESO_90.filter((_, i) => [0, 2, 3, 5, 7, 8, 10, 12, 13, 14, 16, 17].includes(i))
  return { values: pts.map((p) => p.v), labels: pts.map((p) => dateCourte(p.date, false)), low: pts.findIndex((p) => p.v === pb.valeur) }
})()

const PILOTER: Answer[] = [
  {
    id: 'recruter', profil: 'piloter', question: 'Puis-je recruter en janvier ?',
    mots: ['recrut', 'embauch', 'janvier', 'charge d affaires', 'commercial', 'salarie', 'poste', 'equipe'],
    etapes: ['Lecture de la masse salariale dans Pennylane…', 'Projection de la trésorerie à 90 jours…', 'Simulation d’une arrivée en janvier, puis en mars…'],
    comprendre: [
      { t: 'p', text: `Oui, c’est possible. Mais janvier tombe juste avant votre point bas du ${pbDate}. Un chargé d’affaires à 3 400 € brut par mois vous coûte environ ${eur(Math.round(REF.coutPoste * 100) * 10)} par mois, charges comprises.` },
      { t: 'kpis', items: [
        { label: 'Point bas sans recrutement', value: keur(pb.valeur) },
        { label: 'Arrivée en janvier', value: keur(r1(recJ.pointBas.valeur)), tone: 'alert', note: 'marge de sécurité réduite' },
        { label: 'Arrivée en mars', value: keur(r1(recM.pointBas.valeur)), tone: 'gold', note: 'le creux est passé' },
      ] },
    ],
    decider: [
      { t: 'options', items: [
        { titre: 'Recruter en mars', texte: `Le creux de février est passé. S’il apporte 18 k€ de chiffre d’affaires par mois, le poste couvre son coût dès son ${recM.extra.rentableMois}e mois.`, impact: `Résultat sur 12 mois : ${keur(r1(recM.resultat))}`, reco: true },
        { titre: 'Recruter en janvier', texte: `Tenable, mais votre point bas descendrait à ${keur(r1(recJ.pointBas.valeur))} : peu de marge si un client paie en retard.`, impact: `Résultat sur 12 mois : ${keur(r1(recJ.resultat))}` },
      ] },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: 'Cette semaine', texte: 'Rédiger la fiche de poste et le chiffre d’affaires attendu.' },
        { quand: rdvSophie, texte: `Valider le calendrier avec ${conseillerNom}.`, qui: 'conseiller' },
        { quand: 'Janvier', texte: 'Publier l’annonce pour une arrivée en mars.' },
      ] },
    ],
    actions: [
      { kind: 'simuler', scenario: 'recruter', label: 'Simuler ce recrutement' },
      { kind: 'plan', titre: 'Recruter un chargé d’affaires · arrivée en mars 2027', echeance: '2027-01-15' },
      { kind: 'conseiller', sujet: 'Recrutement d’un chargé d’affaires' },
    ],
    source: `${SOURCE_PENNYLANE} · relevés bancaires synchronisés`,
  },
  {
    id: 'marge', profil: 'piloter', question: 'Pourquoi ma marge baisse-t-elle ?',
    mots: ['marge', 'baisse', 'bois', 'achat', 'fournisseur', 'rentab', 'panneau', 'matiere', 'gagne'],
    etapes: ['Lecture des comptes d’achats dans Pennylane…', 'Comparaison avec les dix premiers mois de 2025…', 'Calcul de l’effet du prix du bois…'],
    comprendre: [
      { t: 'p', text: `Votre marge brute est passée de ${pct(MOREL.margeBruteN1)} à ${pct(MOREL.margeBrute)}. Vos achats de bois et de panneaux ont augmenté plus vite que vos prix de vente : vos devis de 2026 ont été chiffrés avec les tarifs de 2025.` },
      { t: 'bars', max: 42, items: [
        { label: 'Janv.–oct. 2025', value: MOREL.margeBruteN1, display: pct(MOREL.margeBruteN1) },
        { label: 'Janv.–oct. 2026', value: MOREL.margeBrute, display: pct(MOREL.margeBrute), highlight: true },
      ] },
      { t: 'kpis', items: [
        { label: 'Bois massif', value: `+${pct(MOREL.hausseBois, 0)}`, note: 'prix d’achat moyen' },
        { label: 'Panneaux', value: `+${pct(MOREL.hausseePanneaux, 0)}` },
        { label: 'Marge perdue depuis janvier', value: `≈ ${keur(MOREL.margeEffet)}`, tone: 'gold' },
      ] },
    ],
    decider: [
      { t: 'options', items: [
        { titre: 'Réviser vos prix de 3 %', texte: `Votre marge reviendrait à ${pct(prix3.extra.tauxMarge)}, au niveau de l’an dernier. Vous pourriez perdre jusqu’à ${pct(prix3.extra.perteMax, 0)} de volume avant que la hausse ne vous coûte.`, impact: `Résultat annuel : ${keur(r1(prix3.resultat))} au lieu de ${keur(MOREL.resultatNet)}`, reco: true },
        { titre: 'Indexer le bois dans vos devis', texte: 'Une clause d’indexation protège les chantiers signés plus de trois mois à l’avance.' },
        { titre: 'Regrouper vos achats', texte: 'Concentrer les panneaux chez un ou deux fournisseurs pour négocier les volumes.' },
      ] },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: 'Décembre', texte: 'Mettre à jour la grille de prix des devis à partir du 1er janvier.' },
        { quand: rdvSophie, texte: 'Relire la clause d’indexation avec votre conseillère.', qui: 'conseiller' },
      ] },
    ],
    actions: [
      { kind: 'simuler', scenario: 'prix', label: 'Simuler une hausse de prix' },
      { kind: 'plan', titre: 'Ajouter une clause d’indexation du bois aux devis', echeance: '2026-12-31' },
      { kind: 'conseiller', sujet: 'Révision des prix et indexation du bois' },
    ],
    source: SOURCE_PENNYLANE,
  },
  {
    id: 'creux', profil: 'piloter', question: 'Comment passer le creux de février ?',
    mots: ['creux', 'fevrier', 'tresorerie', 'point bas', 'decouvert', 'liquid', 'banque', 'cash', '41'],
    etapes: ['Lecture des relevés bancaires synchronisés…', 'Recensement des échéances fiscales et sociales…', 'Projection à 90 jours…', 'Recherche des leviers…'],
    comprendre: [
      { t: 'p', text: `Votre trésorerie passera de ${keur(MOREL.tresorerie)} aujourd’hui à ${keur(pb.valeur)} le ${pbDate}. Ce n’est pas une perte, c’est un calendrier : l’URSSAF, la TVA de janvier et l’échéance trimestrielle de votre emprunt tombent la même semaine, après un mois de janvier peu facturé.` },
      { t: 'curve', ...treso90Courbe, lowLabel: `${keur(pb.valeur)} le ${dateCourte(pb.date, false)}`, unit: 'k€' },
    ],
    decider: [
      { t: 'options', items: [
        { titre: `Obtenir le règlement de ${hestia}`, texte: `${keur(LEVIERS.hestia.gain)} de factures en retard. Encaissées avant fin janvier, elles remontent votre point bas à ${keur(LEVIERS.hestia.pointBas)}.`, impact: `Point bas : ${keur(LEVIERS.hestia.pointBas)}`, reco: true },
        { titre: 'Décaler la commande de bois de février', texte: `Votre stock couvre les chantiers de début mars : +${keur(LEVIERS.commandeBois.gain)} au moment du creux.`, impact: `Point bas : ${keur(LEVIERS.commandeBois.pointBas)}` },
        { titre: 'Négocier une facilité de caisse', texte: `${keur(LEVIERS.facilite.montant)} en sécurité, sans coût si elle n’est pas utilisée. À demander avant le creux, pas pendant.` },
      ] },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: 'Cette semaine', texte: `Appeler ${hestia} au sujet des deux factures (${keur(MOREL.retards.principal)}).` },
        { quand: 'Mi-janvier', texte: 'Faire le point sur les encaissements avec Clarté.' },
        { quand: rdvSophie, texte: 'Préparer la demande de facilité de caisse.', qui: 'conseiller' },
      ] },
    ],
    actions: [
      { kind: 'plan', titre: `Relancer ${hestia} (${keur(MOREL.retards.principal)})`, echeance: '2026-12-04' },
      { kind: 'question', label: 'Qui me paie en retard ?', answerId: 'retards' },
      { kind: 'conseiller', sujet: 'Passer le creux de trésorerie de février' },
    ],
    source: `Relevés bancaires synchronisés · ${SOURCE_PENNYLANE}`,
  },
  {
    id: 'retards', profil: 'piloter', question: 'Qui me paie en retard ?',
    mots: ['retard', 'paie', 'impaye', 'client', 'relance', 'facture', 'delai', 'hestia', 'encaiss', 'doit'],
    etapes: ['Lecture du compte clients dans Pennylane…', 'Rapprochement avec les encaissements bancaires…', 'Classement par ancienneté…'],
    comprendre: [
      { t: 'p', text: `Six factures ont plus de 60 jours de retard, pour ${keur(MOREL.retards.total)}. Plus de la moitié vient d’un seul client : ${hestia}, qui représente aussi ${pct(MOREL.dependance, 0)} de votre chiffre d’affaires.` },
      { t: 'table', head: ['Client', 'Retard', 'Montant'],
        rows: MOREL.retards.factures.map((f) => [f.client, `${f.jours} j`, keur(f.montant)]),
        foot: ['Total', '', keur(MOREL.retards.total)] },
    ],
    decider: [
      { t: 'p', text: `Vos clients vous paient en ${MOREL.dso} jours en moyenne, pour un objectif de ${MOREL.dsoObjectif}. Revenir à ${MOREL.dsoObjectif} jours libérerait environ ${keur(MOREL.liberable)} de trésorerie.` },
      { t: 'options', items: [
        { titre: 'Relance graduée', texte: `Appel de ${hestia} cette semaine, relance écrite des quatre autres clients sept jours après.`, reco: true },
        { titre: 'Acompte de 30 % à la commande', texte: 'Pour les nouveaux chantiers : la trésorerie suit l’avancement des travaux.' },
        { titre: 'Réduire la dépendance', texte: `${pct(MOREL.dependance, 0)} du chiffre d’affaires chez un seul client : un sujet à aborder au prochain rendez-vous.` },
      ] },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: 'Aujourd’hui', texte: `Appeler ${hestia}.` },
        { quand: 'Dans 7 jours', texte: 'Relance écrite des quatre autres factures (modèle prêt).' },
        { quand: 'Janvier', texte: 'Acompte systématique sur les nouveaux devis.' },
      ] },
    ],
    actions: [
      { kind: 'plan', titre: 'Relancer les 6 factures de plus de 60 jours', echeance: '2026-12-08' },
      { kind: 'question', label: 'Comment passer le creux de février ?', answerId: 'creux' },
      { kind: 'conseiller', sujet: 'Relance des clients et dépendance au premier client' },
    ],
    source: `${SOURCE_PENNYLANE} · compte clients`,
  },
  {
    id: 'machine', profil: 'piloter', question: 'Crédit ou crédit-bail pour la machine ?',
    mots: ['credit', 'bail', 'machine', 'investi', 'numerique', 'cnc', 'leasing', 'financ', 'emprunt', '120'],
    etapes: ['Lecture de vos emprunts en cours…', 'Comparaison de deux financements sur 5 ans…', 'Test d’une livraison en février, puis en avril…'],
    comprendre: [
      { t: 'p', text: `La machine à commande numérique coûte ${keur(SIM_HYP.machine.montant)}. Les deux solutions pèsent à peu près autant sur votre résultat. Elles diffèrent sur deux points : votre trésorerie au moment de la livraison, et le coût total.` },
      { t: 'table', head: ['', 'Crédit 5 ans', 'Crédit-bail 5 ans'], rows: [
        ['Apport', keur(couts.credit.apport), keur(0)],
        ['Avance de TVA', `${keur(SIM_HYP.machine.montant * 0.2)} (1 mois)`, 'aucune'],
        ['Mensualité', eur(couts.credit.mensualite * 1000), eur(couts.creditBail.mensualite * 1000)],
        ['Coût total', keur(couts.credit.total, 1), keur(couts.creditBail.total, 1)],
        ['Point bas si livrée en février', keur(r1(REF.machineCreditFevrier.pointBas.valeur)), keur(r1(REF.machineCBFevrier.pointBas.valeur))],
      ] },
    ],
    decider: [
      { t: 'options', items: [
        { titre: 'Livraison à partir d’avril : le crédit', texte: `Votre point bas reste à ${keur(pb.valeur)} et vous économisez environ ${keur(r1(ecartCout))} sur 5 ans.`, impact: `Coût total : ${keur(couts.credit.total, 1)}`, reco: true },
        { titre: 'Livraison avant mars : le crédit-bail', texte: `Avec un crédit, l’apport et l’avance de TVA feraient passer votre trésorerie sous zéro en février (${keur(r1(REF.machineCreditFevrier.pointBas.valeur))}).`, impact: `Coût total : ${keur(couts.creditBail.total, 1)}` },
      ] },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: 'Décembre', texte: 'Demander deux offres : votre banque et un organisme de crédit-bail.' },
        { quand: 'Janvier', texte: 'Négocier une livraison en avril avec le fournisseur.' },
        { quand: rdvSophie, texte: 'Comparer les offres reçues.', qui: 'conseiller' },
      ] },
    ],
    actions: [
      { kind: 'simuler', scenario: 'investir', label: 'Simuler les deux financements' },
      { kind: 'plan', titre: 'Demander deux offres de financement pour la machine', echeance: '2026-12-18' },
      { kind: 'conseiller', sujet: 'Financement de la machine à commande numérique' },
    ],
    source: `${SOURCE_PENNYLANE} · tableau d’emprunts`,
  },
  {
    id: 'priorites', profil: 'piloter', question: 'Où concentrer mes efforts ces trois prochains mois ?',
    mots: ['priorit', 'effort', 'trois mois', 'concentrer', 'urgent', 'commencer', 'resume', 'synthese', 'situation'],
    etapes: ['Lecture de vos indicateurs…', 'Classement des sujets par impact sur la trésorerie…'],
    comprendre: [
      { t: 'p', text: 'Votre entreprise est rentable et grandit. Trois sujets décident de votre hiver, dans cet ordre.' },
      { t: 'kpis', items: [
        { label: 'Factures en retard', value: keur(MOREL.retards.total), tone: 'alert', note: `dont ${keur(MOREL.retards.principal)} chez ${hestia}` },
        { label: 'Point bas de trésorerie', value: keur(pb.valeur), note: pbDate },
        { label: 'Marge brute', value: pct(MOREL.margeBrute), note: `−${pts(MOREL.margeBruteN1 - MOREL.margeBrute)} sur un an` },
      ] },
    ],
    decider: [
      { t: 'options', items: [
        { titre: '1. Encaisser', texte: `Les ${keur(MOREL.retards.total)} de retards valent plus que toutes les autres actions réunies pour février.`, reco: true },
        { titre: '2. Protéger la marge', texte: `Une hausse de 3 % en janvier ramène la marge à ${pct(prix3.extra.tauxMarge)}.` },
        { titre: '3. Décaler les décisions lourdes après le creux', texte: 'Recrutement et machine : à partir de mars ou d’avril.' },
      ] },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: 'Décembre', texte: 'Relances clients et nouvelle grille de prix.' },
        { quand: 'Janvier', texte: 'Annonce de recrutement, demandes de financement.' },
        { quand: 'Février', texte: 'Passer le creux, puis lancer les projets.' },
      ] },
    ],
    actions: [
      { kind: 'plan', titre: 'Plan de l’hiver : encaisser, protéger la marge, décaler les investissements', echeance: '2026-12-10' },
      { kind: 'aller', label: 'Ouvrir le simulateur', to: '/piloter/decider' },
      { kind: 'conseiller', sujet: 'Priorités des trois prochains mois' },
    ],
    source: SOURCE_PENNYLANE,
  },
  {
    id: 'prix', profil: 'piloter', question: 'Que change une hausse de 3 % de mes prix ?',
    mots: ['prix', 'hausse', 'augment', 'tarif', '3 %', 'devis', 'volume'],
    etapes: ['Lecture du chiffre d’affaires prévu sur 12 mois…', 'Calcul de l’effet sur la marge…', 'Test d’une perte de volume…'],
    comprendre: [
      { t: 'p', text: `Appliquée aux devis signés à partir de janvier, une hausse de 3 % se retrouve dans vos factures à partir de février. Votre marge brute remonterait à ${pct(prix3.extra.tauxMarge)}.` },
      { t: 'kpis', items: [
        { label: 'Marge brute', value: pct(prix3.extra.tauxMarge), tone: 'gold', note: `contre ${pct(MOREL.margeBrute)}` },
        { label: 'Marge supplémentaire', value: `+${keur(r1(prix3.extra.gainMarge))}`, note: 'sur 12 mois, avec 1 % de volume perdu' },
        { label: 'Résultat annuel', value: keur(r1(prix3.resultat)), note: `contre ${keur(MOREL.resultatNet)}` },
      ] },
    ],
    decider: [
      { t: 'p', text: `La hausse reste gagnante tant que vous perdez moins de ${pct(prix3.extra.perteMax, 0)} de volume. Elle ne règle pas février : ses effets arrivent en trésorerie à partir d’avril.` },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: 'Décembre', texte: 'Nouvelle grille de prix et courrier à vos clients réguliers.' },
        { quand: '1er janvier', texte: 'Application aux nouveaux devis.' },
      ] },
    ],
    actions: [
      { kind: 'simuler', scenario: 'prix', label: 'Ajuster la hausse' },
      { kind: 'plan', titre: 'Appliquer la nouvelle grille de prix au 1er janvier', echeance: '2027-01-01' },
      { kind: 'conseiller', sujet: 'Révision des prix de 3 %' },
    ],
    source: `${SOURCE_PENNYLANE} · prévisionnel 12 mois`,
  },
]

/* ------------------------------------------------------------- ÉVOLUER */
const J = JULIEN
const pctSeuil = (J.ca12m / J.seuilTVA) * 100
const statut = (id: string) => J.statuts.find((s) => s.id === id)!

const EVOLUER: Answer[] = [
  {
    id: 'tva-date', profil: 'evoluer', question: 'Quand vais-je dépasser le seuil de TVA ?',
    mots: ['tva', 'seuil', 'franchise', 'depass', 'quand', 'date', '37'],
    etapes: ['Lecture de vos encaissements dans Pennylane…', 'Calcul sur 12 mois glissants…', 'Projection au rythme actuel…'],
    comprendre: [
      { t: 'p', text: `Sur les 12 derniers mois, vous avez encaissé ${eur(J.ca12m)}, soit ${pct(pctSeuil, 0)} du seuil de franchise de TVA (${eur(J.seuilTVA)}, valeur illustrative). À votre rythme actuel, vous le franchirez en ${J.depassement}.` },
      { t: 'gauge', label: 'Seuil de franchise de TVA', value: J.ca12m, max: J.seuilTVA, display: eur(J.ca12m), note: `Dépassement estimé : ${J.depassement}`, projection: 37550 },
    ],
    decider: [
      { t: 'p', text: 'La règle se calcule sur l’année civile, avec un seuil majoré : selon le rythme exact de vos encaissements, la TVA pourrait s’appliquer en cours d’année 2027 ou au 1er janvier 2028. Votre conseillère confirmera la date.' },
      { t: 'options', items: [
        { titre: 'Préparer le passage dès maintenant', texte: 'Nouveaux prix, devis et factures prêts avant mars : aucune mauvaise surprise.', reco: true },
        { titre: 'Attendre le dépassement', texte: 'Risque de facturer sans TVA alors que vous la devez déjà.' },
      ] },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: dateCourte(DATES.rdvJulien, false), texte: 'Rendez-vous : confirmer la date réelle.', qui: 'conseiller' },
        { quand: 'Janvier', texte: 'Devis et factures avec TVA prêts dans Pennylane.' },
      ] },
    ],
    actions: [
      { kind: 'question', label: 'Que change la TVA sur mes prix ?', answerId: 'tva-prix' },
      { kind: 'plan', titre: 'Préparer mes devis et factures avec TVA', echeance: '2027-01-15' },
      { kind: 'conseiller', sujet: 'Date de passage à la TVA' },
    ],
    source: 'Pennylane · encaissements au 31/10/2026',
  },
  {
    id: 'tva-prix', profil: 'evoluer', question: 'Que change la TVA sur mes prix ?',
    mots: ['prix', 'ttc', 'ht', 'client', 'repercut', 'augment', 'tarif', 'cher'],
    etapes: ['Lecture de vos factures récentes…', 'Calcul sur une intervention type…'],
    comprendre: [
      { t: 'p', text: `Une fois soumis à la TVA, vous l’ajoutez à vos prix et vous la reversez. Pour un ${J.interventionType.libelle.toLowerCase()} facturé ${eur(J.interventionType.ht)} aujourd’hui :` },
      { t: 'table', head: ['', 'Client paie', 'Vous gardez'], rows: [
        ['Aujourd’hui (franchise)', eur(1200), eur(1200)],
        ['TVA répercutée (10 %)', eur(1320), eur(1200)],
        ['TVA répercutée (20 %)', eur(1440), eur(1200)],
        ['TVA absorbée (10 %)', eur(1200), eur(1091)],
      ] },
      { t: 'p', text: 'Taux de 10 % pour certains travaux de rénovation dans un logement de plus de deux ans, 20 % sinon : taux illustratifs, à valider.' },
    ],
    decider: [
      { t: 'options', items: [
        { titre: 'Répercuter pour vos clients professionnels', texte: 'Ils récupèrent la TVA : le changement est neutre pour eux.', reco: true },
        { titre: 'Répartir l’effort pour les particuliers', texte: `Une hausse de 5 % au lieu de 10 % garde vos prix compétitifs. Vous récupérez aussi environ ${eur(J.tvaRecuperable)} de TVA par an sur vos achats de matériel.` },
      ] },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: 'Janvier', texte: 'Nouvelle grille de prix HT et TTC.' },
        { quand: 'Février', texte: 'Courrier à vos clients réguliers.' },
      ] },
    ],
    actions: [
      { kind: 'aller', label: 'Voir l’impact sur mes prix', to: '/evoluer#prix' },
      { kind: 'plan', titre: 'Annoncer mes nouveaux prix à mes clients réguliers', echeance: '2027-02-15' },
      { kind: 'conseiller', sujet: 'Taux de TVA applicables à mes chantiers' },
    ],
    source: 'Pennylane · factures 2026',
  },
  {
    id: 'statut', profil: 'evoluer', question: 'Dois-je passer en société ?',
    mots: ['societe', 'statut', 'eurl', 'sasu', 'micro', 'reel', 'changer', 'regime', 'passer'],
    etapes: ['Lecture de vos charges réelles…', 'Comparaison de quatre statuts sur 2027…'],
    comprendre: [
      { t: 'p', text: `Pas tout de suite. Avec ${eur(J.caPrevu2027)} de chiffre d’affaires prévu en 2027 et des charges réelles d’environ ${pct(J.chargesPct, 0)}, la micro-entreprise et l’entreprise individuelle au réel se valent à quelques centaines d’euros près.` },
      { t: 'bars', items: J.statuts.map((s) => ({ label: s.nom, value: s.sans, display: eur(s.sans), highlight: s.id === 'ei' })) },
      { t: 'p', text: 'Revenu disponible estimé pour vous, sans apprenti. En société, une partie reste en réserve dans l’entreprise.' },
    ],
    decider: [
      { t: 'p', text: 'Ce qui change en mars, c’est la TVA, pas votre statut. La question du statut se pose vraiment si vous embauchez : en micro, le coût d’un apprenti ne réduit ni vos cotisations ni votre impôt.' },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: 'Avril 2027', texte: 'Choisir entre micro et réel, selon le projet d’apprenti.' },
        { quand: 'Fin 2027', texte: 'Réétudier la société si le chiffre d’affaires dépasse 60 000 €.' },
      ] },
    ],
    actions: [
      { kind: 'aller', label: 'Ouvrir le comparateur', to: '/evoluer#statuts' },
      { kind: 'question', label: 'Puis-je embaucher un apprenti ?', answerId: 'apprenti' },
      { kind: 'conseiller', sujet: 'Choix du statut pour 2027' },
    ],
    source: 'Pennylane · charges 2026 · estimations illustratives',
  },
  {
    id: 'apprenti', profil: 'evoluer', question: 'Puis-je embaucher un apprenti ?',
    mots: ['apprenti', 'embauch', 'recrut', 'salarie', 'aide', 'alternance', 'cap'],
    etapes: ['Estimation du coût d’un apprenti en première année…', 'Application de l’aide à l’embauche (valeur illustrative)…', 'Effet sur chaque statut…'],
    comprendre: [
      { t: 'p', text: `Oui. En première année, un apprenti vous coûterait environ ${eur(J.apprenti.coutBrutAn)}, et ${eur(J.apprenti.coutNet)} après l’aide à l’embauche (montant illustratif, à valider).` },
      { t: 'kpis', items: [
        { label: 'Coût annuel', value: eur(J.apprenti.coutBrutAn) },
        { label: 'Aide à l’embauche', value: `−${eur(J.apprenti.aide)}`, tone: 'good' },
        { label: 'Coût net', value: eur(J.apprenti.coutNet), tone: 'gold' },
      ] },
    ],
    decider: [
      { t: 'p', text: 'Le vrai sujet, c’est votre statut : en micro, ce coût ne se déduit pas. Au réel, il réduit vos cotisations et votre impôt.' },
      { t: 'bars', items: [
        { label: 'Micro avec apprenti', value: statut('micro').avec, display: eur(statut('micro').avec) },
        { label: 'Réel avec apprenti', value: statut('ei').avec, display: eur(statut('ei').avec), highlight: true },
      ] },
      { t: 'p', text: `Au réel, il vous resterait environ ${eur(statut('ei').avec - statut('micro').avec)} de plus par an.` },
    ],
    avancer: [
      { t: 'steps', items: [
        { quand: 'Avril 2027', texte: 'Passer au réel si le projet se confirme.' },
        { quand: 'Juin 2027', texte: 'Signer le contrat pour une arrivée à la rentrée.' },
      ] },
    ],
    actions: [
      { kind: 'aller', label: 'Comparer les statuts avec un apprenti', to: '/evoluer#statuts' },
      { kind: 'plan', titre: 'Recruter un apprenti pour septembre 2027', echeance: '2027-06-30' },
      { kind: 'conseiller', sujet: 'Embauche d’un apprenti et passage au réel' },
    ],
    source: 'Estimations illustratives · à valider par votre conseiller INPUT',
  },
  {
    id: 'gagne-plus', profil: 'evoluer', question: 'Mon chiffre d’affaires augmente, mais est-ce que je gagne plus ?',
    mots: ['gagne', 'revenu', 'benefice', 'argent', 'reste', 'augmente', 'plus'],
    etapes: ['Lecture des encaissements et des achats…', 'Comparaison avec les 12 mois précédents…'],
    comprendre: [
      { t: 'p', text: `Oui, mais moins vite que votre chiffre d’affaires : +${pct(((J.ca12m - J.ca12mN1) / J.ca12mN1) * 100, 0)} d’encaissements sur un an, alors que vos achats de matériel ont suivi. En micro, vos cotisations augmentent avec chaque euro encaissé.` },
      { t: 'curve', values: J.caMensuel, labels: J.moisLabels, unit: '€' },
    ],
    decider: [
      { t: 'p', text: 'Pour gagner plus, le levier n’est pas seulement le volume : c’est votre prix horaire, à revoir au moment du passage à la TVA.' },
    ],
    avancer: [
      { t: 'steps', items: [{ quand: 'Janvier', texte: 'Calculer votre prix horaire réel avec Clarté et votre conseillère.' }] },
    ],
    actions: [
      { kind: 'question', label: 'Que change la TVA sur mes prix ?', answerId: 'tva-prix' },
      { kind: 'conseiller', sujet: 'Prix horaire et rentabilité' },
    ],
    source: 'Pennylane · encaissements au 31/10/2026',
  },
]

/* ---------------------------------------------------------- SE LANCER */
const C = CAMILLE
const SE_LANCER: Answer[] = [
  {
    id: 'statut-camille', profil: 'lancer', question: 'Quel statut choisir pour mon studio ?',
    mots: ['statut', 'eurl', 'sasu', 'micro', 'societe', 'choisir', 'forme', 'juridique'],
    etapes: ['Lecture de vos réponses…', 'Comparaison de trois statuts sur votre projet…'],
    comprendre: [
      { t: 'p', text: `Votre loyer et votre matériel pèseront plus de la moitié de votre chiffre d’affaires. Avec la micro-entreprise, ces charges ne seraient pas déduites : vous seriez imposée sur un bénéfice que vous n’avez pas.` },
      { t: 'kpis', items: [
        { label: 'Chiffre d’affaires visé', value: eur(C.caAn1) },
        { label: 'Charges de l’année 1', value: eur(C.previsionnel[0].charges), note: `${pct((C.previsionnel[0].charges / C.caAn1) * 100, 0)} du chiffre d’affaires` },
      ] },
    ],
    decider: [
      { t: 'options', items: [
        { titre: 'EURL à l’impôt sur les sociétés', texte: 'Charges déductibles, patrimoine séparé, crédibilité auprès du bailleur et de la banque. Sans rémunération la première année, vos allocations peuvent continuer (à vérifier avec France Travail).', reco: true },
        { titre: 'Micro-entreprise', texte: 'Plus simple, mais adaptée seulement si vous donnez vos cours sans local.' },
      ] },
    ],
    avancer: [
      { t: 'steps', items: [{ quand: dateCourte(DATES.rdvCamille, false), texte: 'Valider le statut avec votre conseillère.', qui: 'conseiller' }] },
    ],
    actions: [
      { kind: 'plan', titre: 'Valider le statut de mon studio', echeance: DATES.rdvCamille.slice(0, 10) },
      { kind: 'conseiller', sujet: 'Choix du statut du studio' },
    ],
    source: 'Vos réponses · estimations illustratives',
  },
  {
    id: 'point-mort', profil: 'lancer', question: 'Quand vais-je atteindre mon point mort ?',
    mots: ['point mort', 'rentable', 'seuil', 'equilibre', 'quand', 'benefice'],
    etapes: ['Calcul de vos charges fixes…', 'Projection mois par mois de la première année…'],
    comprendre: [
      { t: 'p', text: `Votre point mort est d’environ ${eur(C.pointMort)} de chiffre d’affaires par an : c’est ce qu’il faut encaisser pour couvrir vos charges. Vous l’atteindriez au ${C.pointMortMois}e mois, en ${C.pointMortLabel}.` },
      { t: 'curve', values: C.caMensuelAn1.reduce<number[]>((a, v) => [...a, (a.at(-1) ?? 0) + v], []), labels: C.moisAn1, low: C.pointMortMois - 1, lowLabel: `point mort · ${C.pointMortLabel}`, unit: '€' },
    ],
    decider: [{ t: 'p', text: 'La rentrée de septembre est votre moment clé : c’est là que les abonnements annuels se signent.' }],
    avancer: [{ t: 'steps', items: [{ quand: 'Printemps 2027', texte: 'Préparer une offre de rentrée avec votre mentor.' }] }],
    actions: [
      { kind: 'question', label: 'Combien de cours dois-je vendre par mois ?', answerId: 'cours' },
      { kind: 'conseiller', sujet: 'Prévisionnel du studio' },
    ],
    source: 'Prévisionnel simplifié · valeurs illustratives',
  },
  {
    id: 'cours', profil: 'lancer', question: 'Combien de cours dois-je vendre par mois ?',
    mots: ['cours', 'abonnement', 'eleves', 'vendre', 'combien', 'clients', 'mois'],
    etapes: ['Conversion du point mort en cours…'],
    comprendre: [
      { t: 'p', text: `Pour couvrir vos charges, il faut environ ${eur(C.pointMort / 12)} par mois.` },
      { t: 'kpis', items: [
        { label: `Abonnements à ${C.prixAbonnement} €`, value: String(Math.ceil(C.pointMort / 12 / C.prixAbonnement)), note: 'par mois' },
        { label: `ou cours à l’unité à ${C.prixCours} €`, value: String(Math.ceil(C.pointMort / 12 / C.prixCours)), note: 'places par mois' },
      ] },
    ],
    decider: [{ t: 'p', text: 'Les abonnements sécurisent votre trésorerie : visez-les en priorité, les cours à l’unité servent à découvrir le studio.' }],
    avancer: [{ t: 'steps', items: [{ quand: 'Module 4', texte: 'Construire votre offre de lancement dans My Oneee.' }] }],
    actions: [
      { kind: 'plan', titre: 'Construire mon offre d’abonnements', echeance: '2027-01-31' },
      { kind: 'conseiller', sujet: 'Prix des abonnements' },
    ],
    source: 'Prévisionnel simplifié · valeurs illustratives',
  },
  {
    id: 'demarches', profil: 'lancer', question: 'Par quoi commencer cette semaine ?',
    mots: ['commencer', 'semaine', 'demarche', 'premier', 'etape', 'faire', 'ordre'],
    etapes: ['Lecture de votre feuille de route…'],
    comprendre: [{ t: 'p', text: 'Deux démarches conditionnent toutes les autres : votre statut et vos qualifications pour enseigner.' }],
    decider: [{ t: 'steps', items: [
      { quand: 'Cette semaine', texte: 'Vérifier les qualifications requises pour enseigner contre rémunération.' },
      { quand: dateCourte(DATES.rdvCamille, false), texte: 'Valider votre statut avec votre conseillère.', qui: 'conseiller' },
      { quand: 'Janvier', texte: 'Ouvrir votre compte professionnel et y déposer votre apport.' },
    ] }],
    avancer: [{ t: 'kpis', items: [{ label: 'Démarches faites', value: `2 sur ${C.demarches.length}`, tone: 'gold' }] }],
    actions: [
      { kind: 'plan', titre: 'Vérifier mes qualifications pour enseigner', echeance: '2026-12-04' },
      { kind: 'conseiller', sujet: 'Ordre des démarches' },
    ],
    source: 'Votre feuille de route',
  },
  {
    id: 'parcours', profil: 'lancer', question: 'Où en est mon parcours My Oneee ?',
    mots: ['parcours', 'oneee', 'module', 'formation', 'examen', 'diplome', 'mentor'],
    etapes: ['Lecture de votre progression…'],
    comprendre: [
      { t: 'p', text: `Vous suivez le module ${C.parcours.module} sur ${C.parcours.total} : « ${C.parcours.modules[1]} ». Vous en êtes à ${C.parcours.progressionModule} %.` },
      { t: 'gauge', label: 'Parcours de 6 mois', value: 1.6, max: 8, display: `module ${C.parcours.module} sur ${C.parcours.total}`, note: `Examen le ${dateCourte(DATES.examenCamille)}` },
    ],
    decider: [{ t: 'p', text: 'Le module 2 vous servira directement : vous y fixerez le prix de vos abonnements.' }],
    avancer: [{ t: 'steps', items: [{ quand: dateCourte(DATES.rdvCamille, false), texte: `Rendez-vous avec ${P.mentor.prenom} ${P.mentor.nom}, votre mentor.` }] }],
    actions: [
      { kind: 'aller', label: 'Voir mon parcours', to: '/se-lancer#parcours' },
      { kind: 'conseiller', sujet: 'Avancement du parcours' },
    ],
    source: 'My Oneee · progression',
  },
]

/* ------------------------------------------------------------ CABINET */
const K = CABINET
const heuresSans = 4 * K.tempsSans + 4 * K.rdvHeures
const heuresAvec = 4 * K.tempsAvec + 4 * K.rdvHeures
const CABINET_A: Answer[] = [
  {
    id: 'rentabilite', profil: 'cabinet', question: 'Combien rapporte l’offre Piloter ?',
    mots: ['rapporte', 'rentab', 'piloter', '600', 'revenu', 'heure', 'temps', 'marge'],
    etapes: ['Lecture des abonnements Piloter…', 'Mesure du temps passé par situation…'],
    comprendre: [
      { t: 'p', text: `${K.parOffre.piloter} abonnements à ${eur(K.prixPiloter)}, soit ${eur(K.parOffre.piloter * K.prixPiloter)} par an. Sans Clarté, une situation trimestrielle demande environ 3 h 30 de préparation : l’offre ne serait pas rentable.` },
      { t: 'kpis', items: [
        { label: 'Sans Clarté', value: `${Math.round(K.prixPiloter / heuresSans)} €/h`, note: `${heuresSans} h par client et par an`, tone: 'alert' },
        { label: 'Avec Clarté', value: `${Math.round(K.prixPiloter / heuresAvec)} €/h`, note: `${Math.round(heuresAvec * 10) / 10} h par client et par an`, tone: 'gold' },
      ] },
    ],
    decider: [{ t: 'p', text: `Clarté a aussi détecté ${K.missionsDetectees} missions complémentaires ce trimestre, pour environ ${eur(K.missionsValeur)} : l’abonnement devient une porte d’entrée.` }],
    avancer: [{ t: 'steps', items: [{ quand: 'Ce mois-ci', texte: `Valider les ${K.situationsPreRedigees} situations pré-rédigées.` }] }],
    actions: [{ kind: 'aller', label: 'Préparer une situation', to: '/cabinet/situation' }],
    source: 'Estimations de démonstration',
  },
  {
    id: 'appeler', profil: 'cabinet', question: 'Quels clients appeler en priorité ?',
    mots: ['appeler', 'priorit', 'urgent', 'alerte', 'client', 'risque'],
    etapes: ['Lecture des alertes du portefeuille…', 'Classement par impact…'],
    comprendre: [{ t: 'table', head: ['Client', 'Pourquoi'], rows: [
      [P.sophie.entreprise, `Point bas ${keur(pb.valeur)} le ${dateCourte(pb.date, false)}`],
      ['Garage Valette', 'Trésorerie sous 50 k€ en janvier'],
      [`${P.julien.prenom} ${P.julien.nom}`, `Seuil de TVA en ${J.depassement}`],
    ] }],
    decider: [{ t: 'p', text: `Commencez par ${P.sophie.prenom} ${P.sophie.nom} : sa situation est pré-rédigée et le levier (${keur(MOREL.retards.principal)} chez ${hestia}) est connu.` }],
    avancer: [{ t: 'steps', items: [{ quand: 'Aujourd’hui', texte: 'Valider la situation d’Ateliers Morel et l’envoyer.' }] }],
    actions: [{ kind: 'aller', label: 'Préparer la situation d’Ateliers Morel', to: '/cabinet/situation' }],
    source: 'Alertes Clarté · portefeuille INPUT',
  },
  {
    id: 'situations', profil: 'cabinet', question: 'Quelles situations restent à préparer ?',
    mots: ['situation', 'trimestr', 'preparer', 'reste', 'note', 'synthese'],
    etapes: ['Lecture du calendrier des situations…'],
    comprendre: [{ t: 'gauge', label: 'Situations trimestrielles', value: K.situationsPreRedigees, max: K.situationsAPreparer, display: `${K.situationsPreRedigees} sur ${K.situationsAPreparer} pré-rédigées`, note: '2 en attente de pièces' }],
    decider: [{ t: 'p', text: 'Deux situations attendent des pièces : les relevés de novembre de Transports Hennequin et l’inventaire des Caves Delorme. Clarté les rédigera dès réception.' }],
    avancer: [{ t: 'steps', items: [{ quand: 'Cette semaine', texte: 'Relire et valider les 11 pré-rédactions.' }] }],
    actions: [{ kind: 'aller', label: 'Ouvrir les situations', to: '/cabinet#situations' }],
    source: 'Portefeuille INPUT',
  },
]

/* ------------------------------------------------------------ GÉNÉRAL */
const GENERAL: Answer[] = [
  {
    id: 'clarte', profil: 'tous', question: 'Que fait Clarté ?',
    mots: ['clarte', 'qui es', 'que fais', 'ia', 'assistant', 'aide', 'peux'],
    etapes: ['Présentation…'],
    comprendre: [{ t: 'p', text: 'Je lis vos chiffres Pennylane et je les traduis en langage clair. Quand vous me posez une question, je prépare l’analyse : ce que disent les chiffres, les options possibles, le plan d’action.' }],
    decider: [{ t: 'kpis', items: [{ label: 'Comprendre', value: 'les chiffres' }, { label: 'Décider', value: 'les options' }, { label: 'Avancer', value: 'le plan', tone: 'gold' }] }],
    avancer: [{ t: 'p', text: `Je prépare, votre conseillère INPUT valide. Rien ne part chez un client sans sa relecture.` }],
    actions: [{ kind: 'question', label: 'Qui valide les analyses ?', answerId: 'validation' }],
    source: 'INPUT · Espace dirigeant',
  },
  {
    id: 'validation', profil: 'tous', question: 'Qui valide les analyses ?',
    mots: ['valide', 'expert', 'conseiller', 'humain', 'fiable', 'confiance', 'erreur'],
    etapes: ['Présentation…'],
    comprendre: [{ t: 'p', text: `Chaque analyse porte la mention « à valider par votre conseiller INPUT ». ${conseillerNom} relit les situations trimestrielles, corrige si besoin et les signe avant de vous les envoyer.` }],
    decider: [{ t: 'p', text: 'Les seuils et taux réglementaires affichés sont illustratifs tant qu’ils n’ont pas été confirmés par un expert du cabinet.' }],
    avancer: [{ t: 'steps', items: [{ quand: 'À chaque trimestre', texte: 'Une situation validée et un rendez-vous avec votre conseiller.' }] }],
    actions: [{ kind: 'question', label: 'D’où viennent les chiffres ?', answerId: 'donnees' }],
    source: 'INPUT · méthode Comprendre, Décider, Avancer',
  },
  {
    id: 'donnees', profil: 'tous', question: 'D’où viennent les chiffres ?',
    mots: ['vient', 'source', 'pennylane', 'donnee', 'securit', 'banque', 'synchro'],
    etapes: ['Présentation…'],
    comprendre: [{ t: 'p', text: 'De votre comptabilité Pennylane, tenue par le cabinet, et de vos relevés bancaires synchronisés. Chaque réponse cite sa source et sa date.' }],
    decider: [{ t: 'kpis', items: [{ label: 'Pennylane', value: 'Connecté' }, { label: 'Dernière synchronisation', value: 'il y a 2 min' }] }],
    avancer: [{ t: 'p', text: 'Dans cette démonstration, toutes les données sont fictives.' }],
    actions: [{ kind: 'aller', label: 'Choisir un profil', to: '/demo' }],
    source: 'Démo · données fictives',
  },
]

export const ANSWERS: Answer[] = [...PILOTER, ...EVOLUER, ...SE_LANCER, ...CABINET_A, ...GENERAL]
export const answerById = (id: string) => ANSWERS.find((a) => a.id === id)

/* Questions suggérées par profil et par écran */
export function suggestions(profil: ProfilId | null, path: string): string[] {
  if (profil === 'piloter' || path.startsWith('/piloter')) {
    if (path.includes('decider')) return ['recruter', 'machine', 'prix', 'creux']
    return ['recruter', 'marge', 'creux', 'retards', 'machine', 'priorites']
  }
  if (profil === 'evoluer' || path.startsWith('/evoluer')) return ['tva-date', 'tva-prix', 'statut', 'apprenti', 'gagne-plus']
  if (profil === 'lancer' || path.startsWith('/se-lancer')) return ['statut-camille', 'point-mort', 'cours', 'demarches', 'parcours']
  if (profil === 'cabinet' || path.startsWith('/cabinet')) return ['appeler', 'rentabilite', 'situations', 'validation']
  return ['clarte', 'validation', 'donnees']
}

/* Saisie libre : rapprochement par mots-clés */
const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ')
export function trouverReponse(texte: string, profil: ProfilId | null): string | null {
  const q = norm(texte)
  let best: { id: string; score: number } | null = null
  for (const a of ANSWERS) {
    let score = 0
    for (const m of a.mots) if (q.includes(norm(m))) score += m.length > 4 ? 2 : 1
    if (score === 0) continue
    if (a.profil === profil) score += 1.5
    else if (a.profil !== 'tous') score -= 1
    if (!best || score > best.score) best = { id: a.id, score }
  }
  return best && best.score >= 2 ? best.id : null
}

export const REPONSE_INCONNUE = {
  texte: 'Je n’ai pas encore cette analyse dans la démonstration. Dans la version finale, je lirai votre grand livre Pennylane pour y répondre, avec les chiffres de votre entreprise, puis je transmettrai la question à votre conseiller si elle demande son expertise.',
}
