/**
 * phoneInputHelpers.js — маска телефона РБ с сохранением позиции курсора
 *
 * ПОЧЕМУ отдельный модуль?
 * При каждом onChange маска пересобирает строку — без расчёта caret
 * курсор прыгает в конец и нельзя отредактировать код оператора.
 */

/**
 * Нормализует ввод до 12 цифр с префиксом 375
 * @param {string} raw
 * @returns {string}
 */
export function normalizeByPhoneDigits(raw) {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";

  if (!digits.startsWith("375")) {
    if (digits.startsWith("80")) {
      digits = "375" + digits.slice(2);
    } else if (digits.startsWith("8")) {
      digits = "375" + digits.slice(1);
    } else if (!digits.startsWith("3")) {
      digits = "375" + digits;
    }
  }

  return digits.slice(0, 12);
}

/**
 * Форматирует частичный набор цифр: +375 (29) 123-45-67
 * @param {string} digits
 * @returns {string}
 */
export function formatPartialByPhone(digits) {
  if (!digits) return "";

  let formatted = `+${digits.slice(0, Math.min(3, digits.length))}`;

  if (digits.length > 3) {
    formatted += ` (${digits.slice(3, Math.min(5, digits.length))}`;
  }
  if (digits.length > 5) {
    formatted += `) ${digits.slice(5, Math.min(8, digits.length))}`;
  }
  if (digits.length > 8) {
    formatted += `-${digits.slice(8, Math.min(10, digits.length))}`;
  }
  if (digits.length > 10) {
    formatted += `-${digits.slice(10, Math.min(12, digits.length))}`;
  }

  return formatted;
}

/**
 * Сколько цифр находится левее caret в отформатированной строке
 * @param {string} formatted
 * @param {number} cursor
 * @returns {number}
 */
export function getDigitIndexFromCursor(formatted, cursor) {
  if (!formatted || cursor <= 0) return 0;

  let digitIndex = 0;
  const limit = Math.min(cursor, formatted.length);

  for (let i = 0; i < limit; i += 1) {
    if (/\d/.test(formatted[i])) {
      digitIndex += 1;
    }
  }

  return digitIndex;
}

/**
 * Позиция caret после N-й цифры в отформатированной строке
 * @param {string} formatted
 * @param {number} digitIndex
 * @returns {number}
 */
export function getCursorFromDigitIndex(formatted, digitIndex) {
  if (!formatted) return 0;
  if (digitIndex <= 0) return 1;

  let count = 0;
  for (let i = 0; i < formatted.length; i += 1) {
    if (/\d/.test(formatted[i])) {
      count += 1;
      if (count >= digitIndex) {
        return i + 1;
      }
    }
  }

  return formatted.length;
}

/**
 * Обрабатывает ввод телефона и возвращает формат + позицию курсора
 * @param {string} rawValue - текущее значение input после действия пользователя
 * @param {number} cursorPos - selectionStart из события
 * @returns {{ formatted: string, cursorPos: number }}
 */
export function processPhoneInput(rawValue, cursorPos = rawValue.length) {
  const digitsOnly = rawValue.replace(/\D/g, "");
  if (!digitsOnly) {
    return { formatted: "", cursorPos: 0 };
  }

  const digitIndex = getDigitIndexFromCursor(rawValue, cursorPos);
  const digits = normalizeByPhoneDigits(rawValue);
  const formatted = formatPartialByPhone(digits);
  const newCursorPos = getCursorFromDigitIndex(formatted, digitIndex);

  return { formatted, cursorPos: newCursorPos };
}
