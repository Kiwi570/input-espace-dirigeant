# INPUT · Espace dirigeant — maquette de démonstration

Maquette interactive de l’espace dirigeant d’**INPUT Conseil et Expertise** : les chiffres Pennylane traduits en langage clair, **Clarté**, une assistante IA qui prépare les décisions, et le conseiller INPUT qui les valide. Méthode visible partout : **Comprendre → Décider → Avancer**.

> Démo · toutes les données sont fictives. Aucune IA réelle ni connexion Pennylane : tout est scénarisé. Aucun traceur, aucun cookie, pages en `noindex`.
> Maquette de démonstration réalisée par P’tit Kiwi.

---

## Lancer la maquette

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # vérifie les types, construit dist/ (+ 404.html pour les hébergements statiques)
npm run preview    # sert le build
```

Application statique (Vite, React 19, TypeScript, Tailwind 4, Framer Motion, graphiques SVG maison). Le routage fonctionne sur Vercel (`vercel.json`) et sur tout hébergement statique grâce à la copie `404.html`.

### Mise en ligne sur Vercel (depuis ~/Downloads, sur le Mac)

```bash
cd ~/Downloads/input-espace-dirigeant
git init && git add -A && git commit -m "INPUT espace dirigeant v1"
git branch -M main
gh repo create input-espace-dirigeant --public --source=. --remote=origin --push
npx vercel --prod --yes
npx vercel git connect
```

Puis, dans Vercel : Settings › Deployment Protection › désactiver Vercel Authentication, pour que le client voie la maquette. Aucune règle n’interdit l’affichage dans un cadre (module Wix « Intégrer un site »).

---

## Où changer quoi

| Fichier | Contenu |
|---|---|
| `src/data/demo.ts` | **Seule source des données.** Prénoms, entreprises et conseiller dans `PERSONNES` (un seul endroit). Chiffres d’Ateliers Morel, de Julien, de Camille et du cabinet. |
| `src/data/model.ts` | Calculs du simulateur (recrutement, machine, prix). Clarté et la note trimestrielle appellent les mêmes fonctions. |
| `src/data/clarte.ts` | Réponses scénarisées de Clarté, questions suggérées par profil et par écran, rapprochement par mots-clés de la saisie libre. |
| `src/data/situation.ts` | Note de synthèse trimestrielle (cabinet → dirigeant → version imprimable). |
| `src/lib/typo.ts` | Typographie française appliquée à tout le texte affiché (espaces insécables avant « : ; ? ! », €, %, milliers). |

Chiffres clés repris à l’identique partout (cockpit, Clarté, simulateur, note) : CA 10 mois 1 612 k€ (+9,1 %), marge brute 38,4 % (40,1 %), EBE 116 k€ (7,2 %), résultat estimé 74 k€, trésorerie 186 k€, point bas 41 k€ le 16 févr. 2027, délai clients 58 j (objectif 45), 84 k€ de retards dont 47 k€ chez le premier client (31 % du CA).

---

## Script de démonstration (5 minutes)

**Avant de commencer** : ouvrir la maquette en plein écran, sur l’accueil. Pour rejouer la démo à neuf : fermer l’onglet et rouvrir l’adresse (l’état est gardé le temps de la session). Raccourci de secours : le bouton **Mode présentation** (bandeau du haut) déroule les 8 étapes clés tout seul.

**0:00 · Accueil (20 s)**
« Voici la porte d’entrée : votre promesse — de la clarté, de l’anticipation et de la capacité à décider — et vos trois offres. » Cliquer **Entrer dans la démo**.

**0:20 · Choix du profil (15 s)**
« Un espace, quatre points de vue : un créateur, un micro-entrepreneur qui grandit, une PME, et votre cabinet. » Cliquer **Sophie Morel · Piloter**.

**0:35 · Connexion Pennylane (25 s)**
Laisser jouer la séquence. « Le dirigeant ne saisit rien : 12 486 écritures sont lues, deviennent des indicateurs, puis Clarté en tire trois constats. » Cliquer **Ouvrir mon cockpit**.

**1:00 · Cockpit (70 s)**
- Laisser le **brief du jour** s’écrire : « Trois phrases, ton direct : ce qui va bien, ce qui arrive, la priorité de la semaine. »
- Survoler **Marge brute** puis **Délai de paiement** : « Chaque chiffre s’explique en langage simple. »
- Descendre sur la **trésorerie à 90 jours** : « Le point bas du 16 février, et pourquoi. Ce n’est pas une perte, c’est un calendrier. »
- Montrer l’**échéancier** et le **rendez-vous** avec la conseillère : « L’abonnement Piloter, c’est ça : une situation par trimestre et un rendez-vous. »

**2:10 · Clarté (60 s)**
Sur la vigilance « 84 k€ de factures en retard », cliquer **Comprendre**. « Clarté montre son travail, puis répond toujours en trois temps : comprendre, décider, avancer. Et elle cite sa source : la balance Pennylane. Tout est marqué : à valider par votre conseiller. » Cliquer **Ajouter au plan d’action**. Puis taper librement : *Puis-je recruter en janvier ?*

**3:10 · Simulateur (50 s)**
Dans la réponse, cliquer **Simuler ce recrutement**. « Arrivée en janvier : point bas à 36 k€. » Glisser le mois d’arrivée sur **mars** : « Le point bas reste à 41 k€. » Onglet **Investir**, livraison en **février** avec un crédit : la courbe passe sous zéro ; basculer sur **crédit-bail** : elle remonte. Conclure sur **Préparer cette décision avec mon conseiller**.

**4:00 · Vue cabinet (50 s)** — le moment pour INPUT
Changer de profil en haut : **Vue cabinet INPUT**. « Les alertes de l’IA, classées par impact. Et l’économie de l’offre : sans Clarté, 33 € de l’heure ; avec Clarté, 82 €. » Cliquer **Préparer la situation trimestrielle** : Clarté rédige en direct. Corriger une phrase du « mot de votre conseillère », puis **Valider et envoyer au client** et **Voir côté dirigeant**. « L’IA prépare, l’expert valide. »

**4:50 · Ouverture (10 s)**
« Julien et Camille montrent les deux autres offres : le seuil de TVA et le choix du statut, puis la feuille de route d’un créateur. » (Si le temps le permet : profil **Évoluer**, interrupteur « Avec un apprenti ».)

---

## Faisabilité

**Connexion à Pennylane.** Pennylane propose une API entreprise et une **API cabinet** (« Firm API ») qui donne accès au portefeuille de clients d’un cabinet et à leurs états comptables (balance, FEC, grand livre analytique), avec jeton de cabinet ou OAuth. Les droits se règlent par périmètre : lecture des écritures (`ledger_entries:readonly`), de la balance (`trial_balance:readonly`), export FEC. Une synchronisation quotidienne ou à la demande suffit pour ce produit. Les relevés bancaires et les factures clients sont aussi accessibles. À valider avec Pennylane : les conditions d’accès partenaire et les quotas.

**IA réelle.** Clarté ne doit pas « calculer » : un moteur d’indicateurs (code classique) calcule les chiffres à partir de la balance et du grand livre ; un modèle de langage rédige les explications, propose les options et prépare la note à partir de ces chiffres, avec une liste de sources. Garde-fous : réponses limitées aux données du client, mention systématique « à valider », seuils réglementaires tenus à jour par le cabinet, journal de toutes les analyses, hébergement des données en Europe et clauses de confidentialité compatibles avec le secret professionnel.

**Ce qu’il resterait à construire**
1. Comptes et accès : authentification, un espace par client, droits conseiller et dirigeant.
2. Connecteur Pennylane : synchronisation, rapprochement, gestion des erreurs.
3. Moteur d’indicateurs et prévisionnel de trésorerie (échéances fiscales et sociales, emprunts, saisonnalité).
4. Simulateurs paramétrables par le cabinet (taux, seuils, hypothèses).
5. Clarté : rédaction, questions libres, base de règles du cabinet, tests de qualité des réponses.
6. Back-office cabinet : file des situations, relecture, validation, envoi, suivi du temps passé.
7. Liens avec My Oneee (progression du parcours) et l’agenda des rendez-vous.
8. Sécurité, RGPD, conditions d’utilisation, hébergement et sauvegardes.

Approche conseillée : un pilote sur l’offre Piloter avec 3 à 5 clients du cabinet, en lecture seule sur Pennylane, avant d’ouvrir Évoluer et Se lancer.

---

## Hypothèses prises pour la maquette

- Date du jour de la démo : **mardi 1er décembre 2026** (comptes arrêtés au 31/10/2026, banque synchronisée « il y a 2 min »). Elle se change dans `DATES`.
- Conseillère fictive : **Claire Ancel** ; mentor de Camille : **Hélène Marquis** ; premier client d’Ateliers Morel : **Résidences Hestia** ; projet de Camille : **Studio Ancrage**. Tous modifiables dans `PERSONNES`.
- Calendrier fiscal : les acomptes d’IS tombent en mars, juin, septembre et décembre. L’acompte de décembre, la CFE, la TVA mensuelle, l’URSSAF et l’échéance trimestrielle d’emprunt du 15 février expliquent ensemble le point bas de mi-février (plutôt qu’un acompte d’IS en février, qui n’existe pas dans le calendrier usuel).
- URSSAF mensuelle (14 salariés), TVA mensuelle déclarée vers le 16.
- Seuil de franchise de TVA 37 500 €, seuil majoré 41 250 €, plafond micro 83 600 €, cotisations micro 21,2 %, aide à l’apprentissage 5 000 € : valeurs illustratives, toutes marquées « à valider par votre conseiller ». Clarté suit les 12 derniers mois de Julien pour l’alerter tôt, en précisant que la règle s’apprécie sur l’année civile.
- Simulateur : charges patronales 42 %, IS 25 %, crédit à 4,2 % sur 5 ans, loyer de crédit-bail ≈ 2 % du prix par mois, encaissements clients à environ 2 mois.
- Économie de l’offre Piloter (vue cabinet) : 3 h 30 de préparation par situation sans Clarté, 50 min de relecture avec Clarté, 4 rendez-vous d’une heure par an : estimations de démonstration à remplacer par les temps réels du cabinet.
- Pennylane et My Oneee sont cités en texte, avec un badge neutre « Connecté » : aucun logo, aucune interface reproduite.

## Points à valider avec INPUT

1. Le nom « Clarté » pour l’assistante, et le prénom de la conseillère affichée.
2. Les seuils, taux et montants réglementaires à jour pour 2027.
3. Le contenu réel de la situation trimestrielle (rubriques, longueur, ton du « mot du conseiller »).
4. Le format de l’offre Évoluer (« modalités à définir » dans le brief) et le lien avec My Oneee pour Se lancer.
5. Les temps de préparation réels du cabinet, pour chiffrer la rentabilité de l’offre Piloter.
6. Les conditions d’accès à l’API cabinet de Pennylane.

## À retirer pour une mise en ligne réelle

Le bandeau « Démo · données fictives », la balise et l’en-tête `noindex`, les données de `demo.ts`, les réponses scénarisées de Clarté et les envois simulés (plan d’action, demandes au conseiller, envoi de la situation).
