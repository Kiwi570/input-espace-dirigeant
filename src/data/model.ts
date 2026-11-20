/* Modèle de calcul du simulateur (Ateliers Morel).
   Une seule fonction par scénario : le simulateur, Clarté et la note
   trimestrielle appellent les mêmes fonctions, donc affichent les mêmes chiffres.
   Valeurs illustratives : à valider par le conseiller INPUT. */
import { SIM_BASE_CA, SIM_BASE_TRESO, SIM_HYP } from './demo'

const MB = SIM_HYP.tauxMarge
const IS = SIM_HYP.tauxIS
const N = 12 // mois simulés : 0 = déc. 2026 … 11 = nov. 2027

export type SimResult = {
  serie: number[] // 13 points : aujourd'hui + milieu de chaque mois
  base: number[]
  pointBas: { valeur: number; index: number }
  pointBasBase: { valeur: number; index: number }
  treso12: number
  treso12Base: number
  resultat: number
  resultatBase: number
  extra: Record<string, number>
}

function minAvec(serie: number[]) {
  let index = 0
  serie.forEach((v, i) => { if (v < serie[index]) index = i })
  return { valeur: serie[index], index }
}

function emballer(delta: number[], deltaResultat: number, extra: Record<string, number> = {}): SimResult {
  const serie = SIM_BASE_TRESO.map((v, i) => v + delta[i])
  return {
    serie,
    base: [...SIM_BASE_TRESO],
    pointBas: minAvec(serie),
    pointBasBase: minAvec(SIM_BASE_TRESO),
    treso12: serie[N],
    treso12Base: SIM_BASE_TRESO[N],
    resultat: SIM_HYP.resultatBase + deltaResultat,
    resultatBase: SIM_HYP.resultatBase,
    extra,
  }
}

/* point P(m) = index m + 1 dans la série */
const P = (m: number) => m + 1

/* ---------------------------------------------------------------- Recruter */
export type ParamsRecruter = { arrivee: number; brut: number; caMensuel: number; montee: number }
export const DEFAUT_RECRUTER: ParamsRecruter = { ...SIM_HYP.recrutement }

export function coutMensuel(brut: number) {
  return (brut * (1 + SIM_HYP.chargesPatronales)) / 1000 // k€
}

export function simulerRecrutement(p: ParamsRecruter): SimResult {
  const C = coutMensuel(p.brut)
  const delta = new Array(N + 1).fill(0)
  let dRes = 0
  let rentableMois = 0
  for (let m = p.arrivee; m < N; m++) {
    const r = p.caMensuel * Math.min(1, (m - p.arrivee + 1) / p.montee)
    const marge = MB * r
    if (!rentableMois && marge >= C) rentableMois = m - p.arrivee + 1
    dRes += (marge - C) * (1 - IS)
    for (let k = m + 1; k < N; k++) delta[P(k)] -= C // salaire et charges payés le mois suivant
    for (let k = m + 2; k < N; k++) delta[P(k)] += marge // encaissement à ~58 jours
  }
  return emballer(delta, dRes, { coutMensuel: C, rentableMois })
}

/* ----------------------------------------------------------------- Investir */
export type ParamsInvestir = { mode: 'credit' | 'credit-bail'; montant: number; livraison: number; apport: number; gain: number }
export const DEFAUT_INVESTIR: ParamsInvestir = {
  mode: 'credit', montant: SIM_HYP.machine.montant, livraison: SIM_HYP.machine.livraison,
  apport: SIM_HYP.machine.apport, gain: SIM_HYP.machine.gain,
}

export function mensualite(capital: number, taux = SIM_HYP.machine.tauxCredit, n = SIM_HYP.machine.duree) {
  const r = taux / 12
  return (capital * r) / (1 - Math.pow(1 + r, -n))
}

export function coutsFinancement(montant: number, apport: number) {
  const emprunt = montant * (1 - apport)
  const mens = mensualite(emprunt)
  const loyer = montant * SIM_HYP.machine.loyerCB
  return {
    credit: { apport: montant * apport, mensualite: mens, total: montant * apport + mens * SIM_HYP.machine.duree, interets: mens * SIM_HYP.machine.duree - emprunt },
    creditBail: { apport: 0, mensualite: loyer, total: loyer * SIM_HYP.machine.duree + montant * SIM_HYP.machine.optionAchat },
  }
}

