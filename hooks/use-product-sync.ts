"use client"
import { useState } from "react"

interface SyncResult {
  success: boolean;
  provider: string;
  sync: {
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
    added: number;
    updated: number;
    deleted: number;
    errors: number;
  };
}

interface SyncError {
  error: string;
  success: false;
  details?: string;
}

export function useProductSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncProducts = async (provider: string): Promise<SyncResult | null> => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/products/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider })
      });

      const data: SyncResult | SyncError = await response.json();

      if (!response.ok) {
        const errorData = data as SyncError;
        throw new Error(errorData.error || 'Failed to sync products');
      }

      if (!data.success) {
        const errorData = data as SyncError;
        throw new Error(errorData.error || 'Sync failed');
      }

      const syncResult = data as SyncResult;
      setLastSyncResult(syncResult);
      return syncResult;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setSyncing(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearLastSyncResult = () => {
    setLastSyncResult(null);
  };

  return {
    syncing,
    lastSyncResult,
    error,
    syncProducts,
    clearError,
    clearLastSyncResult
  };
}
