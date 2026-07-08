/**
 * useBookingWizardStepHandlers.js — обработчики выбора на шагах wizard
 */

import { useCallback } from "react";

export function useBookingWizardStepHandlers({
  draft,
  updateDraft,
  resetNavigationLimit,
  setCurrentStep,
}) {
  const handleServiceSelect = useCallback(
    (serviceId) => {
      resetNavigationLimit();

      if (!serviceId || serviceId === draft.serviceId) {
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

  const handleSpecialistSelect = useCallback(
    (specialistId) => {
      resetNavigationLimit();

      // ПОЧЕМУ toggle?
      // Повторный клик по выбранной карточке снимает выбор — как на шаге услуги.
      if (!specialistId || specialistId === draft.specialistId) {
        updateDraft({
          specialistId: null,
          date: null,
          startTime: null,
        });
      } else {
        updateDraft({ specialistId });
      }
    },
    [draft.specialistId, updateDraft, resetNavigationLimit],
  );

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

  const goToStep = useCallback(
    (stepNum) => {
      setCurrentStep(stepNum);
    },
    [setCurrentStep],
  );

  return {
    handleServiceSelect,
    handleSpecialistSelect,
    handleSelectDate,
    handleSelectTime,
    goToStep,
  };
}

export default useBookingWizardStepHandlers;
