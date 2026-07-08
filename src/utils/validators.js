/**
 * validators.js — универсальный набор валидаторов форм
 *
 * ПОЧЕМУ единый формат результата?
 * Компоненты используют isValid/errorKey (i18n), тесты и новый код — valid/error/sanitized.
 */

import { BY_PHONE_CODES } from "./constants.js";
import { VALIDATION_LIMITS } from "../constants/validationLimits.js";
import {
  hasXSSPattern,
  sanitizeString,
  sanitizeInput,
} from "./sanitizers.js";
import { parseValidNumber, isReasonableNumber } from "./numberHelpers.js";
import {
  VALIDATION_MESSAGE_KEYS,
  getEmailFormatErrorKey,
} from "./validationMessages.js";

/**
 * Унифицированный результат валидации
 * @param {boolean} isValid
 * @param {string|null} errorKey - ключ i18n
 * @param {string} [sanitized]
 */
function validationResult(
  isValid,
  errorKey = null,
  sanitized = undefined,
  errorParams = null,
) {
  const result = {
    isValid,
    errorKey,
    valid: isValid,
    error: errorKey,
  };
  if (sanitized !== undefined) {
    result.sanitized = sanitized;
  }
  if (errorParams) {
    result.errorParams = errorParams;
  }
  return result;
}

/**
 * Проверка обязательного поля
 * @param {unknown} value
 * @param {Object} [options]
 * @param {boolean} [options.required=true]
 * @param {string} [options.fieldName='field']
 */
export function validateRequired(value, options = {}) {
  const { required = true, fieldName = "field" } = options;

  if (!required) {
    return validationResult(true, null, typeof value === "string" ? value : "");
  }

  if (value === null || value === undefined) {
    return validationResult(false, "validation.required");
  }

  if (typeof value === "string" && value.trim() === "") {
    return validationResult(false, "validation.required");
  }

  // 0 и false — валидные значения для числовых/булевых полей
  if (value === 0 || value === false) {
    return validationResult(true, null, value);
  }

  return validationResult(true, null, value);
}

/**
 * Валидация цены услуги
 */
export function validatePrice(price, options = {}) {
  const {
    required = true,
    min = VALIDATION_LIMITS.PRICE.min,
    max = VALIDATION_LIMITS.PRICE.max,
    allowZero = true,
    integerOnly = true,
    maxDecimals = VALIDATION_LIMITS.PRICE.maxDecimals,
  } = options;

  if (price === undefined || price === null || price === "") {
    return required
      ? validationResult(false, "validation.service.priceRequired")
      : validationResult(true, null);
  }

  if (hasXSSPattern(String(price))) {
    return validationResult(false, "validation.xssDetected");
  }

  const num = parseValidNumber(price);
  if (num === null) {
    return validationResult(false, "validation.service.priceInvalid");
  }

  if (!allowZero && num === 0) {
    return validationResult(false, "validation.service.priceTooLow");
  }

  if (integerOnly && !Number.isInteger(num)) {
    return validationResult(false, "validation.service.priceNotInteger");
  }

  if (
    !isReasonableNumber(price, {
      min,
      max,
      integerOnly,
      maxDecimals,
      allowZero,
    })
  ) {
    if (num < min || (!allowZero && num <= 0)) {
      return validationResult(false, "validation.service.priceTooLow");
    }
    return validationResult(false, "validation.service.priceTooHigh");
  }

  return validationResult(true, null, num);
}

