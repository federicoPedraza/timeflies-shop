import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface TiendanubeWebhook {
  id: number;
  event: string;
  url: string;
  created_at: string;
  updated_at: string;
}

interface WebhookStatusResponse {
  status: boolean;
  total_webhooks: number;
  webhooks: TiendanubeWebhook[];
  webhooks_by_type: Record<string, TiendanubeWebhook[]>;
  summary: {
    product_events: number;
    order_events: number;
    app_events: number;
    category_events: number;
    other_events: number;
  };
}

export function useWebhookStatus() {
  const [checking, setChecking] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<WebhookStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { makeAuthenticatedRequest } = useAuth();

  // Auto-check webhook status on mount
  useEffect(() => {
    checkWebhookStatus();
  }, [makeAuthenticatedRequest]);

  const checkWebhookStatus = async (): Promise<boolean> => {
    setChecking(true);
    setError(null);
    setWebhookStatus(null);

    try {
      const response = await makeAuthenticatedRequest('/api/tiendanube/webhooks/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check webhook status');
      }

      if (!data.status) {
        throw new Error(data.error || 'Webhook status check failed');
      }

      setWebhookStatus(data);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setChecking(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearStatus = () => {
    setWebhookStatus(null);
  };

  return {
    checking,
    webhookStatus,
    error,
    checkWebhookStatus,
    clearError,
    clearStatus,
  };
}
