export interface UserOut {
  id: string;
  email: string;
  full_name: string | null;
  preferred_name: string | null;
  avatar_url: string | null;
  locale: string;
  timezone: string;
  is_active: boolean;
  email_verified_at: string | null;
  mfa_enabled: boolean;
  last_login_at: string | null;
  created_at: string;
  // Persistent Daily Review target (editable from profile + the daily form).
  daily_target_count: number;
  daily_limit_type: "count" | "time";
  daily_time_limit_minutes: number;
  daily_new_cards_cap: number;
  daily_topic_ids: string[] | null;
  daily_self_rated_level:
    | "beginner"
    | "developing"
    | "proficient"
    | "advanced"
    | null;
}

export interface ProfileUpdateRequest {
  full_name?: string | null;
  preferred_name?: string | null;
  avatar_url?: string | null;
  locale?: string | null;
  timezone?: string | null;
  daily_target_count?: number;
  daily_limit_type?: "count" | "time";
  daily_time_limit_minutes?: number;
  daily_new_cards_cap?: number;
  daily_topic_ids?: string[] | null;
  daily_self_rated_level?:
    | "beginner"
    | "developing"
    | "proficient"
    | "advanced"
    | null;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface SessionOut {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
  is_current: boolean;
}

export interface MembershipOut {
  institution_id: string;
  role: string;
  status: string;
}

export interface MeResponse {
  user: UserOut;
  memberships: MembershipOut[];
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  institution_name: string;
  institution_slug: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type Role =
  | "student"
  | "content_author"
  | "instructor"
  | "coordinator"
  | "institution_admin"
  | "system_admin";

export const ROLE_LABELS: Record<Role, string> = {
  student: "Student",
  content_author: "Content Author",
  instructor: "Instructor",
  coordinator: "Coordinator",
  institution_admin: "Institution Admin",
  system_admin: "System Admin",
};

const ROLE_ORDER: Role[] = [
  "student",
  "content_author",
  "instructor",
  "coordinator",
  "institution_admin",
  "system_admin",
];

export function roleGte(userRole: string, minimum: Role): boolean {
  const userIdx = ROLE_ORDER.indexOf(userRole as Role);
  const minIdx = ROLE_ORDER.indexOf(minimum);
  return userIdx !== -1 && userIdx >= minIdx;
}
