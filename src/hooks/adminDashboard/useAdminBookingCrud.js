/**
 * useAdminBookingCrud.js — редактирование, подтверждение и отмена записей
 */

import { useState, useCallback } from "react";
import { BOOKING_STATUS } from "../../utils/constants";
import { ADMIN_TOAST_DURATION } from "./constants.js";

export function useAdminBookingCrud({
  onUpdateBooking,
  onCancelBooking,
  notify,
  notifySuccess,
  notifyError,
  t,
  confirm,
}) {
  const [editBookingModal, setEditBookingModal] = useState({
    isOpen: false,
    booking: null,
  });

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
        notify.error(errorMessage, { duration: ADMIN_TOAST_DURATION.error });
      }
    },
    [onUpdateBooking, notifySuccess, t, notify],
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
        notify.success(
          t("admin.bookings.cancelSuccess") || "Запись отменена",
          { duration: ADMIN_TOAST_DURATION.success },
        );
      } else {
        notifyError(result);
      }
    },
    [onCancelBooking, t, notifyError, confirm, notify],
  );

  return {
    editBookingModal,
    handleEditBooking,
    handleSaveBooking,
    handleConfirmBooking,
    handleCancelBooking,
    handleCloseEditBookingModal,
  };
}

export default useAdminBookingCrud;
