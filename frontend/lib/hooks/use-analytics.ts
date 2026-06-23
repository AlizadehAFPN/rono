"use client";

import { analyticsApi } from "@/lib/api/analytics";
import { ApiError } from "@/lib/api/client";
import { useQuery } from "@tanstack/react-query";

const noRetryOn401 = (failureCount: number, error: unknown) => {
  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    return false;
  }
  return failureCount < 1;
};

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => analyticsApi.overview(),
    staleTime: 60 * 1000,
    retry: noRetryOn401,
  });
}

export function useItemStats(limit = 50) {
  return useQuery({
    queryKey: ["analytics", "items", limit],
    queryFn: () => analyticsApi.items(limit),
    staleTime: 60 * 1000,
    retry: noRetryOn401,
  });
}
