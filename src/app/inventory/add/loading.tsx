
import { Skeleton } from "@/components/ui/skeleton";

export default function AddMedicineLoading() {
  return (
    <div className="px-4 pt-6 pb-24 md:px-8">
      <div className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-lg dark:bg-gray-800 md:p-8">
        <div className="mb-6">
          <Skeleton className="h-9 w-3/4 mb-2 rounded" /> {/* Title */}
          <Skeleton className="h-5 w-full rounded" /> {/* Subtitle */}
        </div>

        <div className="grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <Skeleton className="h-4 w-24 mb-1 rounded" /> {/* Label */}
            <Skeleton className="h-12 w-full rounded-lg" /> {/* Input */}
          </div>

          <div>
            <Skeleton className="h-4 w-20 mb-1 rounded" /> {/* Label */}
            <Skeleton className="h-12 w-full rounded-lg" /> {/* Select */}
          </div>
          
          <div>
            <Skeleton className="h-4 w-24 mb-1 rounded" /> {/* Label */}
            <Skeleton className="h-12 w-full rounded-lg" /> {/* Select */}
          </div>

          <div>
            <Skeleton className="h-4 w-20 mb-1 rounded" /> {/* Label */}
            <Skeleton className="h-12 w-full rounded-lg" /> {/* Input */}
          </div>
            
          <div>
            <Skeleton className="h-4 w-32 mb-1 rounded" /> {/* Label */}
            <Skeleton className="h-12 w-full rounded-lg" /> {/* Input */}
          </div>
            
          <div className="md:col-span-2">
            <Skeleton className="h-4 w-28 mb-1 rounded" /> {/* Label */}
            <Skeleton className="h-12 w-full rounded-lg" /> {/* Input */}
          </div>
        </div>
          
        <div className="mt-8 flex justify-end">
          <Skeleton className="h-12 w-40 rounded-full" /> {/* Button */}
        </div>
      </div>
    </div>
  );
}
