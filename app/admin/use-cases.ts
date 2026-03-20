import { createServerSupabaseClient } from "@/lib/supabase/server";

export const useCaseTable = process.env.SUPABASE_USE_CASES_TABLE ?? "use_cases";
export const adminRatingColumn =
  process.env.SUPABASE_ADMIN_RATING_COLUMN ?? "admin_rating";

type SupabaseErrorShape = {
  message?: string | null;
  details?: string | null;
  hint?: string | null;
};

type UseCaseRow = {
  id?: string | number;
  title?: string | null;
  business_area?: string | null;
  urgency?: string | null;
  status?: string | null;
  impact_score?: number | string | null;
  feasibility_score?: number | string | null;
  admin_rating?: number | string | null;
  rating?: number | string | null;
  submitter_name?: string | null;
  submitter_email?: string | null;
  problem_to_solve?: string | null;
  current_process?: string | null;
  expected_value?: string | null;
  created_at?: string | null;
};

export type AdminRequest = {
  id: string;
  name: string;
  businessArea: string;
  priority: string;
  status: string;
  impactScore: number;
  feasibilityScore: number;
  adminRating: number;
  submitterName: string;
  submitterEmail: string;
  problemToSolve: string;
  currentProcess: string;
  expectedValue: string;
  createdAt: string;
};

function getErrorMessage(error: SupabaseErrorShape, prefix: string) {
  const details = [error.message, error.details, error.hint]
    .filter(Boolean)
    .join(" ");

  return details ? `${prefix}: ${details}` : prefix;
}

function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function mapRowToRequest(row: UseCaseRow, index: number): AdminRequest {
  const urgency = row.urgency ? toTitleCase(row.urgency) : "Not set";
  const status = row.status ? toTitleCase(row.status) : "New";
  const adminRating = toNumber(row.admin_rating ?? row.rating);

  return {
    id: String(row.id ?? row.created_at ?? row.title ?? index),
    name: row.title?.trim() || "Untitled idea",
    businessArea: row.business_area?.trim() || "Not set",
    priority: urgency,
    status,
    impactScore: toNumber(row.impact_score),
    feasibilityScore: toNumber(row.feasibility_score),
    adminRating,
    submitterName: row.submitter_name?.trim() || "Not provided",
    submitterEmail: row.submitter_email?.trim() || "Not provided",
    problemToSolve: row.problem_to_solve?.trim() || "Not provided",
    currentProcess: row.current_process?.trim() || "Not provided",
    expectedValue: row.expected_value?.trim() || "Not provided",
    createdAt: row.created_at ?? "",
  };
}

export async function fetchUseCases() {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from(useCaseTable)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return {
        requests: [] as AdminRequest[],
        loadError: getErrorMessage(error, "Could not load ideas from Supabase"),
      };
    }

    return {
      requests: ((data ?? []) as UseCaseRow[]).map(mapRowToRequest),
      loadError: "",
    };
  } catch {
    return {
      requests: [] as AdminRequest[],
      loadError:
        "Could not load ideas from Supabase. Confirm the server environment variables are available.",
    };
  }
}

export async function fetchUseCaseById(id: string) {
  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from(useCaseTable)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return {
        request: null as AdminRequest | null,
        loadError: getErrorMessage(error, "Could not load this idea from Supabase"),
      };
    }

    if (!data) {
      return {
        request: null as AdminRequest | null,
        loadError: "This idea could not be found.",
      };
    }

    return {
      request: mapRowToRequest(data as UseCaseRow, 0),
      loadError: "",
    };
  } catch {
    return {
      request: null as AdminRequest | null,
      loadError:
        "Could not load this idea from Supabase. Confirm the server environment variables are available.",
    };
  }
}
