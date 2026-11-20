/* ==========================================================================
   INPUT · Espace dirigeant — données de démonstration
   --------------------------------------------------------------------------
   Toutes les données sont FICTIVES. C'est la seule source des chiffres :
   cockpit, Clarté, simulateur et note trimestrielle lisent tous ce fichier.
   Pour changer un prénom, une entreprise ou le conseiller : modifier PERSONNES
   ci-dessous, et rien d'autre.
   ========================================================================== */

export const PERSONNES = {
  cabinet: 'INPUT',
  cabinetLong: 'INPUT Conseil et Expertise',
  conseiller: { prenom: 'Claire', nom: 'Ancel', role: 'Conseillère INPUT' },
  sophie: { prenom: 'Sophie', nom: 'Morel', entreprise: 'Ateliers Morel Agencement', forme: 'SAS', ville: 'Metz' },
  julien: { prenom: 'Julien', nom: 'Marchal', metier: 'Électricien', ville: 'Bar-le-Duc' },
  camille: { prenom: 'Camille', nom: 'Renaud', age: 34, ville: 'Verdun', projet: 'Studio Ancrage', activite: 'studio de pilates' },
  mentor: { prenom: 'Hélène', nom: 'Marquis', bio: 'a créé deux studios de yoga à Metz, qu’elle dirige depuis 2016' },
  premierClient: 'Résidences Hestia',
} as const

export const conseillerNom = `${PERSONNES.conseiller.prenom} ${PERSONNES.conseiller.nom}`

/* Dates de la démo ------------------------------------------------------- */
export const DATES = {
  aujourdhui: '2026-12-01', // date du jour affichée dans la démo
  arrete: '2026-10-31', // données comptables arrêtées au
  arreteTexte: '31/10/2026',
  rdvSophie: '2026-12-10T09:30', // rendez-vous trimestriel
  remiseSituation: '2026-12-04',
  rdvJulien: '2026-12-10T14:00',
  rdvCamille: '2026-12-09T18:30',
  examenCamille: '2027-05-20',
}

export const SOURCE_PENNYLANE = `Pennylane · balance au ${DATES.arreteTexte}`
export const STATUT_CLARTE = `Analyse préparée par Clarté · à valider par votre conseiller INPUT`

/* ==========================================================================
   PILOTER — Ateliers Morel Agencement (SAS, Metz, 14 salariés)
   ========================================================================== */
export const MOREL = {
  salaries: 14,
  activite: 'Menuiserie et agencement intérieur',
  ecritures: 12486,
  moisLabels: ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.'],
  ca10m: 1612, // k€
  ca10mN1: 1478,
  caVar: 9.1, // %
  caMensuel: [138, 142, 165, 158, 170, 176, 152, 98, 205, 208],
  caMensuelN1: [128, 130, 150, 146, 155, 160, 141, 92, 186, 190],
  margeBrute: 38.4, // %
  margeBruteN1: 40.1,
  margeMensuelle: [39.6, 39.3, 39.0, 38.7, 38.5, 38.3, 37.9, 37.9, 37.8, 37.6],
  margeEffet: 27, // k€ de marge perdue sur 10 mois (1,7 pt × 1 612 k€)
  hausseBois: 14, // % (illustratif)
  hausseePanneaux: 9,
  ebe: 116, // k€
  ebePct: 7.2,
  ebeN1: 124,
  ebeCumule: [8, 19, 33, 45, 59, 73, 84, 88, 102, 116],
  resultatNet: 74, // k€, estimé sur l'année
  tresorerie: 186, // k€ aujourd'hui
  tresoFinMois: [142, 128, 151, 163, 158, 172, 181, 160, 171, 179],
  pointBas: { valeur: 41, date: '2027-02-16' },
  dso: 58, // jours
  dsoObjectif: 45,
  dsoMensuel: [49, 50, 52, 51, 53, 54, 55, 57, 57, 58],
  liberable: 83, // k€ libérés en revenant à 45 jours (13 j × 6,4 k€ TTC/j)
  parJour: 6, // k€ TTC encaissés par jour (arrondi)
  retards: {
    total: 84,
    nombre: 6,
    principal: 47,
    factures: [
      { client: 'Résidences Hestia', ref: 'F-2026-0388', objet: 'Agencement de 24 chambres', jours: 94, montant: 29 },
      { client: 'Résidences Hestia', ref: 'F-2026-0415', objet: 'Comptoir et salon d’accueil', jours: 71, montant: 18 },
      { client: 'Brasserie du Sablon', ref: 'F-2026-0402', objet: 'Bar et banquettes', jours: 83, montant: 14 },
      { client: 'Agence Lumen Architectes', ref: 'F-2026-0397', objet: 'Bibliothèques sur mesure', jours: 88, montant: 11 },
      { client: 'Cabinet dentaire des Arènes', ref: 'F-2026-0420', objet: 'Mobilier de réception', jours: 66, montant: 7 },
      { client: 'Boutique Linéa', ref: 'F-2026-0426', objet: 'Présentoirs', jours: 63, montant: 5 },
    ],
  },
  dependance: 31, // % du CA réalisé avec le premier client
  emprunt: { echeanceTrimestrielle: 18 },
} as const

