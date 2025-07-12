import { useState } from 'react';

interface WebhookConfigResult {
  total: number;
  successful: number;
  failed: number;
  errors: string[];
}

interface WebhookConfigResponse {
  success: boolean;
  message: string;
  results: WebhookConfigResult;
  webhookUrl: string;
}

export function useWebhookConfig() {
  const [configuring, setConfiguring] = useState(false);
  const [lastResult, setLastResult] = useState<WebhookConfigResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const configureWebhooks = async (webhookUrl: string): Promise<boolean> => {
    setConfiguring(true);
    setError(null);
    setLastResult(null);

    try {
      const response = await fetch('/api/tiendanube/webhooks/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to configure webhooks');
      }

      setLastResult(data);
      return data.success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      return false;
    } finally {
      setConfiguring(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const clearLastResult = () => {
    setLastResult(null);
  };

  return {
    configuring,
    lastResult,
    error,
    configureWebhooks,
    clearError,
    clearLastResult,
  };
}
