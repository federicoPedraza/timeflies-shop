import { useState } from 'react';

interface SyncResult {
  success: boolean;
  summary: {
    total: number;
    added: number;
    updated: number;
    errors: number;
    errors_details: string[];
    orders_synced: number;
    products_processed: number;
    cleanup?: {
      total_orders: number;
      duplicates_removed: number;
      errors: number;
      errors_details: string[];
    };
    local_refresh?: {
      total_processed: number;
      updated: number;
      created: number;
      errors: number;
      errors_details: string[];
    };
  };
  timestamp: string;
}

export function useOrderSync() {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncOrders = async (provider: string = 'tiendanube'): Promise<SyncResult | null> => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result: SyncResult = await response.json();
      setLastSyncResult(result);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error syncing orders:', err);
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
    syncOrders,
    clearError,
    clearLastSyncResult,
  };
}
