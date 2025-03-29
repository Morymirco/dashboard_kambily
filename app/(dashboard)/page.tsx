"use client"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchDashboardStats, fetchRecentOrders, fetchTopProducts, formatPrice } from "@/services/dashboard-service"
import { getStatusText, getStatusColor } from "@/services/order-service"
import type { DashboardStats, RecentOrder, TopProduct } from "@/services/dashboard-service"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Importer dynamiquement les composants recharts pour éviter les problèmes côté serveur
const DynamicCharts = dynamic(() => import("@/components/dashboard-charts"), {
  ssr: false,
  loading: () => (
    <div className="h-80 w-full flex items-center justify-center">
      <p className="text-muted-foreground">Chargement des graphiques...</p>
    </div>
  ),
})

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Charger toutes les données en parallèle
        const [statsData, ordersData, productsData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentOrders(),
          fetchTopProducts(),
        ])

        console.log("Statistiques récupérées:", statsData) // Log pour débogage

        setStats(statsData)
        setRecentOrders(ordersData.orders.slice(0, 5)) // Limiter à 5 commandes
        setTopProducts(productsData.top_products)
      } catch (err: any) {
        console.error("Erreur lors du chargement des données:", err)
        setError(err.message || "Impossible de charger les données du tableau de bord")
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // Fonction pour obtenir la classe CSS selon le statut
  const getStatusBadgeClass = (status: string) => {
    return getStatusColor(status)
  }

  // Afficher un état de chargement
  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground">Chargement des données...</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Afficher un message d'erreur
  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        </div>

        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button onClick={() => window.location.reload()} variant="outline">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground">Bienvenue sur votre tableau de bord administratif Kambily</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ventes totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? formatPrice(stats.total.revenue) : "0"}</div>
            <p className="text-xs text-green-500">
              +{stats ? Math.round((stats.this_month.revenue / (stats.total.revenue || 1)) * 100) : 0}% ce mois-ci
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total.users || 0}</div>
            <p className="text-xs text-green-500">+{stats?.today.users || 0} aujourd'hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total.orders || 0}</div>
            <p className="text-xs text-green-500">+{stats?.today.orders || 0} aujourd'hui</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produits actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total.products || 0}</div>
            <p className="text-xs text-muted-foreground">+{stats?.today.products || 0} nouveaux produits</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventes mensuelles</CardTitle>
            <CardDescription>Évolution des ventes sur les 7 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <DynamicCharts />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Répartition des ventes par catégorie</CardTitle>
            <CardDescription>Pourcentage des ventes par type de produit</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <DynamicCharts isPieChart topProducts={topProducts} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="mt-6">
        <TabsList>
          <TabsTrigger value="orders">Commandes récentes</TabsTrigger>
          <TabsTrigger value="products">Produits populaires</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Commandes récentes</CardTitle>
              <CardDescription>
                Vous avez reçu {stats?.today.orders || 0} nouvelles commandes aujourd'hui.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.number}</TableCell>
                        <TableCell>{`${order.user.first_name} ${order.user.last_name}`}</TableCell>
                        <TableCell>{new Date(order.created_at).toLocaleDateString("fr-FR")}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(order.status)}>{getStatusText(order.status)}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatPrice(order.total_price)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        Aucune commande récente
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Produits populaires</CardTitle>
              <CardDescription>Les produits les plus vendus ce mois-ci.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Quantité vendue</TableHead>
                    <TableHead>Revenu total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.product__name}</TableCell>
                        <TableCell>{product.total_quantity}</TableCell>
                        <TableCell>{formatPrice(product.total_revenue)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Aucun produit populaire
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

