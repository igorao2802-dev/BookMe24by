/**
 * useAdminFilters.js — фильтры, сортировка и derived sortedBookings
 */

import { useState, useCallback, useMemo } from "react";
import {
  filterBookings,
  sortBookings,
  countActiveFilters,
} from "../../utils/bookingsHelpers";
import { INITIAL_ADMIN_FILTERS } from "./constants.js";

export function useAdminFilters(bookings) {
  const [filters, setFilters] = useState(INITIAL_ADMIN_FILTERS);
  const [sortBy, setSortBy] = useState("date-desc");

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_ADMIN_FILTERS);
    setSortBy("date-desc");
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
  }, []);

  // ПОЧЕМУ useMemo: filter + sort без debounce на каждый keystroke в searchQuery
  const sortedBookings = useMemo(() => {
    const filtered = filterBookings(bookings, filters);
    return sortBookings(filtered, sortBy);
  }, [bookings, filters, sortBy]);

  const activeFiltersCount = countActiveFilters(filters);

  return {
    filters,
    sortBy,
    sortedBookings,
    activeFiltersCount,
    handleFilterChange,
    handleResetFilters,
    handleSortChange,
  };
}

export default useAdminFilters;
