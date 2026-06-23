"use client";

import { itemsApi, type ItemsFilter } from "@/lib/api/items";
import { ApiError } from "@/lib/api/client";
import type {
  ItemCreate,
  ItemUpdate,
  ItemVersionCreate,
} from "@/lib/types/items";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const ITEMS_QUERY_KEY = ["items"] as const;

const noRetryOn401 = (failureCount: number, error: unknown) => {
  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    return false;
  }
  return failureCount < 1;
};

export function useItems(filter: ItemsFilter = {}) {
  return useQuery({
    queryKey: [...ITEMS_QUERY_KEY, filter],
    queryFn: () => itemsApi.list(filter),
    staleTime: 2 * 60 * 1000,
    retry: noRetryOn401,
  });
}

export function useItem(id: string) {
  return useQuery({
    queryKey: [...ITEMS_QUERY_KEY, id],
    queryFn: () => itemsApi.get(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    retry: noRetryOn401,
  });
}

export function useItemVersions(id: string) {
  return useQuery({
    queryKey: [...ITEMS_QUERY_KEY, id, "versions"],
    queryFn: () => itemsApi.listVersions(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
    retry: noRetryOn401,
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ItemCreate) => itemsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItemUpdate }) =>
      itemsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ITEMS_QUERY_KEY, id] });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ITEMS_QUERY_KEY });
    },
  });
}

export function useCreateItemVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ItemVersionCreate }) =>
      itemsApi.createVersion(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [...ITEMS_QUERY_KEY, id] });
      queryClient.invalidateQueries({
        queryKey: [...ITEMS_QUERY_KEY, id, "versions"],
      });
    },
  });
}
