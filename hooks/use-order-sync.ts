import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface SyncResult {
  success: boolean;
  summary: {
    added: number;
    updated: number;
    errors: number;
    errors_details: string[];
  };
  timestamp: string;
}

export function useOrderSync() {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { makeAuthenticatedRequest } = useAuth();

  const syncOrders = async (provider: string = 'tiendanube'): Promise<boolean> => {
    setSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      const response = await makeAuthenticatedRequest('/api/orders/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync orders');
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
    syncOrders,
    clearError,
    clearResult,
  };
}
