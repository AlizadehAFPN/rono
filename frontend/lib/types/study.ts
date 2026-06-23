// Study-journey category cards — mirror backend app/schemas/progress.py
// (CategoryCardOut / StudyOverviewOut).

export type JourneyState = "not_started" | "learning" | "reviewing" | "mastered";
export type MasteryLevel =
  | "not_started"
  | "needs_review"
  | "developing"
  | "proficient"
  | "mastered";

export interface CategoryCardOut {
  topic_id: string;
  topic_name: string;
  level: number;
  exam_type: string | null;
  total_questions: number;
  answered: number;
  new_count: number;
  due_count: number;
  mastery_level: MasteryLevel | string;
  topic_theta: number | null;
  accuracy_rate: number | null;
  journey_state: JourneyState | string;
  recommended_mode: "adaptive_practice" | "review" | null;
}

export interface StudyOverviewOut {
  categories: CategoryCardOut[];
}
