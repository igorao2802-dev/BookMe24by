/**
 * searchInputHelpers.js — единая обработка поисковых полей
 *
 * ПОЧЕМУ отдельный хелпер?
 * Поиск есть в BookingWizard, каталоге и админке — лимит и санитизация
 * должны совпадать, иначе в одном месте 100 символов, в другом — бесконечно.
 */

import { VALIDATION_LIMITS } from "../constants/validationLimits";
import { sanitizeSearchQuery } from "./sanitizers";
import { validateSearchQuery } from "./validators";

export const SEARCH_INPUT_MAX = VALIDATION_LIMITS.SEARCH_QUERY.maxLength;

/**
 * Нормализует ввод поиска: XSS-символы, управляющие символы, обрезка по лимиту
 * @param {string} rawValue
 * @returns {{ value: string, errorKey: string|null }}
 */
export function processSearchInput(rawValue) {
  const sanitized = sanitizeSearchQuery(rawValue);
  const limited = sanitized.slice(0, SEARCH_INPUT_MAX);
  const validation = validateSearchQuery(limited);

  return {
    value: limited,
    errorKey: validation.valid ? null : validation.errorKey,
  };
}
