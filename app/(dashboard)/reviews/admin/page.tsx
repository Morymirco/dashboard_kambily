"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { PROTOCOL_HTTP, HOST_IP, PORT, API_BASE_URL } from "@/constants"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Star, Search, Check, X, MessageSquare, Filter, ChevronDown, ChevronUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatDate } from "date-fns"
import { useReviews } from "@/hooks/api/reviews"

// Type pour les avis
type Review = {
  id: number
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
    avatar?: string
  }
  product: {
    id: number
    name: string
    slug: string
    image?: string
  }
  rating: number
  comment: string
  created_at: string
  is_approved: boolean
}

export default function ReviewsAdminPage() {
  const { getToken } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<string>("created_at")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const { data: reviewsData, isLoading: reviewsLoading } = useReviews()


  useEffect(() => {
    if (reviewsData) {
      filterReviews()
    }
    setIsLoading(false)
  }, [reviewsData, activeTab, searchTerm, sortField, sortDirection])

  

  const filterReviews = () => {
    let filtered = [...reviewsData]
    
    // Filtrer par statut
    if (activeTab === "pending") {
      filtered = filtered.filter(review => !review.is_approved)
    } else if (activeTab === "approved") {
      filtered = filtered.filter(review => review.is_approved)
    }
    
    // Filtrer par recherche
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(review => 
        review.user.username.toLowerCase().includes(term) ||
        review.user.email.toLowerCase().includes(term) ||
        review.product.name.toLowerCase().includes(term) ||
        review.comment.toLowerCase().includes(term)
      )
    }
    
    // Trier les résultats
    filtered.sort((a, b) => {
      let comparison = 0
      
      if (sortField === "created_at") {
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      } else if (sortField === "rating") {
        comparison = a.rating - b.rating
      } else if (sortField === "product") {
        comparison = a.product.name.localeCompare(b.product.name)
      } else if (sortField === "user") {
        comparison = a.user.username.localeCompare(b.user.username)
      }
      
      return sortDirection === "desc" ? -comparison : comparison
    })
    
    setFilteredReviews(filtered)
  }

  const handleApproveReview = async (id: number, approve: boolean) => {
    try {
      const token = getToken()
      
      const response = await fetch(`${PROTOCOL_HTTP}://${HOST_IP}${PORT}/reviews/${id}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ is_approved: approve })
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      // Mettre à jour l'état local
      setReviews(reviews.map(review => 
        review.id === id ? { ...review, is_approved: approve } : review
      ))
      
      toast.success(approve ? "Avis approuvé avec succès" : "Avis rejeté avec succès")
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'avis:", error)
      toast.error("Impossible de mettre à jour l'avis")
    }
  }

  const handleDeleteReview = async (id: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ? Cette action est irréversible.")) {
      return
    }
    
    try {
      const token = getToken()
      
      const response = await fetch(`${PROTOCOL_HTTP}://${HOST_IP}${PORT}/reviews/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`)
      }
      
      // Mettre à jour l'état local
      setReviews(reviews.filter(review => review.id !== id))
      
      toast.success("Avis supprimé avec succès")
    } catch (error) {
      console.error("Erreur lors de la suppression de l'avis:", error)
      toast.error("Impossible de supprimer l'avis")
    }
  }

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Rendu du squelette de chargement
  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-8 flex items-center justify-between">
          <Skeleton className="h-9 w-[250px]" />
          <Skeleton className="h-10 w-[180px] rounded-md" />
        </div>

        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <Skeleton className="h-10 w-full sm:w-[350px] rounded-md" />
          <Skeleton className="h-10 w-[150px] rounded-md" />
        </div>

        <Skeleton className="h-10 w-[350px] mb-4 rounded-md" />

        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <ReviewSkeleton key={index} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Avis</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredReviews.length} avis au total
          </span>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher par utilisateur, produit ou contenu..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" />
              Trier par
              {sortDirection === "asc" ? (
                <ChevronUp className="ml-2 h-4 w-4" />
              ) : (
                <ChevronDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toggleSort("created_at")}>
              Date {sortField === "created_at" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleSort("rating")}>
              Note {sortField === "rating" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleSort("product")}>
              Produit {sortField === "product" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleSort("user")}>
              Utilisateur {sortField === "user" && (sortDirection === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">Tous les avis</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="approved">Approuvés</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onApprove={() => handleApproveReview(review.id, true)}
                onReject={() => handleApproveReview(review.id, false)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">Aucun avis trouvé</p>
              <p className="text-sm text-muted-foreground">
                Aucun avis ne correspond à vos critères de recherche.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onApprove={() => handleApproveReview(review.id, true)}
                onReject={() => handleApproveReview(review.id, false)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">Aucun avis en attente</p>
              <p className="text-sm text-muted-foreground">
                Tous les avis ont été traités.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {filteredReviews.length > 0 ? (
            filteredReviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onApprove={() => handleApproveReview(review.id, true)}
                onReject={() => handleApproveReview(review.id, false)}
                onDelete={() => handleDeleteReview(review.id)}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-lg font-medium">Aucun avis approuvé</p>
              <p className="text-sm text-muted-foreground">
                Aucun avis n'a encore été approuvé.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Composant pour afficher un avis
function ReviewCard({ 
  review, 
  onApprove, 
  onReject, 
  onDelete 
}: { 
  review: Review
  onApprove: () => void
  onReject: () => void
  onDelete: () => void
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/4">
            <div className="flex items-center gap-3 mb-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full">
                {review.user.avatar ? (
                  <Image
                    src={review.user.avatar}
                    alt={review.user.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                    {review.user.first_name.charAt(0)}
                    {review.user.last_name.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium">
                  {review.user.first_name} {review.user.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{review.user.email}</p>
              </div>
            </div>
            <div className="mb-3">
              <p className="text-sm font-medium">Produit</p>
              <Link 
                href={`/produits/${review.product.id}`}
                className="text-sm text-teal-600 hover:underline"
              >
                {review.product.name}
              </Link>
            </div>
            <div className="mb-3">
              <p className="text-sm font-medium">Note</p>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm">({review.rating}/5)</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">Date</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(review.created_at, "dd/MM/yyyy")}
              </p>
            </div>
          </div>
          
          <div className="md:w-3/4">
            <div className="mb-4 flex items-center justify-between">
              <Badge variant={review.is_approved ? "default" : "outline"}>
                {review.is_approved ? "Approuvé" : "En attente"}
              </Badge>
              <div className="flex gap-2">
                {!review.is_approved && (
                  <Button size="sm" variant="outline" className="text-green-600" onClick={onApprove}>
                    <Check className="mr-1 h-4 w-4" /> Approuver
                  </Button>
                )}
                {review.is_approved && (
                  <Button size="sm" variant="outline" className="text-amber-600" onClick={onReject}>
                    <X className="mr-1 h-4 w-4" /> Rejeter
                  </Button>
                )}
                <Button size="sm" variant="outline" className="text-destructive" onClick={onDelete}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg bg-muted p-4">
              <p className="whitespace-pre-wrap">{review.comment}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Composant pour le squelette de chargement d'un avis
function ReviewSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/4">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-5 w-[120px] mb-1" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            </div>
            <div className="mb-3">
              <Skeleton className="h-4 w-[80px] mb-1" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
            <div className="mb-3">
              <Skeleton className="h-4 w-[60px] mb-1" />
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-4 mr-1 rounded-full" />
                ))}
                <Skeleton className="h-4 w-[40px] ml-1" />
              </div>
            </div>
            <div>
              <Skeleton className="h-4 w-[60px] mb-1" />
              <Skeleton className="h-4 w-[120px]" />
            </div>
          </div>
          
          <div className="md:w-3/4">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-6 w-[80px] rounded-full" />
              <div className="flex gap-2">
                <Skeleton className="h-9 w-[100px] rounded-md" />
                <Skeleton className="h-9 w-9 rounded-md" />
              </div>
            </div>
            
            <Skeleton className="h-[100px] w-full rounded-lg" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 