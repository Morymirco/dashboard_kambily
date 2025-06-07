"use client"

import type React from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Product } from "@/lib/types/products"
import { MoreHorizontal, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: Product
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push(`/produits/${product.id}`)
  }

  return (
    <div className="border rounded-md p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-500">{product.short_description}</p>
      <div className="mt-2">
        <span>Prix: {product.regular_price}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <MoreHorizontal className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleViewDetails}>
            <Eye className="mr-2 h-4 w-4" />
            <span>Voir détails</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default ProductCard

