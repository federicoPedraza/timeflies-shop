"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "../convex/_generated/api"

interface ProductImagesProps {
  productId: number
  productName: string
}

export function ProductImages({ productId, productName }: ProductImagesProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const images = useQuery(api.products.getProductImages, { productId: productId })

  if (!images || images.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Product Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
            <p className="text-muted-foreground">No images available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentImage = images[currentImageIndex]

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Product Images ({images.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Main Image Display */}
          <div className="relative">
            <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={currentImage.src}
                alt={currentImage.alt || `${productName} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onClick={() => setIsZoomed(!isZoomed)}
              />

              {/* Navigation Buttons */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={previousImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Zoom Button */}
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              {/* Image Counter */}
              <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                {currentImageIndex + 1} / {images.length}
              </div>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.tiendanube_id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    index === currentImageIndex
                      ? "border-blue-500"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={image.src}
                    alt={image.alt || `${productName} - Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Image Details */}
          <div className="text-sm text-muted-foreground">
            <p><strong>Position:</strong> {currentImage.position}</p>
            {currentImage.alt && <p><strong>Alt Text:</strong> {currentImage.alt}</p>}
            <p><strong>Created:</strong> {new Date(currentImage.created_at).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> {new Date(currentImage.updated_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Zoom Modal */}
        {isZoomed && (
          <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
            onClick={() => setIsZoomed(false)}
          >
            <div className="relative max-w-4xl max-h-full p-4">
              <img
                src={currentImage.src}
                alt={currentImage.alt || `${productName} - Zoomed`}
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-4 right-4 bg-white/80 hover:bg-white"
                onClick={() => setIsZoomed(false)}
              >
                ×
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
