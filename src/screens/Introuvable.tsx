import { Link } from 'react-router-dom'
import { ClarteMark } from '../components/ui/ui'

export default function Introuvable() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[640px] flex-col items-center justify-center px-5 text-center">
      <ClarteMark className="scale-150" />
      <div className="surtitre filets mt-6">Écriture introuvable</div>
      <h1 className="mt-4 text-[40px] leading-tight md:text-[52px]">Cette page n’est pas au grand livre.</h1>
      <p className="mt-3 text-[16px] text-encre-2">L’adresse ne correspond à aucun écran de la démonstration.</p>
      <Link to="/demo" className="btn btn-primaire mt-8">Choisir un profil</Link>
    </div>
  )
}
