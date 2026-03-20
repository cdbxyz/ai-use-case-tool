import Link from "next/link";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const useCaseTable = process.env.SUPABASE_USE_CASES_TABLE ?? "use_cases";

type SearchParamValue = string | string[] | undefined;

type UseCaseRow = {
  id?: string | number;
  title?: string | null;
  business_area?: string | null;
  urgency?: string | null;
  status?: string | null;
  impact_score?: number | string | null;
  feasibility_score?: number | string | null;
  created_at?: string | null;
};

type AdminRequest = {
  id: string;
  name: string;
  businessArea: string;
  priority: string;
  status: string;
  impactScore: number;
  feasibilityScore: number;
  createdAt: string;
};

function readParam(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function getBadgeClasses(status: string) {
  switch (status) {
    case "Approved":
      return "bg-emerald-50 text-emerald-700";
    case "In review":
      return "bg-amber-50 text-amber-700";
    case "New":
      return "bg-sky-50 text-sky-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function toTitleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function toNumber(value: UseCaseRow["impact_score"]) {
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

  return {
    id: String(row.id ?? row.created_at ?? row.title ?? index),
    name: row.title?.trim() || "Untitled idea",
    businessArea: row.business_area?.trim() || "Not set",
    priority: urgency,
    status,
    impactScore: toNumber(row.impact_score),
    feasibilityScore: toNumber(row.feasibility_score),
    createdAt: row.created_at ?? "",
  };
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: SearchParamValue }>;
}) {
  const params = await searchParams;
  const selectedStatus = readParam(params.status);
  const selectedBusinessArea = readParam(params.businessArea);

  let requests: AdminRequest[] = [];
  let loadError = "";

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from(useCaseTable)
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      const details = [error.message, error.details, error.hint]
        .filter(Boolean)
        .join(" ");
      loadError = details
        ? `Could not load ideas from Supabase: ${details}`
        : "Could not load ideas from Supabase.";
    } else {
      requests = ((data ?? []) as UseCaseRow[]).map(mapRowToRequest);
    }
  } catch {
    loadError =
      "Could not load ideas from Supabase. Confirm the server environment variables are available.";
  }

  const statuses = [...new Set(requests.map((request) => request.status))];
  const businessAreas = [
    ...new Set(requests.map((request) => request.businessArea)),
  ];

  const filteredRequests = requests
    .filter((request) => {
      if (selectedStatus && request.status !== selectedStatus) {
        return false;
      }

      if (
        selectedBusinessArea &&
        request.businessArea !== selectedBusinessArea
      ) {
        return false;
      }

      return true;
    })
    .sort((left, right) => {
      const leftTotal = left.impactScore + left.feasibilityScore;
      const rightTotal = right.impactScore + right.feasibilityScore;

      if (rightTotal !== leftTotal) {
        return rightTotal - leftTotal;
      }

      return right.createdAt.localeCompare(left.createdAt);
    });

  const openCount = filteredRequests.filter(
    (request) => request.status !== "Approved",
  ).length;
  const topScore =
    filteredRequests[0]?.impactScore + filteredRequests[0]?.feasibilityScore;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            Back to home
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Review ideas
          </h1>
        </div>

        <Link
          href="/submit"
          className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 text-lg font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          Share a new idea
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
              Overview
            </p>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              The list below shows real submissions from Supabase. Ideas with
              the highest combined impact and feasibility score appear first.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <p className="text-sm text-slate-600">Open</p>
              <p className="text-2xl font-semibold text-slate-950">
                {openCount}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <p className="text-sm text-slate-600">Top score</p>
              <p className="text-2xl font-semibold text-slate-950">
                {topScore ?? 0}
              </p>
            </div>
          </div>
        </div>

        {loadError ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-800">
            {loadError}
          </div>
        ) : null}

        <form className="mb-6 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 md:grid-cols-[1fr_1fr_auto]">
          <label className="grid gap-2">
            <span className="text-base font-semibold text-slate-800">
              Status
            </span>
            <p className="text-sm leading-6 text-slate-500">
              Use this to see only ideas at a specific stage.
            </p>
            <select
              name="status"
              defaultValue={selectedStatus}
              className="min-h-14 rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
            >
              <option value="">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-base font-semibold text-slate-800">
              Business area
            </span>
            <p className="text-sm leading-6 text-slate-500">
              Use this to focus on one part of the business.
            </p>
            <select
              name="businessArea"
              defaultValue={selectedBusinessArea}
              className="min-h-14 rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
            >
              <option value="">All business areas</option>
              {businessAreas.map((businessArea) => (
                <option key={businessArea} value={businessArea}>
                  {businessArea}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-end gap-3">
            <button
              type="submit"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-slate-900 px-6 text-lg font-semibold text-white transition hover:bg-slate-800"
            >
              Show results
            </button>
            <Link
              href="/admin"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 text-lg font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              Clear filters
            </Link>
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr className="text-left text-sm font-semibold text-slate-700">
                <th className="px-5 py-4">Use case</th>
                <th className="px-5 py-4">Business area</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Impact</th>
                <th className="px-5 py-4">Feasibility</th>
                <th className="px-5 py-4">Total score</th>
                <th className="px-5 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-base text-slate-500"
                  >
                    {loadError
                      ? "No ideas can be shown until the Supabase connection issue is fixed."
                      : "No requests match the selected filters."}
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr key={request.id} className="text-base text-slate-700">
                    <td className="px-5 py-4 font-medium text-slate-950">
                      {request.name}
                    </td>
                    <td className="px-5 py-4">{request.businessArea}</td>
                    <td className="px-5 py-4">{request.priority}</td>
                    <td className="px-5 py-4">{request.impactScore}</td>
                    <td className="px-5 py-4">{request.feasibilityScore}</td>
                    <td className="px-5 py-4 font-semibold text-slate-950">
                      {request.impactScore + request.feasibilityScore}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${getBadgeClasses(
                          request.status,
                        )}`}
                      >
                        {request.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
