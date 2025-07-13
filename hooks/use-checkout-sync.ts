import { useState } from 'react';

interface CheckoutSyncResult {
  success: boolean;
  summary: {
    total_checkouts: number;
    added: number;
    updated: number;
    errors: number;
    timestamp: string;
  };
  message: string;
}

interface UseCheckoutSyncReturn {
  syncing: boolean;
  lastSyncResult: CheckoutSyncResult | null;
  error: string | null;
  syncCheckouts: (provider: string) => Promise<CheckoutSyncResult | null>;
  clearError: () => void;
  clearLastSyncResult: () => void;
}

export function useCheckoutSync(): UseCheckoutSyncReturn {
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<CheckoutSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const syncCheckouts = async (provider: string): Promise<CheckoutSyncResult | null> => {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch('/api/products/sync-checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      if (data.success) {
        setLastSyncResult(data);
        return data;
      } else {
        throw new Error(data.error || 'Sync failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Checkout sync error:', err);
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
    syncCheckouts,
    clearError,
    clearLastSyncResult,
  };
}
