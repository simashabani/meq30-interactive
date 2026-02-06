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
  { canonicalId: 35, order: 1, subscale: "MYSTICAL", text: { en: "Freedom from the limitations of your personal self and feeling a unity or bond with what was felt to be greater than your personal self.", fa: "آزادی از محدودیت‌های خود و احساس وحدت یا پیوند با آنچه بیشتر از خود شما احساس می‌شود" } },
  { canonicalId: 41, order: 2, subscale: "MYSTICAL", text: { en: "Experience of pure being and pure awareness (beyond the world of sense impressions).", fa: "تجربهٔ موجودیت خالص و آگاهی خالص (فراتر از دنیای تأثیرات حسی)" } },
  { canonicalId: 54, order: 3, subscale: "MYSTICAL", text: { en: "Experience of oneness in relation to an \"inner world\" within.", fa: "تجربهٔ یکتایی در رابطه با دنیای درونی" } },
  { canonicalId: 77, order: 4, subscale: "MYSTICAL", text: { en: "Experience of the fusion of your personal self into a larger whole.", fa: "تجربهٔ ذوب‌شدن خویشتن در یک کل بزرگ‌تر" } },
  { canonicalId: 83, order: 5, subscale: "MYSTICAL", text: { en: "Experience of unity with ultimate reality.", fa: "تجربهٔ وحدت با واقعیت نهایی" } },

  { canonicalId: 2, order: 6, subscale: "TIME_SPACE", text: { en: "Loss of your usual sense of time.", fa: "از دست رفتن احساس معمول زمان" } },
  { canonicalId: 15, order: 7, subscale: "TIME_SPACE", text: { en: "Loss of your usual sense of space.", fa: "از دست رفتن احساس معمول فضا" } },
  { canonicalId: 29, order: 8, subscale: "TIME_SPACE", text: { en: "Loss of usual awareness of where you were.", fa: "از دست رفتن آگاهی معمول از محل حضور" } },
  { canonicalId: 34, order: 9, subscale: "TIME_SPACE", text: { en: "Sense of being \"outside of\" time, beyond past and future.", fa: "احساس بودن فراتر از زمان، فراتر از ماضی و آینده" } },
  { canonicalId: 48, order: 10, subscale: "TIME_SPACE", text: { en: "Being in a realm with no space boundaries.", fa: "بودن در قلمرویی بدون مرزهای فضایی" } },
  { canonicalId: 65, order: 11, subscale: "TIME_SPACE", text: { en: "Experience of timelessness.", fa: "تجربهٔ بی‌زمانگی" } },

  { canonicalId: 6, order: 12, subscale: "INEFFABILITY", text: { en: "Sense that the experience cannot be described adequately in words.", fa: "احساس اینکه تجربه را نمی‌توان کافی‌انه با کلمات توصیف کرد" } },
  { canonicalId: 23, order: 13, subscale: "INEFFABILITY", text: { en: "Feeling that you could not do justice to your experience by describing it in words.", fa: "احساس اینکه نمی‌توانید با توصیف‌های کلامی نسبت به تجربه خود عدالت کنید" } },
  { canonicalId: 86, order: 14, subscale: "INEFFABILITY", text: { en: "Feeling that it would be difficult to communicate your own experience to others who have not had similar experiences.", fa: "احساس اینکه انتقال تجربهٔ خود به دیگرانی که تجربهٔ مشابهی نداشته‌اند دشوار است" } },

  { canonicalId: 14, order: 15, subscale: "MYSTICAL", text: { en: "Experience of oneness or unity with objects and/or persons perceived in your surroundings.", fa: "تجربهٔ یکتایی یا وحدت با اشیاء و یا افراد در اطراف شما" } },
  { canonicalId: 47, order: 16, subscale: "MYSTICAL", text: { en: "Experience of the insight that \"all is One.\"", fa: "تجربهٔ درک اینکه «همه یک هستند»" } },
  { canonicalId: 74, order: 17, subscale: "MYSTICAL", text: { en: "Awareness of the life or living presence in all things.", fa: "آگاهی از حیات یا حضور زندهٔ در تمام چیزها" } },
  { canonicalId: 9, order: 18, subscale: "MYSTICAL", text: { en: "Gain of insightful knowledge experienced at an intuitive level.", fa: "کسب دانش بینش‌آمیز در سطح شهودی" } },
  { canonicalId: 22, order: 19, subscale: "MYSTICAL", text: { en: "Certainty of encounter with ultimate reality (in the sense of being able to \"know\" and \"see\" what is really real).", fa: "اطمینان از برخورد با واقعیت نهایی (به معنی توانایی «دانستن» و «دیدن» آنچه واقعی است)" } },
  { canonicalId: 12, order: 20, subscale: "MYSTICAL", text: { en: "You are convinced now, as you look back on your experience, that in it you encountered ultimate reality.", fa: "اکنون با نگاه به عقب به تجربهٔ خود، مطمئن هستید که در آن با واقعیت نهایی برخورد کردید" } },

  { canonicalId: 36, order: 21, subscale: "MYSTICAL", text: { en: "Sense of being at a spiritual height.", fa: "احساس بودن در ارتفاع معنوی" } },
  { canonicalId: 55, order: 22, subscale: "MYSTICAL", text: { en: "Sense of reverence.", fa: "احساس تقدس" } },
  { canonicalId: 73, order: 23, subscale: "MYSTICAL", text: { en: "Feeling that you experienced something profoundly sacred and holy.", fa: "احساس اینکه چیزی عمیقاً مقدس و پاک را تجربه کردید" } },
  { canonicalId: 69, order: 24, subscale: "MYSTICAL", text: { en: "You are convinced now, as you look back on your experience, that in it you \"knew\" and \"saw\" what was really real.", fa: "اکنون با نگاه به عقب به تجربهٔ خود، مطمئن هستید که در آن آنچه واقعی است را «دانستید» و «دیدید»" } },

  { canonicalId: 5, order: 25, subscale: "POSITIVE_MOOD", text: { en: "Experience of amazement.", fa: "تجربهٔ حیرت و تعجب" } },
  { canonicalId: 18, order: 26, subscale: "POSITIVE_MOOD", text: { en: "Feelings of tenderness and gentleness.", fa: "احساسات مهربانی و نرمی" } },
  { canonicalId: 30, order: 27, subscale: "POSITIVE_MOOD", text: { en: "Feelings of peace and tranquility.", fa: "احساسات صلح و آرامش" } },
  { canonicalId: 43, order: 28, subscale: "POSITIVE_MOOD", text: { en: "Experience of ecstasy.", fa: "تجربهٔ وجدانی" } },
  { canonicalId: 80, order: 29, subscale: "POSITIVE_MOOD", text: { en: "Sense of awe or awesomeness.", fa: "احساس بزرگی و شکوه" } },
  { canonicalId: 87, order: 30, subscale: "POSITIVE_MOOD", text: { en: "Feelings of joy.", fa: "احساسات شادی" } }
];

