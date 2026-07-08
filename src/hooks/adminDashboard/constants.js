/**
 * constants.js — начальные значения фильтров и длительности toast админки
 */

export const INITIAL_ADMIN_FILTERS = {
  searchQuery: "",
  status: "all",
  specialistId: "all",
  dateFrom: "",
  dateTo: "",
};

export const ADMIN_TOAST_DURATION = {
  success: 3000,
  error: 5000,
};

export default INITIAL_ADMIN_FILTERS;
