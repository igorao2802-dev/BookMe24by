/**
 * timeSlotPickerHelpers.js — чистые функции для TimeSlotPicker
 */

export function isDatePast(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

export function isSpecialistWorking(specialist, date) {
  if (!specialist || !specialist.workingHours) return false;
  const dayOfWeek = new Date(date).getDay();
  return (
    specialist.workingHours[dayOfWeek] !== null &&
    specialist.workingHours[dayOfWeek] !== undefined
  );
}

export function getDateUnavailableReason(date, specialist, t) {
  if (isDatePast(date)) return t("timeSlotPicker.pastDate");
  if (!isSpecialistWorking(specialist, date)) {
    const dayOfWeek = new Date(date).getDay();
    return t(`timeSlotPicker.days.${dayOfWeek}`, {
      day: t(`timeSlotPicker.days.${dayOfWeek}`),
    });
  }
  return null;
}

export function getWindowsWord(count, t) {
  const lastTwo = count % 100;
  const lastOne = count % 10;

  if (lastTwo >= 11 && lastTwo <= 19) {
    return t("timeSlotPicker.windows.many", { count });
  }
  if (lastOne === 1) return t("timeSlotPicker.windows.one", { count });
  if (lastOne >= 2 && lastOne <= 4) {
    return t("timeSlotPicker.windows.few", { count });
  }
  return t("timeSlotPicker.windows.many", { count });
}

export function groupSlotsByTimeOfDay(slots) {
  if (!slots) return { morning: [], afternoon: [], evening: [] };
  return {
    morning: slots.filter((s) => parseInt(s.startTime, 10) < 12),
    afternoon: slots.filter((s) => {
      const hour = parseInt(s.startTime, 10);
      return hour >= 12 && hour < 17;
    }),
    evening: slots.filter((s) => parseInt(s.startTime, 10) >= 17),
  };
}

export function generateAvailableDates(maxDays) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < maxDays; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
}
