// @ts-ignore
import { toJalaali, toGregorian } from 'jalaali-js';

/**
 * Convert Gregorian (English) date to Jalali (Persian) date
 * Returns formatted string: YYYY-MM-DD
 */
export function gregorianToJalali(gregorianDate: string): string {
  // gregorianDate expected format: "YYYY-MM-DD"
  const [gy, gm, gd] = gregorianDate.split("-").map(Number);
  
  const { jy, jm, jd } = toJalaali(gy, gm, gd);
  
  return `${String(jy).padStart(4, "0")}-${String(jm).padStart(2, "0")}-${String(jd).padStart(2, "0")}`;
}

/**
 * Convert Jalali (Persian) date to Gregorian (English) date
 * Returns formatted string: YYYY-MM-DD
 */
export function jalaliToGregorian(jalaliDate: string): string {
  // jalaliDate expected format: "YYYY-MM-DD"
  const [jy, jm, jd] = jalaliDate.split("-").map(Number);
  
  const { gy, gm, gd } = toGregorian(jy, jm, jd);
  
  return `${String(gy).padStart(4, "0")}-${String(gm).padStart(2, "0")}-${String(gd).padStart(2, "0")}`;
}

/**
 * Format a Gregorian date for display in Persian calendar
 * Input: "YYYY-MM-DD", Output: "YYYY-MM-DD (with Persian numerals if needed)"
 */
export function formatJalaliDate(gregorianDate: string): string {
  const jalali = gregorianToJalali(gregorianDate);
  return jalali; // Return as-is; caller can apply toPersianNumerals if needed
}
