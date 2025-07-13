"use client"
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface SyncResult {
  success: boolean;
  provider: string;
  sync: {
    added: number;
    updated: number;
    errors: number;
    errors_details: string[];
  };
  imageSync: {
    added: number;
    updated: number;
    errors: number;
    errors_details: string[];
  };
  cleanup: {
    deleted: number;
    errors: number;
    errors_details: string[];
  };
  stats: {
    total: number;
    withPrice: number;
    withStock: number;
    lastSync: number | null;
  };
  summary: {
    total_products: number;
    total_images: number;
    added: number;
    updated: number;
    images_added: number;
    images_updated: number;
    deleted: number;
    errors: number;
  };
}

export function useProductSync() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { makeAuthenticatedRequest } = useAuth();

  const syncProducts = async (provider: string = 'tiendanube'): Promise<boolean> => {
    setSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const response = await makeAuthenticatedRequest('/api/products/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync products');
      }

      setSyncResult(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setSyncing(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearResult = () => {
    setSyncResult(null);
  };

  return {
    syncing,
    syncResult,
    error,
    syncProducts,
    clearError,
    clearResult,
  };
}
