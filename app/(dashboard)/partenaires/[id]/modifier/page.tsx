"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { toast } from "react-hot-toast"
import { ArrowLeft, Save } from "lucide-react"
import axios from "axios"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchPartnerById, type Partner } from "@/services/partner-service"
import { API_BASE_URL } from "@/constants"
import { getAuthToken } from "@/lib/auth-utils"

export default function ModifierPartenairePage() {
  // Utiliser uniquement useParams() pour obtenir l'ID
  const params = useParams()
  const partnerId = params.id as string
  
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Partner>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    website: "",
  })

  useEffect(() => {
    const loadPartner = async () => {
      try {
        setLoading(true)
        const id = Number.parseInt(partnerId)
        const partnerData = await fetchPartnerById(id)
        setFormData({
          name: partnerData.name,
          email: partnerData.email,
          phone: partnerData.phone,
          address: partnerData.address,
          website: partnerData.website,
        })
      } catch (error) {
        console.error("Erreur lors du chargement du partenaire:", error)
        setError("Impossible de charger les détails du partenaire")
        toast.error("Impossible de charger les détails du partenaire")
      } finally {
        setLoading(false)
      }
    }

    loadPartner()
  }, [partnerId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name) {
      toast.error("Le nom du partenaire est requis")
      return
    }

    try {
      setSaving(true)
      const token = getAuthToken()
      
      if (!token) {
        toast.error("Vous devez être connecté pour effectuer cette action")
        router.push("/login")
        return
      }

      const loadingToast = toast.loading("Mise à jour du partenaire en cours...")

      // Appel direct à l'API backend
      const response = await axios.patch(
        `${API_BASE_URL}/partenaire/${partnerId}/`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        }
      )

      toast.dismiss(loadingToast)
      
      if (response.status === 200) {
        toast.success("Partenaire mis à jour avec succès")
        router.push(`/partenaires/${partnerId}`)
      } else {
        throw new Error("Erreur lors de la mise à jour du partenaire")
      }
    } catch (error) {
      console.error("Erreur:", error)
      
      // Afficher un message d'erreur plus détaillé si disponible
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.detail || error.response.data?.message || "Erreur lors de la mise à jour du partenaire"
        toast.error(errorMessage)
      } else {
        toast.error("Erreur lors de la mise à jour du partenaire")
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        <div className="space-y-6">
          <Skeleton className="h-[400px] rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/partenaires")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Modifier le partenaire</h1>
        </div>

        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800 max-w-md">
            <div className="text-red-500 dark:text-red-400 mx-auto mb-4">⚠️</div>
            <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push(`/partenaires/${partnerId}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Modifier le partenaire</h1>
        </div>
        <Button
          className="bg-teal-600 hover:bg-teal-700 flex items-center gap-2"
          onClick={handleSubmit}
          disabled={saving}
        >
          <Save className="h-4 w-4" />
          {saving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="general">Informations générales</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="location">Localisation</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations générales</CardTitle>
                <CardDescription>Modifiez les informations de base du partenaire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Nom du partenaire <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Nom du partenaire"
                    value={formData.name || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    name="website"
                    placeholder="https://example.com"
                    value={formData.website || ""}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de contact</CardTitle>
                <CardDescription>Modifiez les coordonnées du partenaire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="contact@example.com"
                    value={formData.email || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+224 XXX XXX XXX"
                    value={formData.phone || ""}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Localisation</CardTitle>
                <CardDescription>Modifiez l'adresse du partenaire</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    name="address"
                    placeholder="Adresse complète"
                    value={formData.address || ""}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}

