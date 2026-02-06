export type MEQ30Scores = {
  mystical_percentage: number;
  positive_mood_percentage: number;
  time_space_percentage: number;
  ineffability_percentage: number;
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

  // Calculate sum and percentage for each subscale
  const sumOf = (ids: readonly number[]) => {
    return ids.reduce((acc, id) => acc + answersById[String(id)], 0);
  };

  const percentageOf = (ids: readonly number[]) => {
    const sum = sumOf(ids);
    const maxPossible = ids.length * 5;
    return (sum / maxPossible) * 100;
  };

  const mystical_percentage = percentageOf(MYSTICAL);
  const positive_mood_percentage = percentageOf(POSITIVE_MOOD);
  const time_space_percentage = percentageOf(TIME_SPACE);
  const ineffability_percentage = percentageOf(INEFFABILITY);

  // Overall mean = mean of all 30 items (intensity proxy)
  const overall_sum = allIds.reduce((acc, id) => acc + answersById[String(id)], 0);

  // Complete mystical experience: ALL four subscales must be >= 60%
  const complete_mystical =
    mystical_percentage >= 60 &&
    positive_mood_percentage >= 60 &&
    time_space_percentage >= 60 &&
    ineffability_percentage >= 60;

  return {
    mystical_percentage,
    positive_mood_percentage,
    time_space_percentage,
    ineffability_percentage,
    complete_mystical,
  };
}
