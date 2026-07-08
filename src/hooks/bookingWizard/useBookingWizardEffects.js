/**
 * useBookingWizardEffects.js — побочные эффекты wizard (notify, preselect, guards)
 *
 * ПОЧЕМУ отдельный хук?
 * useBookingWizard.js превышал 300 строк; эффекты изолированы от навигации и submit.
 */

import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BOOKING_STEPS } from "../../utils/constants";

/**
 * Toast при изменении draft (услуга, мастер, дата, контакты).
 * ПОЧЕМУ prevDraftRef: уведомляем только при переходе «пусто → значение».
 */
export function useWizardDraftNotifications({
  draft,
  currentStep,
  services,
  specialists,
  notify,
  t,
}) {
  const isInitialMount = useRef(true);
  const prevDraftRef = useRef(draft);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (draft.serviceId && !prevDraftRef.current.serviceId) {
      const serviceName = services.find((s) => s.id === draft.serviceId)?.name;
      if (serviceName) {
        notify.success(t("booking.serviceSelected", { name: serviceName }), {
          duration: 2000,
        });
      }
    }
  }, [draft.serviceId, services, t, notify]);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (draft.specialistId && !prevDraftRef.current.specialistId) {
      const specialistName = specialists.find(
        (s) => s.id === draft.specialistId,
      )?.fullName;
      if (specialistName) {
        notify.success(
          t("booking.specialistSelected", { name: specialistName }),
          { duration: 2000 },
        );
      }
    }
  }, [draft.specialistId, specialists, t, notify]);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (
      draft.date &&
      draft.startTime &&
      (!prevDraftRef.current.date || !prevDraftRef.current.startTime)
    ) {
      notify.success(t("booking.dateTimeSelected"), { duration: 2000 });
    }
  }, [draft.date, draft.startTime, t, notify]);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (
      currentStep === BOOKING_STEPS.CONFIRM &&
      prevDraftRef.current.clientName !== draft.clientName
    ) {
      notify.success(t("booking.contactsSaved"), { duration: 2000 });
    }
  }, [currentStep, draft.clientName, t, notify]);

  useEffect(() => {
    prevDraftRef.current = draft;
  });

  useEffect(() => {
    isInitialMount.current = false;
  }, []);
}

/**
 * Preselect из location.state (каталог → запись).
 */
export function useWizardRoutePreselect({
  services,
  specialists,
  updateDraft,
  setCurrentStep,
  notify,
  t,
}) {
  const navigate = useNavigate();
  const location = useLocation();

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
        notify.success(
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
        notify.success(t("booking.serviceSelected", { name: serviceName }), {
          duration: 2000,
        });
      } else {
        notify.error(t("booking.serviceNotFound"), { duration: 3000 });
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
    notify,
    setCurrentStep,
  ]);
}

/**
 * Автовыбор единственного мастера на шаге 2 без перехода на следующий шаг.
 *
 * ПОЧЕМУ без setCurrentStep?
 * Переход между шагами — только через NextButton; клик по карточке лишь меняет draft.
 */
export function useWizardSingleSpecialistPreselect({
  draft,
  services,
  currentStep,
  updateDraft,
}) {
  useEffect(() => {
    if (currentStep !== BOOKING_STEPS.SPECIALIST) return;
    if (!draft.serviceId || draft.specialistId) return;

    const service = services.find((s) => s.id === draft.serviceId);
    if (service?.specialistIds?.length === 1) {
      updateDraft({ specialistId: service.specialistIds[0] });
    }
  }, [
    draft.serviceId,
    draft.specialistId,
    services,
    updateDraft,
    currentStep,
  ]);
}

/**
 * Вернуть на шаг контактов, если данные стали невалидны на шаге подтверждения.
 */
export function useWizardConfirmationGuard({
  currentStep,
  isContactsStepValid,
  setCurrentStep,
}) {
  useEffect(() => {
    if (currentStep === BOOKING_STEPS.CONFIRM && !isContactsStepValid) {
      setCurrentStep(BOOKING_STEPS.CONTACTS);
    }
  }, [currentStep, isContactsStepValid, setCurrentStep]);
}
