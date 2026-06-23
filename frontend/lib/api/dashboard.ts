import type { StudentDashboardOut } from "@/lib/types/dashboard";
import { api } from "./client";

export const dashboardApi = {
  get: () => api.get<StudentDashboardOut>("/api/v1/me/dashboard"),
};
