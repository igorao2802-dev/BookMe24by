/**
 * useBookingWizardSubmit.js — подтверждение, очистка формы, экран «Мои записи»
 */

import { useCallback } from "react";
import { validateBookingForm } from "../../utils/validators";
import { sanitizeInput } from "../../utils/sanitizers";
import { calculateEndTime } from "../../utils/timeHelpers";
import { playBookingConfirmation } from "../../utils/audioHelper";
import { BOOKING_STEPS } from "../../utils/constants";

export function useBookingWizardSubmit({
  draft,
  selectedService,
  isSubmitting,
  setIsSubmitting,
  setIsProcessing,
  onCreateBooking,
  notify,
  t,
  confirm,
  clearDraft,
  setCurrentStep,
  setLastCreatedBooking,
  setLastClientPhone,
  setShowMyBookings,
  resetNavigationLimit,
  checkNavigationLimit,
  showNavigationBlockedToast,
}) {
  const handleClearForm = useCallback(async () => {
    const limitResult = checkNavigationLimit();
    if (!limitResult.allowed) {
      showNavigationBlockedToast(limitResult);
      return;
    }

    const confirmed = await confirm({
      title: t("booking.clearFormConfirmTitle"),
      message: t("booking.clearFormConfirmMessage"),
      variant: "warning",
      cancelLabel: t("common.cancel"),
      confirmLabel: t("booking.clearFormConfirmYes"),
    });
    if (!confirmed) return;

    clearDraft();
    setCurrentStep(BOOKING_STEPS.SERVICE);
    notify.info(t("booking.formCleared"), { duration: 3000 });
  }, [
    clearDraft,
    t,
    checkNavigationLimit,
    showNavigationBlockedToast,
    confirm,
    notify,
    setCurrentStep,
  ]);

  const handleConfirm = useCallback(async () => {
    if (isSubmitting) return;

    const formValidation = validateBookingForm({
      clientName: draft.clientName,
      clientPhone: draft.clientPhone,
      clientEmail: draft.clientEmail,
      comment: draft.comment,
    });
    if (!formValidation.isValid) {
      const firstErrorKey = Object.values(formValidation.errors)[0];
      notify.error(t(firstErrorKey));
      setCurrentStep(BOOKING_STEPS.CONTACTS);
      return;
    }

    setIsSubmitting(true);
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      if (!selectedService?.duration) {
        notify.error(t("booking.validation.selectService"));
        return;
      }

      const duration = selectedService.duration;
      const totalPrice = selectedService.price;
      const endTime = calculateEndTime(draft.startTime, duration);

      const result = onCreateBooking({
        serviceId: draft.serviceId,
        specialistId: draft.specialistId,
        date: draft.date,
        startTime: draft.startTime,
        endTime,
        duration,
        totalPrice,
        clientName: sanitizeInput(draft.clientName).trim(),
        clientPhone: sanitizeInput(draft.clientPhone).trim(),
        clientEmail: sanitizeInput(draft.clientEmail).trim(),
        comment: sanitizeInput(draft.comment).trim(),
        createdBy: "client",
      });

      if (result.success) {
        playBookingConfirmation();
        notify.success(
          t("booking.confirmation.success", {
            service: selectedService?.name,
            time: draft.startTime,
          }),
        );
        setLastCreatedBooking(result.booking);
        setLastClientPhone(draft.clientPhone.trim());
        clearDraft();
        setShowMyBookings(true);
        setCurrentStep(BOOKING_STEPS.SERVICE);
        resetNavigationLimit();
      } else {
        notify.error(t(result.error) || t("booking.confirmation.failed"));
      }
    } catch (error) {
      notify.error(t("booking.confirmation.error"));
      console.error("[useBookingWizard] Error:", error);
    } finally {
      setIsSubmitting(false);
      setIsProcessing(false);
    }
  }, [
    isSubmitting,
    onCreateBooking,
    draft,
    selectedService,
    t,
    setLastClientPhone,
    clearDraft,
    resetNavigationLimit,
    notify,
    setIsSubmitting,
    setIsProcessing,
    setLastCreatedBooking,
    setShowMyBookings,
    setCurrentStep,
  ]);

  const handleNewBooking = useCallback(() => {
    clearDraft();
    setLastCreatedBooking(null);
    setCurrentStep(BOOKING_STEPS.SERVICE);
    setShowMyBookings(false);
  }, [clearDraft, setCurrentStep, setLastCreatedBooking, setShowMyBookings]);

  return {
    handleConfirm,
    handleClearForm,
    handleNewBooking,
  };
}

export default useBookingWizardSubmit;
