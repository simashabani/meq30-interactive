"use client";

import { useState, useMemo } from "react";
import { jalaliToGregorian, gregorianToJalali } from "@/lib/persianDate";
import { toPersianNumerals, fromPersianNumerals } from "@/lib/persianNumerals";

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

const MONTH_DAYS = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29]; // Non-leap year

interface PersianDatePickerProps {
  value: string; // Gregorian date: "YYYY-MM-DD"
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

export default function PersianDatePicker({
  value,
  onChange,
  disabled = false,
  className = "",
}: PersianDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Parse Persian date from Gregorian
  const parsedPersian = useMemo(() => {
    if (!value) return { year: 1403, month: 1, day: 1 };
    const jalali = gregorianToJalali(value);
    const [y, m, d] = jalali.split("-").map(Number);
    return { year: y, month: m, day: d };
  }, [value]);

  const [tempPYear, setTempPYear] = useState(parsedPersian.year);
  const [tempPMonth, setTempPMonth] = useState(parsedPersian.month);
  const [tempPDay, setTempPDay] = useState(parsedPersian.day);

  // Calculate max days in Persian month
  const maxPersianDays = useMemo(() => {
    if (tempPMonth <= 6) return 31;
    if (tempPMonth <= 11) return 30;
    // Esfand: check for leap year
    const isLeap =
      (tempPYear % 33 === 1) ||
      (tempPYear % 33 === 5) ||
      (tempPYear % 33 === 9) ||
      (tempPYear % 33 === 13) ||
      (tempPYear % 33 === 17) ||
      (tempPYear % 33 === 22) ||
      (tempPYear % 33 === 26) ||
      (tempPYear % 33 === 30);
    return isLeap ? 30 : 29;
  }, [tempPMonth, tempPYear]);

  function syncToGregorian() {
    try {
      const jalaliDate = `${String(tempPYear).padStart(4, "0")}-${String(tempPMonth).padStart(2, "0")}-${String(tempPDay).padStart(2, "0")}`;
      const gregorian = jalaliToGregorian(jalaliDate);
      onChange(gregorian);
      setIsOpen(false);
    } catch (err) {
      console.error("Failed to sync date", err);
    }
  }

  function handleCancel() {
    setTempPYear(parsedPersian.year);
    setTempPMonth(parsedPersian.month);
    setTempPDay(parsedPersian.day);
    setIsOpen(false);
  }

  const displayValue = value
    ? `${toPersianNumerals(gregorianToJalali(value))}`
    : "";

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`w-full border rounded px-3 py-2 text-left ${
          disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"
        }`}
      >
        {displayValue || "انتخاب تاریخ"}
      </button>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded shadow-lg p-4 z-10">
          <div className="space-y-3">
            {/* Persian Calendar - Year */}
                <div>
                  <label className="text-sm font-medium">سال</label>
                  <input
                    type="text"
                    value={toPersianNumerals(tempPYear)}
                    onChange={(e) => {
                      const parsed = fromPersianNumerals(e.target.value);
                      const asNum = Number(parsed.replace(/[^0-9]/g, "")) || 0;
                      setTempPYear(asNum);
                    }}
                    className="w-full border rounded px-2 py-1 text-right"
                    dir="rtl"
                  />
                </div>

            {/* Persian Calendar - Month */}
            <div>
              <label className="text-sm font-medium">ماه</label>
              <select
                value={tempPMonth}
                onChange={(e) => {
                  const newMonth = Number(e.target.value);
                  setTempPMonth(newMonth);
                  // Adjust day if it exceeds max days in new month
                  if (tempPDay > maxPersianDays) {
                    setTempPDay(maxPersianDays);
                  }
                }}
                className="w-full border rounded px-2 py-1"
              >
                {PERSIAN_MONTHS.map((month, idx) => (
                  <option key={idx} value={idx + 1}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Persian Calendar - Day */}
                <div>
                  <label className="text-sm font-medium">روز</label>
                  <input
                    type="text"
                    value={toPersianNumerals(tempPDay)}
                    onChange={(e) => {
                      const parsed = fromPersianNumerals(e.target.value);
                      const asNum = Number(parsed.replace(/[^0-9]/g, "")) || 0;
                      if (asNum >= 1 && asNum <= maxPersianDays) {
                        setTempPDay(asNum);
                      }
                    }}
                    min={1}
                    max={maxPersianDays}
                    className="w-full border rounded px-2 py-1 text-right"
                    dir="rtl"
                  />
                </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1 rounded bg-gray-200"
              >
                لغو
              </button>
              <button
                type="button"
                onClick={syncToGregorian}
                className="px-3 py-1 rounded bg-blue-600 text-white"
              >
                تأیید
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
