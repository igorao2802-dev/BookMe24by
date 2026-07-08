/**
 * useBookingWizardNavigation.js — goNext, goBack и rate-limit guard
 */

import { useCallback, useRef } from "react";
import { BOOKING_STEPS } from "../../utils/constants";
import {
  getStepValidationErrorKey,
  getClearStepUpdates,
} from "./stepValidation.js";

export function useBookingWizardNavigation({
  currentStep,
  setCurrentStep,
  draft,
  updateDraft,
  contactsFormValidation,
  checkNavigationLimit,
  notify,
  t,
}) {
  const isBlockedToastShown = useRef(false);

  const showNavigationBlockedToast = useCallback(
    (limitResult) => {
      if (isBlockedToastShown.current) return;
      notify.error(
        t(limitResult.message, { seconds: limitResult.blockedSeconds }),
        { duration: 3000 },
      );
      isBlockedToastShown.current = true;
      setTimeout(() => {
        isBlockedToastShown.current = false;
      }, 3000);
    },
    [t, notify],
  );

  const validateCurrentStep = useCallback(() => {
    const errorKey = getStepValidationErrorKey(
      currentStep,
      draft,
      contactsFormValidation,
    );
    if (errorKey) {
      notify.error(t(errorKey));
      return false;
    }
    return true;
  }, [currentStep, draft, contactsFormValidation, t, notify]);

  const goNext = useCallback(() => {
    const limitResult = checkNavigationLimit();
    if (!limitResult.allowed) {
      showNavigationBlockedToast(limitResult);
      return;
    }

    if (!validateCurrentStep()) return;

    setCurrentStep((prev) => Math.min(prev + 1, BOOKING_STEPS.CONFIRM));
  }, [
    validateCurrentStep,
    checkNavigationLimit,
    showNavigationBlockedToast,
    setCurrentStep,
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

    const updates = getClearStepUpdates(currentStep);
    if (updates) {
      updateDraft(updates);
    }

    setCurrentStep((prev) => Math.max(prev - 1, BOOKING_STEPS.SERVICE));
  }, [
    currentStep,
    updateDraft,
    checkNavigationLimit,
    showNavigationBlockedToast,
    setCurrentStep,
  ]);

  return {
    goNext,
    goBack,
    showNavigationBlockedToast,
  };
}

export default useBookingWizardNavigation;
