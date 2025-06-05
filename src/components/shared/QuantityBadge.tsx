
import { cn } from "@/lib/utils";
// Badge component itself might not be used if we construct it directly with spans

interface QuantityBadgeProps {
  quantity: number;
  className?: string;
}

const LOW_STOCK_THRESHOLD = 10;
const MEDIUM_STOCK_THRESHOLD = 50;

export function QuantityBadge({ quantity, className }: QuantityBadgeProps) {
  let statusText = `${quantity} In Stock`;
  let colorClasses = "bg-success-50 text-green-700 dark:bg-green-900/20 dark:text-green-300"; // High stock

  if (quantity <= 0) {
    statusText = "Out of Stock";
    colorClasses = "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"; // Error/Destructive
  } else if (quantity < LOW_STOCK_THRESHOLD) {
    statusText = `${quantity} Low Stock`;
    colorClasses = "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300"; // Error/Destructive for low for high visibility
  } else if (quantity < MEDIUM_STOCK_THRESHOLD) {
    statusText = `${quantity} Medium Stock`;
    colorClasses = "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300"; // Warning
  }

  return (
    <span
      className={cn(
        "inline-block rounded-full px-3 py-1.5 text-center text-sm font-medium", // Removed min-w-[100px]
        colorClasses,
        className
      )}
      aria-live="polite"
      aria-label={`Stock status: ${statusText}`}
    >
      {statusText}
    </span>
  );
}

