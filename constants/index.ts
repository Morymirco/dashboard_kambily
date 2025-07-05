// Configuration de l'API partagée entre client et serveur
export const HOST_IP = "api.kambily.com"
export const PORT = ""
export const PROTOCOL_HTTP = "https"
// export const HOST_IP = '192.168.1.133'
// export const PORT = ':8000'
// export const PROTOCOL_HTTP = 'http'
export const PROTOCOL_WS = "ws"
export const API_BASE_URL = `${PROTOCOL_HTTP}://${HOST_IP}${PORT}`
export const API_URL = API_BASE_URL

export const generateSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Enlever les caractères spéciaux
    .replace(/\s+/g, "-") // Remplacer les espaces par des tirets
    .replace(/-+/g, "-") // Éviter les tirets multiples
}

export const formatNumber = (number: number) => {
  // Vérifier si le nombre est un nombre valide
  if (isNaN(number)) return number

  // Formater le nombre avec un séparateur de milliers et un point comme séparateur décimal
  const formattedNumber = number.toLocaleString("en-US", {
    minimumFractionDigits: 2, // Pour garantir au moins 2 décimales (par exemple: 123,000.00)
    maximumFractionDigits: 3, // Pour ne pas avoir plus de 3 décimales
  })

  // Ajouter l'unité monétaire (GNF) à la fin
  return `${formattedNumber} GNF`
}

// Fonction utilitaire pour convertir un blob URL en File
export async function blobUrlToFile(blobUrl: string) {
  const response = await fetch(blobUrl)
  const blob = await response.blob()
  const fileName = `image-${Date.now()}.jpg`
  return new File([blob], fileName, { type: blob.type })
}

export const generateSKU = (product: { name: string }) => {
  const { name } = product

  // Extraire les premières lettres des mots du nom et de la catégorie
  const namePart = name.split(" ")[0].substring(0, 3)

  const date = new Date()
  const date_ajout = `${date.getDay() + 1}-${date.getMonth() + 1}-${date.getFullYear()}`

  // Combiner les parties pour former le SKU
  return `${namePart}-${date_ajout}`.toUpperCase()
}

export const STOCK_STATUS = ["En Stock", "Rupture de stock", "Sur commande"]

export const PRODUCT_TYPE = ["simple", "variable"]

