/**
 * specialistHelpers.js — фильтрация записей и статистика мастера
 */

import { BOOKING_STATUS } from "./constants";

/**
 * Записи конкретного мастера.
 * @param {Array} bookings
 * @param {string|null|undefined} specialistId
 * @returns {Array}
 */
export function filterBookingsBySpecialist(bookings, specialistId) {
  if (!specialistId || !Array.isArray(bookings)) {
    return [];
  }

  return bookings.filter(
    (booking) => String(booking.specialistId) === String(specialistId),
  );
}

/**
 * KPI мастера: записи, статусы, доход, рейтинг.
 * @param {Array} bookings — уже отфильтрованные по мастеру
 * @param {Array} services
 * @param {{ rating?: number }} [specialist]
 * @returns {Object}
 */
export function computeSpecialistStats(bookings, services, specialist = {}) {
  const total = bookings.length;
  const pending = bookings.filter(
    (b) => b.status === BOOKING_STATUS.PENDING,
  ).length;
  const confirmed = bookings.filter(
    (b) => b.status === BOOKING_STATUS.CONFIRMED,
  ).length;
  const completed = bookings.filter(
    (b) => b.status === BOOKING_STATUS.COMPLETED,
  ).length;
  const cancelled = bookings.filter(
    (b) => b.status === BOOKING_STATUS.CANCELLED,
  ).length;

  const revenueStatuses = [
    BOOKING_STATUS.CONFIRMED,
    BOOKING_STATUS.COMPLETED,
    BOOKING_STATUS.IN_PROGRESS,
  ];

  const revenue = bookings
    .filter((booking) => revenueStatuses.includes(booking.status))
    .reduce((sum, booking) => {
      const service = services.find((item) => item.id === booking.serviceId);
      return sum + (service?.price || 0);
    }, 0);

  return {
    total,
    pending,
    confirmed,
    completed,
    cancelled,
    revenue,
    rating: specialist.rating ?? 0,
  };
}

/**
 * Услуги, привязанные к мастеру через serviceIds.
 * @param {Array} services
 * @param {{ serviceIds?: string[] }} specialist
 * @returns {Array}
 */
export function getSpecialistServices(services, specialist) {
  if (!specialist?.serviceIds?.length || !Array.isArray(services)) {
    return [];
  }

  const serviceIdSet = new Set(
    specialist.serviceIds.map((id) => String(id)),
  );

  return services
    .filter((service) => serviceIdSet.has(String(service.id)))
    .sort((a, b) => a.name.localeCompare(b.name, 'ru', { sensitivity: 'base' }));
}
