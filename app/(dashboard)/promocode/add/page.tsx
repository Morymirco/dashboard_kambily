"use client"

import { ArrowLeft, Calendar, DollarSign, Info, Percent, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useCreatePromoCode } from "@/hooks/api/promocodes"
import { type CreatePromoCodeData } from "@/lib/services/promocodes.service"

export default function AddPromoCodePage() {
  const router = useRouter()
  const createPromoCode = useCreatePromoCode()

  const [formData, setFormData] = useState<CreatePromoCodeData>({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: 0,
    min_order_amount: undefined,
    max_discount_amount: undefined,
    usage_limit: undefined,
    is_active: true,
    start_date: "",
    end_date: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value
    }))
  }

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }))
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      await createPromoCode.mutateAsync(formData)
      router.push("/promocode")
    } catch (error) {
      // L'erreur est déjà gérée par le hook avec toast.error
    }
  }

  const generateRandomCode = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    setFormData(prev => ({ ...prev, code: result }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" onClick={() => router.push("/promocode")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Ajouter un code promo</h1>
          <p className="text-muted-foreground">Créez un nouveau code promotionnel pour vos clients</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de base */}
        <Card>
          <CardHeader>
            <CardTitle>Informations de base</CardTitle>
            <CardDescription>Définissez les informations principales du code promo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Code promo *</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    placeholder="Ex: SUMMER2024"
                    required
                    className="uppercase"
                  />
                  <Button type="button" variant="outline" onClick={generateRandomCode}>
                    Générer
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_type">Type de réduction *</Label>
                <Select 
                  value={formData.discount_type} 
                  onValueChange={handleSelectChange("discount_type")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed">Montant fixe (GNF)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Ex: Réduction de 10% sur tous les produits d'été"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Configuration de la réduction */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {formData.discount_type === 'percentage' ? (
                <Percent className="h-5 w-5" />
              ) : (
                <DollarSign className="h-5 w-5" />
              )}
              Configuration de la réduction
            </CardTitle>
            <CardDescription>
              Définissez la valeur et les limites de votre réduction
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discount_value">
                  Valeur de la réduction * {formData.discount_type === 'percentage' ? '(%)' : '(GNF)'}
                </Label>
                <Input
                  id="discount_value"
                  name="discount_value"
                  type="number"
                  min="0"
                  max={formData.discount_type === 'percentage' ? 100 : undefined}
                  value={formData.discount_value || ''}
                  onChange={handleInputChange}
                  placeholder={formData.discount_type === 'percentage' ? "Ex: 15" : "Ex: 5000"}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="min_order_amount">Montant minimum de commande (GNF)</Label>
                <Input
                  id="min_order_amount"
                  name="min_order_amount"
                  type="number"
                  min="0"
                  value={formData.min_order_amount || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 50000"
                />
              </div>
            </div>

            {formData.discount_type === 'percentage' && (
              <div className="space-y-2">
                <Label htmlFor="max_discount_amount">Réduction maximale (GNF)</Label>
                <Input
                  id="max_discount_amount"
                  name="max_discount_amount"
                  type="number"
                  min="0"
                  value={formData.max_discount_amount || ''}
                  onChange={handleInputChange}
                  placeholder="Ex: 20000"
                />
                <p className="text-sm text-muted-foreground">
                  Limite la réduction maximale pour les pourcentages
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Limites d'utilisation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Limites d'utilisation
            </CardTitle>
            <CardDescription>Contrôlez l'usage de votre code promo</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="usage_limit">Limite d'utilisation</Label>
              <Input
                id="usage_limit"
                name="usage_limit"
                type="number"
                min="1"
                value={formData.usage_limit || ''}
                onChange={handleInputChange}
                placeholder="Ex: 100 (laisser vide pour illimité)"
              />
              <p className="text-sm text-muted-foreground">
                Nombre maximum d'utilisations du code. Laisser vide pour un usage illimité.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Période de validité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Période de validité
            </CardTitle>
            <CardDescription>Définissez quand le code promo sera actif</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Date de début *</Label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_date">Date de fin *</Label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Le code promo sera automatiquement activé à la date de début et désactivé à la date de fin.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Statut */}
        <Card>
          <CardHeader>
            <CardTitle>Statut</CardTitle>
            <CardDescription>Contrôlez l'état initial de votre code promo</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={handleSwitchChange("is_active")}
              />
              <Label htmlFor="is_active">Code promo actif</Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Si désactivé, le code ne pourra pas être utilisé même pendant sa période de validité.
            </p>
          </CardContent>
        </Card>

        {/* Boutons d'action */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/promocode")}
            disabled={createPromoCode.isPending}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            className="bg-teal-600 hover:bg-teal-700"
            disabled={createPromoCode.isPending}
          >
            {createPromoCode.isPending ? "Création..." : "Créer le code promo"}
          </Button>
        </div>
      </form>
    </div>
  )
} 