export function simulerInvestissement(p: ParamsInvestir): SimResult {
  const delta = new Array(N + 1).fill(0)
  const d = p.livraison
  const M = p.montant
  let dRes = 0
  const couts = coutsFinancement(M, p.apport)
  if (p.mode === 'credit') {
    const emprunt = M * (1 - p.apport)
    const mens = couts.credit.mensualite
    for (let k = d; k < N; k++) delta[P(k)] += -M * 1.2 + emprunt // achat TTC, fonds débloqués
    for (let k = d + 1; k < N; k++) delta[P(k)] += M * 0.2 // TVA récupérée le mois suivant
    let capital = emprunt
    for (let m = d + 1; m < N; m++) {
      const interet = capital * (SIM_HYP.machine.tauxCredit / 12)
      capital -= mens - interet
      for (let k = m; k < N; k++) delta[P(k)] -= mens
      dRes -= interet * (1 - IS)
    }
    for (let m = d; m < N; m++) dRes -= (M / SIM_HYP.machine.duree) * (1 - IS) // amortissement sur 5 ans
  } else {
    const loyer = couts.creditBail.mensualite
    for (let m = d; m < N; m++) {
      for (let k = m; k < N; k++) delta[P(k)] -= loyer
      dRes -= loyer * (1 - IS)
    }
  }
  for (let m = d + 1; m < N; m++) {
    for (let k = m + 2; k < N; k++) delta[P(k)] += p.gain
    dRes += p.gain * (1 - IS)
  }
  return emballer(delta, dRes, {
    mensualite: p.mode === 'credit' ? couts.credit.mensualite : couts.creditBail.mensualite,
    total: p.mode === 'credit' ? couts.credit.total : couts.creditBail.total,
    apport: p.mode === 'credit' ? couts.credit.apport : 0,
  })
}

/* ------------------------------------------------------------------- Prix */
export type ParamsPrix = { hausse: number; debut: number; perteVolume: number }
export const DEFAUT_PRIX: ParamsPrix = { ...SIM_HYP.prix }

export function tauxMargeApresHausse(hausse: number) {
  const p = hausse / 100
  return ((1 + p - (1 - MB)) / (1 + p)) * 100
}
export function perteVolumeMax(hausse: number) {
  const p = hausse / 100
  return (1 - MB / (MB + p)) * 100
}

export function simulerPrix(p: ParamsPrix): SimResult {
  const delta = new Array(N + 1).fill(0)
  const h = p.hausse / 100
  const v = p.perteVolume / 100
  const facteur = (1 - v) * (1 + h - (1 - MB)) - MB
  let dRes = 0
  let gainMarge = 0
  for (let m = p.debut + 1; m < N; m++) {
    const dm = SIM_BASE_CA[m] * facteur
    gainMarge += dm
    dRes += dm * (1 - IS)
    for (let k = m + 2; k < N; k++) delta[P(k)] += dm
  }
  return emballer(delta, dRes, { gainMarge, tauxMarge: tauxMargeApresHausse(p.hausse), perteMax: perteVolumeMax(p.hausse) })
}

/* -------------------------------------------------- Chiffres de référence */
export const REF = {
  recrutementJanvier: simulerRecrutement({ ...DEFAUT_RECRUTER, arrivee: 1 }),
  recrutementMars: simulerRecrutement({ ...DEFAUT_RECRUTER, arrivee: 3 }),
  machineCreditAvril: simulerInvestissement({ ...DEFAUT_INVESTIR, mode: 'credit', livraison: 4 }),
  machineCBAvril: simulerInvestissement({ ...DEFAUT_INVESTIR, mode: 'credit-bail', livraison: 4 }),
  machineCreditFevrier: simulerInvestissement({ ...DEFAUT_INVESTIR, mode: 'credit', livraison: 2 }),
  machineCBFevrier: simulerInvestissement({ ...DEFAUT_INVESTIR, mode: 'credit-bail', livraison: 2 }),
  couts: coutsFinancement(SIM_HYP.machine.montant, SIM_HYP.machine.apport),
  prix3: simulerPrix(DEFAUT_PRIX),
  coutPoste: coutMensuel(SIM_HYP.recrutement.brut),
}
