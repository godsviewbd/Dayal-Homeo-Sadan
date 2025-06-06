
import { Skeleton } from "@/components/ui/skeleton";

export default function InventoryLoading() {
  return (
    <div className="px-4 pt-6 pb-24 md:px-8">
      <div className="mx-auto w-full rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 md:p-8">
        <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-1 rounded" /> {/* Title */}
            <Skeleton className="h-5 w-64 rounded" /> {/* Subtitle */}
          </div>
          <div className="relative w-full md:w-1/3">
            <Skeleton className="h-12 w-full rounded-lg" /> {/* Search Input */}
          </div>
        </div>

        {/* Skeleton for Medicine Table/Cards */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 shadow">
              <div className="flex items-start justify-between">
                <div>
                  <Skeleton className="h-6 w-40 mb-2 rounded" /> {/* Name */}
                  <Skeleton className="h-4 w-24 rounded" /> {/* Potency/Prep */}
                </div>
                <Skeleton className="h-8 w-24 rounded-full" /> {/* Quantity Badge */}
              </div>
              <Skeleton className="h-4 w-32 mt-3 rounded" /> {/* Location */}
              <div className="mt-4 flex justify-end space-x-2">
                <Skeleton className="h-9 w-20 rounded-lg" /> {/* Edit Button */}
                <Skeleton className="h-9 w-9 rounded-md" /> {/* Delete Button */}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
