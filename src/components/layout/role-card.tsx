import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LucideIcon } from "lucide-react"

interface RoleCardProps {
  title: string
  description: string
  features: string[]
  icon: LucideIcon
  buttonText: string
  onClick: () => void
  variant?: "default" | "highlighted"
}

export function RoleCard({
  title,
  description,
  features,
  icon: Icon,
  buttonText,
  onClick,
  variant = "default"
}: RoleCardProps) {
  return (
    <Card className={`shadow-card hover:shadow-elevated transition-all duration-300 animate-fade-in ${
      variant === "highlighted" ? "ring-2 ring-primary shadow-glow" : ""
    }`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-lg w-fit">
          <Icon className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-sm text-muted-foreground">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3 flex-shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
        <Button 
          onClick={onClick} 
          className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
          size="lg"
        >
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  )
}