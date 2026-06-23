"use client";

import type { MembershipOut, UserOut } from "@/lib/types/auth";
import { create } from "zustand";

interface AuthState {
  user: UserOut | null;
  memberships: MembershipOut[];
  isInitialized: boolean;
  institutionId: string | null;
  role: string | null;
}

interface AuthActions {
  setAuth: (user: UserOut, memberships: MembershipOut[]) => void;
  clearAuth: () => void;
  markInitialized: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  memberships: [],
  isInitialized: false,
  institutionId: null,
  role: null,

  setAuth: (user, memberships) =>
    set({
      user,
      memberships,
      institutionId: memberships[0]?.institution_id ?? null,
      role: memberships[0]?.role ?? null,
      isInitialized: true,
    }),

  clearAuth: () =>
    set({
      user: null,
      memberships: [],
      institutionId: null,
      role: null,
      isInitialized: true,
    }),

  markInitialized: () => set({ isInitialized: true }),
}));
