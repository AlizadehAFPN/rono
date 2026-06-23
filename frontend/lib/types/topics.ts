export interface TopicOut {
  id: string;
  institution_id: string | null;
  parent_id: string | null;
  name: string;
  slug: string;
  path: string;
  level: number;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_by_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TopicTree extends TopicOut {
  children: TopicTree[];
}

export interface TopicCreate {
  name: string;
  slug: string;
  parent_id?: string | null;
  description?: string | null;
  display_order?: number;
}

export interface TopicUpdate {
  name?: string;
  slug?: string;
  description?: string | null;
  display_order?: number;
  is_active?: boolean;
}
