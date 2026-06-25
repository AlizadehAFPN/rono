import type {
  ItemCreate,
  ItemUpdate,
  ItemVersionCreate,
  ItemVersionOut,
  ItemWithTopics,
  PaginatedItems,
} from "@/lib/types/items";
import { api } from "./client";

const BASE = "/api/v1/items";

export interface ItemsFilter {
  status?: string;
  topic_id?: string;
  exam_type?: string;
  limit?: number;
  offset?: number;
}

function buildQuery(filter: ItemsFilter): string {
  const params = new URLSearchParams();
  if (filter.status) params.set("status", filter.status);
  if (filter.topic_id) params.set("topic_id", filter.topic_id);
  if (filter.exam_type) params.set("exam_type", filter.exam_type);
  if (filter.limit != null) params.set("limit", String(filter.limit));
  if (filter.offset != null) params.set("offset", String(filter.offset));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export const itemsApi = {
  list: (filter: ItemsFilter = {}) =>
    api.get<PaginatedItems>(`${BASE}/${buildQuery(filter)}`),

  get: (id: string) => api.get<ItemWithTopics>(`${BASE}/${id}`),

  create: (data: ItemCreate) => api.post<ItemWithTopics>(`${BASE}/`, data),

  update: (id: string, data: ItemUpdate) =>
    api.patch<ItemWithTopics>(`${BASE}/${id}`, data),

  delete: (id: string) => api.delete(`${BASE}/${id}`),

  createVersion: (id: string, data: ItemVersionCreate) =>
    api.post<ItemVersionOut>(`${BASE}/${id}/versions`, data),

  listVersions: (id: string) =>
    api.get<ItemVersionOut[]>(`${BASE}/${id}/versions`),

  // Upload a question image (web/PWA); returns its public URL to store in the
  // version's media_attachments when the item is saved.
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.postForm<{ url: string }>(`${BASE}/images`, form);
  },
};
