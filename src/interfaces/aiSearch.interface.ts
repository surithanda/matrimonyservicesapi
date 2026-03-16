// ─── AI Search Interfaces ─────────────────────────────────────
// Types for the AI-powered natural language profile search feature.

export interface ISearchFilters {
  // Personal
  gender?: string;
  min_age?: number;
  max_age?: number;
  religion?: string;
  caste?: string;
  marital_status?: string;
  nationality?: string;
  min_height_cms?: number;
  max_height_cms?: number;
  min_weight?: number;
  max_weight?: number;
  complexion?: string;
  profession?: string;

  // Location
  city?: string;
  state?: string;
  country?: string;

  // Education
  education_level?: string;
  field_of_study?: string;
  institution_name?: string;

  // Employment
  occupation?: string;
  company?: string;
  min_salary?: number;
  max_salary?: number;

  // Lifestyle (stored as text in DB)
  eating_habit?: string;
  diet_habit?: string;
  drinking?: string;
  smoking?: string;
  physical_activity?: string;

  // Other
  hobbies?: string[];
  disability?: string;
}

export interface ISearchIntent {
  filters: ISearchFilters;
  sort_by?: 'age_asc' | 'age_desc' | 'newest' | 'salary_desc' | 'height_desc';
  confidence: number;
  interpretation: string;
}

export interface IResolvedIds {
  gender?: number | null;
  religion?: number | null;
  caste?: number | null;
  marital_status?: number | null;
  nationality?: number | null;
  complexion?: number | null;
  profession?: number | null;
  education_level?: number | null;
  field_of_study?: number | null;
  occupation?: number | null;
  disability?: number | null;
  // Country & state resolved from country/state tables
  country_id?: number | null;
  state_id?: number | null;
  // Hobbies resolved from lookup
  hobbies?: (number | null)[];
}

export interface IQuotaStatus {
  allowed: boolean;
  plan_name: string;
  monthly_limit: number;       // -1 = unlimited
  used_this_month: number;
  remaining: number;           // -1 = unlimited
  resets_at: string;           // ISO date of next month start
}

export interface IAISearchRequest {
  query: string;
  profile_id: number;
}

export interface IAISearchResult {
  success: boolean;
  message?: string;
  data?: {
    profiles: any[];
    interpretation: string;
    filters_applied: ISearchFilters;
    resolved_ids: IResolvedIds;
    confidence: number;
    result_count: number;
    ai_provider: string;
    ai_model: string;
    tokens_used: number;
    response_time_ms: number;
    quota?: IQuotaStatus;
  };
  error?: string;
}

export interface IAIProviderResponse {
  intent: ISearchIntent;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  responseTimeMs: number;
}

export interface IAIProvider {
  name: string;
  model: string;
  parseSearchIntent(
    userQuery: string,
    schemaContext: string
  ): Promise<IAIProviderResponse>;
}
