"use client"
import WithAuth from "@/app/hoc/WithAuth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getAxiosConfig } from "@/constants/client"
import { useAddImages, useDeleteImages, useDeleteProduct, useProductDetail, useDeleteVariant } from "@/hooks/api/products"
import { ProductAttribute, ProductStats } from "@/lib/types/products"
import axios from "axios"
import { Calendar, ChevronLeft, Edit, Eye, Plus, Star, Trash2 } from "lucide-react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import { HOST_IP, PORT, PROTOCOL_HTTP } from "../../../../constants"

const ProductDetailPage = () => {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const { data: product, isLoading, isError, error } = useProductDetail(id);
  const { mutate: addImages, isPending: isAddingImages } = useAddImages();
  const { mutate: deleteImages } = useDeleteImages();
  const { mutate: deleteProduct, isPending: isDeletingProduct } = useDeleteProduct();
  const { mutate: deleteVariant, isPending: isDeletingVariant } = useDeleteVariant();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loadingVariant, setLoadingVariant] = useState(false);
  const [availableAttributes, setAvailableAttributes] = useState<ProductAttribute[]>([]);
  const [availableColors, setAvailableColors] = useState<ProductAttribute[]>([]);
  const [availableSizes, setAvailableSizes] = useState<ProductAttribute[]>([]);
  const [groupedAttributes, setGroupedAttributes] = useState<Record<string, ProductAttribute[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("details");

  const [newVariante, setNewVariante] = useState({
    attributs: [],
    regular_price: 0,
    promo_price: 0,
    quantity: 0,
    images: [],
    images_url: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [editingVariant, setEditingVariant] = useState(null);
  const [editedValues, setEditedValues] = useState({
    quantity: 0,
    regular_price: 0,
    promo_price: 0,
  });

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
       
        const response = await axios.get(
          `${PROTOCOL_HTTP}://${HOST_IP}${PORT}/products/attributes/of/`,
          getAxiosConfig(),
        );

        const { attributs } = response.data;
        setAvailableAttributes(attributs);

        const sizes = attributs.filter((attr: ProductAttribute) => attr.attribut.nom === "size");
        const colors = attributs.filter((attr: ProductAttribute) => attr.attribut.nom === "color");

        setAvailableSizes(sizes);
        setAvailableColors(colors);

        // Regrouper les autres attributs
        const otherAttrs = attributs.filter((attr: ProductAttribute) => attr.attribut.nom !== "size" && attr.attribut.nom !== "color");
        const grouped = otherAttrs.reduce((acc: Record<string, ProductAttribute[]>, attr: ProductAttribute) => {
          if (!acc[attr.attribut.nom]) {
            acc[attr.attribut.nom] = [];
          }
          acc[attr.attribut.nom].push(attr);
          return acc;
        }, {});
        setGroupedAttributes(grouped);
      } catch (error) {
        console.error("Erreur lors de la récupération des attributs:", error);
      }
    };

    if (id) {
      fetchAttributes();
    }
  }, [id, router]);

  const formatPrice = (price: number | string): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(price));
  };

  const handleDelete = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      deleteProduct(id, {
        onSuccess: () => {
          toast.success("Produit supprimé avec succès");
          router.push("/produits");
        },
        onError: (error) => {
          console.error("Erreur lors de la suppression:", error);
          toast.error("Erreur lors de la suppression du produit");
        }
      });
    }
  };

  const handleAddImages = () => {
    imageInputRef.current?.click();
  };

  const handleImageFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('images', file);
    });

    addImages(
      { id, data: formData },
      {
        onSuccess: () => {
          toast.success("Images ajoutées avec succès");
          if (imageInputRef.current) {
            imageInputRef.current.value = '';
          }
        },
        onError: (error) => {
          console.error("Erreur lors de l'ajout d'images:", error);
          toast.error("Erreur lors de l'ajout d'images");
        }
      }
    );
  };

  const handleDeleteImage = (imageId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // Empêcher la sélection de l'image
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
      deleteImages({product_image_id: imageId}, {
        onSuccess: () => {
          toast.success("Image supprimée avec succès");
          // Réinitialiser l'index sélectionné si nécessaire
          // if (selectedImageIndex >= product?.images?.length - 1) {
          //   setSelectedImageIndex(Math.max(0, product?.images?.length - 2));
          // }
        },
        onError: (error) => {
          console.error("Erreur lors de la suppression de l'image:", error);
          toast.error("Erreur lors de la suppression de l'image");
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Skeleton className="h-[400px] rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-[400px] rounded-lg" />
          </div>
        </div>

        <div className="mt-8">
          <div className="border-b mb-4">
            <div className="flex gap-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
          
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <Button variant="outline" size="icon" onClick={() => router.push("/produits")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Détails du produit</h1>
        </div>
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 text-center">
            <div className="text-red-500 text-4xl mb-4">⚠️</div>
            <CardTitle className="text-red-700 mb-2">Erreur de chargement</CardTitle>
            <CardDescription className="text-red-600 mb-4">{error?.message}</CardDescription>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!product) {
    return <div>Produit non trouvé</div>;
  }

  const getStarCount = (star: number): number => {
    if (!product?.stats_star) return 0;
    const key = `${star}_star` as keyof ProductStats;
    return product.stats_star[key] || 0;
  };

  const groupVariantsByMainAttribute = (variants: any) => {
    // Nouveau regroupement : tableau ou objet
    const grouped: Record<string, any[]> = {};
    const autres: any[] = [];

    if (Array.isArray(variants)) {
      variants.forEach(variant => {
        if (variant.main_attribut) {
          const mainAttributeKey = `${variant.main_attribut.attribut.nom}: ${variant.main_attribut.valeur}`;
          if (!grouped[mainAttributeKey]) grouped[mainAttributeKey] = [];
          grouped[mainAttributeKey].push(variant);
        } else {
          autres.push(variant);
        }
      });
      if (autres.length > 0) {
        grouped['Autre'] = autres;
      }
      return grouped;
    }
    // Si c'est un objet (ancien format), garder la logique précédente
    if (typeof variants === 'object' && variants !== null) {
      Object.entries(variants).forEach(([variantType, variantData]) => {
        if (variantData && typeof variantData === 'object' && 'items' in variantData && Array.isArray((variantData as any).items)) {
          const itemsByMainAttribute: Record<string, any[]> = {};
          (variantData as any).items.forEach((item: any) => {
            if (item.main_attribut) {
              const mainAttributeValue = item.main_attribut.valeur;
              if (!itemsByMainAttribute[mainAttributeValue]) {
                itemsByMainAttribute[mainAttributeValue] = [];
              }
              itemsByMainAttribute[mainAttributeValue].push(item);
            } else {
              autres.push(item);
            }
          });
          Object.entries(itemsByMainAttribute).forEach(([mainAttributeValue, items]) => {
            const mainAttributeKey = `${variantType.toUpperCase()}: ${mainAttributeValue}`;
            if (!grouped[mainAttributeKey]) {
              grouped[mainAttributeKey] = [];
            }
            grouped[mainAttributeKey].push(...items);
          });
        } else if (Array.isArray(variantData)) {
          variantData.forEach((variant) => {
            if (variant.main_attribut) {
              const mainAttributeKey = `${variantType.toUpperCase()}: ${variant.main_attribut.valeur}`;
              if (!grouped[mainAttributeKey]) {
                grouped[mainAttributeKey] = [];
              }
              grouped[mainAttributeKey].push(variant);
            } else {
              autres.push(variant);
            }
          });
        }
      });
      if (autres.length > 0) {
        grouped['Autre'] = autres;
      }
      return grouped;
    }
    return grouped;
  };

  // Fonction pour obtenir les attributs secondaires d'une variante
  const getSecondaryAttributes = (variant: any) => {
    // Nouveau format : utiliser attributs directement
    if (variant.attributs && Array.isArray(variant.attributs)) {
      if (variant.attributs.length <= 1) return [];
      return variant.attributs.slice(1);
    }
    return [];
  };

  // Fonction pour obtenir le nom de l'attribut principal
  const getMainAttributeName = (variant: any, variantType?: string) => {
    // Si on a le type de variante, l'utiliser en priorité
    if (variantType) {
      return variantType.charAt(0).toUpperCase() + variantType.slice(1);
    }
    
    // Nouveau format : utiliser main_attribut
    if (variant.main_attribut) {
      return variant.main_attribut.attribut.nom.charAt(0).toUpperCase() + variant.main_attribut.attribut.nom.slice(1);
    }
    
    // Fallback pour l'ancien format
    if (variant.attributs && variant.attributs.length > 0) {
      return variant.attributs[0].attribut.nom.charAt(0).toUpperCase() + variant.attributs[0].attribut.nom.slice(1);
    }
    
    return "Sans attribut";
  };

  // Fonction pour obtenir la valeur de l'attribut principal
  const getMainAttributeValue = (variant: any) => {
    // Nouveau format : utiliser main_attribut
    if (variant.main_attribut) {
      return variant.main_attribut.valeur;
    }
    
    // Fallback pour l'ancien format
    if (variant.attributs && variant.attributs.length > 0) {
      return variant.attributs[0].valeur;
    }
    
    return "";
  };

  // Fonction pour formater les attributs secondaires en texte
  const formatSecondaryAttributes = (variant: any) => {
    const secondaryAttrs = getSecondaryAttributes(variant);
    if (secondaryAttrs.length === 0) return "Aucun attribut secondaire";
    
    return secondaryAttrs.map((attr: any) => `${attr.attribut.nom}: ${attr.valeur}`).join(", ");
  };

  // Fonction pour obtenir toutes les variantes uniques (sans doublons)
  const getUniqueVariants = (variants: any[]) => {
    const uniqueVariants: any[] = [];
    const seenIds = new Set();
    
    variants.forEach(variant => {
      if (!seenIds.has(variant.id)) {
        seenIds.add(variant.id);
        uniqueVariants.push(variant);
      }
    });
    
    return uniqueVariants;
  };

  // Fonction pour obtenir un résumé des attributs secondaires d'un groupe
  const getSecondaryAttributesSummary = (variants: any[]) => {
    if (variants.length === 0) return "Aucun attribut secondaire";
    
    // Prendre la première variante comme référence pour les attributs secondaires
    const firstVariant = variants[0];
    const secondaryAttrs = getSecondaryAttributes(firstVariant);
    
    if (secondaryAttrs.length === 0) return "Aucun attribut secondaire";
    
    return secondaryAttrs.map((attr: any) => `${attr.attribut.nom}: ${attr.valeur}`).join(", ");
  };

  // Fonction pour obtenir le nombre total de variantes
  const getTotalVariantsCount = (variants: any) => {
    if (typeof variants === 'object' && !Array.isArray(variants)) {
      // Nouveau format : compter les variantes uniques par main_attribut
      return Object.values(variants).reduce((total: number, variantData: any) => {
        // Nouveau format : variantData est un objet avec une propriété items
        if (variantData && typeof variantData === 'object' && 'items' in variantData && Array.isArray((variantData as any).items)) {
          // Grouper par main_attribut pour compter les variantes uniques
          const uniqueMainAttributes = new Set();
          (variantData as any).items.forEach((item: any) => {
            if (item.main_attribut) {
              uniqueMainAttributes.add(item.main_attribut.valeur);
            }
          });
          return total + uniqueMainAttributes.size;
        }
        // Ancien format : variantData est directement un tableau
        else if (Array.isArray(variantData)) {
          return total + variantData.length;
        }
        return total;
      }, 0);
    }
    
    // Fallback pour l'ancien format
    return Array.isArray(variants) ? variants.length : 0;
  };

  // Fonction pour obtenir les types de variantes disponibles
  const getVariantTypes = (variants: any) => {
    if (typeof variants === 'object' && !Array.isArray(variants)) {
      return Object.keys(variants);
    }
    return [];
  };

  // Fonction pour obtenir le nombre de variantes par type
  const getVariantsCountByType = (variants: any) => {
    if (typeof variants === 'object' && !Array.isArray(variants)) {
      const counts: Record<string, number> = {};
      Object.entries(variants).forEach(([type, variantData]) => {
        // Nouveau format : variantData est un objet avec une propriété items
        if (variantData && typeof variantData === 'object' && 'items' in variantData && Array.isArray((variantData as any).items)) {
          // Compter les variantes uniques par main_attribut
          const uniqueMainAttributes = new Set();
          (variantData as any).items.forEach((item: any) => {
            if (item.main_attribut) {
              uniqueMainAttributes.add(item.main_attribut.valeur);
            }
          });
          counts[type] = uniqueMainAttributes.size;
        }
        // Ancien format : variantData est directement un tableau
        else if (Array.isArray(variantData)) {
          counts[type] = variantData.length;
        }
        else {
          counts[type] = 0;
        }
      });
      return counts;
    }
    return {};
  };

  const handleDeleteVariant = async (variantId: number, variantName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la variante "${variantName}" ?`)) {
      deleteVariant(variantId, {
        onSuccess: () => {
          toast.success("Variante supprimée avec succès");
        },
        onError: (error) => {
          console.error("Erreur lors de la suppression de la variante:", error);
          toast.error("Erreur lors de la suppression de la variante");
        }
      });
    }
  };

  const handleDeleteAllVariantsInGroup = async (variants: any[], groupName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer toutes les variantes du groupe "${groupName}" ? Cette action est irréversible.`)) {
      const deletePromises = variants.map((variant) => 
        new Promise((resolve, reject) => {
          deleteVariant(variant.id, {
            onSuccess: () => resolve(true),
            onError: (error) => reject(error)
          });
        })
      );

      try {
        await Promise.all(deletePromises);
        toast.success(`Toutes les variantes du groupe "${groupName}" ont été supprimées`);
      } catch (error) {
        console.error("Erreur lors de la suppression des variantes:", error);
        toast.error("Erreur lors de la suppression des variantes");
      }
    }
  };

  return (
    <div className="p-6 dark:bg-black dark:text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/produits")} 
            className="dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{product?.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
            onClick={() => router.push(`/produits/${id}/modifier`)}
          >
            <Edit className="h-4 w-4" />
            Modifier
          </Button>
          <Button 
            variant="destructive" 
            className="flex items-center gap-2 dark:bg-red-900 dark:hover:bg-red-800"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
            Supprimer
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="overflow-hidden border-gray-200 dark:border-gray-800 dark:bg-gray-900">
            <div className="aspect-video bg-gray-100 dark:bg-black relative">
              {product?.images && product.images.length > 0 ? (
                <img
                  src={product.images[selectedImageIndex]?.image || "/placeholder.svg"}
                  alt={product.name}
                  className="object-contain w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground dark:text-gray-500">
                  Pas d'image disponible
                </div>
              )}
            </div>
            {product?.images && product.images.length > 1 && (
              <div className="p-4 flex gap-2 overflow-x-auto dark:bg-gray-900">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 relative group ${
                      selectedImageIndex === index ? "border-primary dark:border-blue-500" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image.image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                    {/* Bouton de suppression */}
                    <button
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => handleDeleteImage(image.id, e)}
                      title="Supprimer cette image"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <div
                  className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  onClick={handleAddImages}
                  title="Ajouter des images"
                >
                  {isAddingImages ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 dark:border-gray-500"></div>
                  ) : (
                    <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              </div>
            )}
            {(!product?.images || product.images.length <= 1) && (
              <div className="p-4 flex gap-2 overflow-x-auto dark:bg-gray-900">
                {product?.images && product.images.length === 1 && (
                  <div
                    className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 relative group ${
                      selectedImageIndex === 0 ? "border-primary dark:border-blue-500" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImageIndex(0)}
                  >
                    <img src={product.images[0].image} alt={`${product.name} 1`} className="w-full h-full object-cover" />
                    {/* Bouton de suppression */}
                    <button
                      className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => handleDeleteImage(product.images[0].id, e)}
                      title="Supprimer cette image"
                    >
                      ×
                    </button>
                  </div>
                )}
                <div
                  className="w-16 h-16 rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
                  onClick={handleAddImages}
                  title="Ajouter des images"
                >
                  {isAddingImages ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400 dark:border-gray-500"></div>
                  ) : (
                    <Plus className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
              </div>
            )}
          </Card>
        </div>

        <div>
          <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900 h-full">
            <CardHeader className="pb-3 border-b dark:border-gray-800">
              <CardTitle className="text-xl text-gray-800 dark:text-white">Informations produit</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Prix</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold dark:text-white">{formatPrice(product?.regular_price || 0)}</p>
                    {product?.promo_price && Number(product.promo_price) > 0 && (
                      <p className="text-lg line-through text-muted-foreground dark:text-gray-500">{formatPrice(product.promo_price)}</p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">SKU</p>
                  <p className="font-medium dark:text-gray-200">{product?.sku}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Stock</p>
                  <div className="flex items-center gap-2">
                    <Badge 
                      className={`${
                        product?.etat_stock === "En Stock" 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" 
                          : product?.etat_stock === "Stock faible" 
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300" 
                          : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                      }`}
                    >
                      {product?.etat_stock}
                    </Badge>
                    <span className="text-gray-600 dark:text-gray-300">{product?.quantity} unités</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Catégories</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product?.categories?.map((category) => (
                      <Badge key={category.id} variant="outline" className="bg-muted dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Type de produit</p>
                  <Badge 
                    className={`${
                      product?.product_type === "variable" 
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300" 
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                    }`}
                  >
                    {product?.product_type === "variable" ? "Variable" : "Simple"}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium text-muted-foreground dark:text-gray-400">Date de création</p>
                  <p className="font-medium flex items-center gap-1 dark:text-gray-300">
                    <Calendar className="h-3 w-3 text-muted-foreground dark:text-gray-500" />
                    {product?.created_at && new Date(product.created_at).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-8">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 dark:bg-gray-900">
            <TabsTrigger value="details" className="dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white dark:text-gray-400">Description</TabsTrigger>
            {product.product_type === "variable" && (
              <TabsTrigger value="variants" className="dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white dark:text-gray-400">
                Variantes ({getTotalVariantsCount(product?.variantes || {})})
                {getVariantTypes(product?.variantes || {}).length > 0 && (
                  <span className="ml-1 text-xs opacity-70">
                    [{getVariantTypes(product?.variantes || {}).join(", ")}]
                  </span>
                )}
              </TabsTrigger>
            )}
            <TabsTrigger value="reviews" className="dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-white dark:text-gray-400">
              Avis ({product.reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
              <CardHeader>
                <CardTitle className="dark:text-white">Description</CardTitle>
                <CardDescription className="dark:text-gray-400">Détails complets du produit</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none dark:prose-invert dark:text-gray-300">
                  {product.long_description ? (
                    <div dangerouslySetInnerHTML={{ __html: product.long_description }} />
                  ) : (
                    <p className="text-muted-foreground dark:text-gray-500">Aucune description détaillée disponible pour ce produit.</p>
                  )}
                </div>

                {(product.weight > 0 || product.length > 0 || product.width > 0 || product.height > 0) && (
                  <div className="mt-8 border-t pt-6 dark:border-gray-800">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Dimensions et poids</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {product.weight > 0 && (
                        <div className="bg-muted p-4 rounded-lg dark:bg-black">
                          <p className="text-sm text-muted-foreground dark:text-gray-400">Poids</p>
                          <p className="font-medium dark:text-gray-200">{product.weight} kg</p>
                        </div>
                      )}
                      {product.length > 0 && (
                        <div className="bg-muted p-4 rounded-lg dark:bg-black">
                          <p className="text-sm text-muted-foreground dark:text-gray-400">Longueur</p>
                          <p className="font-medium dark:text-gray-200">{product.length} cm</p>
                        </div>
                      )}
                      {product.width > 0 && (
                        <div className="bg-muted p-4 rounded-lg dark:bg-black">
                          <p className="text-sm text-muted-foreground dark:text-gray-400">Largeur</p>
                          <p className="font-medium dark:text-gray-200">{product.width} cm</p>
                        </div>
                      )}
                      {product.height > 0 && (
                        <div className="bg-muted p-4 rounded-lg dark:bg-black">
                          <p className="text-sm text-muted-foreground dark:text-gray-400">Hauteur</p>
                          <p className="font-medium dark:text-gray-200">{product.height} cm</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {product.product_type === "variable" && (
            <TabsContent value="variants">
              <Card className="border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                <CardHeader>
                  <CardTitle className="dark:text-white">Variantes du produit</CardTitle>
                  <CardDescription className="dark:text-gray-400">
                    Liste des différentes configurations disponibles pour ce produit
                    {getVariantTypes(product?.variantes || {}).length > 0 && (
                      <span className="block mt-1">
                        Types disponibles : {getVariantTypes(product?.variantes || {}).map(type => 
                          <Badge key={type} variant="outline" className="ml-1 text-xs">
                            {type.charAt(0).toUpperCase() + type.slice(1)} ({getVariantsCountByType(product?.variantes || {})[type] || 0})
                          </Badge>
                        )}
                      </span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!product?.variantes || getTotalVariantsCount(product.variantes) === 0 ? (
                    <div className="text-center p-8 bg-muted dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800">
                      <div className="text-muted-foreground dark:text-gray-600 mx-auto mb-4 text-4xl">🔍</div>
                      <p className="text-muted-foreground dark:text-gray-400">Aucune variante disponible pour ce produit</p>
                      <p className="text-sm text-muted-foreground dark:text-gray-500 mt-1">
                        Vous pouvez ajouter des variantes en modifiant ce produit
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {Object.entries(groupVariantsByMainAttribute(product.variantes)).map(([mainAttributeKey, variants]) => {
                        const variantType = mainAttributeKey.split(": ")[0].toLowerCase();
                        const mainAttributeValue = getMainAttributeValue(variants[0]);
                        const uniqueVariants = getUniqueVariants(variants);
                        const secondarySummary = getSecondaryAttributesSummary(variants);
                        
                        // Calculer dynamiquement le nombre d'attributs secondaires
                        // Prendre le maximum d'attributs secondaires parmi toutes les variantes du groupe
                        const maxSecondaryAttributesCount = variants.reduce((max, variant) => {
                          const currentCount = variant.attributs ? variant.attributs.length : 0;
                          return Math.max(max, currentCount);
                        }, 0);
                        
                        return (
                          <div key={mainAttributeKey} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
                            {/* En-tête du groupe */}
                            <div className="bg-muted dark:bg-gray-900 px-4 py-3 border-b dark:border-gray-800">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge 
                                    variant="secondary" 
                                    className="bg-primary/10 text-primary dark:bg-blue-900/50 dark:text-blue-300"
                                  >
                                    {variantType.charAt(0).toUpperCase() + variantType.slice(1)}
                                  </Badge>
                                  <span className="font-medium dark:text-white">{mainAttributeValue}</span>
                                  <span className="text-sm text-muted-foreground dark:text-gray-400">
                                    (Première variante - {maxSecondaryAttributesCount} attribut{maxSecondaryAttributesCount > 1 ? 's' : ''} secondaire{maxSecondaryAttributesCount > 1 ? 's' : ''})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 px-2 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                                      onClick={() => router.push(`/produits/${id}/variante/${uniqueVariants[0].id}`)}
                                    >
                                      <Eye className="h-3.5 w-3.5 mr-1" />
                                      Voir
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 px-2 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800"
                                      onClick={() => router.push(`/produits/${id}/variante/${uniqueVariants[0].id}`)}
                                    >
                                      <Edit className="h-3.5 w-3.5 mr-1" />
                                      Modifier
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                                      onClick={() => handleDeleteAllVariantsInGroup(uniqueVariants, mainAttributeKey)}
                                      disabled={isDeletingVariant}
                                    >
                                      {isDeletingVariant ? (
                                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-red-600 mr-1"></div>
                                      ) : (
                                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                                      )}
                                      Supprimer tout
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Tableau des variantes du groupe */}
                            <div className="overflow-x-auto">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="border-b dark:border-gray-800 bg-muted/50 dark:bg-gray-900/50">
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground dark:text-gray-400">Image</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground dark:text-gray-400">Prix</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground dark:text-gray-400">Stock</th>
                                    <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground dark:text-gray-400">Attributs</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {uniqueVariants.map((variant: any, index: any) => (
                                    <tr 
                                      key={variant.id} 
                                      className={`border-b dark:border-gray-800 hover:bg-muted/50 dark:hover:bg-gray-800/50 ${
                                        index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-muted/30 dark:bg-gray-900/30'
                                      }`}
                                    >
                                      <td className="px-4 py-3">
                                        <div className="w-12 h-12 rounded-md overflow-hidden bg-muted dark:bg-gray-800">
                                          {variant.images && variant.images.length > 0 ? (
                                            <img 
                                              src={variant.images[0].image} 
                                              alt={`Variante ${index + 1}`} 
                                              className="w-full h-full object-cover"
                                            />
                                          ) : product?.images && product.images.length > 0 ? (
                                            <img 
                                              src={product.images[0].image} 
                                              alt={`Variante ${index + 1}`} 
                                              className="w-full h-full object-cover opacity-60"
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center text-muted-foreground dark:text-gray-600">
                                              <Eye className="h-4 w-4" />
                                            </div>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                          <span className="font-medium dark:text-white">{formatPrice(variant.regular_price)}</span>
                                          {variant.promo_price && Number(variant.promo_price) > 0 && (
                                            <span className="text-xs line-through text-muted-foreground dark:text-gray-500">
                                              {formatPrice(variant.promo_price)}
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                      <td className="px-4 py-3">
                                        <Badge 
                                          className={`${
                                            (variant.total_quantity || variant.quantity) > 10 
                                              ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" 
                                              : (variant.total_quantity || variant.quantity) > 0 
                                              ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300" 
                                              : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
                                          }`}
                                        >
                                          {(variant.total_quantity || variant.quantity) > 0 ? `${variant.total_quantity || variant.quantity} en stock` : "Épuisé"}
                                        </Badge>
                                      </td>
                                      <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                          {variant.attributs && variant.attributs.length > 0 ? (
                                            variant.attributs.map((attr: any, attrIndex: number) => (
                                              <Badge 
                                                key={attrIndex} 
                                                variant="outline" 
                                                className={`text-xs ${
                                                  attrIndex === 0 
                                                    ? "bg-primary/10 text-primary dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700" 
                                                    : "bg-muted/50 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700"
                                                }`}
                                              >
                                                {attr.attribut.nom}: {attr.valeur}
                                              </Badge>
                                            ))
                                          ) : (
                                            <span className="text-xs text-muted-foreground dark:text-gray-500">
                                              Aucun attribut
                                            </span>
                                          )}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  <div className="mt-6 flex justify-end">
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2 dark:border-gray-800 dark:text-gray-200 dark:hover:bg-gray-900"
                      onClick={() => router.push(`/produits/${id}/addVariantes`)}
                    >
                      <Plus className="h-4 w-4" />
                      Ajouter une variante
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="reviews">
            <div className="bg-white dark:bg-black rounded-lg">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                <Card className="w-full md:w-2/3 border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                  <CardHeader className="pb-3 border-b dark:border-gray-800">
                    <CardTitle className="flex items-center dark:text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-primary dark:text-blue-400"
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
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">Commentaires et évaluations des clients</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    {!product?.reviews || product.reviews.length === 0 ? (
                      <div className="text-center p-8 bg-muted dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-muted-foreground dark:text-gray-600 mx-auto mb-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <p className="text-muted-foreground dark:text-gray-400">Aucun commentaire sur ce produit</p>
                        <p className="text-sm text-muted-foreground dark:text-gray-500 mt-1">
                          Les avis clients apparaîtront ici lorsqu'ils seront disponibles
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4 mt-2">
                        {product.reviews.map((review: any, index: any) => (
                          <div
                            key={index}
                            className="bg-muted dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 p-4 hover:shadow-sm transition-shadow"
                          >
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                <Image
                                  src={review.user.image || "/placeholder.svg?height=40&width=40"}
                                  width={40}
                                  height={40}
                                  className="rounded-full border border-gray-200 dark:border-gray-800"
                                  alt={`${review.user.first_name} ${review.user.last_name}`}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-semibold dark:text-white">
                                    {review.user.first_name} {review.user.last_name}
                                  </h4>
                                  <p className="text-sm text-muted-foreground dark:text-gray-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex items-center mt-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-3.5 w-3.5 ${star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-700"}`}
                                    />
                                  ))}
                                </div>
                                <p className="mt-2 text-sm dark:text-gray-300">{review.comment}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="w-full md:w-1/3 border-gray-200 dark:border-gray-800 dark:bg-gray-900">
                  <CardHeader className="pb-3 border-b dark:border-gray-800">
                    <CardTitle className="flex items-center dark:text-white">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 text-primary dark:text-blue-400"
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
                    </CardTitle>
                    <CardDescription className="dark:text-gray-400">Résumé des évaluations</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold dark:text-white">{product?.stats_star?.average_rating?.toFixed(1) || "0.0"}</p>
                      <div className="flex items-center justify-center my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(product?.stats_star?.average_rating || 0)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300 dark:text-gray-700"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground dark:text-gray-400">{product?.stats_star?.total_reviews || 0} avis</p>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-md font-semibold mb-3 dark:text-white">Répartition des évaluations</h4>
                      <div className="space-y-3">
                        {[5, 4, 3, 2, 1].map((star) => (
                          <div key={star} className="flex items-center">
                            <span className="w-8 text-sm flex items-center dark:text-gray-300">
                              {star} <Star className="h-3 w-3 ml-1 text-yellow-400 fill-yellow-400" />
                            </span>
                            <div className="flex-1 mx-2 h-2 bg-muted dark:bg-black rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400"
                                style={{
                                  width: `${(getStarCount(star) / Math.max(1, product?.stats_star?.total_reviews || 0)) * 100}%`,
                                }}
                              ></div>
                            </div>
                            <span className="text-sm w-8 text-right dark:text-gray-300">
                              {getStarCount(star)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Input file caché pour l'ajout d'images */}
      <input
        ref={imageInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageFileChange}
        className="hidden"
      />
    </div>
  );
};

export default WithAuth(ProductDetailPage);
