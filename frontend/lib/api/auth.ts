import type {
  ChangePasswordRequest,
  LoginRequest,
  MeResponse,
  ProfileUpdateRequest,
  RegisterRequest,
  SessionOut,
  SignupRequest,
} from "@/lib/types/auth";
import { api } from "./client";

const BASE = "/api/v1/auth";

export const authApi = {
  register: (data: RegisterRequest) =>
    api.post<MeResponse>(`${BASE}/register`, data),

  signup: (data: SignupRequest) => api.post<MeResponse>(`${BASE}/signup`, data),

  login: (data: LoginRequest) => api.post<MeResponse>(`${BASE}/login`, data),

  logout: () => api.post<void>(`${BASE}/logout`),

  refresh: () => api.post<MeResponse>(`${BASE}/refresh`),

  me: () => api.get<MeResponse>(`${BASE}/me`),

  updateProfile: (data: ProfileUpdateRequest) =>
    api.patch<MeResponse>(`${BASE}/me`, data),

  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.putForm<MeResponse>(`${BASE}/me/avatar`, form);
  },

  deleteAvatar: () => api.delete<MeResponse>(`${BASE}/me/avatar`),

  changePassword: (data: ChangePasswordRequest) =>
    api.post<void>(`${BASE}/change-password`, data),

  listSessions: () => api.get<SessionOut[]>(`${BASE}/sessions`),

  revokeSession: (id: string) => api.delete(`${BASE}/sessions/${id}`),

  revokeOtherSessions: () => api.delete(`${BASE}/sessions/others`),
};
