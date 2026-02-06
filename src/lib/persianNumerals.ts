/**
 * Convert English numerals to Persian numerals
 * 0→۰, 1→۱, 2→۲, etc.
 */
export function toPersianNumerals(num: number | string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (digit) => persianDigits[parseInt(digit, 10)]);
}
