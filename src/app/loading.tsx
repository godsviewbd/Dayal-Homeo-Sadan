
import { Skeleton } from "@/components/ui/skeleton";
import { MedicineCardSkeleton } from "@/components/features/search/MedicineCardSkeleton";

export default function RootLoading() {
  return (
    <div className="px-4 pt-6 pb-24 md:px-8">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl">
        <div className="rounded-2xl bg-white dark:bg-gray-800 p-6 shadow-lg md:p-8">
          <div className="mb-6 flex items-center">
            <Skeleton className="mr-3 h-8 w-8 rounded-md" />
            <div>
              <Skeleton className="h-7 w-48 mb-1 rounded" />
              <Skeleton className="h-5 w-64 rounded" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Skeleton className="h-12 w-full rounded-lg" /> {/* Input */}
            </div>
            <div className="relative">
              <Skeleton className="h-12 w-full rounded-lg" /> {/* Select */}
            </div>
            <Skeleton className="h-12 w-full rounded-lg md:w-1/3 md:mx-auto" /> {/* Button */}
          </div>
        </div>

        <div className="mt-8">
          <Skeleton className="h-6 w-1/3 mb-4 rounded" /> {/* Search Results Title Skeleton */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3 lg:gap-8">
            <MedicineCardSkeleton />
            <MedicineCardSkeleton />
            <MedicineCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
