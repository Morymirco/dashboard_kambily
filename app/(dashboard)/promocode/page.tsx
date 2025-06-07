"use client";

import {
  Calendar,
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
import { useState } from "react";
import * as XLSX from "xlsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePromoCodes } from "@/hooks/api/promocodes";
import { useDebounce } from "@/hooks/use-debounce";
import { type PromoCode } from "@/lib/types/promocode";
import { toast } from "sonner"; // Import toast for error notifications

export default function PromoCodesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const { data: promoCodesData, isLoading } = usePromoCodes(currentPage, debouncedSearchTerm);
  // const deletePromoCode = useDeletePromoCode();

  const promoCodes = promoCodesData || [];
  console.log(promoCodes);
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

  // Function to handle Excel export
  const handleExport = () => {
    try {
      // Prepare data for Excel
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
        Utilisations: code.used_count + (code.usage_limit ? ` / ${code.usage_limit}` : ""),
        "Date de début": formatDate(code.start_date),
        "Date de fin": formatDate(code.end_date),
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Codes Promo");

      // Customize column widths (optional)
      const colWidths = [
        { wch: 10 }, // ID
        { wch: 20 }, // Code
        { wch: 15 }, // Type
        { wch: 15 }, // Réduction
        { wch: 15 }, // Statut
        { wch: 15 }, // Utilisations
        { wch: 20 }, // Date de début
        { wch: 20 }, // Date de fin
      ];
      worksheet["!cols"] = colWidths;

      // Generate binary string for Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

      // Create Blob for download
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
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => router.push("/promocode/add")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un code promo
          </Button>
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
            <div className="text-2xl font-bold">
              {promoCodes.filter((code) => new Date(code.end_date) < new Date()).length}
            </div>
            <p className="text-xs text-red-500">À archiver</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilisations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {promoCodes.reduce((total, code) => total + (code?.used_count || 0), 0)}
            </div>
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
                            {promoCode.used_count}
                            {promoCode.usage_limit && ` / ${promoCode.usage_limit}`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(promoCode.start_date)}
                            </div>
                            <div className="text-muted-foreground">
                              au {formatDate(promoCode.end_date)}
                            </div>
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
                              <DropdownMenuItem>
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