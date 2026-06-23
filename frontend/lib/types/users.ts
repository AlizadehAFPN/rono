export interface UserListItem {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export interface PaginatedUsers {
  users: UserListItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserCreate {
  email: string;
  full_name?: string | null;
  password: string;
  role: string;
}

export interface UserUpdate {
  role?: string | null;
  status?: string | null;
  is_active?: boolean | null;
}

export const MANAGEABLE_ROLES = [
  "student",
  "content_author",
  "instructor",
  "coordinator",
  "institution_admin",
] as const;

export interface Institution {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  subscription_tier: string;
  is_active: boolean;
}

export interface InstitutionUpdate {
  name?: string | null;
  domain?: string | null;
}
