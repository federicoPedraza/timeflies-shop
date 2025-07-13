"use client"
import { useEffect, useState } from "react"
import { useAuth } from "@/components/AuthProvider"

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

export function useTiendanubeStatus() {
  const [tiendanubeStatus, setTiendanubeStatus] = useState<TiendanubeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const { makeAuthenticatedRequest } = useAuth();

  useEffect(() => {
    async function checkTiendanubeStatus() {
      try {
        const response = await makeAuthenticatedRequest('/api/tiendanube/store', {
          headers: {
            'Content-Type': 'application/json',
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
  }, [makeAuthenticatedRequest]);

  return { tiendanubeStatus, loading };
}
