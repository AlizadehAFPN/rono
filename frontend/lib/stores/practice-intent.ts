import { create } from "zustand";

// A one-shot hand-off from the study dashboard to the practice runner: the
// student clicks a category card, we stash *what* to study here, then navigate
// to /dashboard/practice which consumes the intent on mount and auto-starts a
// topic-scoped session (skipping the manual setup form). Cleared once consumed.

export interface PracticeIntent {
  topicId: string | null;
  topicName: string;
  examType: string | null;
  mode: string; // "adaptive_practice" | "review" | "daily_review"
  count: number;
  // Daily-review-only fields (ignored for single-topic study sessions).
  topicIds?: string[] | null; // chosen collections; null/empty = all
  limitType?: "count" | "time"; // budget kind
  timeLimitMinutes?: number | null; // when limitType === "time"
  selfRatedLevel?: "beginner" | "developing" | "proficient" | "advanced" | null;
}

interface PracticeIntentStore {
  intent: PracticeIntent | null;
  setIntent: (intent: PracticeIntent) => void;
  consume: () => PracticeIntent | null;
  clear: () => void;
}

export const usePracticeIntentStore = create<PracticeIntentStore>((set, get) => ({
  intent: null,
  setIntent: (intent) => set({ intent }),
  consume: () => {
    const current = get().intent;
    if (current) set({ intent: null });
    return current;
  },
  clear: () => set({ intent: null }),
}));
