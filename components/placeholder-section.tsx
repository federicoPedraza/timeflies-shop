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
              En desarrollo
            </CardTitle>
            <CardDescription>
              Esta funcionalidad está siendo desarrollada activamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center space-y-2">
                <Construction className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground font-medium">Próximamente disponible</p>
                <p className="text-sm text-muted-foreground">Estamos trabajando para traerte esta funcionalidad</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium">¿Quieres ser notificado?</p>
                <p className="text-xs text-muted-foreground">Te avisaremos cuando esté disponible</p>
              </div>
              <Button variant="outline" size="sm">
                Notificarme
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
