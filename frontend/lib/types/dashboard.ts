// Student home dashboard — mirrors backend StudentDashboardOut.

import type { SessionBrief } from "@/lib/types/progress";

export interface AbilityOut {
  theta: number | null;
  theta_se: number | null;
  level: "beginner" | "developing" | "proficient" | "advanced" | string;
}

export interface ActivityPoint {
  date: string; // YYYY-MM-DD
  count: number;
}

export interface ThetaPoint {
  at: string;
  theta: number;
}

export interface SubjectRef {
  topic_id: string;
  topic_name: string;
  accuracy_rate: number | null;
}

export interface StudentDashboardOut {
  ability: AbilityOut;
  answered: number;
  correct: number;
  accuracy: number | null;
  sessions: number;
  library_total: number;
  library_seen: number;
  library_new: number;
  due_now: number;
  cards_learning: number;
  cards_review: number;
  topics_active: number;
  topics_mastered: number;
  mastery: Record<string, number>;
  streak_days: number;
  activity: ActivityPoint[];
  theta_trend: ThetaPoint[];
  strongest: SubjectRef | null;
  focus: SubjectRef | null;
  recent_sessions: SessionBrief[];
}