/* Trésorerie prévisionnelle à 90 jours (k€) — du 1er déc. 2026 au 1er mars 2027 */
export const TRESO_90: { date: string; v: number; evt?: string }[] = [
  { date: '2026-12-01', v: 186 },
  { date: '2026-12-08', v: 192 },
  { date: '2026-12-15', v: 166, evt: 'URSSAF, acompte d’IS, CFE' },
  { date: '2026-12-16', v: 152, evt: 'TVA de novembre' },
  { date: '2026-12-23', v: 158 },
  { date: '2026-12-31', v: 131, evt: 'Salaires et primes de fin d’année' },
  { date: '2027-01-07', v: 136 },
  { date: '2027-01-15', v: 118, evt: 'URSSAF' },
  { date: '2027-01-18', v: 106, evt: 'TVA de décembre' },
  { date: '2027-01-22', v: 112 },
  { date: '2027-01-31', v: 82, evt: 'Salaires et fournisseurs' },
  { date: '2027-02-07', v: 84 },
  { date: '2027-02-15', v: 50, evt: 'URSSAF et échéance d’emprunt' },
  { date: '2027-02-16', v: 41, evt: 'TVA de janvier' },
  { date: '2027-02-23', v: 63 },
  { date: '2027-02-26', v: 66 },
  { date: '2027-02-28', v: 57, evt: 'Salaires' },
  { date: '2027-03-01', v: 60 },
]

/* Ce qui creuse le point bas (entre aujourd'hui et le 16 févr.) */
export const CAUSES_POINT_BAS = [
  { titre: 'Échéances fiscales et sociales', detail: 'URSSAF ×3, TVA ×3, acompte d’IS, CFE', montant: 95 },
  { titre: 'Échéance trimestrielle d’emprunt', detail: 'le 15 févr., la même semaine que l’URSSAF et la TVA', montant: 18 },
  { titre: 'Janvier peu facturé', detail: 'fermeture de fin d’année et chantiers décalés', montant: null },
  { titre: 'Factures en retard non encaissées', detail: 'six factures de plus de 60 jours', montant: 84 },
]

/* Échéancier fiscal et social des 90 prochains jours (montants illustratifs, k€) */
export type Echeance = { date: string; libelle: string; detail: string; montant: number; type: 'fiscal' | 'social' | 'financement' }
export const ECHEANCES: Echeance[] = [
  { date: '2026-12-15', libelle: 'URSSAF', detail: 'cotisations de novembre', montant: 17, type: 'social' },
  { date: '2026-12-15', libelle: 'Acompte d’IS n° 4', detail: 'exercice 2026', montant: 6, type: 'fiscal' },
  { date: '2026-12-15', libelle: 'CFE', detail: 'solde 2026', montant: 3, type: 'fiscal' },
  { date: '2026-12-16', libelle: 'TVA', detail: 'déclaration de novembre', montant: 14, type: 'fiscal' },
  { date: '2027-01-15', libelle: 'URSSAF', detail: 'cotisations de décembre', montant: 18, type: 'social' },
  { date: '2027-01-18', libelle: 'TVA', detail: 'déclaration de décembre', montant: 12, type: 'fiscal' },
  { date: '2027-02-15', libelle: 'URSSAF', detail: 'cotisations de janvier', montant: 16, type: 'social' },
  { date: '2027-02-15', libelle: 'Échéance d’emprunt', detail: 'trimestrielle', montant: 18, type: 'financement' },
  { date: '2027-02-16', libelle: 'TVA', detail: 'déclaration de janvier', montant: 9, type: 'fiscal' },
]
export const APRES_FENETRE = 'Juste après : acompte d’IS n° 1 de 2027, le 15 mars.'