// RFC 5322: локальная часть + домен с минимум одной точкой (test@mail — невалидно)
const EMAIL_RFC5322_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
const NAME_REGEX = /^[a-zA-Zа-яА-ЯёЁіІўЎ\s\-']+$/;
const PHONE_ALLOWED_CHARS = /^[\d+\s()\-]*$/;

/**
 * Валидация телефона Республики Беларусь
 */
export function validatePhone(phone, options = {}) {
  const { required = false } = options;

  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    return required
      ? validationResult(false, VALIDATION_MESSAGE_KEYS.phone.required)
      : validationResult(true, null, "");
  }

  if (hasXSSPattern(phone) || !PHONE_ALLOWED_CHARS.test(phone)) {
    return validationResult(false, "validation.xssDetected");
  }

  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 0) {
    return required
      ? validationResult(false, VALIDATION_MESSAGE_KEYS.phone.required)
      : validationResult(true, null, "");
  }
  if (cleaned.length !== 12) {
    return validationResult(false, VALIDATION_MESSAGE_KEYS.phone.tooShort);
  }
  if (!cleaned.startsWith("375")) {
    return validationResult(false, VALIDATION_MESSAGE_KEYS.phone.invalidPrefix);
  }
  const operatorCode = cleaned.slice(3, 5);
  if (!BY_PHONE_CODES.includes(operatorCode)) {
    return validationResult(false, VALIDATION_MESSAGE_KEYS.phone.invalidCode);
  }
  return validationResult(true, null, sanitizeString(phone));
}

/**
 * Валидация имени клиента / ФИО
 */
export function validateName(name, options = {}) {
  const {
    required = true,
    minLength = VALIDATION_LIMITS.CLIENT_NAME.minLength,
    maxLength = VALIDATION_LIMITS.CLIENT_NAME.maxLength,
  } = options;

  if (!name || typeof name !== "string") {
    return required
      ? validationResult(false, VALIDATION_MESSAGE_KEYS.name.required)
      : validationResult(true, null, "");
  }

  const trimmed = name.trim();
  const sanitized = sanitizeString(trimmed);

  if (trimmed.length === 0) {
    return required
      ? validationResult(false, VALIDATION_MESSAGE_KEYS.name.required)
      : validationResult(true, null, "");
  }

  if (hasXSSPattern(trimmed)) {
    return validationResult(false, "validation.xssDetected");
  }

  if (trimmed.length < minLength) {
    return validationResult(
      false,
      VALIDATION_MESSAGE_KEYS.name.tooShort,
      undefined,
      { min: minLength },
    );
  }
  if (trimmed.length > maxLength) {
    return validationResult(false, VALIDATION_MESSAGE_KEYS.name.tooLong);
  }
  if (!NAME_REGEX.test(trimmed)) {
    return validationResult(false, VALIDATION_MESSAGE_KEYS.name.invalidChars);
  }
  return validationResult(true, null, sanitized);
}

/**
 * Валидация email по RFC 5322 (поле необязательное — пустое значение валидно)
 */
export function validateEmail(email, options = {}) {
  const { required = false } = options;

  if (!email || typeof email !== "string" || email.trim() === "") {
    return required
      ? validationResult(false, "validation.email.required")
      : validationResult(true, null, "");
  }

  const trimmed = email.trim();
  const sanitized = sanitizeString(trimmed);

  if (hasXSSPattern(trimmed)) {
    return validationResult(false, "validation.xssDetected");
  }

  if (trimmed.length > VALIDATION_LIMITS.EMAIL.maxLength) {
    return validationResult(false, "validation.email.tooLong");
  }

  if (trimmed.includes("..")) {
    return validationResult(false, VALIDATION_MESSAGE_KEYS.email.consecutiveDots);
  }

  const formatErrorKey = getEmailFormatErrorKey(trimmed);
  if (formatErrorKey) {
    return validationResult(false, formatErrorKey);
  }

  if (!EMAIL_RFC5322_REGEX.test(trimmed)) {
    return validationResult(false, VALIDATION_MESSAGE_KEYS.email.invalid);
  }

  return validationResult(true, null, sanitized);
}

/**
 * Валидация комментария
 */
export function validateComment(comment, options = {}) {
  const {
    required = false,
    maxLength = VALIDATION_LIMITS.COMMENT.maxLength,
  } = options;

  if (!comment || (typeof comment === "string" && comment.trim() === "")) {
    return required
      ? validationResult(false, "validation.required")
      : validationResult(true, null, "");
  }

  if (typeof comment !== "string") {
    return validationResult(false, "validation.comment.htmlNotAllowed");
  }

  if (hasXSSPattern(comment)) {
    return validationResult(false, "validation.xssDetected");
  }

  if (comment.length > maxLength) {
    return validationResult(false, "validation.comment.tooLong");
  }

  const htmlTagRegex = /<[^>]*>/;
  if (htmlTagRegex.test(comment)) {
    return validationResult(false, "validation.comment.htmlNotAllowed");
  }

  return validationResult(true, null, sanitizeString(comment));
}

