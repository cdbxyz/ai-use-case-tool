import Link from "next/link";
import { notFound } from "next/navigation";

import { updateIdeaRating, updateIdeaScores } from "../actions";
import { fetchUseCaseById } from "../use-cases";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function fieldValue(value: string) {
  return value && value !== "Not provided" ? value : "Not provided";
}

export default async function AdminIdeaDetailPage(props: PageProps) {
  const { id } = await props.params;
  const query = await props.searchParams;
  const notice = readParam(query.notice);
  const actionError = readParam(query.error);

  const { request, loadError } = await fetchUseCaseById(id);

  if (!request && !loadError) {
    notFound();
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-1 flex-col px-6 py-10 sm:px-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/admin"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
          >
            Back to admin
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Review submission
          </h1>
        </div>

        <Link
          href="/submit"
          className="inline-flex min-h-14 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 text-lg font-semibold text-slate-900 transition hover:bg-slate-50"
        >
          Share a new idea
        </Link>
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

      {loadError || !request ? (
        <section className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-800 shadow-sm">
          {loadError || "This idea could not be found."}
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                Submission details
              </p>
              <h2 className="text-3xl font-semibold text-slate-950">
                {request.name}
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Review the original submission, then record a simple admin
                rating from 1 to 5.
              </p>
            </div>

            <div className="grid gap-4 lg:min-w-[320px]">
              <form
                action={updateIdeaRating}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <input type="hidden" name="id" value={request.id} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/admin/${request.id}`}
                />
                <label className="grid gap-2">
                  <span className="text-base font-semibold text-slate-800">
                    Admin rating
                  </span>
                  <select
                    name="rating"
                    defaultValue={
                      request.adminRating ? String(request.adminRating) : ""
                    }
                    className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
                  >
                    <option value="" disabled>
                      Choose rating
                    </option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-base font-semibold text-white transition hover:bg-slate-800"
                >
                  Save rating
                </button>
              </form>

              <form
                action={updateIdeaScores}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <input type="hidden" name="id" value={request.id} />
                <input
                  type="hidden"
                  name="returnTo"
                  value={`/admin/${request.id}`}
                />
                <label className="grid gap-2">
                  <span className="text-base font-semibold text-slate-800">
                    Impact score
                  </span>
                  <select
                    name="impactScore"
                    defaultValue={
                      request.impactScore ? String(request.impactScore) : ""
                    }
                    className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
                  >
                    <option value="" disabled>
                      Choose impact
                    </option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-base font-semibold text-slate-800">
                    Feasibility score
                  </span>
                  <select
                    name="feasibilityScore"
                    defaultValue={
                      request.feasibilityScore
                        ? String(request.feasibilityScore)
                        : ""
                    }
                    className="min-h-12 rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-200"
                  >
                    <option value="" disabled>
                      Choose feasibility
                    </option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </label>
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-slate-900 px-5 text-base font-semibold text-white transition hover:bg-slate-800"
                >
                  Save scores
                </button>
              </form>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                Submitter
              </p>
              <p className="text-lg font-medium text-slate-950">
                {fieldValue(request.submitterName)}
              </p>
              <p className="mt-2 text-base text-slate-600">
                {fieldValue(request.submitterEmail)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-5">
              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                Summary
              </p>
              <p className="text-base text-slate-700">
                Business area: <span className="font-medium">{request.businessArea}</span>
              </p>
              <p className="mt-2 text-base text-slate-700">
                Priority: <span className="font-medium">{request.priority}</span>
              </p>
              <p className="mt-2 text-base text-slate-700">
                Status: <span className="font-medium">{request.status}</span>
              </p>
              <p className="mt-2 text-base text-slate-700">
                Impact score: <span className="font-medium">{request.impactScore}</span>
              </p>
              <p className="mt-2 text-base text-slate-700">
                Feasibility score:{" "}
                <span className="font-medium">{request.feasibilityScore}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            <section className="rounded-2xl border border-slate-200 p-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                Problem to solve
              </p>
              <p className="text-base leading-7 text-slate-700">
                {fieldValue(request.problemToSolve)}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                Current process
              </p>
              <p className="text-base leading-7 text-slate-700">
                {fieldValue(request.currentProcess)}
              </p>
            </section>

            <section className="rounded-2xl border border-slate-200 p-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.08em] text-slate-600">
                Expected value
              </p>
              <p className="text-base leading-7 text-slate-700">
                {fieldValue(request.expectedValue)}
              </p>
            </section>
          </div>
        </section>
      )}
    </main>
  );
}
