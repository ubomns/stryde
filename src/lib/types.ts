export type SearchMode = "jobs" | "clients" | "both";

export interface Contact {
  name: string;
  title: string;
  email: string;
  email_status: "valid" | "invalid" | "unknown" | string;
  linkedin_url: string;
}

export interface Lead {
  type: string;
  company: string;
  domain: string;
  location: string;
  remote_status?: string;
  remote?: string;
  remote_preference?: string;
  opportunity: string;
  source_url: string;
  why_it_fits: string;
  priority: string;
  posted_date: string;
  days_old: number;
  contacts?: Contact[];
  notes?: string;
}

export interface SearchResponse {
  mode: SearchMode;
  intent_summary?: string;
  assumptions: string[];
  leads: Lead[];
  notes?: string;
}

export interface SearchRequest {
  mode: SearchMode;
  query: string;
  maxResults?: number;
}

export interface ApiErrorDetails {
  [key: string]: unknown;
}

export interface ApiError {
  code:
    | "VALIDATION_ERROR"
    | "UNSUPPORTED_MODE"
    | "RATE_LIMITED"
    | "BACKEND_ERROR"
    | "TIMEOUT_ERROR"
    | "UNKNOWN_ERROR";
  message: string;
  details?: ApiErrorDetails;
}

export interface ApiErrorResponse {
  error: ApiError;
}

export type SearchResult = SearchResponse | ApiErrorResponse;
