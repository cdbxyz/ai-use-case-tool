import Link from "next/link";

const actions = [
  {
    href: "/submit",
    title: "Share an idea",
    description:
      "Use a short form to explain the idea, why it matters, and who it helps.",
    variant: "primary",
  },
  {
    href: "/admin",
    title: "Review ideas",
    description:
      "See submitted ideas, sort the list, and focus on the highest-value work first.",
    variant: "secondary",
  },
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-1 flex-col justify-center px-6 py-12 sm:px-10">
      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-10 px-6 py-8 sm:px-10 sm:py-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
              Internal idea review
            </span>
            <div className="space-y-4">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                A simple place to collect and review AI ideas.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                Start by sharing a business problem or improvement idea. Then
                review the list and decide what to look at first.
              </p>
            </div>
            <p className="max-w-xl rounded-2xl bg-slate-50 px-5 py-4 text-base leading-7 text-slate-600">
              Choose one option below. Both screens are designed to be quick,
              clear, and easy to use for non-technical teams.
            </p>
          </div>

          <div className="grid gap-4">
            {actions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className={`rounded-2xl border p-7 transition-colors ${
                  action.variant === "primary"
                    ? "border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                    : "border-slate-200 bg-slate-50 text-slate-900 hover:bg-slate-100"
                }`}
              >
                <div className="space-y-3">
                  <p className="text-2xl font-semibold">{action.title}</p>
                  <p
                    className={`text-base leading-7 ${
                      action.variant === "primary"
                        ? "text-slate-200"
                        : "text-slate-600"
                    }`}
                  >
                    {action.description}
                  </p>
                  <p
                    className={`text-lg font-semibold ${
                      action.variant === "primary"
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    Open page
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
