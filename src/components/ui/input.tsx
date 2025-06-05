
import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Applying .input-base styles from globals.css or directly here
          "block w-full h-12 px-4 text-base rounded-lg border-2 bg-gray-50 border-gray-200",
          "text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200",
          "dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500",
          "dark:focus:border-primary-300 dark:focus:ring-primary-700",
          "transition-colors duration-[var(--motion-fast)]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          className // Allow overriding
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
