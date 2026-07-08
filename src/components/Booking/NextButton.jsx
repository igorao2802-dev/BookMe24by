/**
 * NextButton.jsx — единая кнопка перехода между шагами визарда записи
 */
import { ArrowRight } from "lucide-react";

import Button from "../UI/Button";
import { BOOKING_STEPS } from "../../utils/constants";
import {
  getNextButtonLabelKey,
  getFirstContactsValidationError,
  isCurrentStepValid,
} from "../../hooks/bookingWizard/stepValidation";
import { translateValidationError } from "../../utils/validationMessages";
import "./NextButton.css";

export default function NextButton({
  currentStep,
  draft,
  contactsFormValidation,
  onClick,
  t,
  isSubmitting = false,
}) {
  const isValid = isCurrentStepValid(currentStep, draft, contactsFormValidation);
  const isConfirmStep = currentStep === BOOKING_STEPS.CONFIRM;
  const showArrow = !isConfirmStep;
  const isDisabled = !isValid || isSubmitting;
  const isIconOnlyOnMobile = !isConfirmStep && !isSubmitting;

  const labelKey = getNextButtonLabelKey(currentStep);
  const buttonLabel =
    isConfirmStep && isSubmitting ? t('common.loading') : t(labelKey);

  const firstContactError =
    currentStep === BOOKING_STEPS.CONTACTS
      ? getFirstContactsValidationError(contactsFormValidation)
      : null;

  const disabledHint =
    isDisabled && !isSubmitting
      ? firstContactError
        ? translateValidationError(
            t,
            firstContactError.key,
            firstContactError.params,
          )
        : currentStep === BOOKING_STEPS.CONTACTS
          ? t("booking.contacts.fixFieldsHint")
          : null
      : null;

  return (
    <div className="next-button-wrap">
      {isDisabled && disabledHint && currentStep === BOOKING_STEPS.CONTACTS && (
        <p className="next-button__hint" id="next-button-hint">
          {disabledHint}
        </p>
      )}

      <Button
        variant="primary"
        onClick={onClick}
        disabled={isDisabled}
        isLoading={isConfirmStep && isSubmitting}
        rightIcon={showArrow && !isSubmitting ? <ArrowRight size={16} /> : null}
        size="lg"
        className={`next-button ${
          isIconOnlyOnMobile ? 'next-button--icon-only-mobile' : ''
        }`}
        title={disabledHint || undefined}
        aria-label={isIconOnlyOnMobile ? t('common.next') : undefined}
        aria-describedby={
          isDisabled && disabledHint ? 'next-button-hint' : undefined
        }
      >
        <span className="booking-wizard__nav-label booking-wizard__nav-label--desktop">
          {buttonLabel}
        </span>
        {isConfirmStep && !isSubmitting && (
          <span className="booking-wizard__nav-label booking-wizard__nav-label--mobile">
            {t('common.confirm')}
          </span>
        )}
        {isConfirmStep && isSubmitting && (
          <span className="booking-wizard__nav-label booking-wizard__nav-label--mobile">
            {t('common.loading')}
          </span>
        )}
      </Button>
    </div>
  );
}
