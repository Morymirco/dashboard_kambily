"use client"

import { useState } from "react"
import {
  BarChart,
  Users,
  ShoppingBag,
  Package,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
} from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Ajouter ces imports en haut du fichier
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

// Remplacer la déclaration de fonction Dashboard par celle-ci pour ajouter useTheme
export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold">
              K
            </div>
            <span className="ml-2 text-xl font-semibold text-foreground">Kambily</span>
          </div>
          <button
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <Link
            href="#"
            className="flex items-center rounded-md px-3 py-2 text-foreground bg-accent text-accent-foreground"
          >
            <BarChart className="mr-3 h-5 w-5" />
            Tableau de bord
          </Link>
          <Link
            href="#"
            className="flex items-center rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Users className="mr-3 h-5 w-5" />
            Utilisateurs
          </Link>
          <Link
            href="#"
            className="flex items-center rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ShoppingBag className="mr-3 h-5 w-5" />
            Commandes
          </Link>
          <Link
            href="#"
            className="flex items-center rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Package className="mr-3 h-5 w-5" />
            Produits
          </Link>
          <Link
            href="#"
            className="flex items-center rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Settings className="mr-3 h-5 w-5" />
            Paramètres
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
          <button
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-4 lg:gap-6">
            <form className="hidden md:block">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Rechercher..." className="w-64 rounded-md pl-8 text-sm" />
              </div>
            </form>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Changer de thème"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-teal-500" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <span className="hidden text-sm font-medium md:inline-block">Admin</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profil</DropdownMenuItem>
                <DropdownMenuItem>Paramètres</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Déconnexion</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <main className="p-4 lg:p-6">
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
                <div className="text-2xl font-bold">€24,780</div>
                <p className="text-xs text-green-500">+12% par rapport au mois dernier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Nouveaux clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">124</div>
                <p className="text-xs text-green-500">+8% par rapport au mois dernier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Commandes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-green-500">+18% par rapport au mois dernier</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Produits actifs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">56</div>
                <p className="text-xs text-muted-foreground">+2 nouveaux produits</p>
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
                  <CardDescription>Vous avez reçu 12 nouvelles commandes aujourd'hui.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Client</TableHead>
                        <TableHead>Produit</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">#4532</TableCell>
                        <TableCell>Sophie Martin</TableCell>
                        <TableCell>Bracelet en or</TableCell>
                        <TableCell>23 Mars 2023</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-100">
                            Livré
                          </span>
                        </TableCell>
                        <TableCell className="text-right">€129.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">#4531</TableCell>
                        <TableCell>Thomas Dubois</TableCell>
                        <TableCell>Collier en argent</TableCell>
                        <TableCell>23 Mars 2023</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-yellow-100 dark:bg-yellow-900 px-2.5 py-0.5 text-xs font-medium text-yellow-800 dark:text-yellow-100">
                            En cours
                          </span>
                        </TableCell>
                        <TableCell className="text-right">€89.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">#4530</TableCell>
                        <TableCell>Marie Leroy</TableCell>
                        <TableCell>Bague diamant</TableCell>
                        <TableCell>22 Mars 2023</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-100">
                            Préparation
                          </span>
                        </TableCell>
                        <TableCell className="text-right">€249.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">#4529</TableCell>
                        <TableCell>Jean Petit</TableCell>
                        <TableCell>Montre en or</TableCell>
                        <TableCell>22 Mars 2023</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-100">
                            Livré
                          </span>
                        </TableCell>
                        <TableCell className="text-right">€349.00</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">#4528</TableCell>
                        <TableCell>Lucie Bernard</TableCell>
                        <TableCell>Boucles d'oreilles</TableCell>
                        <TableCell>21 Mars 2023</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-100">
                            Livré
                          </span>
                        </TableCell>
                        <TableCell className="text-right">€79.00</TableCell>
                      </TableRow>
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
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Prix</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Ventes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Bracelet en or</TableCell>
                        <TableCell>Bracelets</TableCell>
                        <TableCell>€129.00</TableCell>
                        <TableCell>24</TableCell>
                        <TableCell>89</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Collier en argent</TableCell>
                        <TableCell>Colliers</TableCell>
                        <TableCell>€89.00</TableCell>
                        <TableCell>18</TableCell>
                        <TableCell>76</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Bague diamant</TableCell>
                        <TableCell>Bagues</TableCell>
                        <TableCell>€249.00</TableCell>
                        <TableCell>12</TableCell>
                        <TableCell>65</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Montre en or</TableCell>
                        <TableCell>Montres</TableCell>
                        <TableCell>€349.00</TableCell>
                        <TableCell>8</TableCell>
                        <TableCell>52</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Boucles d'oreilles</TableCell>
                        <TableCell>Boucles d'oreilles</TableCell>
                        <TableCell>€79.00</TableCell>
                        <TableCell>32</TableCell>
                        <TableCell>48</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}

