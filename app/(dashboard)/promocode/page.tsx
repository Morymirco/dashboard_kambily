"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreatePromoCode, usePromoCode, usePromoCodes, useUpdatePromoCode } from "@/hooks/api/promocodes";
import { useDebounce } from "@/hooks/use-debounce";
import { type PromoCode } from "@/lib/types/promocode";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Download,
  Edit,
  Eye,
  MoreHorizontal,
  Percent,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

export default function PromoCodesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("percent");
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percent",
    discount_value: "",
    max_discount: "",
    minimum_order_amount: "",
    max_uses: "",
    max_uses_per_user: "",
    is_active: true,
    start_date: new Date(),
    end_date: new Date(),
    eligible_users: [] as number[],
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: promoCodesData, isLoading } = usePromoCodes(currentPage, debouncedSearchTerm);
  const createPromoCode = useCreatePromoCode();
  const updatePromoCode = useUpdatePromoCode();
  const { data: editingPromoCode } = usePromoCode(editingId || "");

  const promoCodes = promoCodesData || [];
  const totalPromoCodes = promoCodes.length || 0;

  const handleDeletePromoCode = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce code promo ?")) {
      // await deletePromoCode.mutateAsync(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(dateString));
  };

  const formatDiscount = (code: PromoCode) => {
    return code.discount_type === "fixed"
      ? `${code.discount_value.toLocaleString()} GNF`
      : `${code.discount_value}%`;
  };

  const getStatusBadge = (code: PromoCode) => {
    const now = new Date();
    const startDate = new Date(code.start_date);
    const endDate = new Date(code.end_date);

    if (!code.is_active) {
      return <Badge variant="secondary">Inactif</Badge>;
    }

    if (now < startDate) {
      return <Badge variant="outline">Programmé</Badge>;
    }

    if (now > endDate) {
      return <Badge variant="destructive">Expiré</Badge>;
    }

    return <Badge variant="default" className="bg-green-600">Actif</Badge>;
  };

  const handleExport = () => {
    try {
      const exportData = promoCodes.map((code: PromoCode) => ({
        ID: code.id,
        Code: code.code,
        Type: code.discount_type === "fixed" ? "Fixe" : "Pourcentage",
        Réduction: formatDiscount(code),
        Statut: !code.is_active
          ? "Inactif"
          : new Date() < new Date(code.start_date)
          ? "Programmé"
          : new Date() > new Date(code.end_date)
          ? "Expiré"
          : "Actif",
        "Date de début": formatDate(code.start_date),
        "Date de fin": formatDate(code.end_date),
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Codes Promo");

      const colWidths = [
        { wch: 10 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 20 },
        { wch: 20 },
      ];
      worksheet["!cols"] = colWidths;

      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "codes_promo.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Fichier Excel exporté avec succès !");
    } catch (error) {
      console.error("Erreur lors de l'exportation Excel:", error);
      toast.error("Échec de l'exportation du fichier Excel. Veuillez réessayer.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (editingId && editingPromoCode) {
      setFormData({
        code: editingPromoCode.code,
        discount_type: editingPromoCode.discount_type,
        discount_value: editingPromoCode.discount_value.toString(),
        max_discount: editingPromoCode.max_discount?.toString() || "",
        minimum_order_amount: editingPromoCode.minimum_order_amount?.toString() || "",
        max_uses: editingPromoCode.max_uses?.toString() || "",
        max_uses_per_user: editingPromoCode.max_uses_per_user?.toString() || "",
        is_active: editingPromoCode.is_active,
        start_date: new Date(editingPromoCode.start_date),
        end_date: new Date(editingPromoCode.end_date),
        eligible_users: editingPromoCode.eligible_users || [],
      });
      setActiveTab(editingPromoCode.discount_type);
    }
  }, [editingId, editingPromoCode]);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const submitData = {
      ...formData,
      discount_type: (activeTab === "specific" ? "percent" : activeTab) as "percent" | "fixed",
      discount_value: Number(formData.discount_value),
      max_discount: activeTab !== "fixed" ? Number(formData.max_discount) : undefined,
      minimum_order_amount: formData.minimum_order_amount ? Number(formData.minimum_order_amount) : undefined,
      max_uses: formData.max_uses ? Number(formData.max_uses) : undefined,
      max_uses_per_user: formData.max_uses_per_user ? Number(formData.max_uses_per_user) : undefined,
    };

    try {
      if (editingId) {
        await updatePromoCode.mutateAsync({ id: editingId, data: submitData });
      } else {
        await createPromoCode.mutateAsync(submitData);
      }
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({
        code: "",
        discount_type: "percent",
        discount_value: "",
        max_discount: "",
        minimum_order_amount: "",
        max_uses: "",
        max_uses_per_user: "",
        is_active: true,
        start_date: new Date(),
        end_date: new Date(),
        eligible_users: [],
      });
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Codes Promo</h1>
            <p className="text-muted-foreground">Gérez vos codes promotionnels</p>
          </div>
          <Skeleton className="h-10 w-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Codes Promo</h1>
          <p className="text-muted-foreground">Gérez vos codes promotionnels et réductions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
          <Dialog
            open={isModalOpen}
            onOpenChange={(open) => {
              setIsModalOpen(open);
              if (!open) {
                setEditingId(null);
                setFormData({
                  code: "",
                  discount_type: "percent",
                  discount_value: "",
                  max_discount: "",
                  minimum_order_amount: "",
                  max_uses: "",
                  max_uses_per_user: "",
                  is_active: true,
                  start_date: new Date(),
                  end_date: new Date(),
                  eligible_users: [],
                });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter un code promo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingId ? "Modifier le code promo" : "Créer un nouveau code promo"}</DialogTitle>
              </DialogHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="percent">Pourcentage</TabsTrigger>
                  <TabsTrigger value="fixed">Montant fixe</TabsTrigger>
                  <TabsTrigger value="specific">Utilisateurs spécifiques</TabsTrigger>
                </TabsList>
                <form onSubmit={handleSubmit}>
                  <TabsContent value="percent" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Code promo</Label>
                        <Input id="code" name="code" value={formData.code} onChange={handleInputChange} placeholder="SUMMER2024" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount_value">Pourcentage de remise</Label>
                        <Input
                          id="discount_value"
                          name="discount_value"
                          type="number"
                          value={formData.discount_value}
                          onChange={handleInputChange}
                          placeholder="20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_discount">Remise maximale</Label>
                        <Input
                          id="max_discount"
                          name="max_discount"
                          type="number"
                          value={formData.max_discount}
                          onChange={handleInputChange}
                          placeholder="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimum_order_amount">Montant minimum</Label>
                        <Input
                          id="minimum_order_amount"
                          name="minimum_order_amount"
                          type="number"
                          value={formData.minimum_order_amount}
                          onChange={handleInputChange}
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="fixed" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Code promo</Label>
                        <Input id="code" name="code" value={formData.code} onChange={handleInputChange} placeholder="FIXED50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount_value">Montant de la remise</Label>
                        <Input
                          id="discount_value"
                          name="discount_value"
                          type="number"
                          value={formData.discount_value}
                          onChange={handleInputChange}
                          placeholder="50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="minimum_order_amount">Montant minimum</Label>
                        <Input
                          id="minimum_order_amount"
                          name="minimum_order_amount"
                          type="number"
                          value={formData.minimum_order_amount}
                          onChange={handleInputChange}
                          placeholder="200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_uses">Utilisations max</Label>
                        <Input
                          id="max_uses"
                          name="max_uses"
                          type="number"
                          value={formData.max_uses}
                          onChange={handleInputChange}
                          placeholder="50"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="specific" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="code">Code promo</Label>
                        <Input id="code" name="code" value={formData.code} onChange={handleInputChange} placeholder="VIP2024" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discount_value">Pourcentage de remise</Label>
                        <Input
                          id="discount_value"
                          name="discount_value"
                          type="number"
                          value={formData.discount_value}
                          onChange={handleInputChange}
                          placeholder="30"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="max_discount">Remise maximale</Label>
                        <Input
                          id="max_discount"
                          name="max_discount"
                          type="number"
                          value={formData.max_discount}
                          onChange={handleInputChange}
                          placeholder="100"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="eligible_users">Utilisateurs éligibles</Label>
                        <Input
                          id="eligible_users"
                          name="eligible_users"
                          value={formData.eligible_users.join(",")}
                          onChange={(e) => setFormData((prev) => ({ ...prev, eligible_users: e.target.value.split(",").map(Number) }))}
                          placeholder="1,2,3"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <div className="mt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Date de début</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full justify-start text-left font-normal", !formData.start_date && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.start_date ? format(formData.start_date, "PPP", { locale: fr }) : "Sélectionner une date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.start_date}
                              onSelect={(date: Date | undefined) => setFormData((prev) => ({ ...prev, start_date: date || new Date() }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="space-y-2">
                        <Label>Date de fin</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn("w-full justify-start text-left font-normal", !formData.end_date && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.end_date ? format(formData.end_date, "PPP", { locale: fr }) : "Sélectionner une date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={formData.end_date}
                              onSelect={(date: Date | undefined) => setFormData((prev) => ({ ...prev, end_date: date || new Date() }))}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_active: checked }))}
                      />
                      <Label htmlFor="is_active">Code actif</Label>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button type="submit" className="bg-teal-600 hover:bg-teal-700">
                        Créer le code promo
                      </Button>
                    </div>
                  </div>
                </form>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total des codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPromoCodes}</div>
            <p className="text-xs text-green-500">+2 cette semaine</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Codes actifs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoCodes.filter((code) => {
                const now = new Date();
                const startDate = new Date(code.start_date);
                const endDate = new Date(code.end_date);
                return code.is_active && now >= startDate && now <= endDate;
              }).length}
            </div>
            <p className="text-xs text-green-500">En cours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Codes expirés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promoCodes.filter((code) => new Date(code.end_date) < new Date()).length}</div>
            <p className="text-xs text-red-500">À archiver</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilisations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promoCodes.reduce((total, code) => total + (code?.usage_count.current || 0), 0)}</div>
            <p className="text-xs text-blue-500">Total</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Liste des codes promo</CardTitle>
            <CardDescription>{promoCodes.length} codes au total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Réduction</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Utilisations</TableHead>
                    <TableHead>Validité</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {promoCodes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center">
                          <div className="text-muted-foreground mb-2">🎫</div>
                          <p className="text-muted-foreground">Aucun code promo trouvé</p>
                          <Button variant="link" onClick={() => router.push("/promocode/add")}>
                            Créer votre premier code promo
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    promoCodes.map((promoCode: PromoCode) => (
                      <TableRow key={promoCode.id}>
                        <TableCell>
                          <div className="font-medium">{promoCode.code}</div>
                          <div className="text-sm text-muted-foreground">ID: {promoCode.id}</div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] truncate">
                            {promoCode.discount_type === "fixed" ? "Fixe" : "Pourcentage"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Percent className="h-3 w-3" />
                            {formatDiscount(promoCode)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(promoCode)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {promoCode.usage_count.current}
                            {promoCode.usage_count.max && ` / ${promoCode.usage_count.max}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(promoCode.start_date)} - {formatDate(promoCode.end_date)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                Voir détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(promoCode.id.toString())}>
                                <Edit className="mr-2 h-4 w-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDeletePromoCode(promoCode.id.toString())}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}