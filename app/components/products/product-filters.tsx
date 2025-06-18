'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Search, X } from "lucide-react"
import { useState } from "react"

interface ProductFiltersProps {
  onSearch: (value: string) => void
  onFilterChange: (filters: ProductFilters) => void
  onReset: () => void
}

export interface ProductFilters {
  search: string
  priceRange: [number, number]
  stockStatus: string
  category: string
  sortBy: string
}

export function ProductFilters({ onSearch, onFilterChange, onReset }: ProductFiltersProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    search: "",
    priceRange: [0, 1000000],
    stockStatus: "all",
    category: "all",
    sortBy: "newest"
  })

  const handleFilterChange = (key: keyof ProductFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handleReset = () => {
    setFilters({
      search: "",
      priceRange: [0, 1000000],
      stockStatus: "all",
      category: "all",
      sortBy: "newest"
    })
    onReset()
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-4 space-y-4">
        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher des produits..."
            value={filters.search}
            onChange={(e) => {
              handleFilterChange("search", e.target.value)
              onSearch(e.target.value)
            }}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtre par prix */}
          <div className="space-y-2">
            <Label>Prix (GNF)</Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => handleFilterChange("priceRange", value)}
              min={0}
              max={1000000}
              step={1000}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{filters.priceRange[0].toLocaleString()} GNF</span>
              <span>{filters.priceRange[1].toLocaleString()} GNF</span>
            </div>
          </div>

          {/* Filtre par statut de stock */}
          <div className="space-y-2">
            <Label>Statut du stock</Label>
            <Select
              value={filters.stockStatus}
              onValueChange={(value) => handleFilterChange("stockStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="en_stock">En stock</SelectItem>
                <SelectItem value="rupture">Rupture de stock</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtre par catégorie */}
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select
              value={filters.category}
              onValueChange={(value) => handleFilterChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                <SelectItem value="electronics">Électronique</SelectItem>
                <SelectItem value="clothing">Vêtements</SelectItem>
                <SelectItem value="books">Livres</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tri */}
          <div className="space-y-2">
            <Label>Trier par</Label>
            <Select
              value={filters.sortBy}
              onValueChange={(value) => handleFilterChange("sortBy", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Plus récent</SelectItem>
                <SelectItem value="oldest">Plus ancien</SelectItem>
                <SelectItem value="price_asc">Prix croissant</SelectItem>
                <SelectItem value="price_desc">Prix décroissant</SelectItem>
                <SelectItem value="name_asc">Nom A-Z</SelectItem>
                <SelectItem value="name_desc">Nom Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Bouton de réinitialisation */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Réinitialiser les filtres
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 