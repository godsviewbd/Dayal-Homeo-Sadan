
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      // Using skeleton-shimmer class from globals.css
      className={cn("skeleton-shimmer", className)}
      {...props}
    />
  )
}

export { Skeleton }
