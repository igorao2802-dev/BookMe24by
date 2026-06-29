/**
 * useAdminDashboard.js — бизнес-логика админ-панели (Фаза 6, G.2)
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Изолирует tabs, фильтры, modal-state и CRUD-orchestration от JSX AdminDashboard.
 * Компонент остаётся composition (stats, tabs, tables, modals); хук владеет
 * UI-state и Toast-реакциями на результат CRUD-callback'ов из useSalonData.
 *
 * ПОЧЕМУ CRUD-callback'и снаружи?
 * Хук не владеет localStorage — только оркестрирует вызовы onAddService,
 * onUpdateBooking и т.д., переданных из AppRoutes → useSalonData.
 *
 * ПУБЛИЧНЫЙ API (Frozen Core — не менять без согласования):
 * activeTab, setActiveTab, filters, sortBy, sortedBookings, activeFiltersCount,
 * serviceModal, specialistModal, editBookingModal,
 * handleFilterChange, handleResetFilters, handleSortChange,
 * handleEditBooking, handleSaveBooking, handleConfirmBooking, handleCancelBooking,
 * handleOpenAddService, handleOpenEditService, handleSaveService, handleDeleteService,
 * handleCloseServiceModal,
 * handleOpenAddSpecialist, handleOpenEditSpecialist, handleSaveSpecialist,
 * handleDeleteSpecialist, handleCloseSpecialistModal, handleCloseEditBookingModal
 */

import { useState, useCallback, useMemo } from "react";

import { useLanguage } from "./useLanguage";
import Toast from "../components/UI/Toast";
import { BOOKING_STATUS } from "../utils/constants";
import { filterBookings, sortBookings, countActiveFilters } from "../utils/bookingsHelpers";

const INITIAL_FILTERS = {
  searchQuery: "",
  status: "all",
  specialistId: "all",
  dateFrom: "",
  dateTo: "",
};

