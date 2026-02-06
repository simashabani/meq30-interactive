import { MEQAnswersMap } from "@/components/MEQ30Form";
import { MEQ30Scores } from "@/lib/meq30Score";

export type PendingExperience = {
  title: string;
  date: string; // "" if not set
  notes: string;
  answers: MEQAnswersMap;
  scores: MEQ30Scores;
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
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function clearPendingExperience() {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(PENDING_KEY);
  }
}
