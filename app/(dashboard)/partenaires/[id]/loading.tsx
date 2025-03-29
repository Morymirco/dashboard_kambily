import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function PartenaireDetailLoading() {
  return (
    <div className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="outline" size="icon">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Skeleton className="h-8 w-64" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
        <div>
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
      </div>
    </div>
  )
}

