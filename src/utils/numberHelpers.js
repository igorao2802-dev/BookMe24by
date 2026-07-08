/**
 * numberHelpers.js — безопасный парсинг и проверка числовых полей
 *
 * ПОЧЕМУ отдельно от validators?
 * number-input в браузере пропускает 'e', несколько точек и leading zeros —
 * парсинг нужен и при вводе, и при submit.
 */

import { VALIDATION_LIMITS } from "../constants/validationLimits";

/**
 * Безопасный парсинг числа из строки
 * @param {unknown} str
 * @returns {number|null} null если невалидно
 */
export function parseValidNumber(str) {
  if (str === null || str === undefined || str === "") return null;
  if (typeof str === "number") {
    if (!Number.isFinite(str)) return null;
    return str;
  }
  if (typeof str !== "string") return null;

  const trimmed = str.trim();
  if (trimmed === "" || trimmed === "-" || trimmed === ".") return null;

  // Блокируем экспоненциальную запись и несколько точек
  if (/[eE]/.test(trimmed) || (trimmed.match(/\./g) || []).length > 1) {
    return null;
  }

  const num = Number(trimmed);
  if (!Number.isFinite(num)) return null;
  return num;
}

/**
 * Ограничивает число диапазоном
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clampNumber(value, min, max) {
  if (!Number.isFinite(value)) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Проверяет число на разумность в заданных лимитах
 * @param {unknown} value
 * @param {Object} limits
 * @param {number} [limits.min]
 * @param {number} [limits.max]
 * @param {boolean} [limits.integerOnly=false]
 * @param {number} [limits.maxDecimals=2]
 * @param {boolean} [limits.allowZero=true]
 * @returns {boolean}
 */
export function isReasonableNumber(value, limits = {}) {
  const {
    min = VALIDATION_LIMITS.PRICE.min,
    max = VALIDATION_LIMITS.PRICE.max,
    integerOnly = false,
    maxDecimals = VALIDATION_LIMITS.PRICE.maxDecimals,
    allowZero = true,
  } = limits;

  const num = parseValidNumber(value);
  if (num === null) return false;
  if (!allowZero && num === 0) return false;
  if (num < min || num > max) return false;
  if (integerOnly && !Number.isInteger(num)) return false;
  if (!integerOnly && maxDecimals !== undefined) {
    const decimalPart = String(value).split(".")[1];
    if (decimalPart && decimalPart.length > maxDecimals) return false;
  }
  return true;
}

/**
 * Блокирует недопустимые клавиши в number-input (e, E, +/-, запятая)
 * @param {KeyboardEvent} e
 */
export function blockInvalidNumberKeys(e) {
  if (["e", "E", "+", "-", ",", "."].includes(e.key)) {
    e.preventDefault();
  }
}
