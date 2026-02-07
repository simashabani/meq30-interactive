/**
 * Convert English numerals to Persian numerals
 * 0→۰, 1→۱, 2→۲, etc.
 */
export function toPersianNumerals(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)]);
}

/**
 * Convert Persian numerals to English numerals.
 * e.g. "۱۴۰۴" -> "1404"
 */
export function fromPersianNumerals(str: string): string {
  const map: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };
  return String(str).replace(/[۰-۹]/g, (ch) => map[ch] || ch);
}
