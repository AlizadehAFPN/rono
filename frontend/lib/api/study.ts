import type { StudyOverviewOut } from "@/lib/types/study";
import { api } from "./client";

const BASE = "/api/v1/me";

export const studyApi = {
  overview: () => api.get<StudyOverviewOut>(`${BASE}/categories`),
};