/**
 * Валидация названия услуги (админка)
 * ПОЧЕМУ отдельно от validateName?
 * Название услуги допускает цифры и скобки, но запрещает HTML/XSS-символы.
 */
export function validateServiceName(name, options = {}) {
  const {
    required = true,
    minLength = VALIDATION_LIMITS.SERVICE_NAME.minLength,
    maxLength = VALIDATION_LIMITS.SERVICE_NAME.maxLength,
  } = options;

  if (!name || typeof name !== "string") {
    return required
      ? validationResult(false, "validation.service.nameRequired")
      : validationResult(true, null, "");
  }

  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return required
      ? validationResult(false, "validation.service.nameRequired")
      : validationResult(true, null, "");
  }

  if (hasXSSPattern(trimmed)) {
    return validationResult(false, "validation.xssDetected");
  }

  if (trimmed.length < minLength) {
    return validationResult(
      false,
      "validation.service.nameTooShort",
      undefined,
      { min: minLength },
    );
  }

  if (trimmed.length > maxLength) {
    return validationResult(false, "validation.service.nameTooLong");
  }

  return validationResult(true, null, sanitizeString(trimmed));
}

/**
 * Валидация описания услуги (админка)
 */
export function validateServiceDescription(description, options = {}) {
  const {
    required = true,
    minLength = VALIDATION_LIMITS.SERVICE_DESCRIPTION.minLength,
    maxLength = VALIDATION_LIMITS.SERVICE_DESCRIPTION.maxLength,
  } = options;

  if (
    !description ||
    (typeof description === "string" && description.trim() === "")
  ) {
    return required
      ? validationResult(false, "validation.service.descriptionRequired")
      : validationResult(true, null, "");
  }

  if (typeof description !== "string") {
    return validationResult(false, "validation.comment.htmlNotAllowed");
  }

  if (hasXSSPattern(description)) {
    return validationResult(false, "validation.xssDetected");
  }

  const trimmed = description.trim();

  if (trimmed.length < minLength) {
    return validationResult(false, "validation.service.descriptionTooShort");
  }

  if (description.length > maxLength) {
    return validationResult(false, "validation.service.descriptionTooLong");
  }

  const htmlTagRegex = /<[^>]*>/;
  if (htmlTagRegex.test(description)) {
    return validationResult(false, "validation.comment.htmlNotAllowed");
  }

  return validationResult(true, null, sanitizeString(trimmed));
}

/**
 * Валидация стажа специалиста (годы)
 */
export function validateExperience(experience, options = {}) {
  const {
    required = true,
    min = VALIDATION_LIMITS.EXPERIENCE.min,
    max = VALIDATION_LIMITS.EXPERIENCE.max,
  } = options;

  if (experience === undefined || experience === null || experience === "") {
    return required
      ? validationResult(false, "validation.specialist.experienceRequired")
      : validationResult(true, null);
  }

  if (hasXSSPattern(String(experience))) {
    return validationResult(false, "validation.xssDetected");
  }

  const num = parseValidNumber(experience);
  if (num === null) {
    return validationResult(false, "validation.specialist.experienceInvalid");
  }

  if (!Number.isInteger(num)) {
    return validationResult(false, "validation.specialist.experienceInvalid");
  }

  if (num < min) {
    return validationResult(false, "validation.specialist.experienceNegative");
  }

  if (num > max) {
    return validationResult(false, "validation.specialist.experienceTooHigh");
  }

  return validationResult(true, null, num);
}

/**
 * Валидация длительности услуги (минуты)
 */
export function validateDuration(duration, options = {}) {
  const {
    required = true,
    min = VALIDATION_LIMITS.DURATION.min,
    max = VALIDATION_LIMITS.DURATION.max,
    step = VALIDATION_LIMITS.DURATION.step,
  } = options;

  if (duration === undefined || duration === null || duration === "") {
    return required
      ? validationResult(false, "validation.service.durationRequired")
      : validationResult(true, null);
  }

  const num = parseValidNumber(duration);
  if (num === null) {
    return validationResult(false, "validation.service.durationInvalid");
  }

  if (!Number.isInteger(num)) {
    return validationResult(false, "validation.service.durationInvalid");
  }

  if (num < min) {
    return validationResult(false, "validation.service.durationTooShort");
  }
  if (num > max) {
    return validationResult(false, "validation.service.durationTooLong");
  }
  if (step > 0 && num % step !== 0) {
    return validationResult(false, "validation.duration.invalidStep");
  }

  return validationResult(true, null, num);
}

