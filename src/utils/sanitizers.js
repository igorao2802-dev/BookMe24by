/**
 * sanitizers.js — защита от XSS и опасных символов
 *
 * ПОЧЕМУ три уровня (ввод → валидация → сохранение)?
 * Блокировка на вводе улучшает UX; валидация ловит обход;
 * очистка перед localStorage — последний рубеж.
 */

import { VALIDATION_LIMITS } from "../constants/validationLimits";

/** Символы, опасные для HTML/JS-инъекций */
const XSS_CHARS_REGEX = /[<>"';&|`$]/g;

/** Паттерны типичных XSS-атак */
const XSS_PATTERNS = [
  /<script\b/i,
  /<\/script>/i,
  /<img\b/i,
  /on\w+\s*=/i,
  /javascript:/i,
  /data:text\/html/i,
  /\{\{.*constructor/i,
];

/**
 * Проверяет строку на XSS-паттерны
 * @param {unknown} str
 * @returns {boolean}
 */
export function hasXSSPattern(str) {
  if (str === null || str === undefined) return false;
  if (typeof str !== "string") return false;
  const hasDangerousChar = XSS_CHARS_REGEX.test(str);
  XSS_CHARS_REGEX.lastIndex = 0;
  if (hasDangerousChar) return true;
  return XSS_PATTERNS.some((pattern) => pattern.test(str));
}

/**
 * Очищает строку от опасных символов
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeString(value) {
  if (value === null || value === undefined) return "";
  if (typeof value !== "string") return String(value);
  return value.replace(XSS_CHARS_REGEX, "");
}

/**
 * Универсальная очистка ввода (алиас для форм)
 * @param {unknown} value
 * @returns {string}
 */
export function sanitizeInput(value) {
  return sanitizeString(value);
}

/**
 * Рекурсивно очищает строковые поля объекта перед сохранением
 * @param {unknown} obj
 * @returns {unknown}
 */
export function sanitizeObject(obj) {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "string") return sanitizeString(obj);
  if (Array.isArray(obj)) return obj.map((item) => sanitizeObject(item));
  if (typeof obj === "object") {
    const result = {};
    Object.keys(obj).forEach((key) => {
      result[key] = sanitizeObject(obj[key]);
    });
    return result;
  }
  return obj;
}

/** Разрешённые символы в поле ФИО (кириллица, латиница, пробел, дефис, апостроф) */
const NAME_INPUT_FILTER = /[^a-zA-Zа-яА-ЯёЁіІўЎ\s\-']/g;

/**
 * Фильтрует ввод ФИО: только буквы, пробелы, дефис и апостроф
 * @param {string} value
 * @returns {string}
 */
export function sanitizeNameInput(value) {
  if (!value || typeof value !== "string") return "";
  // ПОЧЕМУ не sanitizeString?
  // Апостроф допустим в ФИО (O'Brien), но sanitizeString удаляет кавычки как XSS-символы.
  return value
    .replace(/[<>";&|`$]/g, "")
    .replace(NAME_INPUT_FILTER, "")
    .slice(0, VALIDATION_LIMITS.CLIENT_NAME.maxLength);
}

/**
 * Фильтрует ввод телефона: только +, цифры, скобки, дефисы, пробелы
 * @param {string} value
 * @returns {string}
 */
export function sanitizePhoneInput(value) {
  if (!value || typeof value !== "string") return "";
  return value.replace(/[^\d+\s()\-]/g, "");
}

/**
 * Фильтрует числовой ввод: цифры, одна точка, опциональный минус
 * @param {string} value
 * @param {Object} [options]
 * @param {boolean} [options.allowNegative=false]
 * @param {boolean} [options.integerOnly=false]
 * @returns {string}
 */
export function sanitizeNumberInput(value, options = {}) {
  const { allowNegative = false, integerOnly = false } = options;
  if (!value || typeof value !== "string") return "";
  let cleaned = value.replace(integerOnly ? /[^\d-]/g : /[^\d.\-]/g, "");
  if (!allowNegative) cleaned = cleaned.replace(/-/g, "");
  if (!integerOnly) {
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = `${parts[0]}.${parts.slice(1).join("")}`;
    }
  }
  return cleaned;
}

/**
 * Удаляет управляющие символы из поискового запроса
 * @param {string} value
 * @returns {string}
 */
export function sanitizeSearchQuery(value) {
  if (!value || typeof value !== "string") return "";
  // eslint-disable-next-line no-control-regex
  return value
    .replace(/[\x00-\x1F\x7F]/g, "")
    .slice(0, VALIDATION_LIMITS.SEARCH_QUERY.maxLength);
}
