export interface AnalyticsOverview {
  total_items: number;
  active_items: number;
  total_responses: number;
  overall_accuracy: number | null;
  total_users: number;
  completed_sessions: number;
}

export interface ItemStat {
  item_id: string;
  preview: string;
  exam_type: string | null;
  exam_part: string | null;
  irt_b: number | null;
  calibration_status: string;
  response_count: number;
  accuracy: number | null;
}

export interface ItemStatsResponse {
  items: ItemStat[];
}
