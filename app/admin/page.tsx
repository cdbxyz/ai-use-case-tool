import Link from "next/link";

import { updateIdeaRating } from "./actions";
import { fetchUseCases } from "./use-cases";

type SearchParamValue = string | string[] | undefined;

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

function buildReturnPath(status: string, businessArea: string) {
  const params = new URLSearchParams();

  if (status) {
    params.set("status", status);
  }

  if (businessArea) {
    params.set("businessArea", businessArea);
  }

  const query = params.toString();
  return query ? `/admin?${query}` : "/admin";
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: SearchParamValue }>;
}) {
  const params = await searchParams;
  const selectedStatus = readParam(params.status);
  const selectedBusinessArea = readParam(params.businessArea);
  const notice = readParam(params.notice);
  const actionError = readParam(params.error);

  const { requests, loadError } = await fetchUseCases();
  const statuses = [...new Set(requests.map((request) => request.status))];
  const businessAreas = [
    ...new Set(requests.map((request) => request.businessArea)),
  ];
  const returnTo = buildReturnPath(selectedStatus, selectedBusinessArea);

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

      if (right.adminRating !== left.adminRating) {
        return right.adminRating - left.adminRating;
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
              Review each submission, click into the full details, and add a
              simple 1 to 5 admin rating for overall value or potential.
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

        {notice ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-base text-emerald-800">
            {notice}
          </div>
        ) : null}

        {actionError ? (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-base text-rose-800">
            {actionError}
          </div>
        ) : null}

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
                <th className="px-5 py-4">Admin rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
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
                      <Link
                        href={`/admin/${request.id}`}
                        className="transition-colors hover:text-slate-700 hover:underline"
                      >
                        {request.name}
                      </Link>
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
                    <td className="px-5 py-4">
                      <form action={updateIdeaRating} className="flex gap-2">
                        <input type="hidden" name="id" value={request.id} />
                        <input type="hidden" name="returnTo" value={returnTo} />
                        <select
                          name="rating"
                          defaultValue={
                            request.adminRating
                              ? String(request.adminRating)
                              : ""
                          }
                          className="min-h-11 rounded-xl border border-slate-300 bg-white px-3 text-base text-slate-950 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
                        >
                          <option value="" disabled>
                            Rate
                          </option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          <option value="4">4</option>
                          <option value="5">5</option>
                        </select>
                        <button
                          type="submit"
                          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                        >
                          Save
                        </button>
                      </form>
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
