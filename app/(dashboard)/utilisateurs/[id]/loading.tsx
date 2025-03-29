import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export default function UserDetailLoading() {
  return (
    <div className="container py-10">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-lg font-medium">Chargement des informations de l'utilisateur...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

