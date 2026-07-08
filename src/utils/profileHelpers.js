/**
 * profileHelpers.js — чистые функции личного кабинета (Фаза 7, H.1)
 *
 * ПОЧЕМУ вынесено из ProfilePage?
 * - Фильтрация, статистика и merge профиля удобно покрываются unit-тестами
 * - useClientProfile (H.2) получит готовые building blocks без дублирования
 */

import { normalizePhone } from "./formatters";

/**
 * Фильтрует записи клиента по телефону.
 * Без phone — все записи, отсортированные по date (новые сверху), как в ProfilePage.
 *
 * @param {Array} bookings
 * @param {string} phone
 * @returns {Array}
 */
export function filterClientBookings(bookings = [], phone = "") {
  if (!Array.isArray(bookings) || bookings.length === 0) {
    return [];
  }

  const normalizedFilter = normalizePhone(phone);

  if (!normalizedFilter) {
    return [...bookings].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  }

  return bookings.filter((booking) => {
    if (!booking.clientPhone) return false;
    return normalizePhone(booking.clientPhone) === normalizedFilter;
  });
}

const CONFIRMED_STATUSES = ["confirmed", "inProgress", "completed"];
const SPENT_STATUSES = ["confirmed", "completed", "inProgress"];

/**
 * @param {Array} bookings — уже отфильтрованные записи клиента
 * @returns {{ total: number, confirmed: number, cancelled: number, spent: number }}
 */
export function computeClientStats(bookings = []) {
  const list = Array.isArray(bookings) ? bookings : [];

  const total = list.length;
  const confirmed = list.filter((b) => CONFIRMED_STATUSES.includes(b.status)).length;
  const cancelled = list.filter((b) => b.status === "cancelled").length;
  const spent = list
    .filter((b) => SPENT_STATUSES.includes(b.status))
    .reduce((sum, b) => sum + (b.totalPrice || 0), 0);

  return { total, confirmed, cancelled, spent };
}

/**
 * Мерджит данные профиля из записей с userSettings (приоритет у настроек).
 *
 * @param {Object|null} profileData
 * @param {{ phone?: string, email?: string }} [userSettings]
 * @returns {Object|null}
 */
export function deriveProfileData(profileData, userSettings = {}) {
  if (!profileData) return null;

  return {
    ...profileData,
    phone: userSettings.phone || profileData.phone,
    email: userSettings.email || profileData.email,
  };
}

/**
 * Инициалы для аватара профиля (до 2 слов имени).
 *
 * @param {string} fullName
 * @returns {string}
 */
export function getProfileInitials(fullName) {
  if (!fullName) return "?";
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

export default {
  filterClientBookings,
  computeClientStats,
  deriveProfileData,
  getProfileInitials,
};
