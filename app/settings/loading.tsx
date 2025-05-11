import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-[100px] ml-auto" />
      </div>
    </div>
  )
}