/* Leviers sur le point bas (k€) */
export const LEVIERS = {
  hestia: { gain: 47, pointBas: 88 },
  commandeBois: { gain: 22, pointBas: 63 },
  facilite: { montant: 50 },
}

/* Situation trimestrielle et rendez-vous */
export const SITUATION = {
  titre: 'Situation au 31 octobre 2026',
  prochaine: 'Situation au 31 janvier 2027',
  prochaineDate: '2027-02-26',
}

/* ==========================================================================
   SIMULATEUR — trajectoire de base sur 12 mois (k€)
   index 0 = aujourd'hui (1er déc. 2026), puis le milieu de chaque mois,
   de déc. 2026 à nov. 2027 (vers le 16, quand les échéances sont passées).
   ========================================================================== */
export const SIM_LABELS = ['auj.', 'déc.', 'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.']
export const SIM_MOIS = ['décembre', 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre']
export const SIM_BASE_TRESO = [186, 152, 106, 41, 74, 92, 81, 98, 113, 94, 116, 134, 148]
export const SIM_BASE_CA = [172, 128, 140, 168, 165, 176, 182, 160, 102, 212, 214, 190] // CA HT mensuel prévu
export const SIM_HYP = {
  tauxMarge: MOREL.margeBrute / 100,
  tauxIS: 0.25, // illustratif
  chargesPatronales: 0.42, // illustratif
  resultatBase: MOREL.resultatNet,
  recrutement: { brut: 3400, arrivee: 1, caMensuel: 18, montee: 6 },
  machine: { montant: 120, duree: 60, tauxCredit: 0.042, loyerCB: 0.0199167, optionAchat: 0.01, apport: 0.2, livraison: 4, gain: 3.5 },
  prix: { hausse: 3, debut: 1, perteVolume: 1 },
}

/* ==========================================================================
   ÉVOLUER — Julien Marchal, électricien, micro-entrepreneur à Bar-le-Duc
   ========================================================================== */
export const JULIEN = {
  ecritures: 1318,
  ca12m: 34200, // € sur 12 mois glissants au 31/10/2026
  moisLabels: ['nov.', 'déc.', 'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.'],
  caMensuel: [2900, 2700, 2600, 2650, 2700, 2750, 2900, 3000, 2700, 2600, 3250, 3450],
  ca12mN1: 29000,
  // projection des 12 mois glissants (fin de mois)
  projection: [
    { mois: 'oct. 2026', v: 34200 },
    { mois: 'nov. 2026', v: 34800 },
    { mois: 'déc. 2026', v: 35450 },
    { mois: 'janv. 2027', v: 36100 },
    { mois: 'févr. 2027', v: 36800 },
    { mois: 'mars 2027', v: 37550 },
    { mois: 'avr. 2027', v: 38300 },
  ],
  seuilTVA: 37500, // franchise en base, prestations de services (illustratif)
  seuilTVAMajore: 41250,
  plafondMicro: 83600, // plafond micro-entreprise, prestations (illustratif)
  depassement: 'mars 2027',
  caPrevu2027: 42000,
  chargesPct: 38,
  tauxCotisMicro: 21.2,
  interventionType: { libelle: 'Remplacement d’un tableau électrique', ht: 1200 },
  tvaRecuperable: 2670, // € par an, TVA sur ~16 000 € d'achats de matériel
  apprenti: { coutBrutAn: 9500, aide: 5000, coutNet: 4500 },
  statuts: [
    { id: 'micro', nom: 'Micro-entreprise', sans: 16050, avec: 11550, reserve: [0, 0], protection: 'Minimale', charges: 'Non déductibles (abattement forfaitaire)', formalites: 'Très légères' },
    { id: 'ei', nom: 'EI au réel', sans: 16370, avec: 13610, reserve: [0, 0], protection: 'Indépendant', charges: 'Déductibles, apprenti compris', formalites: 'Comptabilité complète' },
    { id: 'eurl', nom: 'EURL à l’IS', sans: 13880, avec: 12000, reserve: [3650, 2300], protection: 'Indépendant', charges: 'Déductibles', formalites: 'Statuts, comptes annuels' },
    { id: 'sasu', nom: 'SASU', sans: 11240, avec: 9550, reserve: [3900, 2650], protection: 'Assimilé salarié', charges: 'Déductibles', formalites: 'Statuts, paie, comptes annuels' },
  ],
  plan: [
    { date: '2026-12-10', titre: 'Rendez-vous avec votre conseillère', texte: 'Confirmer la date réelle de passage à la TVA et vos nouveaux prix.', qui: 'conseiller' },
    { date: '2027-01-15', titre: 'Préparer vos devis et factures', texte: 'Ajouter les mentions de TVA ; modèles prêts dans Pennylane.', qui: 'vous' },
    { date: '2027-02-15', titre: 'Annoncer vos prix à vos clients réguliers', texte: 'Un mois avant le passage, avec un courrier simple.', qui: 'vous' },
    { date: '2027-03-31', titre: 'Seuil de 37 500 € franchi (estimation)', texte: 'Point de contrôle : date exacte d’application de la TVA.', qui: 'conseiller' },
    { date: '2027-04-30', titre: 'Choisir : micro ou réel', texte: 'Avec l’apprenti, le réel devient plus intéressant.', qui: 'vous' },
    { date: '2027-06-30', titre: 'Signer le contrat d’apprentissage', texte: 'Pour une arrivée à la rentrée, avec l’aide à l’embauche.', qui: 'vous' },
    { date: '2027-09-01', titre: 'Arrivée de l’apprenti', texte: 'Premier mois : accueil et formation au poste.', qui: 'vous' },
  ],
}

/* ==========================================================================
   SE LANCER — Camille Renaud, projet de studio de pilates à Verdun
   ========================================================================== */
export const CAMILLE = {
  apport: 15000,
  caAn1: 48000,
  ouverture: 'mars 2027',
  questions: [
    {
      id: 'associe',
      q: 'Pour commencer, vous lancez votre studio seule ou à plusieurs ?',
      choix: [{ id: 'seule', label: 'Seule' }, { id: 'associee', label: 'Avec une associée' }],
      defaut: 'seule',
    },
    {
      id: 'ca',
      q: 'Quel chiffre d’affaires visez-vous la première année ?',
      choix: [{ id: '30', label: 'Environ 30 000 €' }, { id: '48', label: 'Environ 48 000 €' }, { id: '70', label: 'Plus de 70 000 €' }],
      defaut: '48',
    },
    {
      id: 'apport',
      q: 'Quel apport pouvez-vous mobiliser ?',
      choix: [{ id: '5', label: '5 000 €' }, { id: '15', label: '15 000 €' }, { id: '30', label: '30 000 € ou plus' }],
      defaut: '15',
    },
    {
      id: 'local',
      q: 'Allez-vous louer un local ?',
      choix: [{ id: 'oui', label: 'Oui, un studio' }, { id: 'non', label: 'Non, cours à domicile et en extérieur' }],
      defaut: 'oui',
    },
    {
      id: 'revenu',
      q: 'Gardez-vous un revenu pendant le lancement ?',
      choix: [{ id: 'are', label: 'Oui, mes allocations chômage' }, { id: 'non', label: 'Non, aucun' }],
      defaut: 'are',
    },
  ],
  usageApport: [
    { label: 'Matériel (réformers, accessoires)', montant: 9000 },
    { label: 'Dépôt de garantie et petits travaux', montant: 3000 },
    { label: 'Trésorerie de démarrage', montant: 3000 },
  ],
  previsionnel: [
    { annee: 'Année 1', ca: 48000, charges: 25680, resultat: 22320 },
    { annee: 'Année 2', ca: 61000, charges: 27260, resultat: 33740 },
    { annee: 'Année 3', ca: 72000, charges: 28720, resultat: 43280 },
  ],
  chargesFixesAn1: 22800,
  pointMort: 24300, // € de CA par an
  pointMortMois: 8, // atteint au 8e mois (octobre 2027)
  pointMortLabel: 'octobre 2027',
  caMensuelAn1: [2400, 3000, 3500, 3700, 2900, 2300, 4600, 5000, 5200, 4800, 5300, 5300],
  moisAn1: ['mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.', 'janv.', 'févr.'],
  prixAbonnement: 89,
  prixCours: 22,
  demarches: [
    { id: 'd1', label: 'Ouvrir votre espace My Oneee', fait: true },
    { id: 'd2', label: 'Terminer le module 1 « Construire son modèle économique »', fait: true },
    { id: 'd3', label: 'Valider votre statut avec votre conseillère', fait: false },
    { id: 'd4', label: 'Vérifier les qualifications requises pour enseigner (code du sport)', fait: false },
    { id: 'd5', label: 'Ouvrir un compte professionnel et y déposer votre apport', fait: false },
    { id: 'd6', label: 'Signer le bail du local, avec une condition de financement', fait: false },
    { id: 'd7', label: 'Rédiger les statuts et publier l’annonce légale', fait: false },
    { id: 'd8', label: 'Immatriculer l’entreprise sur le guichet unique', fait: false },
    { id: 'd9', label: 'Souscrire la responsabilité civile professionnelle et l’assurance du local', fait: false },
    { id: 'd10', label: 'Connecter votre banque à Pennylane', fait: false },
  ],
  parcours: {
    module: 2,
    total: 8,
    progressionModule: 60,
    modules: [
      'Construire son modèle économique',
      'Fixer ses prix et maîtriser ses charges',
      'Statut, obligations et premières démarches',
      'Trouver ses premiers clients',
      'Communication et réseaux',
      'Piloter sa trésorerie',
      'Responsabilités du dirigeant et enjeux RSE',
      'Préparer l’examen',
    ],
  },
}

/* ==========================================================================
   VUE CABINET INPUT
   ========================================================================== */
export const CABINET = {
  clients: 48,
  parOffre: { lancer: 16, evoluer: 19, piloter: 13 },
  situationsAPreparer: 13,
  situationsPreRedigees: 11,
  prixPiloter: 600,
  tempsSans: 3.5, // h par situation sans Clarté (estimation de démonstration)
  tempsAvec: 0.83, // h par situation avec Clarté (relecture et validation)
  rdvHeures: 1,
  missionsDetectees: 5,
  missionsValeur: 7400,
}

export type Offre = 'lancer' | 'evoluer' | 'piloter'
export type Client = { nom: string; ville: string; offre: Offre; activite: string; signal: string; niveau: 'ok' | 'attention' | 'alerte'; situation?: 'pre' | 'attente'; manque?: string }

export const CLIENTS: Client[] = [
  // Piloter (13)
  { nom: PERSONNES.sophie.entreprise, ville: 'Metz', offre: 'piloter', activite: 'Menuiserie, agencement', signal: 'Point bas 41 k€ le 16 févr.', niveau: 'alerte', situation: 'pre' },
  { nom: 'Garage Valette', ville: 'Thionville', offre: 'piloter', activite: 'Réparation automobile', signal: 'Trésorerie sous 50 k€ en janv.', niveau: 'alerte', situation: 'pre' },
  { nom: 'Imprimerie du Barrois', ville: 'Bar-le-Duc', offre: 'piloter', activite: 'Imprimerie', signal: 'Marge stable', niveau: 'ok', situation: 'pre' },
  { nom: 'Maison Collin Traiteur', ville: 'Verdun', offre: 'piloter', activite: 'Traiteur', signal: 'Délai clients 64 j', niveau: 'attention', situation: 'pre' },
  { nom: 'Caves Delorme', ville: 'Reims', offre: 'piloter', activite: 'Négoce de vins', signal: 'Inventaire à confirmer', niveau: 'attention', situation: 'attente', manque: 'inventaire de stock à confirmer' },
  { nom: 'Atelier Ruhl Architectes', ville: 'Nancy', offre: 'piloter', activite: 'Architecture', signal: 'Délai clients 71 j', niveau: 'attention', situation: 'pre' },
  { nom: 'Transports Hennequin', ville: 'Saint-Dizier', offre: 'piloter', activite: 'Transport routier', signal: 'Relevés à compléter', niveau: 'attention', situation: 'attente', manque: 'relevés bancaires de novembre manquants' },
  { nom: 'Optique Lambert', ville: 'Commercy', offre: 'piloter', activite: 'Optique', signal: 'Résultat en hausse', niveau: 'ok', situation: 'pre' },
  { nom: 'Serrurerie Vauthier', ville: 'Ligny-en-Barrois', offre: 'piloter', activite: 'Métallerie', signal: 'Projet d’investissement', niveau: 'ok', situation: 'pre' },
  { nom: 'Le Comptoir Lorrain', ville: 'Nancy', offre: 'piloter', activite: 'Restaurant', signal: 'Délai clients 62 j', niveau: 'attention', situation: 'pre' },
  { nom: 'Paysages Mangin', ville: 'Jarville-la-Malgrange', offre: 'piloter', activite: 'Paysagiste', signal: 'Saison basse anticipée', niveau: 'ok', situation: 'pre' },
  { nom: 'Clinique vétérinaire des Côtes', ville: 'Thionville', offre: 'piloter', activite: 'Vétérinaire', signal: 'Recrutement envisagé', niveau: 'ok', situation: 'pre' },
  { nom: 'Boulangerie Ferry', ville: 'Metz', offre: 'piloter', activite: 'Boulangerie', signal: 'Énergie +12 %', niveau: 'attention', situation: 'pre' },
  // Évoluer (19)
  { nom: `${PERSONNES.julien.prenom} ${PERSONNES.julien.nom}`, ville: 'Bar-le-Duc', offre: 'evoluer', activite: 'Électricien', signal: 'Seuil de TVA en mars 2027', niveau: 'alerte' },
  { nom: 'Léa Fontaine', ville: 'Nancy', offre: 'evoluer', activite: 'Graphiste', signal: 'Seuil de TVA en févr. 2027', niveau: 'alerte' },
  { nom: 'Karim Benali', ville: 'Saint-Dizier', offre: 'evoluer', activite: 'Plaquiste', signal: 'Seuil de TVA en mars 2027', niveau: 'alerte' },
  { nom: 'Pauline Gérardin', ville: 'Metz', offre: 'evoluer', activite: 'Photographe', signal: 'Passage au réel à étudier', niveau: 'attention' },
  { nom: 'Thomas Didier', ville: 'Reims', offre: 'evoluer', activite: 'Développeur', signal: 'Création de société envisagée', niveau: 'attention' },
  { nom: 'Atelier Grosjean', ville: 'Verdun', offre: 'evoluer', activite: 'Ébéniste', signal: 'Premier recrutement', niveau: 'ok' },
  { nom: 'Sarah Michel', ville: 'Thionville', offre: 'evoluer', activite: 'Coiffeuse', signal: 'Croissance régulière', niveau: 'ok' },
  { nom: 'Nicolas Hubert', ville: 'Commercy', offre: 'evoluer', activite: 'Plombier', signal: 'Changement de statut au 1er janv.', niveau: 'attention' },
  { nom: 'Manon Petitjean', ville: 'Nancy', offre: 'evoluer', activite: 'Diététicienne', signal: 'Croissance régulière', niveau: 'ok' },
  { nom: 'Julie Barthélemy', ville: 'Bar-le-Duc', offre: 'evoluer', activite: 'Fleuriste', signal: 'Saison de Noël', niveau: 'ok' },
  { nom: 'Antoine Leclerc', ville: 'Metz', offre: 'evoluer', activite: 'Consultant', signal: 'Changement de statut au 1er janv.', niveau: 'attention' },
  { nom: 'Mathilde Simon', ville: 'Reims', offre: 'evoluer', activite: 'Traductrice', signal: 'Croissance régulière', niveau: 'ok' },
  { nom: 'Romain Gauthier', ville: 'Saint-Dizier', offre: 'evoluer', activite: 'Menuisier', signal: 'Investissement véhicule', niveau: 'ok' },
  { nom: 'Élodie Perrin', ville: 'Verdun', offre: 'evoluer', activite: 'Esthéticienne', signal: 'Local commercial envisagé', niveau: 'ok' },
  { nom: 'Hugo Marchand', ville: 'Thionville', offre: 'evoluer', activite: 'Couvreur', signal: 'Croissance régulière', niveau: 'ok' },
  { nom: 'Claire Vincent', ville: 'Ligny-en-Barrois', offre: 'evoluer', activite: 'Architecte d’intérieur', signal: 'Croissance régulière', niveau: 'ok' },
  { nom: 'Bastien Royer', ville: 'Nancy', offre: 'evoluer', activite: 'Food truck', signal: 'Saison basse', niveau: 'ok' },
  { nom: 'Inès Mathieu', ville: 'Metz', offre: 'evoluer', activite: 'Ostéopathe', signal: 'Croissance régulière', niveau: 'ok' },
  { nom: 'Lucas François', ville: 'Reims', offre: 'evoluer', activite: 'Vidéaste', signal: 'Croissance régulière', niveau: 'ok' },
  // Se lancer (16)
  { nom: `${PERSONNES.camille.prenom} ${PERSONNES.camille.nom}`, ville: 'Verdun', offre: 'lancer', activite: 'Studio de pilates', signal: 'Module 2 sur 8', niveau: 'ok' },
  { nom: 'Yanis Rousseau', ville: 'Metz', offre: 'lancer', activite: 'Food truck', signal: 'Inactif depuis 3 semaines', niveau: 'attention' },
  { nom: 'Marion Lefèvre', ville: 'Nancy', offre: 'lancer', activite: 'Céramiste', signal: 'Module 4 sur 8', niveau: 'ok' },
  { nom: 'Kevin André', ville: 'Thionville', offre: 'lancer', activite: 'Paysagiste', signal: 'Inactif depuis 3 semaines', niveau: 'attention' },
  { nom: 'Sophie Laurent', ville: 'Reims', offre: 'lancer', activite: 'Épicerie fine', signal: 'Module 5 sur 8', niveau: 'ok' },
  { nom: 'Mehdi Chevalier', ville: 'Saint-Dizier', offre: 'lancer', activite: 'Mécanicien', signal: 'Module 3 sur 8', niveau: 'ok' },
  { nom: 'Lucie Blanchard', ville: 'Bar-le-Duc', offre: 'lancer', activite: 'Fleuriste', signal: 'Inactive depuis 3 semaines', niveau: 'attention' },
  { nom: 'Alexandre Noël', ville: 'Verdun', offre: 'lancer', activite: 'Électricien', signal: 'Module 6 sur 8', niveau: 'ok' },
  { nom: 'Chloé Gaillard', ville: 'Commercy', offre: 'lancer', activite: 'Coiffeuse à domicile', signal: 'Module 2 sur 8', niveau: 'ok' },
  { nom: 'Julien Masson', ville: 'Metz', offre: 'lancer', activite: 'Coach sportif', signal: 'Inactif depuis 3 semaines', niveau: 'attention' },
  { nom: 'Emma Robin', ville: 'Nancy', offre: 'lancer', activite: 'Illustratrice', signal: 'Examen en janvier', niveau: 'ok' },
  { nom: 'Théo Colin', ville: 'Reims', offre: 'lancer', activite: 'Caviste', signal: 'Module 1 sur 8', niveau: 'ok' },
  { nom: 'Laura Picard', ville: 'Thionville', offre: 'lancer', activite: 'Toiletteuse', signal: 'Inactive depuis 3 semaines', niveau: 'attention' },
  { nom: 'Maxime Henry', ville: 'Ligny-en-Barrois', offre: 'lancer', activite: 'Charpentier', signal: 'Module 7 sur 8', niveau: 'ok' },
  { nom: 'Anaïs Bertrand', ville: 'Jarville-la-Malgrange', offre: 'lancer', activite: 'Naturopathe', signal: 'Module 3 sur 8', niveau: 'ok' },
  { nom: 'Quentin Morin', ville: 'Saint-Dizier', offre: 'lancer', activite: 'Plombier', signal: 'Module 4 sur 8', niveau: 'ok' },
]

export const ALERTES_CABINET = [
  { id: 'tva', impact: 'élevé', titre: '3 clients franchiront un seuil de TVA d’ici mars 2027', detail: 'Julien Marchal, Léa Fontaine, Karim Benali · offre Évoluer', action: 'Préparer les nouveaux prix', valeur: 'Mission « passage à la TVA »' },
  { id: 'treso', impact: 'élevé', titre: '2 clients Piloter passeront sous 50 k€ de trésorerie avant mars', detail: 'Ateliers Morel Agencement (41 k€ le 16 févr.), Garage Valette', action: 'Appeler cette semaine', valeur: 'Relance clients, facilité de caisse' },
  { id: 'impayes', impact: 'moyen', titre: '4 clients ont des factures impayées de plus de 60 jours', detail: 'dont 84 k€ chez Ateliers Morel Agencement', action: 'Proposer une procédure de relance', valeur: 'Mission « poste clients »' },
  { id: 'statut', impact: 'moyen', titre: '2 changements de statut à préparer avant le 31 décembre', detail: 'Nicolas Hubert, Antoine Leclerc', action: 'Planifier les rendez-vous', valeur: 'Mission juridique' },
  { id: 'myoneee', impact: 'faible', titre: '5 créateurs n’ont pas avancé sur My Oneee depuis 3 semaines', detail: 'offre Se lancer · relance par leur mentor', action: 'Prévenir les mentors', valeur: 'Taux de réussite à l’examen' },
]

/* ==========================================================================
   PROFILS DE LA DÉMO
   ========================================================================== */
export type ProfilId = 'lancer' | 'evoluer' | 'piloter' | 'cabinet'
export const PROFILS: Record<ProfilId, { id: ProfilId; offre: string; prenom: string; titre: string; sousTitre: string; accroche: string; initiales: string; route: string; pennylane: boolean }> = {
  lancer: {
    id: 'lancer', offre: 'Se lancer', prenom: PERSONNES.camille.prenom,
    titre: `${PERSONNES.camille.prenom} ${PERSONNES.camille.nom}`,
    sousTitre: `Projet de ${PERSONNES.camille.activite} · ${PERSONNES.camille.ville}`,
    accroche: 'Une feuille de route claire avant d’ouvrir son studio.',
    initiales: 'CR', route: '/se-lancer', pennylane: false,
  },
  evoluer: {
    id: 'evoluer', offre: 'Évoluer', prenom: PERSONNES.julien.prenom,
    titre: `${PERSONNES.julien.prenom} ${PERSONNES.julien.nom}`,
    sousTitre: `${PERSONNES.julien.metier}, micro-entrepreneur · ${PERSONNES.julien.ville}`,
    accroche: 'Il approche du seuil de TVA et pense à embaucher un apprenti.',
    initiales: 'JM', route: '/evoluer', pennylane: true,
  },
  piloter: {
    id: 'piloter', offre: 'Piloter', prenom: PERSONNES.sophie.prenom,
    titre: PERSONNES.sophie.entreprise,
    sousTitre: `${PERSONNES.sophie.prenom} ${PERSONNES.sophie.nom} · ${PERSONNES.sophie.forme} à ${PERSONNES.sophie.ville}, 14 salariés`,
    accroche: 'Une PME qui grandit, une trésorerie à anticiper, des décisions à préparer.',
    initiales: 'AM', route: '/piloter', pennylane: true,
  },
  cabinet: {
    id: 'cabinet', offre: 'Vue cabinet', prenom: PERSONNES.conseiller.prenom,
    titre: 'Vue cabinet INPUT',
    sousTitre: `${PERSONNES.conseiller.prenom} ${PERSONNES.conseiller.nom} · portefeuille de 48 clients`,
    accroche: 'Le portefeuille, les alertes de l’IA et les situations à valider.',
    initiales: 'CA', route: '/cabinet', pennylane: false,
  },
}

export const OFFRES = [
  {
    id: 'lancer' as const, nom: 'Se lancer', cible: 'Créateurs d’entreprise',
    message: 'Vous maîtrisez votre métier. Apprenez à en faire une activité pérenne.',
    format: 'Parcours de 6 mois sur My Oneee · examen et diplôme d’aptitude à l’entrepreneuriat · réseau de dirigeants expérimentés',
  },
  {
    id: 'evoluer' as const, nom: 'Évoluer', cible: 'Micro-entreprises et TPE en croissance',
    message: 'Votre activité grandit. Faites évoluer votre entreprise au bon moment.',
    format: 'Seuils, TVA, statut, régime fiscal, premiers recrutements : anticipés et préparés',
  },
  {
    id: 'piloter' as const, nom: 'Piloter', cible: 'Dirigeants de TPE et PME',
    message: 'Vous dirigez votre entreprise. Prenez du recul pour mieux décider.',
    format: 'Abonnement annuel de 600 € · une situation chaque trimestre · un rendez-vous avec un conseiller',
  },
]
