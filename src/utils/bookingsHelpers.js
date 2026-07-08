/**
 * bookingsHelpers.js — фильтрация и сортировка записей (админка)
 *
 * ПОЧЕМУ вынесено из AdminDashboard?
 * - Чистые функции удобно покрывать unit-тестами (bookingsFilter.test.js)
 * - Логика фильтров не дублируется при рефакторинге дашборда
 */

/** Дефолтные значения фильтров AdminFilterPanel / useAdminDashboard */
export const DEFAULT_BOOKING_FILTERS = {
  searchQuery: "",
  status: "all",
  specialistId: "all",
  dateFrom: "",
  dateTo: "",
};

/**
 * @param {Array} bookings - все записи
 * @param {Object} filters - объект фильтров из AdminFilterPanel
 * @returns {Array}
 */
export function filterBookings(bookings, filters = {}) {
  const {
    searchQuery = "",
    status = "all",
    specialistId = "all",
    dateFrom = "",
    dateTo = "",
  } = filters;

  return bookings.filter((booking) => {
    const matchesSearch =
      !searchQuery ||
      booking.clientName
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      booking.clientPhone?.includes(searchQuery);

    const matchesStatus = status === "all" || booking.status === status;

    const matchesSpecialist =
      specialistId === "all" || booking.specialistId === specialistId;

    const matchesDateFrom = !dateFrom || booking.date >= dateFrom;
    const matchesDateTo = !dateTo || booking.date <= dateTo;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesSpecialist &&
      matchesDateFrom &&
      matchesDateTo
    );
  });
}

/**
 * Считает число активных (не дефолтных) фильтров для бейджа в AdminFilterPanel.
 *
 * @param {Object} filters - текущее состояние фильтров
 * @returns {number}
 */
export function countActiveFilters(filters = {}) {
  return Object.entries(filters).filter(([key, value]) => {
    const defaultValue = DEFAULT_BOOKING_FILTERS[key];

    if (defaultValue !== undefined) {
      return value !== defaultValue && value !== null && value !== undefined;
    }

    return value !== "" && value !== null && value !== undefined;
  }).length;
}

/**
 * @param {Array} bookings - отфильтрованные записи
 * @param {string} sortBy - ключ сортировки из AdminFilterPanel
 * @returns {Array} новый массив (исходный не мутируется)
 */
export function sortBookings(bookings, sortBy = "date-desc") {
  return [...bookings].sort((a, b) => {
    switch (sortBy) {
      case "date-asc":
        return new Date(a.date) - new Date(b.date);
      case "service":
        return (a.serviceId || "").localeCompare(b.serviceId || "");
      case "specialist":
        return (a.specialistId || "").localeCompare(b.specialistId || "");
      case "client":
        return (a.clientName || "").localeCompare(b.clientName || "");
      case "date-desc":
      default:
        return new Date(b.date) - new Date(a.date);
    }
  });
}

export default { filterBookings, sortBookings, countActiveFilters, DEFAULT_BOOKING_FILTERS };
