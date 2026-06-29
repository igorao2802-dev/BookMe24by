/**
 * useBookingWizard.js — бизнес-логика многошаговой записи (Фаза 5, E.1)
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Изолирует state machine wizard от JSX BookingWizard.jsx.
 * Компонент остаётся stepper + composition шагов; хук владеет draft,
 * навигацией, preselect и submit pipeline.
 *
 * ПОЧЕМУ onCreateBooking снаружи, а не весь salon?
 * Минимальная связность: wizard не знает про CRUD услуг/мастеров,
 * только о каталоге и callback создания записи из useBookings.
 *
 * ПУБЛИЧНЫЙ API (не менять без согласования):
 * currentStep, draft, updateDraft, selectedService, selectedSpecialist,
 * goNext, goBack, handleConfirm, handleClearForm,
 * showConfirmation, setShowConfirmation, isSubmitting, lastCreatedBooking
 */

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useLocalStorage } from "./useLocalStorage";
import { useLanguage } from "./useLanguage";
import { useRateLimiter } from "./useRateLimiter";
import Toast from "../components/UI/Toast";
import {
  BOOKING_STEPS,
  STORAGE_KEYS,
  STORAGE_DEBOUNCE_MS,
} from "../utils/constants";
import { validateBookingForm } from "../utils/validators";
import { calculateEndTime } from "../utils/timeHelpers";
import { playBookingConfirmation } from "../utils/audioHelper";

const INITIAL_DRAFT = {
  serviceId: null,
  specialistId: null,
  date: null,
  startTime: null,
  clientName: "",
  clientPhone: "",
  clientEmail: "",
  comment: "",
};

/**
 * @param {{
 *   services: Array,
 *   specialists: Array,
 *   onCreateBooking: Function,
 * }} params
 */
