"use client"

import { use } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { ProductDetailsInline } from "@/components/product-details-inline";
import { DashboardLayout } from "@/components/dashboard-layout";
import { useMemo, useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Share2, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface ProductPageProps {
  params: Promise<{ productId: string }>;
}

export default function ProductPage({ params }: ProductPageProps) {
  const { productId } = use(params);
  const products = useQuery(api.products.getProductsWithProviderData);
  const [copied, setCopied] = useState(false);
  const router = useRouter();

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
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Loading Product...</h2>
            <p className="text-muted-foreground">Fetching product details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">Product Not Found</h2>
            <p className="text-muted-foreground">No product found with the provided ID.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full py-8 px-8">
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleBackToProducts}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
            {product.providerProductId && (
              <Button
                variant="outline"
                onClick={handleOpenTiendaNubeAdmin}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Product in TiendaNube
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            {copied ? "Copied!" : "Share"}
          </Button>
        </div>

        <ProductDetailsInline
          product={product}
          showShareAndOpenButtons={false}
        />
      </div>
    </DashboardLayout>
  );
}
