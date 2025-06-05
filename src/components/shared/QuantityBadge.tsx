import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface QuantityBadgeProps {
  quantity: number;
}

const LOW_STOCK_THRESHOLD = 10;
const MEDIUM_STOCK_THRESHOLD = 50;

export function QuantityBadge({ quantity }: QuantityBadgeProps) {
  let variant: "default" | "secondary" | "destructive" = "default";
  let SuffixText = "In Stock";

  if (quantity <= 0) {
    variant = "destructive";
    SuffixText = "Out of Stock";
  } else if (quantity < LOW_STOCK_THRESHOLD) {
    variant = "destructive"; // Using destructive for low stock (red)
    SuffixText = "Low Stock";
  } else if (quantity < MEDIUM_STOCK_THRESHOLD) {
    variant = "secondary"; // Using secondary for medium stock (yellow-ish, depending on theme)
    SuffixText = "Medium Stock";
  }
  // Default variant (green-ish, depending on theme) for high stock

  const badgeClassName = cn(
    "text-xs font-semibold",
    {
      "bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100 border-green-300 dark:border-green-600": variant === "default" && quantity > 0,
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-600 dark:text-yellow-100 border-yellow-300 dark:border-yellow-500": variant === "secondary",
      "bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100 border-red-300 dark:border-red-600": variant === "destructive",
    }
  );

  return (
    <Badge variant={quantity <=0 ? "destructive" : "outline"} className={badgeClassName}>
      {quantity} {SuffixText}
    </Badge>
  );
}
