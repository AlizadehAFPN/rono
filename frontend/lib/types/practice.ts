// Practice/exam session types — mirror backend app/schemas/practice.py

export interface SessionStartRequest {
  session_type?: string;
  exam_type?: string | null;
  exam_part?: string | null;
  topic_id?: string | null;
  // Daily review: chosen collections (topics). Empty/omitted = all collections.
  topic_ids?: string[] | null;
  items_target?: number | null;
  // Daily review budget: "count" caps at items_target; "time" caps at minutes.
  limit_type?: "count" | "time" | null;
  time_limit_minutes?: number | null;
  // Cold-start only: seeds selection ability for a brand-new learner.
  self_rated_level?: "beginner" | "developing" | "proficient" | "advanced" | null;
  device_type?: string | null;
}

export interface SessionOut {
  id: string;
  session_type: string;
  status: string;
  exam_type_scope: string | null;
  exam_part_scope: string | null;
  topic_scope: string | null;
  limit_type: "count" | "time" | null;
  time_limit_minutes: number | null;
  items_target: number | null;
  items_delivered: number;
  items_correct: number;
  score_percent: number | null;
  theta_start: number | null;
  theta_end: number | null;
  started_at: string;
  completed_at: string | null;
}

export interface NextOptionOut {
  id: string;
  key: string;
  content: string;
  display_order: number;
}

export interface NextItemOut {
  session_id: string;
  item_id: string;
  item_version_id: string;
  content: string;
  options: NextOptionOut[];
  primary_topic_id: string | null;
  selection_theta: number;
  item_irt_a: number;
  item_irt_b: number;
  fisher_information: number;
  items_delivered: number;
  items_target: number | null;
}

export interface NoMoreItems {
  session_id: string;
  detail: string;
  items_delivered: number;
}

export type NextResult = NextItemOut | NoMoreItems;

export function isNextItem(r: NextResult): r is NextItemOut {
  return "item_id" in r;
}

export interface ExamItemOut {
  item_id: string;
  item_version_id: string;
  content: string;
  options: NextOptionOut[];
  primary_topic_id: string | null;
}

export interface ExamPaperOut {
  session_id: string;
  items: ExamItemOut[];
  count: number;
}

export interface AnswerSubmitRequest {
  item_id: string;
  selected_option_id?: string | null;
  response_time_ms?: number | null;
  was_skipped?: boolean;
  is_timed_out?: boolean;
}

export interface CardScheduleOut {
  rating: number;
  state: string;
  stability: number;
  difficulty: number;
  due_at: string | null;
  scheduled_interval_days: number;
  reps: number;
  lapses: number;
}

export interface AnswerResultOut {
  response_id: number;
  item_id: string;
  is_correct: boolean;
  was_skipped: boolean;
  correct_option_id: string | null;
  explanation: string | null;
  theta_before: number;
  theta_after: number;
  theta_se_after: number;
  topic_theta_after: number | null;
  card: CardScheduleOut;
  items_delivered: number;
  items_correct: number;
}

export interface BulkAnswerSubmitRequest {
  answers: AnswerSubmitRequest[];
}

export interface BulkAnswerResultOut {
  results: AnswerResultOut[];
}

export interface SessionSummaryOut {
  id: string;
  status: string;
  items_delivered: number;
  items_correct: number;
  items_skipped: number;
  items_wrong: number;
  score_percent: number | null;
  net_score: number | null;
  penalty_per_wrong: number | null;
  theta_start: number | null;
  theta_end: number | null;
  theta_delta: number | null;
  started_at: string;
  completed_at: string | null;
  time_spent_seconds: number | null;
}
