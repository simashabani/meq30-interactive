export type MEQSubscale =
  | "MYSTICAL"
  | "POSITIVE_MOOD"
  | "TIME_SPACE"
  | "INEFFABILITY";

export type MEQQuestion = {
  canonicalId: number; // e.g., 35, 2, 86 (never change)
  order: number;       // 1..30 (UI only)
  subscale: MEQSubscale;
  text: {
    en: string;
    fa: string; // we can fill Persian next
  };
};


export const MEQ30_QUESTIONS: MEQQuestion[] = [
  { canonicalId: 35, order: 1, subscale: "MYSTICAL", text: { en: "Freedom from the limitations of your personal self and feeling a unity or bond with what was felt to be greater than your personal self.", fa: "" } },
  { canonicalId: 41, order: 2, subscale: "MYSTICAL", text: { en: "Experience of pure being and pure awareness (beyond the world of sense impressions).", fa: "" } },
  { canonicalId: 54, order: 3, subscale: "MYSTICAL", text: { en: "Experience of oneness in relation to an \"inner world\" within.", fa: "" } },
  { canonicalId: 77, order: 4, subscale: "MYSTICAL", text: { en: "Experience of the fusion of your personal self into a larger whole.", fa: "" } },
  { canonicalId: 83, order: 5, subscale: "MYSTICAL", text: { en: "Experience of unity with ultimate reality.", fa: "" } },

  { canonicalId: 2, order: 6, subscale: "TIME_SPACE", text: { en: "Loss of your usual sense of time.", fa: "" } },
  { canonicalId: 15, order: 7, subscale: "TIME_SPACE", text: { en: "Loss of your usual sense of space.", fa: "" } },
  { canonicalId: 29, order: 8, subscale: "TIME_SPACE", text: { en: "Loss of usual awareness of where you were.", fa: "" } },
  { canonicalId: 34, order: 9, subscale: "TIME_SPACE", text: { en: "Sense of being \"outside of\" time, beyond past and future.", fa: "" } },
  { canonicalId: 48, order: 10, subscale: "TIME_SPACE", text: { en: "Being in a realm with no space boundaries.", fa: "" } },
  { canonicalId: 65, order: 11, subscale: "TIME_SPACE", text: { en: "Experience of timelessness.", fa: "" } },

  { canonicalId: 6, order: 12, subscale: "INEFFABILITY", text: { en: "Sense that the experience cannot be described adequately in words.", fa: "" } },
  { canonicalId: 23, order: 13, subscale: "INEFFABILITY", text: { en: "Feeling that you could not do justice to your experience by describing it in words.", fa: "" } },
  { canonicalId: 86, order: 14, subscale: "INEFFABILITY", text: { en: "Feeling that it would be difficult to communicate your own experience to others who have not had similar experiences.", fa: "" } },

  { canonicalId: 14, order: 15, subscale: "MYSTICAL", text: { en: "Experience of oneness or unity with objects and/or persons perceived in your surroundings.", fa: "" } },
  { canonicalId: 47, order: 16, subscale: "MYSTICAL", text: { en: "Experience of the insight that \"all is One.\"", fa: "" } },
  { canonicalId: 74, order: 17, subscale: "MYSTICAL", text: { en: "Awareness of the life or living presence in all things.", fa: "" } },
  { canonicalId: 9, order: 18, subscale: "MYSTICAL", text: { en: "Gain of insightful knowledge experienced at an intuitive level.", fa: "" } },
  { canonicalId: 22, order: 19, subscale: "MYSTICAL", text: { en: "Certainty of encounter with ultimate reality (in the sense of being able to \"know\" and \"see\" what is really real).", fa: "" } },
  { canonicalId: 12, order: 20, subscale: "MYSTICAL", text: { en: "You are convinced now, as you look back on your experience, that in it you encountered ultimate reality.", fa: "" } },

  { canonicalId: 36, order: 21, subscale: "MYSTICAL", text: { en: "Sense of being at a spiritual height.", fa: "" } },
  { canonicalId: 55, order: 22, subscale: "MYSTICAL", text: { en: "Sense of reverence.", fa: "" } },
  { canonicalId: 73, order: 23, subscale: "MYSTICAL", text: { en: "Feeling that you experienced something profoundly sacred and holy.", fa: "" } },
  { canonicalId: 69, order: 24, subscale: "MYSTICAL", text: { en: "You are convinced now, as you look back on your experience, that in it you \"knew\" and \"saw\" what was really real.", fa: "" } },

  { canonicalId: 5, order: 25, subscale: "POSITIVE_MOOD", text: { en: "Experience of amazement.", fa: "" } },
  { canonicalId: 18, order: 26, subscale: "POSITIVE_MOOD", text: { en: "Feelings of tenderness and gentleness.", fa: "" } },
  { canonicalId: 30, order: 27, subscale: "POSITIVE_MOOD", text: { en: "Feelings of peace and tranquility.", fa: "" } },
  { canonicalId: 43, order: 28, subscale: "POSITIVE_MOOD", text: { en: "Experience of ecstasy.", fa: "" } },
  { canonicalId: 80, order: 29, subscale: "POSITIVE_MOOD", text: { en: "Sense of awe or awesomeness.", fa: "" } },
  { canonicalId: 87, order: 30, subscale: "POSITIVE_MOOD", text: { en: "Feelings of joy.", fa: "" } }
];

