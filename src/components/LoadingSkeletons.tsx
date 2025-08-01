import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function LoadingSkeletons({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-3/4" />
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-3 w-8 mx-auto" />
              </div>
              <div className="flex-1 space-y-2">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-3 w-8 mx-auto" />
              </div>
            </div>
            
            <div className="pt-3 border-t border-border grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="space-y-1">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-4 w-14" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}