/**
 * validationLimits.js — единые лимиты полей ввода
 *
 * ПОЧЕМУ отдельный файл?
 * Одна точка правды для maxLength в JSX, валидаторов и i18n-сообщений.
 */

export const VALIDATION_LIMITS = {
  CLIENT_NAME: { maxLength: 100, minLength: 2 },
  SPECIALIST_NAME: { maxLength: 100, minLength: 2 },
  SERVICE_NAME: { maxLength: 150, minLength: 3 },
  SERVICE_DESCRIPTION: { maxLength: 500, minLength: 10 },
  COMMENT: { maxLength: 500, minLength: 0 },
  PHONE: { maxLength: 20, minDigits: 12, maxDigits: 12 },
  EMAIL: { maxLength: 254, minLength: 5 },
  PRICE: { min: 0, max: 999999, maxDecimals: 2 },
  DURATION: { min: 5, max: 480, serviceMin: 15, step: 15 },
  SEARCH_QUERY: { maxLength: 100 },
  SALON_ADDRESS: { maxLength: 200, minLength: 5 },
  SPECIALIST_POSITION: { maxLength: 200, minLength: 3 },
  EXPERIENCE: { min: 0, max: 50 },
};

/** Обратная совместимость с constants.js */
export const FIELD_LIMITS = {
  NAME_MAX_LENGTH: VALIDATION_LIMITS.CLIENT_NAME.maxLength,
  EMAIL_MAX_LENGTH: VALIDATION_LIMITS.EMAIL.maxLength,
  COMMENT_MAX_LENGTH: VALIDATION_LIMITS.COMMENT.maxLength,
  PHONE_LENGTH: VALIDATION_LIMITS.PHONE.maxDigits,
  SERVICE_NAME_MAX_LENGTH: VALIDATION_LIMITS.SERVICE_NAME.maxLength,
  SERVICE_DESCRIPTION_MAX_LENGTH: VALIDATION_LIMITS.SERVICE_DESCRIPTION.maxLength,
};

export const PRICE_LIMITS = {
  MIN: VALIDATION_LIMITS.PRICE.min,
  MAX: 10000,
  ABSOLUTE_MAX: VALIDATION_LIMITS.PRICE.max,
  STEP: 1,
};
