/**
 * validateBookingPipeline.js — единая валидация записи перед сохранением
 *
 * АРХИТЕКТУРНАЯ РОЛЬ (Фаза 5, E.2):
 * Одна цепочка проверок для createBooking, updateBooking и админ-модалки:
 * 1) обязательный duration
 * 2) пересечения (checkTimeOverlap)
 * 3) рабочие часы мастера — если передан specialist
 *
 * ПОЧЕМУ duration проверяется здесь, а не только в UI?
 * checkTimeOverlap при отсутствии duration возвращает hasOverlap: false —
 * это silent fail, который мы закрываем на уровне data layer.
 */

import {
  checkTimeOverlap,
  isWithinWorkingHours,
} from "./checkTimeOverlap";

/** i18n-ключ для toast в BookingWizard и AdminDashboard */
export const BOOKING_DURATION_ERROR_KEY = "validation.service.durationRequired";

/**
 * @param {Object} booking
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function assertBookingDuration(booking) {
  if (!booking?.duration || Number(booking.duration) <= 0) {
    return { ok: false, error: BOOKING_DURATION_ERROR_KEY };
  }
  return { ok: true };
}

/**
 * @param {Object} booking — новая или обновлённая запись
 * @param {Array} existingBookings — все записи в storage
 * @param {Object} [options]
 * @param {string} [options.excludeBookingId] — ID редактируемой записи (update)
 * @param {Object} [options.specialist] — для проверки workingHours (опционально)
 * @returns {{ isValid: boolean, error?: string }}
 */
export function validateBookingBeforeSave(
  booking,
  existingBookings,
  options = {},
) {
  const { excludeBookingId = null, specialist = null } = options;

  const durationResult = assertBookingDuration(booking);
  if (!durationResult.ok) {
    return { isValid: false, error: durationResult.error };
  }

  const bookingsPool = excludeBookingId
    ? existingBookings.filter((item) => item.id !== excludeBookingId)
    : existingBookings;

  const overlap = checkTimeOverlap(booking, bookingsPool);
  if (overlap.hasOverlap) {
    return {
      isValid: false,
      error: overlap.reason || "Время пересекается с существующей записью",
    };
  }

  if (specialist?.workingHours) {
    const hoursResult = isWithinWorkingHours(booking, specialist);
    if (!hoursResult.isWithin) {
      return { isValid: false, error: hoursResult.reason };
    }
  }

  return { isValid: true };
}

export default validateBookingBeforeSave;
