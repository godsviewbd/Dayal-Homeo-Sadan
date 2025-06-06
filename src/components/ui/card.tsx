
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      // Applying .card-base styles from globals.css or directly here
      "rounded-2xl bg-card text-card-foreground shadow-md transition-shadow ease-out hover:shadow-lg duration-motion-medium",
      // Default padding from spec, can be overridden by specific card instances
      // "p-6", // Removing default padding from base Card to allow more specific control in implementations
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    // Padding specific to card implementations based on context (e.g., form card p-6/p-8 vs search card header)
    className={cn("flex flex-col space-y-1.5", className)} 
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement, 
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <p // Using <p> but styled as a title
    ref={ref}
    className={cn(
      // Example: text-xl font-semibold leading-none tracking-tight md:text-2xl
      // Specific title styling will be applied in components using CardTitle
      "font-semibold leading-none tracking-tight", 
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"


const CardDescription = React.forwardRef<
  HTMLParagraphElement, 
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p 
    ref={ref}
    // Example: text-sm text-muted-foreground
    // Specific description styling will be applied in components using CardDescription
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // Padding specific to card implementations
  <div ref={ref} className={cn("", className)} {...props} /> 
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  // Padding specific to card implementations
  <div
    ref={ref}
    className={cn("flex items-center", className)} 
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