export function useBookingWizard({ services, specialists, onCreateBooking }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  const { checkLimit: checkNavigationLimit, reset: resetNavigationLimit } =
    useRateLimiter();

  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.SERVICE);
  const [draft, setDraft, clearDraft] = useLocalStorage(
    STORAGE_KEYS.BOOKING_DRAFT,
    INITIAL_DRAFT,
    { debounceMs: STORAGE_DEBOUNCE_MS.DRAFT },
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMyBookings, setShowMyBookings] = useState(false);
  const [lastCreatedBooking, setLastCreatedBooking] = useState(null);
  const [, setLastClientPhone] = useLocalStorage(
    STORAGE_KEYS.LAST_CLIENT_PHONE,
    "",
    { debounceMs: STORAGE_DEBOUNCE_MS.IMMEDIATE },
  );

  const isInitialMount = useRef(true);
  const prevDraftRef = useRef(draft);
  const isBlockedToastShown = useRef(false);

  const updateDraft = useCallback(
    (updates) => {
      setDraft((prev) => ({ ...prev, ...updates }));
    },
    [setDraft],
  );

  const showNavigationBlockedToast = useCallback(
    (limitResult) => {
      if (isBlockedToastShown.current) return;
      Toast.error(
        t(limitResult.message, { seconds: limitResult.blockedSeconds }),
        { duration: 3000 },
      );
      isBlockedToastShown.current = true;
      setTimeout(() => {
        isBlockedToastShown.current = false;
      }, 3000);
    },
    [t],
  );

  /** @internal Part 2 — привязка ServiceSelector */
  const handleServiceSelect = useCallback(
    (serviceId) => {
      resetNavigationLimit();

      if (serviceId === draft.serviceId) {
        updateDraft({
          serviceId: null,
          specialistId: null,
          date: null,
          startTime: null,
        });
      } else {
        updateDraft({ serviceId });
      }
    },
    [draft.serviceId, updateDraft, resetNavigationLimit],
  );

  /** @internal Part 2 — привязка SpecialistSelector */
  const handleSpecialistSelect = useCallback(
    (specialistId) => {
      resetNavigationLimit();
      updateDraft({ specialistId });
    },
    [updateDraft, resetNavigationLimit],
  );

  /** @internal Part 2 — привязка TimeSlotPicker */
  const handleSelectDate = useCallback(
    (date) => {
      resetNavigationLimit();
      updateDraft({ date, startTime: null });
    },
    [updateDraft, resetNavigationLimit],
  );

  const handleSelectTime = useCallback(
    (startTime) => {
      resetNavigationLimit();
      updateDraft({ startTime });
    },
    [updateDraft, resetNavigationLimit],
  );

  /** @internal Part 2 — клик по завершённым шагам stepper */
  const goToStep = useCallback((stepNum) => {
    setCurrentStep(stepNum);
  }, []);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (draft.serviceId && !prevDraftRef.current.serviceId) {
      const serviceName = services.find((s) => s.id === draft.serviceId)?.name;
      if (serviceName) {
        Toast.success(t("booking.serviceSelected", { name: serviceName }), {
          duration: 2000,
        });
      }
    }
  }, [draft.serviceId, services, t]);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (draft.specialistId && !prevDraftRef.current.specialistId) {
      const specialistName = specialists.find(
        (s) => s.id === draft.specialistId,
      )?.fullName;
      if (specialistName) {
        Toast.success(
          t("booking.specialistSelected", { name: specialistName }),
          { duration: 2000 },
        );
      }
    }
  }, [draft.specialistId, specialists, t]);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (
      draft.date &&
      draft.startTime &&
      (!prevDraftRef.current.date || !prevDraftRef.current.startTime)
    ) {
      Toast.success(t("booking.dateTimeSelected"), { duration: 2000 });
    }
  }, [draft.date, draft.startTime, t]);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (
      currentStep === BOOKING_STEPS.CONFIRM &&
      prevDraftRef.current.clientName !== draft.clientName
    ) {
      Toast.success(t("booking.contactsSaved"), { duration: 2000 });
    }
  }, [currentStep, draft.clientName, t]);

  useEffect(() => {
    prevDraftRef.current = draft;
  });

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  useEffect(() => {
    const { preselectedServiceId, preselectedSpecialistId, startStep } =
      location.state || {};

    if (preselectedSpecialistId) {
      const specialistExists = specialists.some(
        (s) => s.id === preselectedSpecialistId,
      );
      if (specialistExists) {
        updateDraft({ specialistId: preselectedSpecialistId });
        setCurrentStep(startStep || BOOKING_STEPS.SERVICE);
        const specialistName = specialists.find(
          (s) => s.id === preselectedSpecialistId,
        )?.fullName;
        Toast.success(
          t("booking.specialistSelected", { name: specialistName }),
          { duration: 2000 },
        );
      }
    }

    if (preselectedServiceId) {
      const serviceExists = services.some((s) => s.id === preselectedServiceId);
      if (serviceExists) {
        updateDraft({ serviceId: preselectedServiceId });
        setCurrentStep(startStep || BOOKING_STEPS.SPECIALIST);
        const serviceName = services.find(
          (s) => s.id === preselectedServiceId,
        )?.name;
        Toast.success(t("booking.serviceSelected", { name: serviceName }), {
          duration: 2000,
        });
      } else {
        Toast.error(t("booking.serviceNotFound"), { duration: 3000 });
      }
    }

    if (location.state) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [
    location.state,
    location.pathname,
    t,
    updateDraft,
    specialists,
    services,
    navigate,
  ]);

  useEffect(() => {
    if (!draft.serviceId) return;
    const service = services.find((s) => s.id === draft.serviceId);
    if (
      draft.specialistId ||
      (service && service.specialistIds?.length === 1)
    ) {
      if (!draft.specialistId && service) {
        updateDraft({ specialistId: service.specialistIds[0] });
      }
      setCurrentStep(BOOKING_STEPS.DATETIME);
    }
  }, [draft.serviceId, draft.specialistId, services, updateDraft]);

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

  useEffect(() => {
    if (showConfirmation && !isContactsStepValid) {
      setShowConfirmation(false);
    }
  }, [showConfirmation, isContactsStepValid]);

  const clearStepData = useCallback(
    (step) => {
      switch (step) {
        case BOOKING_STEPS.DATETIME:
          updateDraft({ date: null, startTime: null });
          break;
        case BOOKING_STEPS.SPECIALIST:
          updateDraft({ specialistId: null, date: null, startTime: null });
          break;
        case BOOKING_STEPS.SERVICE:
          updateDraft({
            serviceId: null,
            specialistId: null,
            date: null,
            startTime: null,
          });
          break;
        case BOOKING_STEPS.CONTACTS:
          updateDraft({
            clientName: "",
            clientPhone: "",
            clientEmail: "",
            comment: "",
          });
          break;
        default:
          break;
      }
    },
    [updateDraft],
  );

  const validateCurrentStep = useCallback(() => {
    switch (currentStep) {
      case BOOKING_STEPS.SERVICE:
        if (!draft.serviceId) {
          Toast.error(t("booking.validation.selectService"));
          return false;
        }
        return true;

      case BOOKING_STEPS.SPECIALIST:
        if (!draft.specialistId) {
          Toast.error(t("booking.validation.selectSpecialist"));
          return false;
        }
        return true;

      case BOOKING_STEPS.DATETIME:
        if (!draft.date || !draft.startTime) {
          Toast.error(t("booking.validation.selectDateTime"));
          return false;
        }
        return true;

      case BOOKING_STEPS.CONTACTS: {
        if (!contactsFormValidation.isValid) {
          const firstErrorKey = Object.values(
            contactsFormValidation.errors,
          )[0];
          Toast.error(t(firstErrorKey));
          return false;
        }
        return true;
      }

      default:
        return true;
    }
  }, [
    currentStep,
    draft.serviceId,
    draft.specialistId,
    draft.date,
    draft.startTime,
    contactsFormValidation,
    t,
  ]);

  const goNext = useCallback(() => {
    const limitResult = checkNavigationLimit();
    if (!limitResult.allowed) {
      showNavigationBlockedToast(limitResult);
      return;
    }

    if (!validateCurrentStep()) return;

    if (currentStep === BOOKING_STEPS.CONTACTS) {
      setShowConfirmation(true);
      return;
    }

    setCurrentStep((prev) => Math.min(prev + 1, BOOKING_STEPS.CONFIRM));
  }, [
    validateCurrentStep,
    currentStep,
    checkNavigationLimit,
    showNavigationBlockedToast,
  ]);

  const goBack = useCallback(() => {
    const limitResult = checkNavigationLimit();
    if (!limitResult.allowed) {
      showNavigationBlockedToast(limitResult);
      return;
    }

    if (
      currentStep === BOOKING_STEPS.SPECIALIST ||
      currentStep === BOOKING_STEPS.DATETIME
    ) {
      updateDraft({ specialistId: null });
    }
    clearStepData(currentStep);
    setCurrentStep((prev) => Math.max(prev - 1, BOOKING_STEPS.SERVICE));
  }, [
    clearStepData,
    currentStep,
    updateDraft,
    checkNavigationLimit,
    showNavigationBlockedToast,
  ]);

  const handleClearForm = useCallback(() => {
    const limitResult = checkNavigationLimit();
    if (!limitResult.allowed) {
      showNavigationBlockedToast(limitResult);
      return;
    }

    const confirmed = window.confirm(
      t("booking.clearFormConfirm") ||
        "Вы уверены, что хотите очистить форму? Все введённые данные будут потеряны.",
    );
    if (confirmed) {
      clearDraft();
      setCurrentStep(BOOKING_STEPS.SERVICE);
      Toast.info(t("booking.formCleared"), { duration: 3000 });
    }
  }, [clearDraft, t, checkNavigationLimit, showNavigationBlockedToast]);

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
      Toast.error(t(firstErrorKey));
      setShowConfirmation(false);
      return;
    }

    setIsSubmitting(true);
    setIsProcessing(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));

      if (!selectedService?.duration) {
        Toast.error(t("booking.validation.selectService"));
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
        clientName: draft.clientName.trim(),
        clientPhone: draft.clientPhone.trim(),
        clientEmail: draft.clientEmail.trim(),
        comment: draft.comment.trim(),
        createdBy: "client",
      });

      if (result.success) {
        playBookingConfirmation();
        Toast.success(
          t("booking.confirmation.success", {
            service: selectedService?.name,
            time: draft.startTime,
          }),
        );
        setLastCreatedBooking(result.booking);
        setLastClientPhone(draft.clientPhone.trim());
        clearDraft();
        setShowConfirmation(false);
        setShowMyBookings(true);
        setCurrentStep(BOOKING_STEPS.SERVICE);
        resetNavigationLimit();
      } else {
        Toast.error(t(result.error) || t("booking.confirmation.failed"));
      }
    } catch (error) {
      Toast.error(t("booking.confirmation.error"));
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
  ]);

  /** @internal Part 2 — экран BookingList после успешной записи */
  const handleNewBooking = useCallback(() => {
    clearDraft();
    setLastCreatedBooking(null);
    setCurrentStep(BOOKING_STEPS.SERVICE);
    setShowMyBookings(false);
  }, [clearDraft]);

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
    showConfirmation,
    setShowConfirmation,
    isSubmitting,
    lastCreatedBooking,
    ui: {
      handleServiceSelect,
      handleSpecialistSelect,
      handleSelectDate,
      handleSelectTime,
      goToStep,
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
