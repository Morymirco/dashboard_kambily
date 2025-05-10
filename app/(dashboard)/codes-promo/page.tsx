import { Metadata } from "next"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Codes Promo | Kambily Dashboard",
  description: "Gestion des codes promotionnels",
}

// Interface pour les codes promo
interface PromoCode {
  id: number
  code: string
  discount_type: string
  discount_value: string
  max_discount: string
  minimum_order_amount: string
  is_active: boolean
  start_date: string
  end_date: string
}

// Fonction pour récupérer les codes promo depuis l'API
async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const response = await fetch("https://api.kambily.com/promocode/", {
      cache: "no-store", // Pour toujours obtenir les données les plus récentes
    })
    
    if (!response.ok) {
      throw new Error("Erreur lors de la récupération des codes promo")
    }
    
    return response.json()
  } catch (error) {
    console.error("Erreur:", error)
    return []
  }
}

export default async function PromoCodesPage() {
  const promoCodes = await getPromoCodes()
  
  // Vérifier si un code est actif en fonction de la date actuelle
  const isCodeActive = (code: PromoCode) => {
    if (!code.is_active) return false
    
    const now = new Date()
    const startDate = new Date(code.start_date)
    const endDate = new Date(code.end_date)
    
    return now >= startDate && now <= endDate
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Codes Promo</h1>
        <Button asChild>
          <Link href="/codes-promo/nouveau">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau code promo
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tous les codes promo</CardTitle>
          <CardDescription>
            Gérez les codes promotionnels pour vos clients.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Remise</TableHead>
                <TableHead>Achat minimum</TableHead>
                <TableHead>Remise max</TableHead>
                <TableHead>Période de validité</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promoCodes.length > 0 ? (
                promoCodes.map((code) => (
                  <TableRow key={code.id}>
                    <TableCell className="font-medium">{code.code}</TableCell>
                    <TableCell>
                      {code.discount_type === "percent"
                        ? `${parseFloat(code.discount_value)}%`
                        : `${parseInt(code.discount_value).toLocaleString("fr-GN")} GNF`}
                    </TableCell>
                    <TableCell>
                      {parseInt(code.minimum_order_amount).toLocaleString("fr-GN")} GNF
                    </TableCell>
                    <TableCell>
                      {parseInt(code.max_discount).toLocaleString("fr-GN")} GNF
                    </TableCell>
                    <TableCell>
                      {new Date(code.start_date).toLocaleDateString("fr-GN")} - {new Date(code.end_date).toLocaleDateString("fr-GN")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          isCodeActive(code) ? "success" : "destructive"
                        }
                      >
                        {isCodeActive(code) ? "Actif" : "Expiré"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/codes-promo/${code.id}`}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    Aucun code promo trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 