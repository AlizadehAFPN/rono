"use client";

import { institutionApi, usersApi } from "@/lib/api/users";
import { ApiError } from "@/lib/api/client";
import type {
  InstitutionUpdate,
  UserCreate,
  UserUpdate,
} from "@/lib/types/users";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const USERS_KEY = ["users"] as const;
const INSTITUTION_KEY = ["institution"] as const;

const noRetryOn401 = (failureCount: number, error: unknown) => {
  if (
    error instanceof ApiError &&
    (error.status === 401 || error.status === 403)
  ) {
    return false;
  }
  return failureCount < 1;
};

export function useUsers() {
  return useQuery({
    queryKey: USERS_KEY,
    queryFn: () => usersApi.list(),
    staleTime: 60 * 1000,
    retry: noRetryOn401,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UserCreate) => usersApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UserUpdate }) =>
      usersApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: USERS_KEY }),
  });
}

export function useInstitution() {
  return useQuery({
    queryKey: INSTITUTION_KEY,
    queryFn: () => institutionApi.get(),
    staleTime: 5 * 60 * 1000,
    retry: noRetryOn401,
  });
}

export function useUpdateInstitution() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InstitutionUpdate) => institutionApi.update(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: INSTITUTION_KEY }),
  });
}
