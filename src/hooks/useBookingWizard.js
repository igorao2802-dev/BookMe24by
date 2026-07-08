/**
 * useBookingWizard.js — бизнес-логика многошаговой записи (Фаза 5, E.1)
 *
 * Оркестратор state machine; эффекты, навигация и submit — в bookingWizard/*.
 */

import { useState, useCallback, useMemo } from "react";

import { useLocalStorage } from "./useLocalStorage";
import { useLanguage } from "./useLanguage";
import { useRateLimiter } from "./useRateLimiter";
import { getNoopNotify } from "../utils/createNotify.js";
import {
  BOOKING_STEPS,
  STORAGE_KEYS,
  STORAGE_DEBOUNCE_MS,
} from "../utils/constants";
import { validateBookingForm } from "../utils/validators";
import { INITIAL_BOOKING_DRAFT } from "./bookingWizard/constants.js";
import {
  useWizardDraftNotifications,
  useWizardRoutePreselect,
  useWizardSingleSpecialistPreselect,
  useWizardConfirmationGuard,
} from "./bookingWizard/useBookingWizardEffects.js";
import { useBookingWizardStepHandlers } from "./bookingWizard/useBookingWizardStepHandlers.js";
import { useBookingWizardSubmit } from "./bookingWizard/useBookingWizardSubmit.js";
import { useBookingWizardNavigation } from "./bookingWizard/useBookingWizardNavigation.js";

/**
 * @param {{
 *   services: Array,
 *   specialists: Array,
 *   onCreateBooking: Function,
 *   confirm: Function,
 *   notify: { success, error, info },
 * }} params
 */
export function useBookingWizard({
  services,
  specialists,
  onCreateBooking,
  confirm,
  notify: notifyProp,
}) {
  const notify = notifyProp ?? getNoopNotify();
  const { t } = useLanguage();

  const { checkLimit: checkNavigationLimit, reset: resetNavigationLimit } =
    useRateLimiter();

  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.SERVICE);
  const [draft, setDraft, clearDraft] = useLocalStorage(
    STORAGE_KEYS.BOOKING_DRAFT,
    INITIAL_BOOKING_DRAFT,
    { debounceMs: STORAGE_DEBOUNCE_MS.DRAFT },
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [lastCreatedBooking, setLastCreatedBooking] = useState(null);
  const [, setLastClientPhone] = useLocalStorage(
    STORAGE_KEYS.LAST_CLIENT_PHONE,
    "",
    { debounceMs: STORAGE_DEBOUNCE_MS.IMMEDIATE },
  );

  const updateDraft = useCallback(
    (updates) => {
      setDraft((prev) => ({ ...prev, ...updates }));
    },
    [setDraft],
  );

  useWizardDraftNotifications({
    draft,
    currentStep,
    services,
    specialists,
    notify,
    t,
  });

  useWizardRoutePreselect({
    services,
    specialists,
    updateDraft,
    setCurrentStep,
    notify,
    t,
  });

  useWizardSingleSpecialistPreselect({
    draft,
    services,
    currentStep,
    updateDraft,
  });

  const stepHandlers = useBookingWizardStepHandlers({
    draft,
    updateDraft,
    resetNavigationLimit,
    setCurrentStep,
  });

  const selectedService = useMemo(
    () => services.find((s) => s.id === draft.serviceId),
    [services, draft.serviceId],
  );

  const selectedSpecialist = useMemo(
    () => specialists.find((s) => s.id === draft.specialistId),
    [specialists, draft.specialistId],
  );

  const contactsFormValidation = useMemo(
    () =>
      validateBookingForm({
        clientName: draft.clientName,
        clientPhone: draft.clientPhone,
        clientEmail: draft.clientEmail,
        comment: draft.comment,
      }),
    [
      draft.clientName,
      draft.clientPhone,
      draft.clientEmail,
      draft.comment,
    ],
  );

  const isContactsStepValid = contactsFormValidation.isValid;

  useWizardConfirmationGuard({
    currentStep,
    isContactsStepValid,
    setCurrentStep,
  });

  const { goNext, goBack, showNavigationBlockedToast } =
    useBookingWizardNavigation({
      currentStep,
      setCurrentStep,
      draft,
      updateDraft,
      contactsFormValidation,
      checkNavigationLimit,
      notify,
      t,
    });

  const { handleConfirm, handleClearForm, handleNewBooking } =
    useBookingWizardSubmit({
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
    });

  return {
    currentStep,
    draft,
    updateDraft,
    selectedService,
    selectedSpecialist,
    goNext,
    goBack,
    handleConfirm,
    handleClearForm,
    isSubmitting,
    lastCreatedBooking,
    ui: {
      ...stepHandlers,
      isContactsStepValid,
      contactsFormValidation,
      isProcessing,
      showMyBookings,
      setShowMyBookings,
      handleNewBooking,
    },
  };
}

export default useBookingWizard;
