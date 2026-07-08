/**
 * stepValidation.js — чистые функции валидации шага и сброса полей
 *
 * ПОЧЕМУ без notify?
 * Хук решает, показывать ли ошибку; здесь только бизнес-правила шага.
 */

import { BOOKING_STEPS } from "../../utils/constants";

/**
 * Первая ошибка контактной формы с параметрами i18n (для подсказки у кнопки).
 */
export function getFirstContactsValidationError(contactsFormValidation) {
  const fieldOrder = ["clientName", "clientPhone", "clientEmail", "comment"];

  for (const field of fieldOrder) {
    const errorKey = contactsFormValidation?.errors?.[field];
    if (errorKey) {
      return {
        key: errorKey,
        params: contactsFormValidation?.errorParams?.[field] || null,
      };
    }
  }

  return null;
}

/**
 * @returns {string|null} i18n-key первой ошибки или null если шаг валиден
 */
export function getStepValidationErrorKey(
  currentStep,
  draft,
  contactsFormValidation,
) {
  switch (currentStep) {
    case BOOKING_STEPS.SERVICE:
      return draft.serviceId ? null : "booking.validation.selectService";

    case BOOKING_STEPS.SPECIALIST:
      return draft.specialistId ? null : "booking.validation.selectSpecialist";

    case BOOKING_STEPS.DATETIME:
      return draft.date && draft.startTime
        ? null
        : "booking.validation.selectDateTime";

    case BOOKING_STEPS.CONTACTS: {
      if (contactsFormValidation.isValid) return null;
      return Object.values(contactsFormValidation.errors)[0] || null;
    }

    case BOOKING_STEPS.CONFIRM: {
      if (!contactsFormValidation.isValid) {
        return Object.values(contactsFormValidation.errors)[0] || null;
      }
      if (!draft.serviceId) return "booking.validation.selectService";
      if (!draft.specialistId) return "booking.validation.selectSpecialist";
      if (!draft.date || !draft.startTime) {
        return "booking.validation.selectDateTime";
      }
      return null;
    }

    default:
      return null;
  }
}

/**
 * ПОЧЕМУ отдельная функция, а не инверсия в JSX?
 * Единая точка для disabled-состояния NextButton и тестов без дублирования логики.
 */
export function isCurrentStepValid(currentStep, draft, contactsFormValidation) {
  return getStepValidationErrorKey(currentStep, draft, contactsFormValidation) === null;
}

/**
 * i18n-key подписи кнопки перехода по шагу визарда.
 */
export function getNextButtonLabelKey(currentStep) {
  switch (currentStep) {
    case BOOKING_STEPS.CONFIRM:
      return "booking.buttons.confirm";
    case BOOKING_STEPS.SERVICE:
    case BOOKING_STEPS.SPECIALIST:
    case BOOKING_STEPS.DATETIME:
    case BOOKING_STEPS.CONTACTS:
    default:
      return "booking.buttons.next";
  }
}

/**
 * @returns {Object|null} partial draft для сброса при goBack
 */
export function getClearStepUpdates(step) {
  switch (step) {
    case BOOKING_STEPS.DATETIME:
      return { date: null, startTime: null };
    case BOOKING_STEPS.SPECIALIST:
      return { specialistId: null, date: null, startTime: null };
    case BOOKING_STEPS.SERVICE:
      return {
        serviceId: null,
        specialistId: null,
        date: null,
        startTime: null,
      };
    case BOOKING_STEPS.CONTACTS:
      return {
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        comment: "",
      };
    default:
      return null;
  }
}
