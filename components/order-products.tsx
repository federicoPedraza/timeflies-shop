"use client";

import { Badge } from "./ui/badge";

interface Product {
  id: number;
  name: string;
  sku: string;
  price: string;
  quantity: number;
  image?: {
    src: string;
    alt: string[];
  };
}

interface OrderProductsProps {
  productsJson: string;
  currency: string;
}

export function OrderProducts({ productsJson, currency }: OrderProductsProps) {
  let products: Product[] = [];

  try {
    products = JSON.parse(productsJson);
  } catch (error) {
    console.error("Error parsing products JSON:", error);
    return (
      <div className="text-sm text-destructive">
        Error loading products
      </div>
    );
  }

  const formatCurrency = (amount: string) => {
    const numAmount = parseFloat(amount); // NO convertir de centavos - TiendaNube usa números enteros
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(numAmount);
  };

  const calculateTotal = () => {
    return products.reduce((total, product) => {
      return total + (parseFloat(product.price) * product.quantity);
    }, 0);
  };

  if (products.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No products
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg px-6 py-4">
      <div className="text-sm font-semibold mb-3 text-foreground">
        Products <span className="font-normal text-muted-foreground">({products.length})</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left font-medium text-muted-foreground w-12">Image</th>
              <th className="py-2 text-left font-medium text-muted-foreground">Name</th>
              <th className="py-2 text-left font-medium text-muted-foreground">SKU</th>
              <th className="py-2 text-left font-medium text-muted-foreground">Quantity</th>
              <th className="py-2 text-right font-medium text-muted-foreground">Price</th>
              <th className="py-2 text-right font-medium text-muted-foreground">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b last:border-0">
                <td className="py-2 pr-2">
                  {product.image?.src ? (
                    <img
                      src={product.image.src}
                      alt={product.image.alt?.[0] || product.name}
                      className="w-10 h-10 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-md bg-gray-200 flex items-center justify-center text-xs text-muted-foreground">—</div>
                  )}
                </td>
                <td className="py-2 font-medium text-foreground">{product.name}</td>
                <td className="py-2 text-xs text-muted-foreground">{product.sku}</td>
                <td className="py-2">
                  <Badge variant="secondary" className="text-xs">x{product.quantity}</Badge>
                </td>
                <td className="py-2 text-right font-mono">{formatCurrency(product.price)}</td>
                <td className="py-2 text-right text-xs text-muted-foreground">{formatCurrency((parseFloat(product.price) * product.quantity).toString())}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className="pt-3 text-right font-semibold text-foreground">Total:</td>
              <td className="pt-3 text-right font-bold text-foreground">{formatCurrency(calculateTotal().toString())}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
