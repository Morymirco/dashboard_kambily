"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Loader2, X, Mail, Phone, Trash2, User, ShoppingBag, MapPin, Calendar, Clock, Edit, Shield, CheckCircle, XCircle } from "lucide-react"
import { toast, Toaster } from "react-hot-toast"
import { useUserDetail } from "@/hooks/api/users"
import { PermissionGuard } from "@/components/PermissionGuard"
import { withUserPermissions } from "@/app/hoc/WithPermissions"

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
import { Skeleton } from "@/components/ui/skeleton"

const UserDetailPage = () => {
  const params = useParams()
  const userId = params.id as string
  const router = useRouter()

  const { data: user, isLoading, isError, error } = useUserDetail(userId)

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRoleBadgeVariant = (role: string) => {
    const roleMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      admin: "destructive",
      manager: "default",
      product_manager: "secondary",
      marketin_gmanager: "secondary",
      finance_manager: "secondary",
      client_manager: "secondary",
      logistic_manager: "secondary",
      customer: "outline",
    }
    return roleMap[role.toLowerCase()] || "outline"
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/utilisateurs")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Détails de l'utilisateur</h1>
        </div>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <CardTitle className="text-red-700 mb-2">Erreur de chargement</CardTitle>
            <CardDescription className="text-red-600 mb-4">
              {error?.message || "Impossible de charger les détails de l'utilisateur"}
            </CardDescription>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/utilisateurs")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Détails de l'utilisateur</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6 text-center">
            <div className="text-muted-foreground text-4xl mb-4">👤</div>
            <CardTitle className="mb-2">Utilisateur non trouvé</CardTitle>
            <CardDescription>
              L'utilisateur que vous recherchez n'existe pas ou a été supprimé.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => router.push("/utilisateurs")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-muted-foreground">
              Détails de l'utilisateur
            </p>
          </div>
        </div>
        
        <PermissionGuard permissions={['users:manage']}>
          <Button 
            variant="outline"
            onClick={() => router.push(`/utilisateurs/${userId}/modifier`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Modifier
          </Button>
        </PermissionGuard>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Détails de base de l'utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Téléphone</p>
                <p className="text-sm text-muted-foreground">
                  {user.phone_number || "Non renseigné"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Date d'inscription</p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(user.date_joined)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statut et permissions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Statut et permissions
            </CardTitle>
            <CardDescription>
              Informations sur le compte et les droits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Rôle</p>
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role}
              </Badge>
            </div>
            
            <div className="flex items-center gap-3">
              {user.is_active ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">Statut du compte</p>
                <p className="text-sm text-muted-foreground">
                  {user.is_active ? "Actif" : "Inactif"}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {user.is_confirmed ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <div>
                <p className="text-sm font-medium">Email confirmé</p>
                <p className="text-sm text-muted-foreground">
                  {user.is_confirmed ? "Confirmé" : "Non confirmé"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions supplémentaires */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Actions disponibles pour cet utilisateur
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <PermissionGuard permissions={['users:manage']}>
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Envoyer un message
                </Button>
              </PermissionGuard>
              
              <PermissionGuard permissions={['users:manage']}>
                <Button variant="outline" size="sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Modifier les permissions
                </Button>
              </PermissionGuard>
              
              <PermissionGuard permissions={['users:manage']}>
                <Button variant="outline" size="sm">
                  <Calendar className="mr-2 h-4 w-4" />
                  Voir l'historique
                </Button>
              </PermissionGuard>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withUserPermissions(UserDetailPage)

