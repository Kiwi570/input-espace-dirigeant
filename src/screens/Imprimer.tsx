import { Link } from 'react-router-dom'
import { NoteSituation } from '../components/Note'
import { useStore } from '../lib/store'

export default function Imprimer() {
  const { situation } = useStore()
  return (
    <div className="min-h-screen bg-ivoire-2/60 py-6 md:py-10">
      <div className="no-print mx-auto mb-5 flex max-w-[820px] flex-wrap items-center justify-between gap-3 px-4">
        <Link to="/piloter/situation" className="text-[14px] text-encre-2 hover:text-marine">← Retour</Link>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-encre-3">Format A4</span>
          <button type="button" onClick={() => window.print()} className="btn btn-primaire">Imprimer ou enregistrer en PDF</button>
        </div>
      </div>
      <div className="print-page mx-auto max-w-[820px] bg-white px-6 py-10 shadow-xl md:px-14 md:py-14">
        <NoteSituation edits={situation.edits} mode="impression" />
        <p className="mt-8 text-center text-[11px] text-encre-3">Démo · données fictives · maquette réalisée par P’tit Kiwi</p>
      </div>
    </div>
  )
}
