"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Construction, ArrowRight } from "lucide-react"

interface PlaceholderSectionProps {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
}

export function PlaceholderSection({ title, description, icon: Icon = Construction }: PlaceholderSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              Under Development
            </CardTitle>
            <CardDescription>
              This functionality is being actively developed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center space-y-2">
                <Construction className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground font-medium">Coming Soon</p>
                <p className="text-sm text-muted-foreground">We're working to bring you this functionality</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">Want to be notified?</p>
                <p className="text-xs text-muted-foreground">We'll let you know when it's available</p>
              </div>
              <Button variant="outline" size="sm">
                Notify Me
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
