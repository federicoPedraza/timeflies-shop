import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function useWebhookLogs(limit?: number, skip?: number) {
  return useQuery(api.products.getWebhookLogsWithInternalIds, { limit, skip });
}
