import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ orderId: string }> }): Promise<Metadata> {
  const { orderId } = await params;
  return {
    title: `Order ${orderId} - Timeflies`,
    description: `View details for order ${orderId}`,
  };
}

export default function OrderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
