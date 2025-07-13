"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useAuth } from "@/components/AuthProvider"
import { useHelp } from "@/components/help-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Clock, Package, TrendingUp, Users, Play } from "lucide-react"

export function WelcomeDialog() {
  const [open, setOpen] = useState(false)
  const [showGuide, setShowGuide] = useState(false)
  const { userId } = useAuth()
  const { openHelp } = useHelp()
  const hasSeenOnboarding = useQuery(api.auth.hasUserSeenOnboarding, { user_id: userId || "" })
  const markOnboardingAsSeen = useMutation(api.auth.markOnboardingAsSeen)

  useEffect(() => {
    // Only show the welcome dialog if user hasn't seen onboarding
    if (hasSeenOnboarding === false && userId) {
      setOpen(true)
    }
  }, [hasSeenOnboarding, userId])

  const handleClose = () => {
    if (userId) {
      markOnboardingAsSeen({ user_id: userId })
    }
    setOpen(false)
    // Start the help tour on the current page
    openHelp()
  }

  const handleShowGuide = () => {
    setShowGuide(true)
  }

  const handleSkipGuide = () => {
    if (userId) {
      markOnboardingAsSeen({ user_id: userId })
    }
    setOpen(false)
  }

  if (showGuide) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center mb-4">
              How Timeflies Works
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed">
              Let&apos;s walk through the key features and how to use them effectively.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-6">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Inventory Management</h4>
                <p className="text-sm text-muted-foreground">
                  Track your clock inventory, monitor stock levels, and manage product catalogs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Order Processing</h4>
                <p className="text-sm text-muted-foreground">
                  View and manage customer orders, track shipping status, and handle fulfillment.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Analytics & Insights</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor sales performance, revenue trends, and customer behavior analytics.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Users className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Customer Management</h4>
                <p className="text-sm text-muted-foreground">
                  Manage customer information, view purchase history, and track customer relationships.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <Button onClick={handleClose} className="px-8">
              Start Exploring
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">
            Welcome to Timeflies
          </DialogTitle>
          <DialogDescription className="text-base leading-relaxed">
            Your comprehensive dashboard for managing your clock store operations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <div className="flex items-start space-x-3">
            <Clock className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Inventory Management</h4>
              <p className="text-sm text-muted-foreground">
                Track your clock inventory, monitor stock levels, and manage product catalogs.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Package className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Order Processing</h4>
              <p className="text-sm text-muted-foreground">
                View and manage customer orders, track shipping status, and handle fulfillment.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Analytics & Insights</h4>
              <p className="text-sm text-muted-foreground">
                Monitor sales performance, revenue trends, and customer behavior analytics.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Users className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium">Customer Management</h4>
              <p className="text-sm text-muted-foreground">
                Manage customer information, view purchase history, and track customer relationships.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col space-y-3 mt-6">
          <Button onClick={handleShowGuide} className="px-8">
            <Play className="w-4 h-4 mr-2" />
            Show Me How It Works
          </Button>
          <Button onClick={handleSkipGuide} variant="outline" className="px-8">
            Skip Guide
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
