"use client"

import { use } from "react"
import { useNavigationLoading } from "@/hooks/use-navigation-loading"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { ProductDetailsInline } from "@/components/product-details-inline"
import { CopyIdButton } from "@/components/copy-id-button"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Share2, ExternalLink } from "lucide-react"
import { useMemo, useState, useCallback, useEffect } from "react"

interface ProductPageProps {
  params: Promise<{ productId: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { productId } = use(params);
  const products = useQuery(api.products.getProductsWithProviderData);
  const [copied, setCopied] = useState(false);
  const router = useNavigationLoading();

  // Find the product by Convex _id
  const product = useMemo(() => {
    if (!products) return null;
    return products.find((p) => p.id === productId) || null;
  }, [products, productId]);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, []);

  const handleBackToProducts = useCallback(() => {
    router.push("/products");
  }, [router]);

  const handleOpenTiendaNubeAdmin = useCallback(() => {
    if (product?.providerProductId) {
      const tiendanubeAdminUrl = process.env.NEXT_PUBLIC_TIENDANUBE_ADMIN_DASHBOARD || "https://timefliesdemo.mitiendanube.com/admin/v2";
      const productUrl = `${tiendanubeAdminUrl}/products/${product.providerProductId}`;
      window.open(productUrl, "_blank");
    }
  }, [product]);

  // Scroll to top when product is loaded
  useEffect(() => {
    if (product) {
      // Add a small delay to ensure the content is rendered
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }, 100)
    }
  }, [product]);

  if (products === undefined) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">Loading Product...</h2>
              <p className="text-muted-foreground">Fetching product details...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!product) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">Product Not Found</h2>
              <p className="text-muted-foreground">The product you&apos;re looking for doesn&apos;t exist.</p>
              <Button onClick={handleBackToProducts} className="mt-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={handleBackToProducts}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Products
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{product.name}</h1>
                <p className="text-muted-foreground">
                  {product.category} • {product.sku}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CopyIdButton
                orderId={product.providerProductId}
                className=""
              />
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                {copied ? "Copied!" : "Share"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleOpenTiendaNubeAdmin}>
                <ExternalLink className="mr-2 h-4 w-4" />
                View in TiendaNube
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <ProductDetailsInline product={product} showShareAndOpenButtons={false} />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
