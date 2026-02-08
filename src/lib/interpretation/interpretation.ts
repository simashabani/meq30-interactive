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
  // Convert % to 0..1 proportions for rules.
  const f = {
    mystical: scores.mystical_percentage / 100,
    positiveMood: scores.positive_mood_percentage / 100,
    timeSpace: scores.time_space_percentage / 100,
    ineffability: scores.ineffability_percentage / 100
  };

  // Minimal v1: build paragraph from (a) verdict + (b) top factor + (c) lowest factor.
  // Later we will plug in repo.comboRules properly.
  const entries = Object.entries(f).sort((a, b) => b[1] - a[1]);
  const top = entries[0][0];
  const bottom = entries[entries.length - 1][0];

  const t = repo.text[locale];

  const verdict = scores.complete_mystical
    ? t.verdict.complete[0]
    : t.verdict.notComplete[0];

  const topSentence =
    t.factorMeanings[top][bandOf(f[top], repo.scoringModel)][0];
  const bottomSentence =
    t.factorMeanings[bottom][bandOf(f[bottom], repo.scoringModel)][0];

  return {
    key: repo.repoId,
    version: repo.version,
    paragraph: [verdict, topSentence, bottomSentence].join(" ")
  };
}

// helper
function bandOf(value01: number, scoringModel: any): keyof typeof scoringModel {
  if (value01 >= scoringModel.thresholds.completeMystical && value01 < 0.8) {
    return "high";
  }
  if (value01 >= 0.8) return "veryHigh";
  if (value01 >= 0.4) return "moderate";
  if (value01 >= 0.2) return "low";
  return "minimal";
}
