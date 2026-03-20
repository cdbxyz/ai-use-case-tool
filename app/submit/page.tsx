import Link from "next/link";
import { SubmitForm } from "./submit-form";

export default function SubmitPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-1 flex-col px-6 py-10 sm:px-10">
      <div className="mb-8">
        <Link
          href="/"
          className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950"
        >
          Back to home
        </Link>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <div className="mb-8 space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Share an idea
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600">
            Use this form to describe the problem, the current process, and the
            value you expect. The form will check for missing information before
            it saves your submission.
          </p>
          <p className="max-w-2xl rounded-2xl bg-slate-50 px-5 py-4 text-base leading-7 text-slate-600">
            Keep your answers simple. Short, clear descriptions are enough for a
            first review.
          </p>
        </div>

        <SubmitForm />
      </section>
    </main>
  );
}
