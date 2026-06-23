import type {
  AnalyticsOverview,
  ItemStatsResponse,
} from "@/lib/types/analytics";
import { api } from "./client";

export const analyticsApi = {
  overview: () => api.get<AnalyticsOverview>("/api/v1/analytics/overview"),
  items: (limit = 50) =>
    api.get<ItemStatsResponse>(`/api/v1/analytics/items?limit=${limit}`),
};
