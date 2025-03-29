import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const formatPrice = (price: string) => {
  const numPrice = Number.parseFloat(price)
  if (isNaN(numPrice)) return price

  return new Intl.NumberFormat("fr-GN", {
    style: "currency",
    currency: "GNF",
    maximumFractionDigits: 0,
  }).format(numPrice)
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

