"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { X } from "lucide-react"
import { useHelp } from "./help-context"

interface HelpStep {
  id: string
  title: string
  content: string
  target?: string // CSS selector for highlighting elements
}

interface HelpPanelProps {
  isOpen: boolean
  onClose: () => void
  steps: HelpStep[]
}

function getSmartPanelPosition(targetRect: DOMRect, panelRect: DOMRect) {
  const margin = 8
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  // Try below
  if (targetRect.bottom + margin + panelRect.height < viewportHeight) {
    return {
      top: targetRect.bottom + margin,
      left: Math.min(
        Math.max(targetRect.left + targetRect.width / 2 - panelRect.width / 2, margin),
        viewportWidth - panelRect.width - margin
      ),
    }
  }
  // Try above
  if (targetRect.top - margin - panelRect.height > 0) {
    return {
      top: targetRect.top - margin - panelRect.height,
      left: Math.min(
        Math.max(targetRect.left + targetRect.width / 2 - panelRect.width / 2, margin),
        viewportWidth - panelRect.width - margin
      ),
    }
  }
  // Try right
  if (targetRect.right + margin + panelRect.width < viewportWidth) {
    return {
      top: Math.min(
        Math.max(targetRect.top + targetRect.height / 2 - panelRect.height / 2, margin),
        viewportHeight - panelRect.height - margin
      ),
      left: targetRect.right + margin,
    }
  }
  // Try left
  if (targetRect.left - margin - panelRect.width > 0) {
    return {
      top: Math.min(
        Math.max(targetRect.top + targetRect.height / 2 - panelRect.height / 2, margin),
        viewportHeight - panelRect.height - margin
      ),
      left: targetRect.left - margin - panelRect.width,
    }
  }
  // Default: top left
  return { top: margin, left: margin }
}

export function HelpPanel({ isOpen, onClose, steps }: HelpPanelProps) {
  const { currentStep, setCurrentStep } = useHelp()
  const [position, setPosition] = useState({ top: 40, left: 40 })
  const panelRef = useRef<HTMLDivElement>(null)

  // Smart positioning logic
  const updatePanelPosition = useCallback(() => {
    if (!isOpen || !steps[currentStep]?.target) return
    const targetElement = document.querySelector(steps[currentStep].target!)
    const panel = panelRef.current
    if (targetElement && panel) {
      const targetRect = targetElement.getBoundingClientRect()
      const panelRect = panel.getBoundingClientRect()
      const pos = getSmartPanelPosition(targetRect, panelRect)
      setPosition(pos)
      // Highlight
      targetElement.classList.add('help-highlight')
    }
  }, [isOpen, currentStep, steps])

  // Update position on open, step change, scroll, resize
  useEffect(() => {
    if (!isOpen || !steps[currentStep]?.target) return
    updatePanelPosition()
    window.addEventListener('scroll', updatePanelPosition, true)
    window.addEventListener('resize', updatePanelPosition)
    return () => {
      window.removeEventListener('scroll', updatePanelPosition, true)
      window.removeEventListener('resize', updatePanelPosition)
      // Remove highlight
      const targetElement = document.querySelector(steps[currentStep].target!)
      if (targetElement) targetElement.classList.remove('help-highlight')
    }
  }, [isOpen, currentStep, steps, updatePanelPosition])

  useEffect(() => {
    if (isOpen) setCurrentStep(0)
  }, [isOpen, setCurrentStep])

  if (!isOpen) return null

  const currentStepData = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleClick = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1)
    } else {
      setCurrentStep(0)
      onClose()
    }
  }

  const handleClose = () => {
    setCurrentStep(0)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Overlay with hole */}
      <div className="fixed inset-0 z-40" onClick={handleClick} style={{ pointerEvents: 'auto' }}>
        <svg
          className="w-full h-full"
          style={{ filter: 'drop-shadow(0 0 0 rgba(0, 0, 0, 0.2))' }}
        >
          <defs>
            <mask id="help-mask">
              <rect width="100%" height="100%" fill="white" />
              {steps[currentStep]?.target && (() => {
                const targetElement = document.querySelector(steps[currentStep].target!)
                if (targetElement) {
                  const rect = targetElement.getBoundingClientRect()
                  return (
                    <rect
                      x={rect.left}
                      y={rect.top}
                      width={rect.width}
                      height={rect.height}
                      fill="black"
                      rx="8"
                    />
                  )
                }
                return null
              })()}
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.2)"
            mask="url(#help-mask)"
          />
        </svg>
      </div>
      {/* Help Panel */}
      <div
        ref={panelRef}
        className="absolute z-50 bg-white border rounded-lg shadow-lg max-w-xs p-3 cursor-pointer pointer-events-auto"
        style={{
          top: position.top,
          left: position.left
        }}
        onClick={handleClick}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {currentStepData.title}
            </p>
            <p className="text-xs text-gray-600 leading-relaxed">
              {currentStepData.content}
            </p>
            <div className="text-xs text-gray-400 mt-2">
              {currentStep + 1} of {steps.length}
            </div>
          </div>
          <button
            onClick={e => {
              e.stopPropagation()
              handleClose()
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}
