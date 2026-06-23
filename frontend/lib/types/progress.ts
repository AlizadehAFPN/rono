// Mirrors backend app/schemas/progress.py

export interface TopicMastery {
  topic_id: string;
  topic_name: string;
  mastery_level: string;
  theta: number | null;
  total_responses: number;
  correct_responses: number;
  accuracy_rate: number | null;
}

export interface SessionBrief {
  id: string;
  session_type: string;
  status: string;
  items_delivered: number;
  items_correct: number;
  score_percent: number | null;
  net_score: number | null;
  started_at: string;
  completed_at: string | null;
}

export interface Progress {
  global_theta: number | null;
  global_theta_se: number | null;
  total_responses: number;
  total_correct: number;
  accuracy: number | null;
  topics: TopicMastery[];
  recent_sessions: SessionBrief[];
}
