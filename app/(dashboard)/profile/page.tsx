"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "react-hot-toast"
import { User, Mail, Phone, MapPin, Building, Shield, Camera } from "lucide-react"
import axios from "axios"
import { API_BASE_URL } from "@/constants"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"

// Mettre à jour le type User pour correspondre à la structure de données reçue
export type User = {
  
  id?: string
  first_name?: string
  last_name?: string
  email?: string
  role?: string
  phone_number?: string
  address?: string
  is_active?: boolean
  status?: boolean
  bio?: string
  image?: string
  is_confirmed?: boolean
  is_accept_mail?: boolean
  total_orders?: number
  total_favorites?: number
  total_reviews?: number
  addresses?: Array<{
    pk: number
    address: string
    ville: string
    pays: string
    telephone: string
    location_url: string
    latitude: number
    longitude: number
    is_default: boolean
  }>
}

export default function ProfilePage() {
  const { 
    user, 
    fetchUserProfile, 
    isLoadingProfile, 
    updateUserData, 
    getToken 
  } = useAuth()
  
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    address: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // Effet pour charger le profil utilisateur
  useEffect(() => {
    if (user) {
      // Mettre à jour le formulaire avec les données de l'utilisateur
      setFormData({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        address: user.address || "",
        bio: user.bio || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      
      // Charger le profil complet si nécessaire
      fetchUserProfile()
    }
  }, [user, fetchUserProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const token = getToken()
      
      const response = await axios.put(
        `${API_BASE_URL}/accounts/updateuser/`, 
        {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          address: formData.address,
          bio: formData.bio,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      
      if (response.data) {
        // Mettre à jour les données utilisateur dans le contexte
        updateUserData({
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone_number: formData.phone_number,
          address: formData.address,
          bio: formData.bio,
        })
        
        toast.success("Profil mis à jour avec succès")
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      toast.error("Impossible de mettre à jour le profil")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Vérifier que les mots de passe correspondent
      if (formData.newPassword !== formData.confirmPassword) {
        toast.error("Les mots de passe ne correspondent pas")
        return
      }

      // Simuler une mise à jour
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("Mot de passe mis à jour avec succès")

      // Réinitialiser les champs de mot de passe
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du mot de passe")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profil utilisateur</h1>
          <p className="text-muted-foreground">Gérez vos informations personnelles et vos préférences</p>
        </div>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="info">
          <TabsList>
            <TabsTrigger value="info" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Informations</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Sécurité</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>Mettez à jour vos informations personnelles</CardDescription>
              </CardHeader>
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-6">
                  {isLoadingProfile ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center space-y-4">
                        <Avatar className="h-24 w-24">
                          <AvatarImage src={user?.image || ""} alt={`${formData.first_name} ${formData.last_name}` || "Avatar"} />
                          <AvatarFallback className="text-2xl">{formData.first_name?.charAt(0) || "A"}</AvatarFallback>
                        </Avatar>
                        <div className="relative">
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Camera className="h-4 w-4" />
                            <span>Changer la photo</span>
                          </Button>
                          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                        </div>
                      </div>

                      <Separator />

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">Prénom</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="first_name"
                              name="first_name"
                              placeholder="Votre prénom"
                              className="pl-10"
                              value={formData.first_name}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Nom</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="last_name"
                              name="last_name"
                              placeholder="Votre nom"
                              className="pl-10"
                              value={formData.last_name}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="email"
                              name="email"
                              type="email"
                              placeholder="votre@email.com"
                              className="pl-10"
                              value={formData.email}
                              onChange={handleChange}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone_number">Téléphone</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="phone_number"
                              name="phone_number"
                              placeholder="+224 621 82 00 65"
                              className="pl-10"
                              value={formData.phone_number}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="address"
                            name="address"
                            placeholder="Votre adresse"
                            className="pl-10"
                            value={formData.address}
                            onChange={handleChange}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Biographie</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          placeholder="Parlez-nous de vous"
                          rows={4}
                          value={formData.bio}
                          onChange={handleChange}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                    {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Changer le mot de passe</CardTitle>
                <CardDescription>Mettez à jour votre mot de passe pour sécuriser votre compte</CardDescription>
              </CardHeader>
              <form onSubmit={handlePasswordUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
                    {isLoading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

