import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              <Skeleton className="h-4 w-24" />
            </CardTitle>
            <Skeleton className="h-8 w-8 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-28 mb-2" />
            <Skeleton className="h-4 w-36" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
