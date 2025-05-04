import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function UtilisateursLoading() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Skeleton className="h-10 w-full max-w-xs" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Liste des utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Nom</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">Rôle</th>
                    <th className="text-left py-3 px-4 font-medium">Statut</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Skeleton className="h-10 w-10 rounded-full" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-5 w-40" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-5 w-20" />
                      </td>
                      <td className="py-3 px-4">
                        <Skeleton className="h-6 w-16 rounded-full" />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Skeleton className="h-9 w-9 rounded-md" />
                          <Skeleton className="h-9 w-9 rounded-md" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

