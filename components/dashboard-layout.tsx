"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
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
  Sun,
  Moon,
  Handshake,
  User,
  Tags,
  MessageSquare,
  Tag,
} from "lucide-react"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/auth-context"
import { usePermissions } from "@/hooks/usePermissions"
import { PermissionGuard } from "@/components/PermissionGuard"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()
  const { user, logout, loading } = useAuth()
  const { userRole } = usePermissions()
  const router = useRouter()

  // Fermer le sidebar sur mobile lors du changement de route
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Vérifier si un lien est actif
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar - maintenant fixe sur desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <div className="flex items-center">
            <Image src="/images/logo.jpg" alt="Kambily" width={32} height={32} />
            <span className="ml-2 text-xl font-semibold text-foreground">Kambily</span>
          </div>
          <button
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-accent-foreground lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4 overflow-y-auto h-[calc(100vh-4rem)]">
          <Link
            href="/"
            className={`flex items-center rounded-md px-3 py-2 ${
              isActive("/")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <BarChart className="mr-3 h-5 w-5" />
            Tableau de bord
          </Link>
          <PermissionGuard permissions={['users:view', 'users:manage']}>
            <Link
              href="/utilisateurs"
              className={`flex items-center rounded-md px-3 py-2 ${
                isActive("/utilisateurs")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Users className="mr-3 h-5 w-5" />
              Utilisateurs
            </Link>
          </PermissionGuard>
          <PermissionGuard permissions={['orders:view', 'orders:manage']}>
            <Link
              href="/commandes"
              className={`flex items-center rounded-md px-3 py-2 ${
                isActive("/commandes")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <ShoppingBag className="mr-3 h-5 w-5" />
              Commandes
            </Link>
          </PermissionGuard>
          <PermissionGuard permissions={['products:view', 'products:create', 'products:edit', 'products:delete']}>
            <Link
              href="/produits"
              className={`flex items-center rounded-md px-3 py-2 ${
                isActive("/produits")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Package className="mr-3 h-5 w-5" />
              Produits
            </Link>
          </PermissionGuard>
          <PermissionGuard permissions={['products:view', 'products:create', 'products:edit']}>
            <Link
              href="/categories"
              className={`flex items-center rounded-md px-3 py-2 ${
                isActive("/categories")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Tags className="mr-3 h-5 w-5" />
              Catégories
            </Link>
          </PermissionGuard>
          <PermissionGuard permissions={['products:view', 'products:create', 'products:edit']}>
            <Link
              href="/etiquettes"
              className={`flex items-center rounded-md px-3 py-2 ${
                isActive("/etiquettes")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Tags className="mr-3 h-5 w-5" />
              Étiquettes
            </Link>
          </PermissionGuard>
          <PermissionGuard permissions={['products:view', 'products:create', 'products:edit']}>
            <Link
              href="/attributs"
              className={`flex items-center rounded-md px-3 py-2 ${
                isActive("/attributs")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Tag className="mr-3 h-5 w-5" />
              Attributs
            </Link>
          </PermissionGuard>
          <PermissionGuard permissions={['reviews:view', 'reviews:manage']}>
            <Link
              href="/reviews/admin"
              className={`flex items-center rounded-md px-3 py-2 ${
                isActive("/reviews/admin")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              Avis clients
            </Link>
          </PermissionGuard>
          <PermissionGuard permissions={['partners:view', 'partners:manage']}>
            <Link
              href="/partenaires"
              className={`flex items-center rounded-md px-3 py-2 ${
                isActive("/partenaires")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Handshake className="mr-3 h-5 w-5" />
              Partenaires
            </Link>
          </PermissionGuard>

          <PermissionGuard permissions={['promocodes:view', 'promocodes:manage']}>
            <Link
              href="/promocode"
              className={`flex items-center rounded-md px-3 py-2 ${
                isActive("/promocode")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Tags className="mr-3 h-5 w-5" />
              Codes promo
            </Link>
          </PermissionGuard>
          <Link
            href="/parametres"
            className={`flex items-center rounded-md px-3 py-2 ${
              isActive("/parametres")
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Settings className="mr-3 h-5 w-5" />
            Paramètres
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 lg:pl-64">
        {/* Header - maintenant fixe */}
        <header className="fixed top-0 right-0 left-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 lg:left-64 lg:px-6">
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
                  <div className="h-8 w-8 rounded-full bg-muted">
                    <Image src={user?.image || "/images/logo.jpg"} className="rounded-full object-cover h-8 w-8" alt="Avatar" width={32} height={32} />
                  </div>
                  <span className="hidden text-sm font-medium md:inline-block">{user?.first_name || "Admin"}</span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/parametres">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={handleLogout} disabled={loading}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{loading ? "Déconnexion..." : "Déconnexion"}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content - ajout d'un padding-top pour compenser le header fixe */}
        <main className="pt-16">
          {children}
        </main>
      </div>
    </div>
  )
}

