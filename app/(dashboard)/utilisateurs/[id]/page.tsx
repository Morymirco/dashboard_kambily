"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Loader2, X, Mail, Phone, Trash2, User, ShoppingBag, MapPin, Calendar, Clock } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { fetchUserById, type User as UserType, updateUserStatus, deleteUser } from "@/services/user-service"

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingAction, setProcessingAction] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const userData = await fetchUserById(id)
        setUser(userData)
      } catch (err) {
        console.error("Erreur lors du chargement de l'utilisateur:", err)
        setError("Impossible de charger les informations de l'utilisateur.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchUser()
    }
  }, [id])

  const handleStatusChange = async () => {
    if (!user || processingAction) return

    try {
      setProcessingAction(true)
      await updateUserStatus(Number(id), !user.status)

      setUser((prev) => (prev ? { ...prev, status: !prev.status } : null))
      toast.success("Statut de l'utilisateur mis à jour avec succès")
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error)
      toast.error("Erreur lors de la mise à jour du statut")
    } finally {
      setProcessingAction(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!user || processingAction) return

    const confirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")
    if (!confirmed) return

    try {
      setProcessingAction(true)
      await deleteUser(Number(id))

      toast.success("Utilisateur supprimé avec succès")
      router.push("/utilisateurs")
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur:", error)
      toast.error("Erreur lors de la suppression de l'utilisateur")
    } finally {
      setProcessingAction(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100"
          >
            En attente
          </Badge>
        )
      case "prepared":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-100"
          >
            Préparé
          </Badge>
        )
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-100"
          >
            Livré
          </Badge>
        )
      case "cancel":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 hover:bg-red-100 dark:bg-red-900 dark:text-red-100"
          >
            Annulé
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
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

  if (error) {
    return (
      <div className="container py-10">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <X className="h-12 w-12 text-red-500 mb-4" />
              <h3 className="text-xl font-bold text-red-600 mb-2">Erreur de chargement</h3>
              <p className="text-gray-600 mb-4 max-w-md">{error}</p>
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => router.push("/utilisateurs")}>
                  Retour à la liste
                </Button>
                <Button onClick={() => window.location.reload()}>Réessayer</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-6">
      <Toaster position="top-right" />

      {/* Fil d'Ariane pour la navigation */}
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/utilisateurs">Utilisateurs</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/utilisateurs/${id}`}>
              {user.first_name} {user.last_name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header avec navigation et actions */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => router.push("/utilisateurs")} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Détails de l'utilisateur</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Consultez et gérez les informations de l'utilisateur</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9" onClick={handleStatusChange} disabled={processingAction}>
            {user.status ? "Désactiver" : "Activer"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="h-9"
            onClick={handleDeleteUser}
            disabled={processingAction}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      {/* Informations principales de l'utilisateur */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage
                src={user.image || "/placeholder.svg?height=64&width=64"}
                alt={`${user.first_name} ${user.last_name}`}
              />
              <AvatarFallback className="text-lg">{user.first_name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">
                {user.first_name} {user.last_name}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Badge variant={user.status ? "success" : "secondary"}>{user.status ? "Actif" : "Inactif"}</Badge>
                <Badge variant="outline">{user.role}</Badge>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Email</h3>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-base">{user.email}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Téléphone</h3>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-base">{user.phone_number || "Non renseigné"}</span>
                </div>
              </div>
              {user.bio && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Bio</h3>
                  <p className="text-base">{user.bio}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Date d'inscription</h3>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-base">{formatDate(user.created_at)}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Dernière connexion</h3>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-base">{user.last_login ? formatDateTime(user.last_login) : "Jamais"}</span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Statistiques</h3>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-muted/50 px-3 py-1 rounded-md">
                    <span className="text-sm font-medium">{user.total_orders}</span>
                    <span className="text-xs text-muted-foreground ml-1">commandes</span>
                  </div>
                  <div className="bg-muted/50 px-3 py-1 rounded-md">
                    <span className="text-sm font-medium">{user.total_favorites}</span>
                    <span className="text-xs text-muted-foreground ml-1">favoris</span>
                  </div>
                  <div className="bg-muted/50 px-3 py-1 rounded-md">
                    <span className="text-sm font-medium">{user.total_reviews}</span>
                    <span className="text-xs text-muted-foreground ml-1">avis</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Onglets pour les différentes sections */}
      <Tabs defaultValue="addresses" className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="addresses">Adresses</TabsTrigger>
          <TabsTrigger value="orders">Commandes</TabsTrigger>
          <TabsTrigger value="favorites">Favoris</TabsTrigger>
        </TabsList>

        {/* Onglet Adresses */}
        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Adresses de livraison</CardTitle>
              <CardDescription>Adresses enregistrées par l'utilisateur</CardDescription>
            </CardHeader>
            <CardContent>
              {user.addresses.length === 0 ? (
                <div className="text-center p-8 bg-muted/50 rounded-lg border">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Aucune adresse</h3>
                  <p className="text-muted-foreground mb-4">Cet utilisateur n'a pas encore enregistré d'adresse.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.addresses.map((address) => (
                    <Card key={address.pk} className={address.is_default ? "border-primary" : ""}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-base">
                            {address.ville}, {address.pays}
                            {address.is_default && (
                              <Badge className="ml-2 bg-primary text-primary-foreground">Par défaut</Badge>
                            )}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <p className="text-sm mb-2">{address.address}</p>
                        <p className="text-sm text-muted-foreground">Tél: {address.telephone}</p>
                      </CardContent>
                      <CardFooter className="pt-0">
                        {address.location_url && (
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <a href={address.location_url} target="_blank" rel="noopener noreferrer">
                              <MapPin className="mr-2 h-4 w-4" />
                              Voir sur la carte
                            </a>
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Commandes */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Historique des commandes</CardTitle>
              <CardDescription>
                Total: {user.orders.total_orders} commande(s)
                {user.orders.total_prices && (
                  <span className="ml-2">
                    - Montant total:{" "}
                    {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "GNF" }).format(
                      user.orders.total_prices,
                    )}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user.orders.orders.length === 0 ? (
                <div className="text-center p-8 bg-muted/50 rounded-lg border">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Aucune commande</h3>
                  <p className="text-muted-foreground mb-4">Cet utilisateur n'a pas encore passé de commande.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Numéro</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {user.orders.orders.map((order) => (
                        <TableRow key={order.number}>
                          <TableCell className="font-medium">{order.number}</TableCell>
                          <TableCell>{formatDate(order.created_at)}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "GNF" }).format(
                              Number.parseFloat(order.total_price),
                            )}
                          </TableCell>
                          <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`/commandes/${order.number}`}>Voir</a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Favoris */}
        <TabsContent value="favorites">
          <Card>
            <CardHeader>
              <CardTitle>Produits favoris</CardTitle>
              <CardDescription>Produits ajoutés aux favoris par l'utilisateur</CardDescription>
            </CardHeader>
            <CardContent>
              {user.orders.favorites.length === 0 ? (
                <div className="text-center p-8 bg-muted/50 rounded-lg border">
                  <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">Aucun favori</h3>
                  <p className="text-muted-foreground mb-4">
                    Cet utilisateur n'a pas encore ajouté de produits à ses favoris.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.orders.favorites.map((favorite) => (
                    <Card key={favorite.product.id}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{favorite.product.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="aspect-square relative mb-3 bg-muted rounded-md overflow-hidden">
                          {favorite.product.images && favorite.product.images.length > 0 ? (
                            <img
                              src={favorite.product.images[0].image || "/placeholder.svg"}
                              alt={favorite.product.name}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <span className="text-muted-foreground">Pas d'image</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {favorite.product.short_description}
                        </p>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">
                            {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "GNF" }).format(
                              Number.parseFloat(favorite.product.regular_price),
                            )}
                          </span>
                          <Button variant="outline" size="sm" asChild>
                            <a href={`/produits/${favorite.product.id}`}>Voir</a>
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
      </Tabs>
    </div>
  )
}

