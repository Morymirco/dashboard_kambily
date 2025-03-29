import { Loader2 } from "lucide-react"

export default function ProductDetailLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-md text-center">
        <div className="text-primary bg-primary/10 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <h3 className="text-lg font-medium text-gray-800 mb-2">Chargement en cours</h3>
        <p className="text-gray-600 mb-4">Veuillez patienter pendant le chargement des données du produit...</p>
      </div>
    </div>
  )
}

