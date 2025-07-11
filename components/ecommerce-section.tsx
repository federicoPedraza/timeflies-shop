"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, ShoppingCart } from "lucide-react"
import { useEffect, useState } from "react"

interface TiendanubeStatus {
  status: boolean;
  business_id: string | null;
  error?: string;
  store_info?: {
    id: number;
    name: { en: string; es: string; pt: string };
    email: string;
    country: string;
    main_currency: string;
    plan_name: string;
  };
}

export function EcommerceSection() {
  const [tiendanubeStatus, setTiendanubeStatus] = useState<TiendanubeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkTiendanubeStatus() {
      try {
        const accessToken = localStorage.getItem('tiendanube_access_token');

        if (!accessToken) {
          setTiendanubeStatus({
            status: false,
            business_id: null,
            error: 'No access token found'
          });
          return;
        }

        const userId = localStorage.getItem('tiendanube_user_id');

        if (!userId) {
          setTiendanubeStatus({
            status: false,
            business_id: null,
            error: 'No user ID found'
          });
          return;
        }

        const response = await fetch('/api/tiendanube/store', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'x-tiendanube-user-id': userId
          }
        });

        const data: TiendanubeStatus = await response.json();
        setTiendanubeStatus(data);

        // Guardar o reemplazar business_id en localStorage si está disponible
        if (data.business_id) {
          localStorage.setItem('tiendanube_business_id', data.business_id);
        }

      } catch (error) {
        setTiendanubeStatus({
          status: false,
          business_id: null,
          error: 'Failed to check connection'
        });
      } finally {
        setLoading(false);
      }
    }

    checkTiendanubeStatus();
  }, []);

  const getStatusBadge = () => {
    if (loading) {
      return (
        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200">
          Checking...
        </Badge>
      );
    }

    if (tiendanubeStatus?.status) {
      return (
        <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
          Connected
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">
        Disconnected
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          E-Commerce
        </CardTitle>
        <CardDescription>
          Manage your online store connections and integrations
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className="flex flex-col">
                <span className="font-medium">Tiendanube</span>
                <span className="text-sm text-muted-foreground">
                  {tiendanubeStatus?.store_info?.name?.en || 'Online store platform'}
                </span>
                {tiendanubeStatus?.error && (
                  <span className="text-xs text-red-600">{tiendanubeStatus.error}</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://timefliesdemo.mitiendanube.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Go to shop
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
