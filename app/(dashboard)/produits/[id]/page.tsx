"use client"

import WithAuth from "@/app/hoc/WithAuth"
import axios from "axios"
import { Check, ChevronLeft, Edit, Eye, Plus, Star, Trash2, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useRef, useState } from "react"
import toast, { Toaster } from "react-hot-toast"
import { getAuthToken, getAxiosConfig, HOST_IP, PORT, PROTOCOL_HTTP } from "../../../../constants"

const ProductDetailPage = ({ params }) => {
  const resolvedParams = use(params)
  const { id } = resolvedParams
  const router = useRouter()

  const [product, setProduct] = useState({
    id: 0,
    name: "",
    slug: "",
    short_description: "",
    long_description: "",
    etat_stock: "",
    regular_price: "",
    promo_price: "",
    sku: "",
    stock_status: true,
    quantity: 0,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    product_type: "",
    is_recommended: false,
    categories: [],
    etiquettes: [],
    images: [],
    variantes: [],
    reviews: [],
    stats_star: {
      one_star: 0,
      two_star: 0,
      three_star: 0,
      four_star: 0,
      five_star: 0,
      total_reviews: 0,
      average_rating: 0,
    },
    created_at: "",
    updated_at: "",
  })

  const [error, setError] = useState(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [loadingVariant, setLoadingVariant] = useState(false)
  const [availableAttributes, setAvailableAttributes] = useState([])
  const [availableColors, setAvailableColors] = useState([])
  const [availableSizes, setAvailableSizes] = useState([])
  const [groupedAttributes, setGroupedAttributes] = useState({})
  const fileInputRef = useRef(null)
  const [activeTab, setActiveTab] = useState("details")

  const [newVariante, setNewVariante] = useState({
    attributs: [],
    regular_price: 0,
    promo_price: 0,
    quantity: 0,
    images: [],
    images_url: [],
  })

  const [imageFiles, setImageFiles] = useState([])
  const [imagesPreviews, setImagesPreviews] = useState([])

  const [selectedVariants, setSelectedVariants] = useState([])

  const [editingVariant, setEditingVariant] = useState(null)
  const [editedValues, setEditedValues] = useState({
    quantity: 0,
    regular_price: 0,
    promo_price: 0,
  })

  useEffect(() => {
    const fetchProduct = () => {
      const token = getAuthToken();
      if (!token) {
        router.push("/login")
        return
      }

      axios
        .get(`${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/${id}/`, getAxiosConfig(token))
        .then((response) => {
          if (response.status === 200 || response.status === 201) {
            setProduct(response.data)
            if (response.data.variantes.length > 0) {
              setSelectedVariant(response.data.variantes[0])
            }
            console.log(response.data)
          } else {
            throw new Error("Erreur lors du chargement du produit")
          }
        })
        .catch((err) => {
          console.error("Erreur:", err)
          setError(err.message)
        })
    }

    const fetchAttributes = async () => {
      try {
        const token = getAuthToken();
        if (!token) {
          router.push("/login")
          return
        }
        const response = await axios.get(
          `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/attributes/of/`,
          getAxiosConfig(token),
        )

        

        const { attributs } = response.data
        setAvailableAttributes(attributs)

        const sizes = attributs.filter((attr) => attr.attribut.nom === "size")
        const colors = attributs.filter((attr) => attr.attribut.nom === "color")

        setAvailableSizes(sizes)
        setAvailableColors(colors)

        // Regrouper les autres attributs
        const otherAttrs = attributs.filter((attr) => attr.attribut.nom !== "size" && attr.attribut.nom !== "color")
        const grouped = otherAttrs.reduce((acc, attr) => {
          if (!acc[attr.attribut.nom]) {
            acc[attr.attribut.nom] = []
          }
          acc[attr.attribut.nom].push(attr)
          return acc
        }, {})
        setGroupedAttributes(grouped)
      } catch (error) {
        console.error("Erreur lors de la récupération des attributs:", error)
      }
    }

    if (id) {
      fetchProduct()
    }

    if (showAddVariant) {
      fetchAttributes()
    }
  }, [id, router, showAddVariant])

  const handleDelete = () => {
    const isConfirmed = window.confirm("Confirmez-vous la suppression du produit ?")

    if (!isConfirmed) return

    const token = getAuthToken();
    if (!token) {
      router.push("/login")
      return
    }

    axios
      .delete(`${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/viewset/${id}/`, getAxiosConfig(token))
      .then((res) => {
        if (res.status === 200 || res.status === 204) {
          toast.success("Produit supprimé avec succès")
          router.push("/admin/products")
        } else {
          console.log(res.data)
          toast.error(res.data.detail || "Erreur lors de la suppression du produit")
        }
      })
      .catch((err) => {
        console.error(err)
        toast.error("Erreur lors de la suppression du produit")
      })
  }

  const handleDeleteVariant = async (variantId) => {
    const isConfirmed = window.confirm("Êtes-vous sûr de vouloir supprimer cette variante ?")

    if (!isConfirmed) return

    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login")
        return
      }

      const response = await axios.delete(
        `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/viewset/variante/${variantId}/`,
        getAxiosConfig(token),
      )

      if (response.status === 200 || response.status === 204) {
        toast.success("Variante supprimée avec succès")

        // Rafraîchir les données du produit
        const productResponse = await axios.get(
          `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/${id}/`,
          getAxiosConfig(token),
        )
        if (productResponse.status === 200) {
          setProduct(productResponse.data)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la suppression de la variante:", error)
      toast.error("Erreur lors de la suppression de la variante")
    }
  }

  const handleAttributeChange = (attrId) => {
    setNewVariante((prev) => ({
      ...prev,
      attributs: prev.attributs.includes(attrId)
        ? prev.attributs.filter((id) => id !== attrId)
        : [...prev.attributs, attrId],
    }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)

    // Vérification du type des fichiers
    const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const validFiles = files.filter((file) => validImageTypes.includes(file.type))

    if (validFiles.length !== files.length) {
      toast.error("Certains fichiers ne sont pas des images valides")
      return
    }

    // Mise à jour des fichiers d'images
    setImageFiles((prev) => [...prev, ...validFiles])

    // Création des aperçus
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file))
    setImagesPreviews((prev) => [...prev, ...newPreviews])

    console.log("Fichiers d'images ajoutés:", validFiles)
  }

  const handleRemoveImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagesPreviews((prev) => {
      // Libérer l'URL de l'aperçu
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const handleSelectAllVariants = (e) => {
    if (e.target.checked) {
      setSelectedVariants(product.variantes.map((v) => v.id))
    } else {
      setSelectedVariants([])
    }
  }

  const handleSelectVariant = (variantId) => {
    setSelectedVariants((prev) => {
      if (prev.includes(variantId)) {
        return prev.filter((id) => id !== variantId)
      } else {
        return [...prev, variantId]
      }
    })
  }

  const handleBulkDelete = async () => {
    if (selectedVariants.length === 0) {
      toast.error("Veuillez sélectionner au moins une variante")
      return
    }

    const isConfirmed = window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedVariants.length} variante(s) ?`)

    if (!isConfirmed) return

    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login")
        return
      }

      const deletePromises = selectedVariants.map((variantId) =>
        axios.delete(
          `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/viewset/variante/${variantId}/`,
          getAxiosConfig(token),
        ),
      )

      await Promise.all(deletePromises)

      toast.success(`${selectedVariants.length} variante(s) supprimée(s) avec succès`)
      setSelectedVariants([])

      // Rafraîchir les données du produit
      const productResponse = await axios.get(
        `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/${id}/`,
        getAxiosConfig(token),
      )
      if (productResponse.status === 200) {
        setProduct(productResponse.data)
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des variantes:", error)
      toast.error("Erreur lors de la suppression des variantes")
    }
  }

  const handleUpdateVariant = async (variantId) => {
    try {
      const token = getAuthToken();
      if (!token) {
        router.push("/login")
        return
      }

      // Créer le FormData avec tous les champs nécessaires
      const formData = new FormData()
      formData.append("quantity", editedValues.quantity)
      formData.append("promo_price", editedValues.promo_price)
      formData.append("regular_price", editedValues.regular_price)

      // Si des images sont fournies
      if (editedValues.images) {
        editedValues.images.forEach((image) => {
          formData.append("images", image)
        })
      }

      // Si des URLs d'images sont fournies
      if (editedValues.images_url) {
        editedValues.images_url.forEach((url) => {
          formData.append("images_url", url)
        })
      }

      const response = await axios.put(
        `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/viewset/variante/${variantId}/update-quantity/`,
        formData,
        {
          ...getAxiosConfig(token),
          headers: {
            ...getAxiosConfig(token).headers,
            "Content-Type": "multipart/form-data",
          },
        },
      )

      if (response.status === 200) {
        toast.success("Variante mise à jour avec succès")
        setEditingVariant(null)

        // Rafraîchir les données du produit
        const productResponse = await axios.get(
          `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/${id}/`,
          getAxiosConfig(token),
        )
        if (productResponse.status === 200) {
          setProduct(productResponse.data)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la variante:", error)
      toast.error("Erreur lors de la mise à jour de la variante")
    }
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 max-w-md text-center">
          <div className="text-red-500 bg-red-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <X className="h-8 w-8" />
          </div>
          <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Retour
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#048B9A] text-white rounded-md hover:bg-[#037483]"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-w-[1200px]">
      <Toaster position="top-right" />
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between p-4 md:p-6 border-b gap-4">
          <div className="flex items-center space-x-4">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => router.back()}
              aria-label="Retour"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{product.name}</h1>
              <p className="text-sm text-gray-500 mt-1">
                SKU: {product.sku} • Dernière mise à jour: {new Date(product.updated_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link
              href={`https://kambily.store/boutique/${product.slug}`}
              target="_blank"
              className="inline-flex items-center px-3 py-2 text-sm font-medium border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Eye className="mr-2 h-4 w-4" />
              Voir
            </Link>
            <Link
              href={`/admin/products/${id}/edit`}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-[#048B9A] hover:bg-[#037483] transition-colors"
            >
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-50 px-4 py-2 border-b overflow-x-auto">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("details")}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "details"
                  ? "bg-white text-[#048B9A] shadow-sm border border-gray-200"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
              </svg>
              Détails
            </button>
            <button
              onClick={() => setActiveTab("variants")}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "variants"
                  ? "bg-white text-[#048B9A] shadow-sm border border-gray-200"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              Variantes
            </button>
            <button
              onClick={() => setActiveTab("images")}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "images"
                  ? "bg-white text-[#048B9A] shadow-sm border border-gray-200"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
              Images
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeTab === "reviews"
                  ? "bg-white text-[#048B9A] shadow-sm border border-gray-200"
                  : "text-gray-600 hover:bg-gray-200"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Avis
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {/* Details Tab */}
          {activeTab === "details" && (
            <div className="bg-white rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 border-b pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#048B9A]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="16" x2="12" y2="12"></line>
                      <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    Informations générales
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Prix régulier:</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {product.regular_price} GNF
                      </span>
                    </div>

                    {product.promo_price !== "0.00" && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-700">Prix promotionnel:</span>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {product.promo_price} GNF
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Type de produit:</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {product.product_type}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">État du stock:</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                          product.stock_status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {product.etat_stock}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Quantité:</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {product.quantity}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Recommandé:</span>
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                          product.is_recommended ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {product.is_recommended ? "Oui" : "Non"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 border-b pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#048B9A]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    </svg>
                    Caractéristiques
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Poids:</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {product.weight} kg
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Dimensions:</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {product.length} × {product.width} × {product.height} cm
                      </span>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700 block mb-2">Catégories:</span>
                      <div className="flex flex-wrap gap-2">
                        {product.categories.length > 0 ? (
                          product.categories.map((category, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3 mr-1"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                <line x1="7" y1="7" x2="7.01" y2="7"></line>
                              </svg>
                              {category.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm italic">Aucune catégorie</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700 block mb-2">Étiquettes:</span>
                      <div className="flex flex-wrap gap-2">
                        {product.etiquettes.length > 0 ? (
                          product.etiquettes.map((etiquette, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {etiquette.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm italic">Aucune étiquette</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-[#048B9A]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                  </svg>
                  Description courte
                </h3>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  {product.short_description ? (
                    <p className="text-gray-700">{product.short_description}</p>
                  ) : (
                    <p className="text-gray-500 italic">Aucune description courte</p>
                  )}
                </div>
              </div>

              <div className="mt-6 bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2 text-[#048B9A]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Description longue
                </h3>
                <div className="bg-gray-50 p-4 rounded-md border border-gray-100">
                  {product.long_description ? (
                    <p className="text-gray-700 whitespace-pre-wrap">{product.long_description}</p>
                  ) : (
                    <p className="text-gray-500 italic">Aucune description longue</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Variants Tab */}
          {activeTab === "variants" && (
            <div className="p-4 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-800">Variantes du produit</h2>
                <button
                  onClick={handleAddVariantClick}
                  className="inline-flex items-center px-4 py-2 bg-[#048B9A] text-white rounded-md hover:bg-[#037483]"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une variante
                </button>
              </div>

              {product.variantes.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Aucune variante</h3>
                  <p className="text-gray-500 mb-4">Ce produit n'a pas encore de variantes.</p>
                  <button
                    onClick={handleAddVariantClick}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-[#048B9A] hover:bg-[#037483] transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une variante
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3">
                          <input
                            type="checkbox"
                            checked={
                              selectedVariants.length === product.variantes.length && product.variantes.length > 0
                            }
                            onChange={handleSelectAllVariants}
                            className="rounded border-gray-300 text-[#048B9A] focus:ring-[#048B9A]"
                          />
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Attributs
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Prix
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Quantité
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Images
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {product.variantes.map((variant, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <input
                              type="checkbox"
                              checked={selectedVariants.includes(variant.id)}
                              onChange={() => handleSelectVariant(variant.id)}
                              className="rounded border-gray-300 text-[#048B9A] focus:ring-[#048B9A]"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {variant.attributs.map((attr, attrIndex) => (
                              <div key={attrIndex} className="flex items-center mb-1">
                                {attr.attribut.nom === "color" ? (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-[#048B9A]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <circle cx="12" cy="12" r="6"></circle>
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2 text-[#048B9A]"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.47a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.47a2 2 0 00-1.34-2.23z"></path>
                                  </svg>
                                )}
                                <span className="font-medium text-gray-700">{attr.attribut.nom}:</span>
                                <span className="ml-1 text-gray-600">{attr.valeur}</span>
                                {attr.hex_code && (
                                  <span
                                    className="ml-2 inline-block w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: attr.hex_code }}
                                  ></span>
                                )}
                              </div>
                            ))}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingVariant === variant.id ? (
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <label className="text-xs text-gray-500 w-12">Régulier:</label>
                                  <input
                                    type="number"
                                    value={editedValues.regular_price}
                                    onChange={(e) =>
                                      setEditedValues((prev) => ({ ...prev, regular_price: Number(e.target.value) }))
                                    }
                                    className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#048B9A] focus:border-[#048B9A]"
                                    min="0"
                                  />
                                </div>
                                <div className="flex items-center">
                                  <label className="text-xs text-gray-500 w-12">Promo:</label>
                                  <input
                                    type="number"
                                    value={editedValues.promo_price}
                                    onChange={(e) =>
                                      setEditedValues((prev) => ({ ...prev, promo_price: Number(e.target.value) }))
                                    }
                                    className="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#048B9A] focus:border-[#048B9A]"
                                    min="0"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1">
                                <div className="text-sm font-medium text-gray-900">{variant.regular_price} GNF</div>
                                {variant.promo_price !== "0.00" && (
                                  <div className="text-xs text-green-600">Promo: {variant.promo_price} GNF</div>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingVariant === variant.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={editedValues.quantity}
                                  onChange={(e) =>
                                    setEditedValues((prev) => ({ ...prev, quantity: Number(e.target.value) }))
                                  }
                                  className="w-20 px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-[#048B9A] focus:border-[#048B9A]"
                                  min="0"
                                />
                                <button
                                  onClick={() => handleUpdateVariant(variant.id)}
                                  className="p-1 text-[#048B9A] hover:text-[#037483] focus:outline-none"
                                  title="Enregistrer"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setEditingVariant(null)}
                                  className="p-1 text-red-600 hover:text-red-800 focus:outline-none"
                                  title="Annuler"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{variant.quantity}</span>
                                <button
                                  onClick={() => {
                                    setEditingVariant(variant.id)
                                    setEditedValues({
                                      quantity: variant.quantity,
                                      regular_price: variant.regular_price,
                                      promo_price: variant.promo_price,
                                    })
                                  }}
                                  className="p-1 text-[#048B9A] hover:text-[#037483] focus:outline-none"
                                  title="Modifier"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              {/* Image principale */}
                              {variant.image && (
                                <div className="relative group">
                                  <Image
                                    src={variant.image || "/placeholder.svg?height=50&width=50"}
                                    alt={`Variante ${index + 1} Image principale`}
                                    width={50}
                                    height={50}
                                    className="rounded-md object-cover border border-gray-200"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Eye className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              )}
                              {/* Images de la galerie */}
                              {variant.images.slice(0, 2).map((img, imgIndex) => (
                                <div key={imgIndex} className="relative group">
                                  <Image
                                    src={img.image || "/placeholder.svg?height=50&width=50"}
                                    alt={`Variante ${index + 1} Image ${imgIndex + 1}`}
                                    width={50}
                                    height={50}
                                    className="rounded-md object-cover border border-gray-200"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <Eye className="h-4 w-4 text-white" />
                                  </div>
                                </div>
                              ))}
                              {(variant.images.length > 2 || (variant.image && variant.images.length > 1)) && (
                                <div className="w-12 h-12 bg-gray-200 rounded-md flex items-center justify-center text-sm font-medium text-gray-700">
                                  +{variant.images.length + (variant.image ? 1 : 0) - (variant.image ? 3 : 2)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleDeleteVariant(variant.id)}
                                className="inline-flex items-center p-1.5 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                title="Supprimer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Images Tab */}
          {activeTab === "images" && (
            <div className="bg-white rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 border-b pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#048B9A]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Image principale
                  </h3>
                  <div className="aspect-square rounded-lg overflow-hidden mb-4 border-4 border-gray-200">
                    {product.images.length > 0 ? (
                      <Image
                        src={product.images[selectedImageIndex].image || "/placeholder.svg"}
                        alt={product.name}
                        width={500}
                        height={500}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-16 w-16 text-gray-400"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    {product.images.length > 0
                      ? `Image ${selectedImageIndex + 1} sur ${product.images.length}`
                      : "Aucune image disponible"}
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 border-b pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#048B9A]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Galerie d'images
                  </h3>
                  {product.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-4">
                      {product.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                            selectedImageIndex === index
                              ? "border-[#048B9A]"
                              : "border-transparent hover:border-gray-200"
                          }`}
                        >
                          <Image
                            src={image.image || "/placeholder.svg?height=100&width=100"}
                            alt={`${product.name} ${index + 1}`}
                            width={100}
                            height={100}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-400 mx-auto mb-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                      </svg>
                      <p className="text-gray-500">Aucune image disponible</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Vous pouvez ajouter des images en modifiant le produit
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-lg">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm w-full md:w-2/3">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 border-b pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#048B9A]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    Avis clients
                  </h3>

                  {product.reviews.length === 0 ? (
                    <div className="text-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-12 text-gray-400 mx-auto mb-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                      </svg>
                      <p className="text-gray-500">Aucun commentaire sur ce produit</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Les avis clients apparaîtront ici lorsqu'ils seront disponibles
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-2">
                      {product.reviews.map((review, index) => (
                        <div
                          key={index}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="flex-shrink-0">
                              <Image
                                src={review.user.image || "/placeholder.svg?height=40&width=40"}
                                width={40}
                                height={40}
                                className="rounded-full border border-gray-200"
                                alt={`${review.user.first_name} ${review.user.last_name}`}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-semibold text-gray-800">
                                  {review.user.first_name} {review.user.last_name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3.5 w-3.5 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                              <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm w-full md:w-1/3">
                  <h3 className="text-lg font-semibold mb-4 flex items-center text-gray-800 border-b pb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2 text-[#048B9A]"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    Statistiques
                  </h3>

                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-gray-800">{product.stats_star.average_rating.toFixed(1)}</p>
                    <div className="flex items-center justify-center my-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= Math.round(product.stats_star.average_rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500">{product.stats_star.total_reviews} avis</p>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-md font-semibold mb-3 text-gray-700">Répartition des évaluations</h4>
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((star) => (
                        <div key={star} className="flex items-center">
                          <span className="w-8 text-sm text-gray-700 flex items-center">
                            {star} <Star className="h-3 w-3 ml-1 text-yellow-400 fill-yellow-400" />
                          </span>
                          <div className="flex-1 mx-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-yellow-400"
                              style={{
                                width: `${(product.stats_star[`${star}_star`] / Math.max(1, product.stats_star.total_reviews)) * 100}%`,
                              }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-700 w-8 text-right">
                            {product.stats_star[`${star}_star`]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WithAuth(ProductDetailPage)

