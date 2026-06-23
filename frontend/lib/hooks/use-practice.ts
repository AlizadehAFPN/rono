"use client";

import { practiceApi } from "@/lib/api/practice";
import type {
  AnswerSubmitRequest,
  SessionStartRequest,
} from "@/lib/types/practice";
import { useMutation } from "@tanstack/react-query";

// The practice flow is inherently sequential (start → next → answer → finish),
// so each step is an imperative mutation driven by the page's local state.

export function useStartSession() {
  return useMutation({
    mutationFn: (data: SessionStartRequest) => practiceApi.start(data),
  });
}

export function useNextItem() {
  return useMutation({
    mutationFn: (sessionId: string) => practiceApi.next(sessionId),
  });
}

export function useExamPaper() {
  return useMutation({
    mutationFn: ({ id, count }: { id: string; count?: number }) =>
      practiceApi.examPaper(id, count),
  });
}

export function useSubmitAnswer() {
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: AnswerSubmitRequest }) =>
      practiceApi.answer(id, data),
  });
}

export function useBulkSubmitAnswers() {
  return useMutation({
    mutationFn: ({ id, answers }: { id: string; answers: AnswerSubmitRequest[] }) =>
      practiceApi.bulkAnswer(id, { answers }),
  });
}

export function useFinishSession() {
  return useMutation({
    mutationFn: (sessionId: string) => practiceApi.finish(sessionId),
  });
}
