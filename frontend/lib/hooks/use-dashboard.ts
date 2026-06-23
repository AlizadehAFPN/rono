"use client";

import { dashboardApi } from "@/lib/api/dashboard";
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

export function useDashboard() {
  return useQuery({
    queryKey: ["student-dashboard"],
    queryFn: () => dashboardApi.get(),
    staleTime: 30 * 1000,
    retry: noRetryOn401,
  });
}
