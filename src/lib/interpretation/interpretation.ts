import repo from "./meq30Repo.v1.json";
import { MEQ30Scores } from "@/lib/meq30Score";

export type InterpretationResult = {
  key: string;
  version: string;
  paragraph: string;
};

export function generateMeq30Interpretation(
  scores: MEQ30Scores,
  locale: "en" | "fa"
): InterpretationResult {
  // Fallback until you add full FA text blocks.
  const text = repo.text as Record<string, any>;
  const safeLocale = text[locale] ? locale : "en";
  const t = text[safeLocale];

  const f = {
    mystical: scores.mystical_percentage / 100,
    positiveMood: scores.positive_mood_percentage / 100,
    timeSpace: scores.time_space_percentage / 100,
    ineffability: scores.ineffability_percentage / 100
  } as const;

  const verdict = scores.complete_mystical
    ? t.verdict.complete[0]
    : t.verdict.notComplete[0];

  const nearMiss = "";

  const factorSentences: string[] = [];

  (Object.keys(f) as Array<keyof typeof f>).forEach((key) => {
    const val = f[key];

    if (val >= repo.scoringModel.thresholds.completeMystical) {
      // Very short line for >=60.
      if (t.meetsThresholdShort?.[key]) {
        factorSentences.push(t.meetsThresholdShort[key]);
      } else {
        // Fallback if you have not added meetsThresholdShort yet.
        factorSentences.push(
          `Your ${displayName(key)} score meets the >=60% threshold.`
        );
      }
    } else {
      // More explanation for <60 using your existing band-based text.
      const band = bandOf(val, repo.scoringModel);
      factorSentences.push(t.factorMeanings[key][band][0]);
    }
  });

  const parts = [verdict, nearMiss, ...factorSentences].filter(Boolean);

  return {
    key: repo.repoId,
    version: repo.version,
    paragraph: parts.join(" ")
  };
}

function displayName(key: string) {
  switch (key) {
    case "positiveMood":
      return "Positive Mood";
    case "timeSpace":
      return "Transcendence of Time/Space";
    case "ineffability":
      return "Ineffability";
    default:
      return "Sense of Unity, Noetic Quality, and Sacredness";
  }
}

// helper
function bandOf(value01: number, scoringModel: any) {
  if (value01 >= scoringModel.thresholds.completeMystical && value01 < 0.8) {
    return "high";
  }
  if (value01 >= 0.8) return "veryHigh";
  if (value01 >= 0.4) return "moderate";
  if (value01 >= 0.2) return "low";
  return "minimal";
}
