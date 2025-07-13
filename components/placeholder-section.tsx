"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Construction, ArrowRight } from "lucide-react"
import { useState } from "react"

interface PlaceholderSectionProps {
  title: string
  description: string
  icon?: React.ComponentType<{ className?: string }>
}

export function PlaceholderSection({ title, description, icon: Icon = Construction }: PlaceholderSectionProps) {
  const [notifyButtons, setNotifyButtons] = useState<number[]>([])

  const handleNotifyClick = () => {
    if (notifyButtons.length < 9) { // Limit to 10 total buttons (1 original + 9 new)
      setNotifyButtons(prev => [...prev, prev.length + 1])
    }
  }

  const getNotifyText = (buttonNumber: number) => {
    const messages = [
      "Notify me when the notify button works",
      "Notify me when the notify button for the notify button works",
      "Notify me when the notify button for the notify button for the notify button works",
      "Notify me when the notify button for the notify button for the notify button for the notify button works",
      "Notify me when the notify button for the notify button for the notify button for the notify button for the notify button works",
      "Notify me when the notify button for the notify button for the notify button for the notify button for the notify button for the notify button works",
      "Notify me when the notify button for the notify button for the notify button for the notify button for the notify button for the notify button for the notify button works",
      "Notify me when the notify button for the notify button for the notify button for the notify button for the notify button for the notify button for the notify button for the notify button works",
      "Notify me when the notify button for the notify button for the notify button for the notify button for the notify button for the notify button for the notify button for the notify button for the notify button works"
    ]
    return messages[buttonNumber - 1] || "Notify me when the notify button works"
  }

  const isButtonDisabled = (buttonNumber: number) => {
    // Disable all buttons except the last one
    return buttonNumber !== notifyButtons.length
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-full" data-testid="customers-under-development">
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
                <p className="text-sm text-muted-foreground">We&apos;re working to bring you this functionality</p>
              </div>
            </div>

                        <div className="space-y-3" data-testid="notify-me-section">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">Want to be notified?</p>
                  <p className="text-xs text-muted-foreground">We&apos;ll let you know when it&apos;s available</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNotifyClick}
                  disabled={notifyButtons.length > 0}
                >
                  Notify Me
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>

              {notifyButtons.map((buttonNumber) => (
                <div key={buttonNumber} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-l-4 border-orange-500">
                  <div>
                    <p className="text-xs text-muted-foreground">Work in progress...</p>
                    <p className="text-xs text-muted-foreground/70">
                      {notifyButtons.length === 9 && buttonNumber === 9
                        ? "We will never work on the Notification system"
                        : getNotifyText(buttonNumber)
                      }
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNotifyClick}
                    disabled={isButtonDisabled(buttonNumber) || notifyButtons.length === 9}
                  >
                    Notify Me
                    <ArrowRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
