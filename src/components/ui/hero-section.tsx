import * as React from "react"
import { cn } from "@/lib/utils"

interface HeroSectionProps {
  children: React.ReactNode
  className?: string
}

export function HeroSection({ children, className }: HeroSectionProps) {
  return (
    <section className={cn(
      "bg-gradient-hero text-primary-foreground py-20 px-6",
      className
    )}>
      <div className="container mx-auto max-w-4xl text-center">
        {children}
      </div>
    </section>
  )
}