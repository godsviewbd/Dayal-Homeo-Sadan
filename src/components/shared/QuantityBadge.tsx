
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface QuantityBadgeProps {
  quantity: number;
}

const LOW_STOCK_THRESHOLD = 10;
const MEDIUM_STOCK_THRESHOLD = 50;

// Using HSL values from the new palette for semantic colors
const successColor = "hsl(var(--success))"; // hsl(140, 35%, 45%)
const warningColor = "hsl(var(--warning))"; // hsl(35, 75%, 55%)
const errorColor = "hsl(var(--destructive))"; // hsl(0, 65%, 50%)

// Define text colors that contrast well with the HSL background colors
// For HSL, lightness (L) is key. High L = light bg, needs dark text. Low L = dark bg, needs light text.
// All semantic colors have L around 45-55%, so white text should provide good contrast.
const textOnSemanticColor = "hsl(0, 0%, 100%)"; // White

export function QuantityBadge({ quantity }: QuantityBadgeProps) {
  let statusText = "In Stock";
  let bgColor = successColor; 
  let textColor = textOnSemanticColor;

  if (quantity <= 0) {
    statusText = "Out of Stock";
    bgColor = errorColor;
  } else if (quantity < LOW_STOCK_THRESHOLD) {
    statusText = "Low Stock";
    bgColor = errorColor; // Using error color for Low Stock for high visibility
  } else if (quantity < MEDIUM_STOCK_THRESHOLD) {
    statusText = "Medium Stock";
    bgColor = warningColor;
  }

  // Using inline styles for dynamic HSL colors as Tailwind class generation is complex for this.
  // The badge itself will have basic structure from shadcn/ui badge.
  return (
    <Badge
      className={cn(
        "text-xs font-medium px-2.5 py-1 rounded-full border-transparent",
        "min-w-[100px] text-center justify-center" // Ensure a minimum width and center text
      )}
      style={{ backgroundColor: bgColor, color: textColor }}
      aria-live="polite"
      aria-label={`Stock status: ${quantity} ${statusText}`}
    >
      {quantity} {statusText}
    </Badge>
  );
}
