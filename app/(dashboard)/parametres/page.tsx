// Remplacer l'export par défaut par une implémentation directe
"use client"

import { useState } from "react"
import { Save, Globe, Bell, CreditCard, Shield, Users, Mail, Smartphone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

export default function ParametresPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)
    // Simuler une sauvegarde
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Paramètres sauvegardés",
        description: "Vos modifications ont été enregistrées avec succès.",
      })
    }, 1000)
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
          <p className="text-muted-foreground">Configurez les paramètres de votre boutique</p>
        </div>
        <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSave} disabled={isLoading}>
          <Save className="mr-2 h-4 w-4" />
          {isLoading ? "Sauvegarde en cours..." : "Sauvegarder les modifications"}
        </Button>
      </div>

      <div className="mt-6">
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Général</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="payment" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Paiement</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Utilisateurs</span>
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">API</span>
            </TabsTrigger>
          </TabsList>

          {/* Paramètres généraux */}
          <TabsContent value="general" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Informations de la boutique</CardTitle>
                <CardDescription>Ces informations seront affichées sur votre site et dans les emails.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="store-name">Nom de la boutique</Label>
                    <Input id="store-name" defaultValue="Kambily" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-url">URL du site</Label>
                    <Input id="store-url" defaultValue="https://kambily.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-email">Email de contact</Label>
                    <Input id="store-email" defaultValue="contact@kambily.com" type="email" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="store-phone">Téléphone</Label>
                    <Input id="store-phone" defaultValue="+33 1 23 45 67 89" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-address">Adresse</Label>
                  <Textarea id="store-address" defaultValue="123 Rue de la Paix, 75001 Paris, France" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres régionaux</CardTitle>
                <CardDescription>Configurez les paramètres de langue, devise et fuseau horaire.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="language">Langue par défaut</Label>
                    <Select defaultValue="fr">
                      <SelectTrigger id="language">
                        <SelectValue placeholder="Sélectionner une langue" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="en">Anglais</SelectItem>
                        <SelectItem value="es">Espagnol</SelectItem>
                        <SelectItem value="de">Allemand</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency">Devise</Label>
                    <Select defaultValue="eur">
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Sélectionner une devise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="eur">Euro (€)</SelectItem>
                        <SelectItem value="usd">Dollar US ($)</SelectItem>
                        <SelectItem value="gbp">Livre Sterling (£)</SelectItem>
                        <SelectItem value="chf">Franc Suisse (CHF)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Fuseau horaire</Label>
                    <Select defaultValue="europe-paris">
                      <SelectTrigger id="timezone">
                        <SelectValue placeholder="Sélectionner un fuseau horaire" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="europe-paris">Europe/Paris</SelectItem>
                        <SelectItem value="europe-london">Europe/Londres</SelectItem>
                        <SelectItem value="america-new_york">Amérique/New York</SelectItem>
                        <SelectItem value="asia-tokyo">Asie/Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres de notifications */}
          <TabsContent value="notifications" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notifications par email</CardTitle>
                <CardDescription>Configurez les emails envoyés automatiquement à vos clients.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Confirmation de commande</Label>
                      <p className="text-sm text-muted-foreground">Envoyer un email lorsqu'une commande est passée</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Confirmation d'expédition</Label>
                      <p className="text-sm text-muted-foreground">Envoyer un email lorsqu'une commande est expédiée</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rappel de panier abandonné</Label>
                      <p className="text-sm text-muted-foreground">
                        Envoyer un email lorsqu'un client abandonne son panier
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Newsletter</Label>
                      <p className="text-sm text-muted-foreground">Envoyer des emails promotionnels aux abonnés</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications administrateur</CardTitle>
                <CardDescription>
                  Configurez les notifications que vous recevez en tant qu'administrateur.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Nouvelle commande</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir une notification lorsqu'une nouvelle commande est passée
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center gap-1">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Stock faible</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir une notification lorsqu'un produit est en stock faible
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center gap-1">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Nouvel utilisateur</Label>
                      <p className="text-sm text-muted-foreground">
                        Recevoir une notification lorsqu'un nouvel utilisateur s'inscrit
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center gap-1">
                        <Smartphone className="h-4 w-4 text-muted-foreground" />
                        <Switch />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres de paiement */}
          <TabsContent value="payment" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Méthodes de paiement</CardTitle>
                <CardDescription>Configurez les méthodes de paiement disponibles pour vos clients.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/placeholder.svg?height=24&width=40" alt="Stripe" className="h-6" />
                      <div className="space-y-0.5">
                        <Label>Stripe</Label>
                        <p className="text-sm text-muted-foreground">
                          Accepter les paiements par carte bancaire via Stripe
                        </p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/placeholder.svg?height=24&width=40" alt="PayPal" className="h-6" />
                      <div className="space-y-0.5">
                        <Label>PayPal</Label>
                        <p className="text-sm text-muted-foreground">Accepter les paiements via PayPal</p>
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/placeholder.svg?height=24&width=40" alt="Apple Pay" className="h-6" />
                      <div className="space-y-0.5">
                        <Label>Apple Pay</Label>
                        <p className="text-sm text-muted-foreground">Accepter les paiements via Apple Pay</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img src="/placeholder.svg?height=24&width=40" alt="Google Pay" className="h-6" />
                      <div className="space-y-0.5">
                        <Label>Google Pay</Label>
                        <p className="text-sm text-muted-foreground">Accepter les paiements via Google Pay</p>
                      </div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres de facturation</CardTitle>
                <CardDescription>Configurez les informations qui apparaissent sur vos factures.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Nom de l'entreprise</Label>
                    <Input id="company-name" defaultValue="Kambily SAS" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vat-number">Numéro de TVA</Label>
                    <Input id="vat-number" defaultValue="FR12345678901" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice-prefix">Préfixe des factures</Label>
                    <Input id="invoice-prefix" defaultValue="KAM-" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">Taux de TVA (%)</Label>
                    <Input id="tax-rate" defaultValue="20" type="number" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="invoice-footer">Pied de page des factures</Label>
                  <Textarea
                    id="invoice-footer"
                    defaultValue="Merci pour votre achat. Pour toute question concernant votre facture, veuillez contacter notre service client."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Paramètres de sécurité */}
          <TabsContent value="security" className="mt-6 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du compte</CardTitle>
                <CardDescription>Configurez les paramètres de sécurité pour votre boutique.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Authentification à deux facteurs</Label>
                      <p className="text-sm text-muted-foreground">
                        Exiger une authentification à deux facteurs pour tous les administrateurs
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Verrouillage de compte</Label>
                      <p className="text-sm text-muted-foreground">
                        Verrouiller les comptes après 5 tentatives de connexion échouées
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Expiration de session</Label>
                      <p className="text-sm text-muted-foreground">
                        Déconnecter automatiquement après 30 minutes d'inactivité
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Modifier le mot de passe
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Journaux d'activité</CardTitle>
                <CardDescription>Configurez la journalisation des activités sur votre boutique.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Journalisation des connexions</Label>
                      <p className="text-sm text-muted-foreground">Enregistrer toutes les tentatives de connexion</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Journalisation des modifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Enregistrer toutes les modifications apportées aux produits et commandes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Durée de conservation</Label>
                      <p className="text-sm text-muted-foreground">Conserver les journaux pendant 90 jours</p>
                    </div>
                    <Select defaultValue="90">
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="Jours" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30</SelectItem>
                        <SelectItem value="60">60</SelectItem>
                        <SelectItem value="90">90</SelectItem>
                        <SelectItem value="180">180</SelectItem>
                        <SelectItem value="365">365</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Voir les journaux d'activité
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Autres onglets... */}
          <TabsContent value="users" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <CardDescription>Configurez les paramètres relatifs aux utilisateurs et aux rôles.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Contenu de la section utilisateurs à venir...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres API</CardTitle>
                <CardDescription>Gérez vos clés API et les intégrations tierces.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Contenu de la section API à venir...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

