"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import { adminRatingColumn, useCaseTable } from "./use-cases";

async function saveRating(
  id: string,
  rating: number,
  preferredColumn: string,
) {
  const supabase = createServerSupabaseClient();

  const firstAttempt = await supabase
    .from(useCaseTable)
    .update({ [preferredColumn]: rating })
    .eq("id", id);

  if (!firstAttempt.error) {
    return { error: null };
  }

  const shouldTryFallback =
    preferredColumn !== "rating" &&
    firstAttempt.error.message?.includes(`'${preferredColumn}' column`);

  if (!shouldTryFallback) {
    return { error: firstAttempt.error };
  }

  const fallbackAttempt = await supabase
    .from(useCaseTable)
    .update({ rating })
    .eq("id", id);

  return { error: fallbackAttempt.error };
}

async function saveScores(
  id: string,
  impactScore: number,
  feasibilityScore: number,
) {
  const supabase = createServerSupabaseClient();

  return supabase
    .from(useCaseTable)
    .update({
      impact_score: impactScore,
      feasibility_score: feasibilityScore,
    })
    .eq("id", id);
}

function buildReturnUrl(path: string, notice: string, isError = false) {
  const [pathname, query = ""] = path.split("?");
  const params = new URLSearchParams(query);

  params.delete("notice");
  params.delete("error");

  params.set(isError ? "error" : "notice", notice);

  const nextQuery = params.toString();
  return nextQuery ? `${pathname}?${nextQuery}` : pathname;
}

export async function updateIdeaRating(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/admin").trim();
  const rating = Number(formData.get("rating") ?? "");

  if (!id) {
    redirect(buildReturnUrl(returnTo, "This idea is missing an id.", true));
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(buildReturnUrl(returnTo, "Choose a rating from 1 to 5.", true));
  }

  const { error } = await saveRating(id, rating, adminRatingColumn);

  if (error) {
    const details = [error.message, error.details, error.hint]
      .filter(Boolean)
      .join(" ");

    redirect(
      buildReturnUrl(
        returnTo,
        details
          ? `Could not save the rating: ${details}`
          : "Could not save the rating.",
        true,
      ),
    );
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  redirect(buildReturnUrl(returnTo, "Rating saved."));
}

export async function updateIdeaScores(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/admin").trim();
  const impactScore = Number(formData.get("impactScore") ?? "");
  const feasibilityScore = Number(formData.get("feasibilityScore") ?? "");

  if (!id) {
    redirect(buildReturnUrl(returnTo, "This idea is missing an id.", true));
  }

  if (!Number.isInteger(impactScore) || impactScore < 1 || impactScore > 5) {
    redirect(
      buildReturnUrl(returnTo, "Choose an impact score from 1 to 5.", true),
    );
  }

  if (
    !Number.isInteger(feasibilityScore) ||
    feasibilityScore < 1 ||
    feasibilityScore > 5
  ) {
    redirect(
      buildReturnUrl(
        returnTo,
        "Choose a feasibility score from 1 to 5.",
        true,
      ),
    );
  }

  const { error } = await saveScores(id, impactScore, feasibilityScore);

  if (error) {
    const details = [error.message, error.details, error.hint]
      .filter(Boolean)
      .join(" ");

    redirect(
      buildReturnUrl(
        returnTo,
        details
          ? `Could not save the scores: ${details}`
          : "Could not save the scores.",
        true,
      ),
    );
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/${id}`);
  redirect(buildReturnUrl(returnTo, "Scores saved."));
}
