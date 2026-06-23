import type {
  Institution,
  InstitutionUpdate,
  PaginatedUsers,
  UserCreate,
  UserListItem,
  UserUpdate,
} from "@/lib/types/users";
import { api } from "./client";

export const usersApi = {
  list: (limit = 100, offset = 0) =>
    api.get<PaginatedUsers>(`/api/v1/users/?limit=${limit}&offset=${offset}`),

  create: (data: UserCreate) => api.post<UserListItem>("/api/v1/users/", data),

  update: (id: string, data: UserUpdate) =>
    api.patch<UserListItem>(`/api/v1/users/${id}`, data),
};

export const institutionApi = {
  get: () => api.get<Institution>("/api/v1/institution/"),

  update: (data: InstitutionUpdate) =>
    api.patch<Institution>("/api/v1/institution/", data),
};
