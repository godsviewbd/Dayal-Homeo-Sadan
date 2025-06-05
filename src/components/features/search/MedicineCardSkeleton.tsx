
import { Skeleton } from "@/components/ui/skeleton"; // Ensure Skeleton uses new shimmer

export function MedicineCardSkeleton() {
  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-md dark:border-gray-700 dark:bg-gray-800">
      <div className="flex animate-pulse space-x-4">
        <Skeleton className="h-10 w-10 rounded-md bg-gray-200 dark:bg-gray-700" /> {/* Icon placeholder */}
        <div className="flex-1 space-y-3 py-1">
          <Skeleton className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-1/2 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full bg-gray-200 dark:bg-gray-700" /> {/* Quantity badge placeholder */}
      </div>
      <div className="mt-4 space-y-2 animate-pulse">
        <Skeleton className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700" />
        <Skeleton className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
      </div>
      <Skeleton className="mt-6 h-10 w-full rounded-full bg-gray-200 dark:bg-gray-700" /> {/* Button placeholder */}
    </div>
  );
}
