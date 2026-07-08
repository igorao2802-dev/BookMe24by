/**
 * useAdminDashboard.js — оркестратор админ-панели (Фаза 6, G.2)
 *
 * Tabs, фильтры и CRUD разнесены по adminDashboard/*.
 * Toast — через notify из AdminDashboard (UI-слой).
 */

import { useState } from "react";

import { useAdminNotify } from "./adminDashboard/useAdminNotify.js";
import { useAdminFilters } from "./adminDashboard/useAdminFilters.js";
import { useAdminServiceCrud } from "./adminDashboard/useAdminServiceCrud.js";
import { useAdminSpecialistCrud } from "./adminDashboard/useAdminSpecialistCrud.js";
import { useAdminBookingCrud } from "./adminDashboard/useAdminBookingCrud.js";

/**
 * @param {{
 *   bookings: Array,
 *   services: Array,
 *   specialists: Array,
 *   onUpdateBooking: Function,
 *   onCancelBooking: Function,
 *   onAddService: Function,
 *   onUpdateService: Function,
 *   onDeleteService: Function,
 *   onAddSpecialist: Function,
 *   onUpdateSpecialist: Function,
 *   onDeleteSpecialist: Function,
 *   confirm: Function,
 *   notify: { success, error, info },
 * }} params
 */
export function useAdminDashboard({
  bookings,
  services,
  specialists,
  onUpdateBooking,
  onCancelBooking,
  onAddService,
  onUpdateService,
  onDeleteService,
  onAddSpecialist,
  onUpdateSpecialist,
  onDeleteSpecialist,
  confirm,
  notify: notifyProp,
}) {
  const [activeTab, setActiveTab] = useState("bookings");

  const { notify, notifySuccess, notifyError, t } = useAdminNotify(notifyProp);

  const {
    filters,
    sortBy,
    sortedBookings,
    activeFiltersCount,
    handleFilterChange,
    handleResetFilters,
    handleSortChange,
  } = useAdminFilters(bookings);

  const serviceCrud = useAdminServiceCrud({
    services,
    onAddService,
    onUpdateService,
    onDeleteService,
    notifySuccess,
    notifyError,
  });

  const specialistCrud = useAdminSpecialistCrud({
    specialists,
    onAddSpecialist,
    onUpdateSpecialist,
    onDeleteSpecialist,
    notifySuccess,
    notifyError,
  });

  const bookingCrud = useAdminBookingCrud({
    onUpdateBooking,
    onCancelBooking,
    notify,
    notifySuccess,
    notifyError,
    t,
    confirm,
  });

  return {
    activeTab,
    setActiveTab,
    filters,
    sortBy,
    sortedBookings,
    activeFiltersCount,
    ...serviceCrud,
    ...specialistCrud,
    ...bookingCrud,
    handleFilterChange,
    handleResetFilters,
    handleSortChange,
  };
}

export default useAdminDashboard;
