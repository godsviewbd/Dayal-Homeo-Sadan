
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Updated buttonVariants based on spec
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-base font-medium ring-offset-background transition-all duration-[var(--motion-fast)] ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 active:scale-95 [&_svg]:pointer-events-none [&_svg]:size-5 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: // Primary - Directly using teal shades to ensure color application
          "bg-teal-500 text-white shadow-md hover:bg-teal-600 dark:bg-teal-300 dark:text-gray-900 dark:hover:bg-teal-400",
        destructive:
          "bg-semantic-error text-semantic-error-fg shadow-md hover:bg-red-600 dark:bg-red-700 dark:hover:bg-red-800",
        outline: // Secondary / Outline
          "border-2 border-primary-500 text-primary-500 hover:bg-primary-50 dark:border-primary-300 dark:text-primary-300 dark:hover:bg-primary-900/20",
        secondary: // A general secondary style if needed, distinct from outline
          "bg-secondary-500 text-secondary-foreground shadow-md hover:bg-secondary-600 dark:bg-secondary-400 dark:hover:bg-secondary-500",
        ghost:
          "hover:bg-accent/60 hover:text-accent-foreground dark:hover:bg-gray-700 dark:hover:text-gray-100", // For nav links or subtle actions
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-12 px-6 py-2", // 48px height, min 44px touch target
        sm: "h-10 rounded-full px-4 text-sm", // 40px
        lg: "h-14 rounded-full px-8 text-lg", // 56px
        icon: "h-11 w-11 rounded-full p-0", // 44px, ensure visual weight for touch
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
