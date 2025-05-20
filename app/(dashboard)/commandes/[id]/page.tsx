"use client"

import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  MapPin,
  Package,
  Phone,
  RefreshCw,
  Truck,
  User,
} from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-hot-toast"

import {
  acceptOrder,
  fetchOrderDetail,
  getPaymentMethodText,
  getStatusColor,
  getStatusText,
  type OrderDetail,
} from "@/services/order-service"

// Composant de squelette pour l'état de chargement
const OrderDetailSkeleton = () => {
  return (
    <div className="animate-pulse p-4 md:p-6">
      {/* Fil d'Ariane skeleton */}
      <div className="mb-6 flex items-center gap-2">
        <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
        <span className="text-gray-300 dark:text-gray-600">›</span>
        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* En-tête skeleton */}
      <div className="mb-6">
        <div className="mb-3 h-7 w-64 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>

      {/* Suivi de commande skeleton */}
      <div className="mb-8">
        <div className="h-1 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="mt-2 flex justify-between">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex flex-col items-center">
              <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="mt-2 h-3 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenu principal skeleton */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Informations commande */}
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-lg border border-border p-5 bg-card">
            <div className="mb-4 h-5 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="flex gap-4">
                  <div className="h-16 w-16 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                    <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-5 bg-card">
            <div className="mb-4 h-5 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
            <div className="mt-4 h-[200px] rounded bg-gray-200 dark:bg-gray-700"></div>
          </div>
        </div>

        {/* Résumé commande */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border p-5 bg-card">
            <div className="mb-4 h-5 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex justify-between">
                  <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
                  <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border p-5 bg-card">
            <div className="mb-4 h-5 w-40 rounded bg-gray-200 dark:bg-gray-700"></div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProductImage {
  id: number
  image: string
}

interface Product {
  id: number
  name: string
  regular_price: string
  product_type?: string
  images: ProductImage[]
}

interface Attribut {
  attribut: {
    nom: string
  }
  valeur: string
  hex_code: string | null
}

interface Variante {
  id: number
  attributs: Attribut[]
  quantity: number
  regular_price: string
}

interface OrderItem {
  id: number
  quantity: number
  price: string
  product: Product
  variante?: Variante
}

interface promo_code{

}

const OrderItem = ({ item }: { item: ApiResponseOrder_items }) => {
  // Calcul du prix total pour l'item
  const getItemTotal = () => {
    const price = item.is_variante 
      ? Number(item.product_variante.regular_price)
      : Number(item.product.regular_price)
    return price * item.quantity
  }

  return (
    <div className="flex items-start gap-4 py-4 border-b last:border-b-0">
      {/* Image du produit */}
      <div className="relative h-20 w-20 overflow-hidden rounded-md border border-border">
        {item.is_variante ? (
          <Image
            src={item.product_variante.image || "/placeholder.png"}
            alt={item.product_variante.product.name}
            fill
            className="object-cover"
          />
        ) : (
          <Image
            src={item.product.images?.[0]?.image || "/placeholder.png"}
            alt={item.product.name}
            fill
            className="object-cover"
          />
        )}
      </div>

      {/* Informations du produit */}
      <div className="flex flex-1 flex-col">
        {/* Nom du produit et lien */}
        <div className="flex items-start justify-between">
          <Link
            href={`/produits/${item.is_variante ? item.product_variante.product.id : item.product.id}`}
            className="font-medium text-foreground hover:text-primary"
          >
            {item.is_variante ? item.product_variante.product.name : item.product.name}
          </Link>
          <span className="text-sm font-medium">
            {getItemTotal().toLocaleString()} GNF
          </span>
        </div>

        {/* Attributs de la variante */}
        {item.is_variante && item.product_variante.attributs && (
          <div className="mt-1 flex flex-wrap gap-2">
            {item.product_variante.attributs.map((attr: Attribut) => (
              <span
                key={attr.attribut.nom}
                className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground"
              >
                {attr.attribut.nom}:{" "}
                <span className="font-medium">{attr.valeur}</span>
                {attr.hex_code && (
                  <span
                    className="ml-1 inline-block h-3 w-3 rounded-full border border-border"
                    style={{ backgroundColor: attr.hex_code }}
                  />
                )}
              </span>
            ))}
          </div>
        )}

        {/* Détails de prix et quantité */}
        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4" />
            <span>Qté: {item.quantity}</span>
          </div>
          <div className="flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            <span>Prix unitaire: {Number(
              item.is_variante 
                ? item.product_variante.regular_price 
                : item.product.regular_price
            ).toLocaleString()} GNF</span>
          </div>
        </div>

        {/* Description courte du produit si disponible */}
        {(item.is_variante 
          ? item.product_variante.product.short_description 
          : item.product.short_description
        ) && (
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
            {item.is_variante 
              ? item.product_variante.product.short_description 
              : item.product.short_description}
          </p>
        )}
      </div>
    </div>
  )
}

