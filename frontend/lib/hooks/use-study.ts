"use client";

import { studyApi } from "@/lib/api/study";
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

export function useStudyOverview() {
  return useQuery({
    queryKey: ["study-overview"],
    queryFn: () => studyApi.overview(),
    staleTime: 30 * 1000,
    retry: noRetryOn401,
  });
}