/**
 * Валидация даты записи
 */
export function validateDate(dateString, options = {}) {
  const {
    required = true,
    minDate = "today",
    maxDaysAhead = 30,
  } = options;

  if (!dateString) {
    return required
      ? validationResult(false, "validation.date.notSelected")
      : validationResult(true, null);
  }

  const selectedDate = new Date(dateString);
  if (isNaN(selectedDate.getTime())) {
    return validationResult(false, "validation.date.invalidFormat");
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDay = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );

  if (minDate === "today" && selectedDay < today) {
    return validationResult(false, "validation.date.inPast");
  }

  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + maxDaysAhead);
  if (selectedDay > maxDate) {
    return validationResult(false, "validation.date.tooFarAhead");
  }

  return validationResult(true, null, dateString);
}

/** @deprecated Используйте validateDate — алиас для обратной совместимости */
export function validateBookingDate(dateString) {
  return validateDate(dateString, { required: true, maxDaysAhead: 30 });
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Валидация времени HH:MM
 */
export function validateTime(time, options = {}) {
  const {
    required = true,
    step = 15,
    minHour = 9,
    maxHour = 21,
  } = options;

  if (!time || typeof time !== "string" || time.trim() === "") {
    return required
      ? validationResult(false, "validation.time.notSelected")
      : validationResult(true, null, "");
  }

  if (!TIME_REGEX.test(time.trim())) {
    return validationResult(false, "validation.time.invalidFormat");
  }

  const [hours, minutes] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes;

  if (hours < minHour || hours >= maxHour) {
    return validationResult(false, "validation.time.outOfWorkingHours");
  }

  if (step > 0 && minutes % step !== 0) {
    return validationResult(false, "validation.time.invalidStep");
  }

  return validationResult(true, null, time.trim());
}

/**
 * Валидация поискового запроса
 */
export function validateSearchQuery(query, options = {}) {
  const { maxLength = VALIDATION_LIMITS.SEARCH_QUERY.maxLength } = options;

  if (!query || typeof query !== "string" || query.trim() === "") {
    return validationResult(true, null, "");
  }

  if (hasXSSPattern(query)) {
    return validationResult(false, "validation.xssDetected");
  }

  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(query)) {
    return validationResult(false, "validation.search.invalidChars");
  }

  if (query.length > maxLength) {
    return validationResult(false, "validation.search.tooLong");
  }

  return validationResult(true, null, sanitizeString(query));
}

/** Реэкспорт для единой точки входа */
export { sanitizeInput, sanitizeString, hasXSSPattern };

/**
 * Универсальная валидация формы контактов (шаг 4)
 */
export function validateBookingForm(formData) {
  const errors = {};
  const errorParams = {};
  const nameResult = validateName(formData.clientName, { required: true });
  if (!nameResult.isValid) {
    errors.clientName = nameResult.errorKey;
    if (nameResult.errorParams) {
      errorParams.clientName = nameResult.errorParams;
    }
  }
  const phoneResult = validatePhone(formData.clientPhone, { required: true });
  if (!phoneResult.isValid) {
    errors.clientPhone = phoneResult.errorKey;
    if (phoneResult.errorParams) {
      errorParams.clientPhone = phoneResult.errorParams;
    }
  }
  const emailResult = validateEmail(formData.clientEmail);
  if (!emailResult.isValid) {
    errors.clientEmail = emailResult.errorKey;
    if (emailResult.errorParams) {
      errorParams.clientEmail = emailResult.errorParams;
    }
  }
  const commentResult = validateComment(formData.comment);
  if (!commentResult.isValid) {
    errors.comment = commentResult.errorKey;
    if (commentResult.errorParams) {
      errorParams.comment = commentResult.errorParams;
    }
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    errorParams,
  };
}
