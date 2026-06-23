"use client";

import { authApi } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { useAuthStore } from "@/lib/stores/auth";
import type {
  ChangePasswordRequest,
  LoginRequest,
  MeResponse,
  ProfileUpdateRequest,
  RegisterRequest,
  SignupRequest,
} from "@/lib/types/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

// Auth transitions use a full navigation rather than router.push so the browser
// re-requests the destination with the freshly-set session cookies and the
// server renders the authenticated page. A client-side router.push here was
// being dropped (the page stayed on /login until a manual refresh).
function navigate(path: string) {
  if (typeof window !== "undefined") {
    window.location.assign(path);
  }
}

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

export function useMe() {
  const { setAuth, clearAuth, markInitialized } = useAuthStore();
  const tzSynced = useRef(false);

  const query = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: authApi.me,
    retry: (failureCount, error) => {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403)
      ) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (query.data) {
      setAuth(query.data.user, query.data.memberships);
    } else if (query.isError) {
      clearAuth();
    }
  }, [query.data, query.isError, setAuth, clearAuth]);

  useEffect(() => {
    if (!query.isPending) {
      markInitialized();
    }
  }, [query.isPending, markInitialized]);

  // Keep the stored timezone aligned with this device's local zone so Daily
  // Review boundaries (new-card cap, streak) use the user's real calendar day.
  // Best-effort, once per session — mirrors the iOS app.
  useEffect(() => {
    const user = query.data?.user;
    if (!user || tzSynced.current) return;
    const device = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!device || device === user.timezone) {
      tzSynced.current = true;
      return;
    }
    tzSynced.current = true;
    authApi
      .updateProfile({ timezone: device })
      .then((me) => setAuth(me.user, me.memberships))
      .catch(() => {
        tzSynced.current = false;
      });
  }, [query.data?.user, setAuth]);

  return query;
}

export function useLogin() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (data) => {
      setAuth(data.user, data.memberships);
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
      navigate("/dashboard");
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.memberships);
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
      navigate("/dashboard");
    },
  });
}

export function useSignup() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: SignupRequest) => authApi.signup(data),
    onSuccess: (data) => {
      setAuth(data.user, data.memberships);
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
      // Self-registered users are students — land them on their study journey.
      navigate("/dashboard/study");
    },
  });
}

export const SESSIONS_QUERY_KEY = ["auth", "sessions"] as const;

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (data: ProfileUpdateRequest) => authApi.updateProfile(data),
    onSuccess: (data: MeResponse) => {
      setAuth(data.user, data.memberships);
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });
}

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => authApi.uploadAvatar(file),
    onSuccess: (data: MeResponse) => {
      setAuth(data.user, data.memberships);
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  const { setAuth } = useAuthStore();

  return useMutation({
    mutationFn: () => authApi.deleteAvatar(),
    onSuccess: (data: MeResponse) => {
      setAuth(data.user, data.memberships);
      queryClient.setQueryData(AUTH_QUERY_KEY, data);
    },
  });
}

export function useChangePassword() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authApi.changePassword(data),
    onSuccess: () => {
      // Other sessions were revoked server-side — refresh the session list.
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY });
    },
  });
}

export function useSessions() {
  return useQuery({
    queryKey: SESSIONS_QUERY_KEY,
    queryFn: authApi.listSessions,
    staleTime: 60 * 1000,
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => authApi.revokeSession(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY }),
  });
}

export function useRevokeOtherSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => authApi.revokeOtherSessions(),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: SESSIONS_QUERY_KEY }),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { clearAuth } = useAuthStore();

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      queryClient.clear();
      navigate("/login");
    },
  });
}
