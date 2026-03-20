"use client";

import { useActionState, useEffect, useRef } from "react";

import { submitUseCase } from "@/app/submit/actions";
import type {
  SubmitFormState,
  SubmitFormValues,
} from "@/app/submit/actions";

const emptyFormValues: SubmitFormValues = {
  submitterName: "",
  submitterEmail: "",
  businessArea: "",
  title: "",
  problemToSolve: "",
  currentProcess: "",
  expectedValue: "",
  urgency: "",
};

const initialSubmitFormState: SubmitFormState = {
  status: "idle",
  message: "",
  fieldErrors: {},
  values: emptyFormValues,
  resetKey: 0,
};

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm font-medium text-rose-700">{message}</p>;
}

function HelperText({ text }: { text: string }) {
  return <p className="text-sm leading-6 text-slate-500">{text}</p>;
}

function fieldClasses(hasError: boolean) {
  return `min-h-14 rounded-2xl border bg-white px-5 text-lg text-slate-950 outline-none transition focus:ring-4 ${
    hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
      : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
  }`;
}

function areaClasses(hasError: boolean) {
  return `rounded-2xl border bg-white px-5 py-4 text-lg text-slate-950 outline-none transition focus:ring-4 ${
    hasError
      ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100"
      : "border-slate-300 focus:border-slate-500 focus:ring-slate-200"
  }`;
}

export function SubmitForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    submitUseCase,
    initialSubmitFormState,
  );
  const currentState = state ?? initialSubmitFormState;
  const fieldErrors = currentState.fieldErrors ?? {};
  const values = currentState.values ?? emptyFormValues;

  useEffect(() => {
    if (currentState.status === "success") {
      formRef.current?.reset();
    }
  }, [currentState.status, currentState.resetKey]);

  return (
    <form
      key={currentState.resetKey}
      ref={formRef}
      action={formAction}
      className="grid gap-7"
    >
      <label className="grid gap-2">
        <span className="text-base font-semibold text-slate-800">
          Your name
        </span>
        <input
          name="submitterName"
          type="text"
          autoComplete="name"
          required
          defaultValue={values.submitterName}
          placeholder="Jordan Lee"
          className={fieldClasses(Boolean(fieldErrors.submitterName))}
        />
        <HelperText text="Enter the name of the person submitting this idea." />
        <FieldError message={fieldErrors.submitterName} />
      </label>

      <label className="grid gap-2">
        <span className="text-base font-semibold text-slate-800">
          Your email
        </span>
        <input
          name="submitterEmail"
          type="email"
          autoComplete="email"
          required
          defaultValue={values.submitterEmail}
          placeholder="jordan.lee@company.com"
          className={fieldClasses(Boolean(fieldErrors.submitterEmail))}
        />
        <HelperText text="We will use this if we need to follow up with you." />
        <FieldError message={fieldErrors.submitterEmail} />
      </label>

      <label className="grid gap-2">
        <span className="text-base font-semibold text-slate-800">
          Business area
        </span>
        <input
          name="businessArea"
          type="text"
          required
          defaultValue={values.businessArea}
          placeholder="Operations"
          className={fieldClasses(Boolean(fieldErrors.businessArea))}
        />
        <HelperText text="Example: Sales, Operations, Finance, or HR." />
        <FieldError message={fieldErrors.businessArea} />
      </label>

      <label className="grid gap-2">
        <span className="text-base font-semibold text-slate-800">
          Idea title
        </span>
        <input
          name="title"
          type="text"
          required
          defaultValue={values.title}
          placeholder="Customer support summary assistant"
          className={fieldClasses(Boolean(fieldErrors.title))}
        />
        <HelperText text="Use a short title that is easy for others to understand." />
        <FieldError message={fieldErrors.title} />
      </label>

      <label className="grid gap-2">
        <span className="text-base font-semibold text-slate-800">
          What problem are you trying to solve?
        </span>
        <textarea
          name="problemToSolve"
          rows={5}
          required
          defaultValue={values.problemToSolve}
          placeholder="What business problem should this solve?"
          className={areaClasses(Boolean(fieldErrors.problemToSolve))}
        />
        <HelperText text="Describe the issue in plain language." />
        <FieldError message={fieldErrors.problemToSolve} />
      </label>

      <label className="grid gap-2">
        <span className="text-base font-semibold text-slate-800">
          How is this handled today?
        </span>
        <textarea
          name="currentProcess"
          rows={5}
          required
          defaultValue={values.currentProcess}
          placeholder="How is the work handled today?"
          className={areaClasses(Boolean(fieldErrors.currentProcess))}
        />
        <HelperText text="A simple step-by-step description is enough." />
        <FieldError message={fieldErrors.currentProcess} />
      </label>

      <label className="grid gap-2">
        <span className="text-base font-semibold text-slate-800">
          What value do you expect?
        </span>
        <textarea
          name="expectedValue"
          rows={4}
          required
          defaultValue={values.expectedValue}
          placeholder="What benefit do you expect from this use case?"
          className={areaClasses(Boolean(fieldErrors.expectedValue))}
        />
        <HelperText text="For example: time saved, better quality, or faster response." />
        <FieldError message={fieldErrors.expectedValue} />
      </label>

      <label className="grid gap-2">
        <span className="text-base font-semibold text-slate-800">
          How urgent is this?
        </span>
        <select
          name="urgency"
          required
          defaultValue={values.urgency}
          className={fieldClasses(Boolean(fieldErrors.urgency))}
        >
          <option value="" disabled>
            Select urgency
          </option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <HelperText text="Choose how soon this idea needs attention." />
        <FieldError message={fieldErrors.urgency} />
      </label>

      {currentState.message ? (
        <div
          aria-live="polite"
          className={`rounded-2xl border px-4 py-3 text-base ${
            currentState.status === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {currentState.message}
        </div>
      ) : null}

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-16 items-center justify-center rounded-2xl bg-slate-900 px-8 text-xl font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {pending ? "Sending..." : "Send idea for review"}
        </button>
      </div>
    </form>
  );
}