const TOAST_DURATION = {
  success: 3000,
  error: 5000,
};

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
}) {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState("bookings");
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [sortBy, setSortBy] = useState("date-desc");

  const [serviceModal, setServiceModal] = useState({
    isOpen: false,
    mode: "add",
    service: null,
  });
  const [specialistModal, setSpecialistModal] = useState({
    isOpen: false,
    mode: "add",
    specialist: null,
  });
  const [editBookingModal, setEditBookingModal] = useState({
    isOpen: false,
    booking: null,
  });

  // ПОЧЕМУ единый паттерн toast?
  // Все CRUD-операции возвращают { success, error? } — дублирование
  // success/error toast в каждом handler усложняло поддержку и G.3 diff.
  const notifySuccess = useCallback(
    (messageKey, params) => {
      Toast.success(t(messageKey, params), { duration: TOAST_DURATION.success });
    },
    [t],
  );

  const notifyError = useCallback(
    (result) => {
      const errorMessage = result?.error ? t(result.error) : t("common.error");
      Toast.error(errorMessage, { duration: TOAST_DURATION.error });
    },
    [t],
  );

  const handleFilterChange = useCallback((name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSortBy("date-desc");
  }, []);

  const handleSortChange = useCallback((value) => {
    setSortBy(value);
  }, []);

  // ПОЧЕМУ useMemo: filter + sort по debouncedQuery и filters при каждом keystroke без debounce
  const sortedBookings = useMemo(() => {
    const filtered = filterBookings(bookings, filters);
    return sortBookings(filtered, sortBy);
  }, [bookings, filters, sortBy]);

  const activeFiltersCount = countActiveFilters(filters);

  const handleOpenAddService = useCallback(() => {
    setServiceModal({ isOpen: true, mode: "add", service: null });
  }, []);

  const handleOpenEditService = useCallback((service) => {
    setServiceModal({ isOpen: true, mode: "edit", service });
  }, []);

  const handleCloseServiceModal = useCallback(() => {
    setServiceModal({ isOpen: false, mode: "add", service: null });
  }, []);

  const handleSaveService = useCallback(
    (serviceData) => {
      let result;

      if (serviceModal.mode === "add") {
        result = onAddService(serviceData);
        if (result?.success) {
          notifySuccess("admin.services.addSuccess", { name: serviceData.name });
          handleCloseServiceModal();
        } else {
          notifyError(result);
        }
      } else {
        result = onUpdateService(serviceModal.service.id, serviceData);
        if (result?.success) {
          notifySuccess("admin.services.updateSuccess", {
            name: serviceData.name,
          });
          handleCloseServiceModal();
        } else {
          notifyError(result);
        }
      }

      return result;
    },
    [
      serviceModal,
      onAddService,
      onUpdateService,
      handleCloseServiceModal,
      notifySuccess,
      notifyError,
    ],
  );

  const handleDeleteService = useCallback(
    (serviceId) => {
      const service = services.find((s) => s.id === serviceId);
      const result = onDeleteService(serviceId);

      if (result?.success && service) {
        notifySuccess("admin.services.deleteSuccess", { name: service.name });
      } else {
        notifyError(result);
      }
    },
    [onDeleteService, services, notifySuccess, notifyError],
  );

  const handleOpenAddSpecialist = useCallback(() => {
    setSpecialistModal({ isOpen: true, mode: "add", specialist: null });
  }, []);

  const handleOpenEditSpecialist = useCallback((specialist) => {
    setSpecialistModal({ isOpen: true, mode: "edit", specialist });
  }, []);

  const handleCloseSpecialistModal = useCallback(() => {
    setSpecialistModal({ isOpen: false, mode: "add", specialist: null });
  }, []);

  const handleSaveSpecialist = useCallback(
    (specialistData) => {
      let result;

      if (specialistModal.mode === "add") {
        result = onAddSpecialist(specialistData);
        if (result?.success) {
          notifySuccess("admin.specialists.addSuccess", {
            name: specialistData.fullName,
          });
          handleCloseSpecialistModal();
        } else {
          notifyError(result);
        }
      } else {
        result = onUpdateSpecialist(
          specialistModal.specialist.id,
          specialistData,
        );
        if (result?.success) {
          notifySuccess("admin.specialists.updateSuccess", {
            name: specialistData.fullName,
          });
          handleCloseSpecialistModal();
        } else {
          notifyError(result);
        }
      }

      return result;
    },
    [
      specialistModal,
      onAddSpecialist,
      onUpdateSpecialist,
      handleCloseSpecialistModal,
      notifySuccess,
      notifyError,
    ],
  );

  const handleDeleteSpecialist = useCallback(
    (specialistId) => {
      const specialist = specialists.find((s) => s.id === specialistId);
      const result = onDeleteSpecialist(specialistId);

      if (result?.success && specialist) {
        notifySuccess("admin.specialists.deleteSuccess", {
          name: specialist.fullName,
        });
      } else {
        notifyError(result);
      }
    },
    [onDeleteSpecialist, specialists, notifySuccess, notifyError],
  );

  const handleEditBooking = useCallback((booking) => {
    setEditBookingModal({ isOpen: true, booking });
  }, []);

  const handleCloseEditBookingModal = useCallback(() => {
    setEditBookingModal({ isOpen: false, booking: null });
  }, []);

  const handleSaveBooking = useCallback(
    (bookingId, updates) => {
      const result = onUpdateBooking(bookingId, updates);

      if (result?.success) {
        notifySuccess("admin.bookings.editSuccess");
        handleCloseEditBookingModal();
      } else {
        notifyError(result);
      }

      return result;
    },
    [onUpdateBooking, handleCloseEditBookingModal, notifySuccess, notifyError],
  );

  const handleConfirmBooking = useCallback(
    (bookingId) => {
      const result = onUpdateBooking(bookingId, {
        status: BOOKING_STATUS.CONFIRMED,
      });

      if (result?.success) {
        notifySuccess("admin.bookings.confirmSuccess");
      } else {
        // ПОЧЕМУ не notifyError?
        // Исторически confirm передавал raw error string, не i18n-key.
        const errorMessage = result?.error || t("common.error");
        Toast.error(errorMessage, { duration: TOAST_DURATION.error });
      }
    },
    [onUpdateBooking, notifySuccess, t],
  );

  const handleCancelBooking = useCallback(
    async (bookingId) => {
      const confirmed = await confirm({
        message: t("admin.bookings.confirmCancel"),
        variant: "danger",
      });
      if (!confirmed) return;

      const result = onCancelBooking(bookingId);

      if (result?.success) {
        Toast.success(
          t("admin.bookings.cancelSuccess") || "Запись отменена",
          { duration: TOAST_DURATION.success },
        );
      } else {
        notifyError(result);
      }
    },
    [onCancelBooking, t, notifyError, confirm],
  );

  return {
    activeTab,
    setActiveTab,
    filters,
    sortBy,
    sortedBookings,
    activeFiltersCount,
    serviceModal,
    specialistModal,
    editBookingModal,
    handleFilterChange,
    handleResetFilters,
    handleSortChange,
    handleEditBooking,
    handleSaveBooking,
    handleConfirmBooking,
    handleCancelBooking,
    handleOpenAddService,
    handleOpenEditService,
    handleSaveService,
    handleDeleteService,
    handleCloseServiceModal,
    handleOpenAddSpecialist,
    handleOpenEditSpecialist,
    handleSaveSpecialist,
    handleDeleteSpecialist,
    handleCloseSpecialistModal,
    handleCloseEditBookingModal,
  };
}

export default useAdminDashboard;
