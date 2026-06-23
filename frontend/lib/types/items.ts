export interface OptionOut {
  id: string;
  key: string;
  content: string;
  is_correct: boolean;
  explanation: string | null;
  display_order: number;
}

export interface ItemVersionOut {
  id: string;
  item_id: string;
  version_number: number;
  content: string;
  explanation: string | null;
  options: OptionOut[];
  is_published: boolean;
  change_summary: string | null;
  authored_by_id: string | null;
  published_at: string | null;
  created_at: string;
}

export interface ItemOut {
  id: string;
  institution_id: string;
  item_type: string;
  exam_type: string | null;
  exam_part: string | null;
  language: string;
  source: string | null;
  source_reference: string | null;
  exam_year: number | null;
  exam_session: string | null;
  status: string;
  calibration_status: string;
  irt_a: number | null;
  irt_b: number | null;
  irt_a_se: number | null;
  irt_b_se: number | null;
  irt_responses_used: number;
  current_version: ItemVersionOut | null;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ItemWithTopics extends ItemOut {
  topic_ids: string[];
  primary_topic_id: string | null;
}

export interface PaginatedItems {
  items: ItemOut[];
  total: number;
  limit: number;
  offset: number;
}

export interface OptionCreate {
  key: string;
  content: string;
  is_correct: boolean;
  explanation?: string | null;
  display_order?: number;
}

export interface ItemVersionCreate {
  content: string;
  explanation?: string | null;
  options: OptionCreate[];
  change_summary?: string | null;
}

export interface ItemCreate {
  item_type?: string;
  exam_type?: string | null;
  exam_part?: string | null;
  language?: string;
  source?: string | null;
  source_reference?: string | null;
  exam_year?: number | null;
  exam_session?: string | null;
  topic_ids?: string[];
  primary_topic_id?: string | null;
  difficulty_preset?: number | null;
  version: ItemVersionCreate;
}

export interface ItemUpdate {
  status?: string | null;
  exam_type?: string | null;
  exam_part?: string | null;
  language?: string | null;
  source?: string | null;
  source_reference?: string | null;
  exam_year?: number | null;
  exam_session?: string | null;
  topic_ids?: string[] | null;
  primary_topic_id?: string | null;
  difficulty_preset?: number | null;
}

export const EXAM_TYPE_LABELS: Record<string, string> = {
  usmle_step1: "USMLE Step 1",
  usmle_step2: "USMLE Step 2",
  usmle_step3: "USMLE Step 3",
  tus: "TUS",
  farzad: "Farzad",
};

export const EXAM_TYPES = Object.keys(EXAM_TYPE_LABELS);

// Exam-based section (TUS: TTBT vs KTBT). Distinct from the topic taxonomy.
export const EXAM_PART_LABELS: Record<string, string> = {
  basic_sciences: "Basic Sciences",
  clinical_sciences: "Clinical Sciences",
};

export const EXAM_PARTS = Object.keys(EXAM_PART_LABELS);

export const EXAM_SESSIONS = ["spring", "fall"];

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  retired: "Retired",
};
