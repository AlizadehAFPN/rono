import type { Progress } from "@/lib/types/progress";
import { api } from "./client";

export const progressApi = {
  get: () => api.get<Progress>("/api/v1/me/progress"),
};
