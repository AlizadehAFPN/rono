import type {
  AnswerResultOut,
  AnswerSubmitRequest,
  BulkAnswerResultOut,
  BulkAnswerSubmitRequest,
  ExamPaperOut,
  NextResult,
  SessionOut,
  SessionStartRequest,
  SessionSummaryOut,
} from "@/lib/types/practice";
import { api } from "./client";

const BASE = "/api/v1/sessions";

export const practiceApi = {
  start: (data: SessionStartRequest) => api.post<SessionOut>(`${BASE}/`, data),

  get: (id: string) => api.get<SessionOut>(`${BASE}/${id}`),

  next: (id: string) => api.get<NextResult>(`${BASE}/${id}/next`),

  examPaper: (id: string, count?: number) =>
    api.get<ExamPaperOut>(
      `${BASE}/${id}/exam-paper${count != null ? `?count=${count}` : ""}`,
    ),

  answer: (id: string, data: AnswerSubmitRequest) =>
    api.post<AnswerResultOut>(`${BASE}/${id}/answer`, data),

  bulkAnswer: (id: string, data: BulkAnswerSubmitRequest) =>
    api.post<BulkAnswerResultOut>(`${BASE}/${id}/bulk-answers`, data),

  finish: (id: string) => api.post<SessionSummaryOut>(`${BASE}/${id}/finish`),
};
