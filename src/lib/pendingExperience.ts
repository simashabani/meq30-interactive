import { MEQAnswersMap } from "@/components/MEQ30Form";
import { MEQ30Scores } from "@/lib/meq30Score";

export type PendingExperience = {
  title: string;
  date: string; // "" if not set
  notes: string;
  answers: MEQAnswersMap;
  scores: MEQ30Scores;
  isDirty: boolean;
};

const PENDING_KEY = "pending_experience";

export function savePendingExperience(exp: PendingExperience) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(exp));
  }
}

export function getPendingExperience(): PendingExperience | null {
  if (typeof window !== "undefined") {
    const data = sessionStorage.getItem(PENDING_KEY);
    if (!data) return null;
    const parsed = JSON.parse(data) as PendingExperience;
    return {
      ...parsed,
      isDirty: typeof parsed.isDirty === "boolean" ? parsed.isDirty : true,
    };
  }
  return null;
}

export function clearPendingExperience() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(PENDING_KEY);
  }
}
