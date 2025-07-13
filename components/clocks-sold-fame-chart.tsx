"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, TrendingUp, Award, DollarSign, BarChart3 } from "lucide-react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function ClocksSoldFameChart() {
  const router = useRouter()
  const salesRanking = useQuery(api.products.getProductSalesRanking)

  if (!salesRanking) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Clocks Sold Fame Chart</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/analytics#performance')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Loading sales data for the last 6 months...
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (salesRanking.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Clocks Sold Fame Chart</CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/analytics#performance')}
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              View Analytics
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            No sales data available for the last 6 months.
          </p>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <TrendingUp className="h-16 w-16 text-muted-foreground mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-muted-foreground">No Sales Data</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  No products were sold in the last 6 months. This chart will show the most popular products once sales data is available.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Clocks Sold Fame Chart</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/analytics#performance')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Top selling products over the last 6 months (non-cancelled orders).
        </p>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <div className="space-y-3 overflow-y-auto flex-1">
          {salesRanking.map((product, index) => (
            <div
              key={product.productId}
              className={cn(
                "flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 cursor-pointer",
                index === 0 ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 hover:from-yellow-100 hover:to-orange-100" :
                index === 1 ? "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 hover:from-gray-100 hover:to-slate-100" :
                index === 2 ? "bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200 hover:from-amber-100 hover:to-yellow-100" :
                "bg-white border-gray-100 hover:bg-gray-50"
              )}
              onClick={() => {
                if (product._id) {
                  router.push(`/products/${product._id}`)
                }
              }}
            >
              {/* Rank */}
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold",
                index === 0 ? "bg-yellow-500 text-white" :
                index === 1 ? "bg-gray-400 text-white" :
                index === 2 ? "bg-amber-600 text-white" :
                "bg-gray-200 text-gray-700"
              )}>
                {index + 1}
              </div>

              {/* Product Image */}
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {product.images && product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={cn(
                  "w-full h-full flex items-center justify-center bg-gray-200",
                  product.images && product.images.length > 0 ? "hidden" : ""
                )}>
                  <Clock className="h-6 w-6 text-gray-400" />
                </div>
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{product.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{product.sku}</p>
              </div>

              {/* Sales Stats */}
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-sm font-semibold">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  {product.quantitySold}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  {product.revenue.toFixed(2)}
                </div>
              </div>

              {/* Award Icon for Top 3 */}
              {index < 3 && (
                <div className="flex-shrink-0">
                  <Award className={cn(
                    "h-5 w-5",
                    index === 0 ? "text-yellow-500" :
                    index === 1 ? "text-gray-400" :
                    "text-amber-600"
                  )} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200 flex-shrink-0">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900">
                {salesRanking.length}
              </div>
              <div className="text-xs text-muted-foreground">Products Sold</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {salesRanking.reduce((sum, p) => sum + p.quantitySold, 0)}
              </div>
              <div className="text-xs text-muted-foreground">Total Units</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                ${salesRanking.reduce((sum, p) => sum + p.revenue, 0).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">Total Revenue</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
