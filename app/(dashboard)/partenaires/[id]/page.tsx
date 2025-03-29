"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "react-hot-toast"
import { ArrowLeft, Edit, Trash2, Mail, Phone, Globe, MapPin, Calendar, Clock, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPartnerById, fetchPartnerProducts, type Partner, type PartnerProduct } from "@/services/partner-service"

export default function PartenaireDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [partner, setPartner] = useState<Partner | null>(null)
  const [products, setProducts] = useState<PartnerProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPartner = async () => {
      try {
        setLoading(true)
        const partnerId = Number.parseInt(params.id)
        const partnerData = await fetchPartnerById(partnerId)
        setPartner(partnerData)

        // Charger les produits du partenaire
        try {
          const productsData = await fetchPartnerProducts(partnerId)
          setProducts(productsData.results || [])
        } catch (error) {
          console.error("Erreur lors du chargement des produits:", error)
          // Ne pas bloquer l'affichage du partenaire si les produits ne peuvent pas être chargés
        }
      } catch (error) {
        console.error("Erreur lors du chargement du partenaire:", error)
        setError("Impossible de charger les détails du partenaire")
        toast.error("Impossible de charger les détails du partenaire")
      } finally {
        setLoading(false)
      }
    }

    loadPartner()
  }, [params.id])

  // Mettre à jour la fonction handleDelete pour utiliser la bonne URL
  const handleDelete = async () => {
    if (!partner) return

    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le partenaire "${partner.name}" ?`)) {
      try {
        const response = await fetch(`/api/partners/${partner.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression du partenaire")
        }

        toast.success("Partenaire supprimé avec succès")
        router.push("/partenaires")
      } catch (error) {
        console.error("Erreur:", error)
        toast.error("Erreur lors de la suppression du partenaire")
      }
    }
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !partner) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/partenaires")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Détails du partenaire</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 max-w-md">
            <div className="text-red-500 dark:text-red-400 mx-auto mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error || "Partenaire non trouvé"}</p>
            <Button
              onClick={() => router.push("/partenaires")}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Retour à la liste
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/partenaires")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">{partner.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push(`/partenaires/${partner.id}/modifier`)}
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button variant="destructive" className="flex items-center gap-2" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Informations du partenaire</CardTitle>
                  <CardDescription>Détails complets du partenaire</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Nom</p>
                      <p className="font-medium">{partner.name}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="font-medium">
                        {partner.email ? (
                          <a
                            href={`mailto:${partner.email}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Mail className="h-3 w-3" />
                            {partner.email}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Téléphone</p>
                      <p className="font-medium">
                        {partner.phone ? (
                          <a
                            href={`tel:${partner.phone}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3" />
                            {partner.phone}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Site web</p>
                      <p className="font-medium">
                        {partner.website ? (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Globe className="h-3 w-3" />
                            {partner.website.replace(/^https?:\/\//, "")}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Adresse</p>
                      <p className="font-medium flex items-center gap-1">
                        {partner.address ? (
                          <>
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            {partner.address}
                          </>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">ID</p>
                      <p className="font-medium">{partner.id}</p>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Date de création</p>
                        <p className="font-medium flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {formatDate(partner.created_at)}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Dernière mise à jour</p>
                        <p className="font-medium flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDate(partner.updated_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Nombre de produits</p>
                    <p className="font-medium">{products.length}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="products">
              <Card>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Produits du partenaire</CardTitle>
                    <CardDescription>Liste des produits associés à {partner.name}</CardDescription>
                  </div>
                  <Button
                    className="bg-teal-600 hover:bg-teal-700 mt-4 sm:mt-0"
                    onClick={() => router.push(`/produits/ajouter?partnerId=${partner.id}`)}
                  >
                    Ajouter un produit
                  </Button>
                </CardHeader>
                <CardContent>
                  {products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="text-muted-foreground mb-2 text-4xl">📦</div>
                      <p className="text-muted-foreground">Aucun produit associé à ce partenaire</p>
                      <Button
                        variant="link"
                        onClick={() => router.push(`/produits/ajouter?partnerId=${partner.id}`)}
                        className="mt-2"
                      >
                        Ajouter un produit maintenant
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {products.map((product) => (
                        <Card key={product.id} className="overflow-hidden">
                          <div className="aspect-video bg-muted relative">
                            {product.images && product.images.length > 0 ? (
                              <img
                                src={product.images[0].image || "/placeholder.svg?height=200&width=300"}
                                alt={product.name}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground">
                                Pas d'image
                              </div>
                            )}
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium truncate">{product.name}</h3>
                            <div className="flex flex-wrap gap-1 my-1">
                              {product.categories &&
                                product.categories.map((category) => (
                                  <span key={category.id} className="text-xs bg-muted px-2 py-0.5 rounded-full">
                                    {category.name}
                                  </span>
                                ))}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{product.short_description}</p>
                            <div className="flex justify-between items-center mt-2">
                              <div>
                                <p className="font-bold">
                                  {Number.parseInt(product.regular_price).toLocaleString()} GNF
                                </p>
                                <p className="text-xs text-muted-foreground">Stock: {product.quantity}</p>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/produits/${product.id}`)}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Voir
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Commandes du partenaire</CardTitle>
                  <CardDescription>Historique des commandes de ce partenaire</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="text-muted-foreground mb-2">🛒</div>
                    <p className="text-muted-foreground">Aucune commande associée à ce partenaire</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Actions rapides</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => router.push(`/partenaires/${partner.id}/modifier`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Modifier le partenaire
              </Button>

              {partner.email && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => window.open(`mailto:${partner.email}`)}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer un email
                </Button>
              )}

              {partner.phone && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => window.open(`tel:${partner.phone}`)}
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Appeler
                </Button>
              )}

              {partner.website && (
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => window.open(partner.website as string, "_blank")}
                >
                  <Globe className="mr-2 h-4 w-4" />
                  Visiter le site web
                </Button>
              )}

              <Button className="w-full justify-start" variant="destructive" onClick={handleDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Supprimer le partenaire
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

