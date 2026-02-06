export type MEQ30Scores = {
  overall_mean: number;
  mystical_mean: number;
  positive_mood_mean: number;
  transcendence_mean: number;
  ineffability_mean: number;
  complete_mystical: boolean;
};

// Canonical item IDs per subscale (Barrett et al., 2015)
const MYSTICAL = [9, 12, 14, 22, 35, 36, 41, 47, 54, 55, 69, 73, 74, 77, 83] as const;
const POSITIVE_MOOD = [5, 18, 30, 43, 80, 87] as const;
const TIME_SPACE = [2, 15, 29, 34, 48, 65] as const;
const INEFFABILITY = [6, 23, 86] as const;

export function scoreMEQ30(answersById: Record<string, number>): MEQ30Scores {
  const allIds = [
    ...MYSTICAL,
    ...POSITIVE_MOOD,
    ...TIME_SPACE,
    ...INEFFABILITY,
  ];

  // Validate: must have all 30
  for (const id of allIds) {
    const v = answersById[String(id)];
    if (!Number.isInteger(v) || v < 0 || v > 5) {
      throw new Error(`Missing/invalid answer for item ${id}. Expected integer 0..5.`);
    }
  }

  const meanOf = (ids: readonly number[]) => {
    const sum = ids.reduce((acc, id) => acc + answersById[String(id)], 0);
    return sum / ids.length;
  };

  const mystical_mean = meanOf(MYSTICAL);
  const positive_mood_mean = meanOf(POSITIVE_MOOD);
  const transcendence_mean = meanOf(TIME_SPACE);
  const ineffability_mean = meanOf(INEFFABILITY);

  // Overall mean = mean of all 30 items (not mean of 4 subscale means)
  const overall_sum = allIds.reduce((acc, id) => acc + answersById[String(id)], 0);
  const overall_mean = overall_sum / 30;

  // Complete mystical experience: >= 60% of max (5) on EACH subscale => mean >= 3.0
  const complete_mystical =
    mystical_mean >= 3.0 &&
    positive_mood_mean >= 3.0 &&
    transcendence_mean >= 3.0 &&
    ineffability_mean >= 3.0;

  return {
    overall_mean,
    mystical_mean,
    positive_mood_mean,
    transcendence_mean,
    ineffability_mean,
    complete_mystical,
  };
}
