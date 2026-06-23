"use client";

import { topicsApi } from "@/lib/api/topics";
import { ApiError } from "@/lib/api/client";
import type { TopicCreate, TopicUpdate } from "@/lib/types/topics";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const TOPICS_QUERY_KEY = ["topics"] as const;
export const TOPICS_TREE_QUERY_KEY = ["topics", "tree"] as const;

const noRetryOn401 = (failureCount: number, error: unknown) => {
  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    return false;
  }
  return failureCount < 1;
};

export function useTopicsTree() {
  return useQuery({
    queryKey: TOPICS_TREE_QUERY_KEY,
    queryFn: topicsApi.tree,
    staleTime: 5 * 60 * 1000,
    retry: noRetryOn401,
  });
}

export function useTopics() {
  return useQuery({
    queryKey: TOPICS_QUERY_KEY,
    queryFn: topicsApi.list,
    staleTime: 5 * 60 * 1000,
    retry: noRetryOn401,
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: [...TOPICS_QUERY_KEY, id],
    queryFn: () => topicsApi.get(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: noRetryOn401,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TopicCreate) => topicsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOPICS_QUERY_KEY });
    },
  });
}

export function useUpdateTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TopicUpdate }) =>
      topicsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOPICS_QUERY_KEY });
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => topicsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TOPICS_QUERY_KEY });
    },
  });
}
