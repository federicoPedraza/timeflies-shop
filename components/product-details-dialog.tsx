"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Save, X, AlertTriangle } from "lucide-react"
import { format } from "date-fns"
import type { Product } from "@/components/products-page-content"

interface ProductDetailsDialogProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onUpdate?: (product: Product) => void
}

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  discontinued: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function ProductDetailsDialog({ product, isOpen, onClose, onUpdate }: ProductDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedProduct, setEditedProduct] = useState<Product | null>(null)

  if (!product) return null

  const handleEdit = () => {
    setEditedProduct({ ...product })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editedProduct && onUpdate) {
      onUpdate({ ...editedProduct, updatedAt: new Date().toISOString() })
      setIsEditing(false)
      setEditedProduct(null)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditedProduct(null)
  }

  const currentProduct = editedProduct || product
  const profitMargin = currentProduct.profitMargin
  const isLowStock = currentProduct.stockQuantity <= currentProduct.lowStockThreshold
  const isOutOfStock = currentProduct.stockQuantity === 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                {currentProduct.name}
                <Badge className={statusColors[currentProduct.status]}>{currentProduct.status}</Badge>
                {isLowStock && !isOutOfStock && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                {isOutOfStock && <AlertTriangle className="h-4 w-4 text-red-500" />}
              </DialogTitle>
              <DialogDescription>SKU: {currentProduct.sku}</DialogDescription>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={handleEdit} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} size="sm">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Product Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {currentProduct.images.map((image, index) => (
                      <img
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`${currentProduct.name} ${index + 1}`}
                        className="h-24 w-24 rounded object-cover border"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="name">Product Name</Label>
                        <Input
                          id="name"
                          value={editedProduct?.name || ""}
                          onChange={(e) =>
                            setEditedProduct((prev) => (prev ? { ...prev, name: e.target.value } : null))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={editedProduct?.description || ""}
                          onChange={(e) =>
                            setEditedProduct((prev) => (prev ? { ...prev, description: e.target.value } : null))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select
                          value={editedProduct?.status || ""}
                          onValueChange={(value: string) =>
                            setEditedProduct((prev) => (prev ? { ...prev, status: value as Product["status"] } : null))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="discontinued">Discontinued</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="font-medium">Category:</span> {currentProduct.category} /{" "}
                        {currentProduct.subcategory}
                      </div>
                      <div>
                        <span className="font-medium">Brand:</span> {currentProduct.brand}
                      </div>
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-sm text-muted-foreground mt-1">{currentProduct.description}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pricing Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isEditing ? (
                    <>
                      <div>
                        <Label htmlFor="price">Selling Price ($)</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={editedProduct?.price || ""}
                          onChange={(e) =>
                            setEditedProduct((prev) =>
                              prev ? { ...prev, price: Number.parseFloat(e.target.value) } : null,
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="compareAtPrice">Compare At Price ($)</Label>
                        <Input
                          id="compareAtPrice"
                          type="number"
                          step="0.01"
                          value={editedProduct?.compareAtPrice || ""}
                          onChange={(e) =>
                            setEditedProduct((prev) =>
                              prev ? { ...prev, compareAtPrice: Number.parseFloat(e.target.value) } : null,
                            )
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="costPrice">Cost Price ($)</Label>
                        <Input
                          id="costPrice"
                          type="number"
                          step="0.01"
                          value={editedProduct?.costPrice || ""}
                          onChange={(e) =>
                            setEditedProduct((prev) =>
                              prev ? { ...prev, costPrice: Number.parseFloat(e.target.value) } : null,
                            )
                          }
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span>Selling Price:</span>
                        <span className="font-medium">${currentProduct.price.toFixed(2)}</span>
                      </div>
                      {currentProduct.compareAtPrice && (
                        <div className="flex justify-between">
                          <span>Compare At Price:</span>
                          <span className="line-through text-muted-foreground">
                            ${currentProduct.compareAtPrice.toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Cost Price:</span>
                        <span>${currentProduct.costPrice.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Profit Margin:</span>
                        <span className={profitMargin > 50 ? "text-green-600" : "text-yellow-600"}>
                          {profitMargin.toFixed(1)}%
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Financial Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Profit per Unit:</span>
                    <span className="font-medium">${(currentProduct.price - currentProduct.costPrice).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Potential Revenue:</span>
                    <span className="font-medium">
                      ${(currentProduct.price * currentProduct.stockQuantity).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Inventory Value:</span>
                    <span className="font-medium">
                      ${(currentProduct.costPrice * currentProduct.stockQuantity).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Stock Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isEditing ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div>
                      <Label htmlFor="stockQuantity">Stock Quantity</Label>
                      <Input
                        id="stockQuantity"
                        type="number"
                        value={editedProduct?.stockQuantity || ""}
                        onChange={(e) =>
                          setEditedProduct((prev) =>
                            prev ? { ...prev, stockQuantity: Number.parseInt(e.target.value) } : null,
                          )
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                      <Input
                        id="lowStockThreshold"
                        type="number"
                        value={editedProduct?.lowStockThreshold || ""}
                        onChange={(e) =>
                          setEditedProduct((prev) =>
                            prev ? { ...prev, lowStockThreshold: Number.parseInt(e.target.value) } : null,
                          )
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>Current Stock:</span>
                      <span className="font-medium">{currentProduct.stockQuantity} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Stock Threshold:</span>
                      <span>{currentProduct.lowStockThreshold} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock Status:</span>
                      <Badge
                        className={
                          isOutOfStock
                            ? "bg-red-100 text-red-800"
                            : isLowStock
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Physical Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Weight:</span>
                    <span>{currentProduct.weight} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dimensions:</span>
                    <span>
                      {currentProduct.dimensions.length} × {currentProduct.dimensions.width} ×{" "}
                      {currentProduct.dimensions.height} cm
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Materials:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentProduct.materials.map((material, index) => (
                        <Badge key={index} variant="outline">
                          {material}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Warranty:</span> {currentProduct.warranty}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Features & Tags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <span className="font-medium">Features:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentProduct.features.map((feature, index) => (
                        <Badge key={index} variant="secondary">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {currentProduct.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="text-sm text-muted-foreground">
                    <div>Created: {format(new Date(currentProduct.createdAt), "MMM dd, yyyy")}</div>
                    <div>Updated: {format(new Date(currentProduct.updatedAt), "MMM dd, yyyy")}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
