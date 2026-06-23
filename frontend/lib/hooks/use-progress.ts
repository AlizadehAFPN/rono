"use client";

import { progressApi } from "@/lib/api/progress";
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

export function useProgress() {
  return useQuery({
    queryKey: ["progress"],
    queryFn: () => progressApi.get(),
    staleTime: 60 * 1000,
    retry: noRetryOn401,
  });
}
