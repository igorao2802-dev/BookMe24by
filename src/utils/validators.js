/**
 * validators.js — валидация полей форм записи и админки
 *
 * ПОЧЕМУ отдельный модуль?
 * Единые правила для BookingForm, SettingsForm и CRUD-форм админки.
 */

import { BY_PHONE_CODES, FIELD_LIMITS, PRICE_LIMITS } from "./constants.js";

/**
 * Валидация цены услуги
 *
 * @param {number|string} price - цена
 * @param {Object} options - дополнительные опции
 * @param {boolean} options.required - обязательно ли поле (по умолчанию true)
 * @param {number} options.max - максимальная цена (по умолчанию PRICE_LIMITS.MAX)
 * @returns {{isValid: boolean, errorKey: string|null}}
 */
export function validatePrice(price, options = {}) {
  const { required = true, max = PRICE_LIMITS.MAX } = options;

  if (price === undefined || price === null || price === "") {
    return required
      ? { isValid: false, errorKey: "validation.service.priceRequired" }
      : { isValid: true, errorKey: null };
  }

  const num = Number(price);

  if (isNaN(num)) {
    return { isValid: false, errorKey: "validation.service.priceInvalid" };
  }

  if (!Number.isInteger(num)) {
    return { isValid: false, errorKey: "validation.service.priceNotInteger" };
  }

  if (num < PRICE_LIMITS.MIN) {
    return { isValid: false, errorKey: "validation.service.priceTooLow" };
  }

  if (num > max) {
    return { isValid: false, errorKey: "validation.service.priceTooHigh" };
  }

  return { isValid: true, errorKey: null };
}

// ПОЧЕМУ строгий regex: RFC-подобная проверка локальной части и TLD ≥ 2 символов
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// ПОЧЕМУ отдельная проверка символов: кириллица и пробелы недопустимы в email
const INVALID_EMAIL_CHARS_REGEX = /[^a-zA-Z0-9._%+-@]/;

/**
 * Валидация телефона Республики Беларусь
 *
 * @param {string} phone - номер телефона
 * @param {Object} [options]
 * @param {boolean} [options.required=false] - обязательно ли поле (true для формы записи)
 */
export function validatePhone(phone, options = {}) {
  const { required = false } = options;

  if (!phone || typeof phone !== "string" || phone.trim() === "") {
    // ПОЧЕМУ required отдельным параметром?
    // В настройках профиля телефон может быть пустым, в форме записи — обязателен.
    return required
      ? { isValid: false, errorKey: "validation.phone.required" }
      : { isValid: true, errorKey: null };
  }

  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 0) {
    return required
      ? { isValid: false, errorKey: "validation.phone.required" }
      : { isValid: true, errorKey: null };
  }
  if (cleaned.length !== 12) {
    return { isValid: false, errorKey: "validation.phone.tooShort" };
  }
  if (!cleaned.startsWith("375")) {
    return { isValid: false, errorKey: "validation.phone.invalidPrefix" };
  }
  const operatorCode = cleaned.slice(3, 5);
  if (!BY_PHONE_CODES.includes(operatorCode)) {
    return { isValid: false, errorKey: "validation.phone.invalidCode" };
  }
  return { isValid: true, errorKey: null };
}

/**
 * Валидация имени клиента
 *
 * @param {string} name - имя для проверки
 * @returns {{isValid: boolean, errorKey: string|null}}
 */
export function validateName(name) {
  if (!name || typeof name !== "string") {
    return { isValid: false, errorKey: "validation.name.required" };
  }
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { isValid: false, errorKey: "validation.name.required" };
  }
  if (trimmed.length > FIELD_LIMITS.NAME_MAX_LENGTH) {
    return { isValid: false, errorKey: "validation.name.tooLong" };
  }
  const nameRegex = /^[a-zA-Zа-яА-ЯёЁіІўЎ\s-']+$/;
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, errorKey: "validation.name.invalidChars" };
  }
  return { isValid: true, errorKey: null };
}

/**
 * Валидация email (поле необязательное — пустое значение валидно)
 *
 * @param {string} email - email для проверки
 * @returns {{isValid: boolean, errorKey: string|null}}
 */
export function validateEmail(email) {
  if (!email || typeof email !== "string" || email.trim() === "") {
    return { isValid: true, errorKey: null };
  }

  const trimmed = email.trim();

  if (trimmed.length > FIELD_LIMITS.EMAIL_MAX_LENGTH) {
    return { isValid: false, errorKey: "validation.email.tooLong" };
  }

  if (INVALID_EMAIL_CHARS_REGEX.test(trimmed)) {
    return { isValid: false, errorKey: "validation.email.invalidChars" };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, errorKey: "validation.email.invalid" };
  }

  return { isValid: true, errorKey: null };
}

/**
 * Валидация комментария к записи
 */
export function validateComment(comment) {
  if (!comment) {
    return { isValid: true, errorKey: null };
  }
  if (comment.length > FIELD_LIMITS.COMMENT_MAX_LENGTH) {
    return { isValid: false, errorKey: "validation.comment.tooLong" };
  }
  const htmlTagRegex = /<[^>]*>/;
  if (htmlTagRegex.test(comment)) {
    return { isValid: false, errorKey: "validation.comment.htmlNotAllowed" };
  }
  return { isValid: true, errorKey: null };
}

/**
 * Валидация даты записи
 */
export function validateBookingDate(dateString) {
  if (!dateString) {
    return { isValid: false, errorKey: "validation.date.notSelected" };
  }
  const selectedDate = new Date(dateString);
  if (isNaN(selectedDate.getTime())) {
    return { isValid: false, errorKey: "validation.date.invalidFormat" };
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDay = new Date(
    selectedDate.getFullYear(),
    selectedDate.getMonth(),
    selectedDate.getDate(),
  );
  if (selectedDay < today) {
    return { isValid: false, errorKey: "validation.date.inPast" };
  }
  const maxDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 30);
  if (selectedDay > maxDate) {
    return { isValid: false, errorKey: "validation.date.tooFarAhead" };
  }
  return { isValid: true, errorKey: null };
}

/**
 * Универсальная валидация всей формы контактов (шаг 4)
 */
export function validateBookingForm(formData) {
  const errors = {};
  const nameResult = validateName(formData.clientName);
  if (!nameResult.isValid) errors.clientName = nameResult.errorKey;
  const phoneResult = validatePhone(formData.clientPhone, { required: true });
  if (!phoneResult.isValid) errors.clientPhone = phoneResult.errorKey;
  const emailResult = validateEmail(formData.clientEmail);
  if (!emailResult.isValid) errors.clientEmail = emailResult.errorKey;
  const commentResult = validateComment(formData.comment);
  if (!commentResult.isValid) errors.comment = commentResult.errorKey;
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
