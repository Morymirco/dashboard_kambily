import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function AllPartnerProductsLoading() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Skeleton className="h-8 w-64" />
      </div>

      <Skeleton className="h-16 w-full mb-6" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array(8)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="h-[300px] rounded-lg" />
          ))}
      </div>
    </div>
  )
}

