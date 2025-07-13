"use client"

import { useState, useEffect } from "react"
import { CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Product } from "@/components/products-page-content"

interface ProductsFiltersProps {
  products: Product[]
  onFilteredProductsChange: (filteredProducts: Product[]) => void
  initialSearch?: string | null
  initialStockStatus?: string | null
  isOptionsCollapsed: boolean
  setIsOptionsCollapsed: (collapsed: boolean) => void
  activeFiltersCount: number
  clearFilters: () => void
}

export function ProductsFilters({ products, onFilteredProductsChange, initialSearch, initialStockStatus, isOptionsCollapsed }: ProductsFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearch || "")
  const [category, setCategory] = useState<string>("all")
  const [status, setStatus] = useState<string>("all")
  const [stockStatus, setStockStatus] = useState<string>(initialStockStatus || "all")
  const [brand, setBrand] = useState<string>("all")
  const [minPrice, setMinPrice] = useState("")
  const [maxPrice, setMaxPrice] = useState("")

  // Get unique values for filter options
  const categories = Array.from(new Set(products.map((p) => p.category)))
  const brands = Array.from(new Set(products.map((p) => p.brand)))

  // Update search term when initialSearch prop changes
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchTerm(initialSearch || "")
    }
  }, [initialSearch])

  // Update stock status when initialStockStatus prop changes
  useEffect(() => {
    if (initialStockStatus !== undefined) {
      setStockStatus(initialStockStatus || "all")
    }
  }, [initialStockStatus])

  useEffect(() => {
    let filtered = products

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Category filter
    if (category !== "all") {
      filtered = filtered.filter((product) => product.category === category)
    }

    // Status filter
    if (status !== "all") {
      filtered = filtered.filter((product) => product.status === status)
    }

    // Stock status filter
    if (stockStatus !== "all") {
      if (stockStatus === "in_stock") {
        filtered = filtered.filter((product) => product.stockQuantity > 0)
      } else if (stockStatus === "out_of_stock") {
        filtered = filtered.filter((product) => product.stockQuantity === 0)
      } else if (stockStatus === "low_stock") {
        filtered = filtered.filter(
          (product) => product.stockQuantity <= product.lowStockThreshold && product.stockQuantity > 0,
        )
      }
    }

    // Brand filter
    if (brand !== "all") {
      filtered = filtered.filter((product) => product.brand === brand)
    }

    // Price range filter
    if (minPrice) {
      filtered = filtered.filter((product) => product.price >= Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      filtered = filtered.filter((product) => product.price <= Number.parseFloat(maxPrice))
    }

    onFilteredProductsChange(filtered)
  }, [products, searchTerm, category, status, stockStatus, brand, minPrice, maxPrice, onFilteredProductsChange])

  return (
    <>
      {!isOptionsCollapsed && (
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Name, SKU, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="discontinued">Discontinued</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Stock Status</Label>
              <Select value={stockStatus} onValueChange={setStockStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Stock</SelectItem>
                  <SelectItem value="in_stock">In Stock</SelectItem>
                  <SelectItem value="low_stock">Low Stock</SelectItem>
                  <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Brand</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Brands</SelectItem>
                  {brands.map((brandName) => (
                    <SelectItem key={brandName} value={brandName}>
                      {brandName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPrice">Min Price ($)</Label>
              <Input
                id="minPrice"
                type="number"
                placeholder="0.00"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice">Max Price ($)</Label>
              <Input
                id="maxPrice"
                type="number"
                placeholder="1000.00"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      )}
    </>
  )
}
