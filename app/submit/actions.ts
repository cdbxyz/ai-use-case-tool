"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const urgencyOptions = ["low", "medium", "high"] as const;
const useCaseTable = process.env.SUPABASE_USE_CASES_TABLE ?? "use_cases";

type FieldName =
  | "submitterName"
  | "submitterEmail"
  | "businessArea"
  | "title"
  | "problemToSolve"
  | "currentProcess"
  | "expectedValue"
  | "urgency";

type FieldErrors = Partial<Record<FieldName, string>>;

export type SubmitFormValues = Record<FieldName, string>;

export type SubmitFormState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldErrors: FieldErrors;
  values: SubmitFormValues;
  resetKey: number;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getTextValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function getFormValues(formData: FormData): SubmitFormValues {
  return {
    submitterName: getTextValue(formData, "submitterName"),
    submitterEmail: getTextValue(formData, "submitterEmail"),
    businessArea: getTextValue(formData, "businessArea"),
    title: getTextValue(formData, "title"),
    problemToSolve: getTextValue(formData, "problemToSolve"),
    currentProcess: getTextValue(formData, "currentProcess"),
    expectedValue: getTextValue(formData, "expectedValue"),
    urgency: getTextValue(formData, "urgency").toLowerCase(),
  };
}

export async function submitUseCase(
  prevState: SubmitFormState,
  formData: FormData,
): Promise<SubmitFormState> {
  const values = getFormValues(formData);
  const {
    submitterName,
    submitterEmail,
    businessArea,
    title,
    problemToSolve,
    currentProcess,
    expectedValue,
    urgency,
  } = values;

  const fieldErrors: FieldErrors = {};

  if (submitterName.length < 2) {
    fieldErrors.submitterName = "Enter the submitter's full name.";
  }

  if (!emailPattern.test(submitterEmail)) {
    fieldErrors.submitterEmail = "Enter a valid email address.";
  }

  if (!businessArea) {
    fieldErrors.businessArea = "Enter the business area.";
  }

  if (!title) {
    fieldErrors.title = "Enter a use case title.";
  }

  if (!problemToSolve) {
    fieldErrors.problemToSolve = "Enter the problem you want to solve.";
  }

  if (!currentProcess) {
    fieldErrors.currentProcess = "Enter how this is handled today.";
  }

  if (!expectedValue) {
    fieldErrors.expectedValue = "Enter the value you expect.";
  }

  if (!urgencyOptions.includes(urgency as (typeof urgencyOptions)[number])) {
    fieldErrors.urgency = "Select an urgency level.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: "error",
      message: "Please fix the highlighted fields and submit again.",
      fieldErrors,
      values,
      resetKey: prevState.resetKey,
    };
  }

  try {
    const supabase = createServerSupabaseClient();

    const { error } = await supabase.from(useCaseTable).insert({
      submitter_name: submitterName,
      submitter_email: submitterEmail,
      business_area: businessArea,
      title,
      problem_to_solve: problemToSolve,
      current_process: currentProcess,
      expected_value: expectedValue,
      urgency,
    });

    if (error) {
      const details = [error.message, error.details, error.hint]
        .filter(Boolean)
        .join(" ");

      return {
        status: "error",
        message: details
          ? `Supabase rejected the save: ${details}`
          : "Supabase rejected the save. Check the table name, column names, and any insert policy.",
        fieldErrors: {},
        values,
        resetKey: prevState.resetKey,
      };
    }

    return {
      status: "success",
      message: "Use case submitted successfully.",
      fieldErrors: {},
      values: prevState.values,
      resetKey: prevState.resetKey + 1,
    };
  } catch {
    return {
      status: "error",
      message:
        "The request could not be submitted. Confirm the Supabase environment variables are available.",
      fieldErrors: {},
      values,
      resetKey: prevState.resetKey,
    };
  }
}
