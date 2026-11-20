import { Link } from 'react-router-dom'
import { NoteSituation } from '../components/Note'
import { Avatar } from '../components/ui/ui'
import { DATES, conseillerNom } from '../data/demo'
import { dateCourte } from '../lib/format'
import { useStore } from '../lib/store'

export default function Situation() {
  const { situation } = useStore()
  const envoyee = situation.statut === 'envoyee'
  return (
    <div className="mx-auto max-w-[920px] px-4 pb-16 pt-6 md:px-8 md:pt-10">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="surtitre mb-2">Situation trimestrielle</div>
          <p className="text-[14px] text-encre-2">{envoyee ? `Validée par ${conseillerNom} · reçue aujourd’hui` : `Aperçu de la pré-rédaction · en relecture chez ${conseillerNom}, remise prévue le ${dateCourte(DATES.remiseSituation)}`}</p>
        </div>
        <Link to="/situation/imprimer" className="btn btn-ligne">Version imprimable</Link>
      </div>
      {!envoyee && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-or/40 bg-[#FBF5E8] px-4 py-3 text-[14px]">
          <Avatar initiales="CA" taille={34} or />
          <span>Ce texte a été préparé par Clarté. Il peut encore être modifié par votre conseillère avant envoi.</span>
        </div>
      )}
      <div className="carte p-6 md:p-10">
        <NoteSituation edits={situation.edits} mode="lecture" />
      </div>
    </div>
  )
}
