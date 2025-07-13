"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { EcommerceSection } from "@/components/ecommerce-section"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../convex/_generated/api"
import { useAuth } from "@/components/AuthProvider"
import { useState } from "react"

function AbandonedCheckoutsSection() {
  const { userId } = useAuth();
  const { count, lastDismiss } = useQuery(api.checkouts.getAbandonedCheckoutsInfo, {}) ?? { count: 0, lastDismiss: null };
  const dismissAll = useMutation(api.checkouts.dismissAllAbandonedCheckouts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDismiss = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      await dismissAll({ user_id: userId });
    } catch (e: any) {
      setError(e.message || "Error dismissing checkouts");
    }
    setLoading(false);
  };

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <h3 className="text-lg font-semibold">Abandoned Checkouts</h3>
      <p>There are <span className="font-bold">{count}</span> abandoned checkouts not dismissed.</p>
      <p className="text-sm text-muted-foreground">Dismissed checkouts cannot be handled yet. In the future, we may get more information about them.</p>
      {lastDismiss && (
        <p className="text-xs text-muted-foreground">Last dismiss: {new Date(lastDismiss.date).toLocaleString()} by user <span className="font-mono">{lastDismiss.user_id}</span> ({lastDismiss.count} checkouts)</p>
      )}
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        onClick={handleDismiss}
        disabled={loading || !userId || count === 0}
      >
        {loading ? "Dismissing..." : "Dismiss all checkouts"}
      </button>
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
            <p className="text-muted-foreground">Manage your store configuration and preferences.</p>
          </div>

          <AbandonedCheckoutsSection />
          <EcommerceSection />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