const PaymentStatusBadge = ({ status }: { status: string | undefined | null }) => {
  const getStatusConfig = (status: string | undefined | null): { color: string; text: string } => {
    switch (status) {
      case "completed":
        return {
          color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-400",
          text: "Payé"
        }
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-400",
          text: "En attente de paiement"
        }
      case "failed":
        return {
          color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-400",
          text: "Paiement échoué"
        }
      default:
        return {
          color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
          text: "Statut inconnu"
        }
    }
  }

  const config = getStatusConfig(status)
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.color}`}>
      {config.text}
    </span>
  )
}

const getPaymentMethodText = (method: string | undefined | null): string => {
  switch (method) {
    case "paycard":
      return "Paiement par carte"
    case "cash":
      return "Paiement à la livraison"
    default:
      return "Méthode de paiement inconnue"
  }
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)
  const [isAccepting, setIsAccepting] = useState(false)

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await fetchOrderDetail(id as string)

        console.log(data)
        setOrder(data)
      } catch (err) {
        console.error("Erreur:", err)
        setError((err as Error).message || "Erreur lors de la récupération de la commande")
        toast.error("Erreur lors de la récupération de la commande")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchOrderData()
    }
  }, [id])

  const handleAcceptOrder = async () => {
    if (!order || isAccepting) return

    try {
      setIsAccepting(true)
      const loadingToast = toast.loading("Acceptation de la commande en cours...")

      await acceptOrder(order.number.toString());

      toast.dismiss(loadingToast)
      toast.success("Commande acceptée avec succès")

      // Mettre à jour l'état local
      setOrder(prev => prev ? {
        ...prev,
        status: "accepted"
      } : null)

    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur lors de l'acceptation de la commande")
    } finally {
      setIsAccepting(false)
    }
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending":
        return 1
      case "accepted":
        return 2
      case "prepared":
        return 3
      case "delivered":
        return 4
      default:
        return 1
    }
  }

  const getPaymentMethodIcon = (method?: string) => {
    const icons = {
      om: "/paiements/om.png",
      momo: "/paiements/momo.png",
      card: "/paiements/card.png",
    }
    return icons[method as keyof typeof icons] || "/paiements/default.png"
  }

  const formatDate = (dateString?: string) => {
    try {
      if (!dateString) return ""
      // Si la date est au format "dd/MM/yyyy HH:mm:ss"
      if (dateString.includes("/")) {
        const [datePart, timePart] = dateString.split(" ")
        const [day, month, year] = datePart.split("/")
        const [hours, minutes, seconds] = timePart.split(":")
        const date = new Date(
          Number.parseInt(year),
          Number.parseInt(month) - 1,
          Number.parseInt(day),
          Number.parseInt(hours),
          Number.parseInt(minutes),
          Number.parseInt(seconds),
        )
        return format(date, "d MMMM yyyy à HH:mm", { locale: fr })
      }
      // Si la date est au format ISO
      return format(parseISO(dateString), "d MMMM yyyy à HH:mm", { locale: fr })
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return dateString
    }
  }

  const handleDownloadInvoice = async () => {
    if (!order?.recu) {
      toast.error("Aucune facture disponible")
      return
    }

    try {
      setDownloadingInvoice(true)
      
      // Ouvrir le lien dans un nouvel onglet
      window.open(order.recu, '_blank')
      
      toast.success("Facture ouverte dans un nouvel onglet")
    } catch (error) {
      console.error("Erreur lors de l'ouverture de la facture:", error)
      toast.error("Impossible d'ouvrir la facture")
    } finally {
      setDownloadingInvoice(false)
    }
  }

  const renderVariantAttributes = (variante: Variante) => {
    return (
      <div className="flex items-center gap-2">
        {variante.attributs.map((attr, index) => (
          <div key={index} className="flex items-center gap-1">
            <span className="text-sm font-medium capitalize">{attr.attribut.nom}:</span>
            {attr.hex_code ? (
              <div className="flex items-center gap-1">
                <div
                  className="h-4 w-4 rounded-full border"
                  style={{ backgroundColor: attr.hex_code }}
                />
                <span className="text-sm">{attr.valeur}</span>
              </div>
            ) : (
              <span className="text-sm">{attr.valeur}</span>
            )}
          </div>
        ))}
      </div>
    )
  }

  if (loading) {
    return <OrderDetailSkeleton />
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-red-100 dark:bg-red-900 p-3 text-red-600 dark:text-red-300">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground">Erreur</h1>
        <p className="mb-4 text-muted-foreground">{error}</p>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </button>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 rounded-full bg-yellow-100 dark:bg-yellow-900 p-3 text-yellow-600 dark:text-yellow-300">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-xl font-bold text-foreground">Commande non trouvée</h1>
        <p className="mb-4 text-muted-foreground">La commande que vous recherchez n'existe pas ou a été supprimée.</p>
        <Link
          href="/commandes"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la liste des commandes
        </Link>
      </div>
    )
  }

  const currentStep = getStatusStep(order.status)

  return (
    <div className="p-4 md:p-6">
      {/* Fil d'Ariane */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={() => router.back()} className="flex items-center text-primary hover:underline">
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          Retour
        </button>
        <span>›</span>
        <Link href="/commandes" className="hover:text-primary">
          Commandes
        </Link>
        <span>›</span>
        <span className="text-foreground">#{order.number}</span>
      </div>

      {/* En-tête */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="mb-1 text-xl font-bold text-foreground md:text-2xl">Commande #{order.number}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              {formatDate(order.created_at)}
            </div>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                order.status,
              )}`}
            >
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        <div className="mt-4 flex gap-2 md:mt-0">
          <button className="inline-flex items-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground">
            <Download className="mr-1.5 h-4 w-4" />
            Facture
          </button>
          <button className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            <ExternalLink className="mr-1.5 h-4 w-4" />
            Voir sur le site
          </button>
        </div>
      </div>

      {/* Suivi de commande */}
      <div className="mb-8 rounded-lg border border-border bg-card p-4">
        <h2 className="mb-4 text-sm font-medium text-foreground">Statut de la commande</h2>
        <div className="relative">
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 bg-muted"></div>
          <div
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 bg-primary transition-all duration-500"
            style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
          ></div>

          <div className="relative flex justify-between">
            {[
              { icon: Clock, label: "En attente" },
              { icon: Package, label: "Accepté" },
              { icon: Truck, label: "En livraison" },
              { icon: Check, label: "Livré" },
            ].map((step, index) => {
              const Icon = step.icon
              const isActive = index + 1 <= currentStep
              const isCurrent = index + 1 === currentStep
              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : isCurrent
                          ? "border-2 border-primary bg-background text-primary"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isActive ? "text-primary" : isCurrent ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Produits commandés */}
        <div className="space-y-6 md:col-span-2">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-medium text-foreground">
              Produits commandés ({order?.total_products})
            </h2>
            <div className="divide-y divide-border">
              {order?.order_items.map((item) => (
                <OrderItem key={item.pk} item={item} />
              ))}
            </div>
            
            {/* Résumé des prix */}
            <div className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{Number(order?.total_price).toLocaleString()} GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Frais de livraison</span>
                <span>{Number(order?.total_delivery).toLocaleString()} GNF</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Réduction</span>
                  <span>-{Number(order.discount).toLocaleString()} GNF</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2 font-medium">
                <span>Total</span>
                <span>{(
                  Number(order?.total_price) + 
                  Number(order?.total_delivery) - 
                  (order.discount ? Number(order.discount) : 0)
                ).toLocaleString()} GNF</span>
              </div>
            </div>
          </div>

          {/* Informations client */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-medium text-foreground">Informations client</h2>
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="flex-1 rounded-md bg-muted p-4">
                <div className="mb-3 flex items-center">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">Client</h3>
                </div>
                <p className="text-sm font-medium text-foreground">
                  {order.user?.first_name} {order.user?.last_name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{order.user?.email}</p>
                {order.user?.phone && (
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    {order.user?.phone}
                  </div>
                )}
                <Link
                  href={`/utilisateurs/${order.user?.id}`}
                  className="mt-3 inline-flex items-center text-xs font-medium text-primary hover:underline"
                >
                  <ExternalLink className="mr-1 h-3 w-3" />
                  Voir le profil
                </Link>
              </div>

              <div className="flex-1 rounded-md bg-muted p-4">
                <div className="mb-3 flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium text-foreground">Adresse de livraison</h3>
                </div>
                <p className="text-sm text-foreground">{order.delivery?.address}</p>
                <p className="text-sm text-foreground">
                  {order.delivery?.ville}
                  {order.delivery?.pays && `, ${order.delivery?.pays}`}
                </p>
                {order.delivery?.telephone && (
                  <div className="mt-2 flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-1.5 h-3.5 w-3.5" />
                    {order.delivery?.telephone}
                  </div>
                )}
              </div>
            </div>

            {/* Carte Google Maps */}
            {order.delivery?.latitude && order.delivery?.longitude && (
              <div className="mt-4 h-[200px] overflow-hidden rounded-md border border-border">
                <iframe
                  title="Adresse de livraison"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyDKB9oTWKPT3cb3ueulmi6HxtvNqHOWdzE&q=${order.delivery.latitude},${order.delivery.longitude}&zoom=15`}
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </div>

          {/* Livreur */}
          {order.deliverer && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="mb-4 text-base font-medium text-foreground">Livreur</h2>
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-muted">
                  <Image
                    src={order.deliverer?.user?.image || "/placeholder.svg?height=48&width=48"}
                    alt={`${order.deliverer?.user?.first_name} ${order.deliverer?.user?.last_name}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {order.deliverer?.user?.first_name} {order.deliverer?.user?.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">{order.deliverer?.user?.phone}</p>
                </div>
                <div className="ml-auto flex gap-2">
                  <a
                    href={`tel:${order.deliverer?.user?.phone}`}
                    className="inline-flex items-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Phone className="mr-1.5 h-4 w-4" />
                    Appeler
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Résumé de la commande */}
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-medium text-foreground">Résumé de la commande</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="text-foreground">{Number(order.total_price || 0).toLocaleString()} GNF</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Frais de livraison</span>
                <span className="text-foreground">{Number(order.total_delivery || 0).toLocaleString()} GNF</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                  <span>Réduction</span>
                  <span>-{Number(order.discount || 0).toLocaleString()} GNF</span>
                </div>
              )}
              <div className="border-t border-border pt-3 mt-3">
                <div className="flex justify-between font-medium">
                  <span className="text-foreground">Total</span>
                  <span className="text-lg text-foreground">
                    {(Number(order.total_price || 0) + Number(order.total_delivery || 0) - (order.discount ? Number(order.discount) : 0)).toLocaleString()} GNF
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Méthode de paiement */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-medium text-foreground">Méthode de paiement</h2>
            <div className="flex items-center gap-3">
              {order.cash_on_delivery ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                  <CreditCard className="h-5 w-5" />
                </div>
              ) : (
                <Image
                  src={getPaymentMethodIcon(order.payment_method) || "/placeholder.svg"}
                  alt={order.payment_method}
                  width={40}
                  height={40}
                  className="rounded"
                />
              )}
              <div>
                <p className="font-medium text-foreground">
                  {getPaymentMethodText(order.payment_method)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {order.payment_status === "completed" ? "Payé" : "En attente de paiement"}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="mb-4 text-base font-medium text-foreground">Actions</h2>
            <div className="space-y-3">
              {order?.status === "pending" && (
                <button
                  onClick={handleAcceptOrder}
                  disabled={isAccepting}
                  className="flex w-full items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAccepting ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin">⌛</span>
                      Acceptation en cours...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Accepter la commande
                    </>
                  )}
                </button>
              )}
              <button className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                <RefreshCw className="mr-2 h-4 w-4" />
                Mettre à jour le statut
              </button>
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice || !order?.recu}
                className="flex w-full items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {downloadingInvoice ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin">⌛</span>
                    Chargement...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {order?.recu ? "Voir la facture" : "Facture non disponible"}
                  </>
                )}
              </button>

                {/* SECTION CODE PROMO  SI LA COMMANDE EST PAYEE AVEC UN CODE PROMO */}
      {order?.promo_code &&(
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-medium text-foreground">
            Code promo
          </h2>
<p>
 <span className="text-muted-foreground"> Code :</span>
  {
    order.promo_code.code
  }
</p>
<p>
  <span className="text-muted-foreground"> Type :</span>
  {
    order.promo_code.discount_type
  }
</p>
<p>
  <span className="text-muted-foreground"> Valeur :</span>
  {
    order.promo_code.discount_value
  }
</p>
<p>
  <span className="text-muted-foreground"> Date de fin :</span>
  {
    order.promo_code.end_date
  }
</p>
        </div>
      )}
            </div>
          </div>
        </div>
      </div>

      {/* Alternative : Lien direct */}
      {order?.recu && (
        <a
          href={order.recu}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-sm text-primary hover:underline"
        >
          <Download className="mr-1.5 h-4 w-4" />
          Voir la facture
        </a>
      )}
    
      {/* Section Paiement */}
      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 text-base font-medium text-foreground">
          Informations de paiement
        </h2>
        
        <div className="space-y-4">
          {/* En-tête avec méthode et statut */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">
                {getPaymentMethodText(order?.payement?.payment_method)}
              </span>
            </div>
            <PaymentStatusBadge status={order?.payement?.payment_status} />
          </div>

          {/* Détails du paiement */}
          {order?.payement ? (
            <div className="grid gap-3 text-sm">
              {order.payement.payment_method === "paycard" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Numéro de carte</span>
                    <span>{order.payement.paycard_card_number || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Titulaire</span>
                    <span>{order.payement.paycard_account_name || "N/A"}</span>
                  </div>
                </>
              )}
              
              {order.payement.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID Transaction</span>
                  <span className="font-mono">{order.payement.transaction_id}</span>
                </div>
              )}
              
              {order.payement.transaction_ref && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Référence</span>
                  <span className="font-mono">{order.payement.transaction_ref}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-muted-foreground">Montant total</span>
                <span className="font-medium">
                  {Number(order.total_price).toLocaleString()} GNF
                </span>
              </div>

              {order.payement.created_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date</span>
                  <span>
                    {format(new Date(order.payement.created_at), "dd MMM yyyy HH:mm", { locale: fr })}
                  </span>
                </div>
              )}

              {order.payement.paycard_transaction_description && (
                <div className="mt-2 rounded-md bg-accent/50 p-3 text-xs text-muted-foreground">
                  <p>{order.payement.paycard_transaction_description}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-md bg-accent/50 p-3 text-sm text-muted-foreground">
              <p>En attente de confirmation du paiement</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

