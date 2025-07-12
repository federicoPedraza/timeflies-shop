import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }): Promise<Metadata> {
  const { productId } = await params;
  return {
    title: `Product ${productId} - Timeflies`,
    description: `View details for product ${productId}`,
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
