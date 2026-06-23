import type {
  TopicCreate,
  TopicOut,
  TopicTree,
  TopicUpdate,
} from "@/lib/types/topics";
import { api } from "./client";

const BASE = "/api/v1/topics";

export const topicsApi = {
  list: () => api.get<TopicOut[]>(`${BASE}/`),

  tree: () => api.get<TopicTree[]>(`${BASE}/tree`),

  get: (id: string) => api.get<TopicOut>(`${BASE}/${id}`),

  create: (data: TopicCreate) => api.post<TopicOut>(`${BASE}/`, data),

  update: (id: string, data: TopicUpdate) =>
    api.patch<TopicOut>(`${BASE}/${id}`, data),

  delete: (id: string) => api.delete(`${BASE}/${id}`),
};
