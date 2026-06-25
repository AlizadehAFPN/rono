export interface OptionOut {
  id: string;
  key: string;
  content: string;
  is_correct: boolean;
  explanation: string | null;
  display_order: number;
}

/** A per-question media item (currently an image). */
export interface MediaAttachment {
  url: string;
  alt?: string | null;
}

export interface ItemVersionOut {
  id: string;
  item_id: string;
  version_number: number;
  content: string;
  explanation: string | null;
  options: OptionOut[];
  media_attachments?: MediaAttachment[];
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
  media_attachments?: MediaAttachment[];
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

// Employment-exam types. Mirrors backend app/core/exams.py::EXAM_TYPES.
export const EXAM_TYPE_LABELS: Record<string, string> = {
  executive: "دستگاه‌های اجرایی",
  education: "آموزش و پرورش",
  bank: "بانک‌ها",
  social_security: "تأمین اجتماعی",
  phd: "دکتری",
};

export const EXAM_TYPES = Object.keys(EXAM_TYPE_LABELS);

// Exam section: general (عمومی) vs specialized (تخصصی). Distinct from the topic taxonomy.
export const EXAM_PART_LABELS: Record<string, string> = {
  general: "عمومی",
  specialized: "تخصصی",
};

export const EXAM_PARTS = Object.keys(EXAM_PART_LABELS);

export const EXAM_SESSIONS = ["spring", "fall"];

export const STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  retired: "Retired",
};
