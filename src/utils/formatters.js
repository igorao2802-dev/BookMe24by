/**
 * formatters.js — утилиты форматирования данных для отображения в UI
 *
 * ПОЧЕМУ единый модуль форматирования?
 * Цены, телефоны и даты отображаются одинаково во всём приложении.
 *
 * ПОЧЕМУ currencyDisplay: "code"?
 * Intl.NumberFormat по умолчанию может показать «Br» вместо кода «BYN».
 */

/**
 * Форматирует цену в BYN
 * Пример: 45 → "45,00 BYN", 120.5 → "120,50 BYN"
 *
 * ПОЧЕМУ Intl.NumberFormat?
 * - Автоматически учитывает локаль (запятая вместо точки)
 * - currencyDisplay: "code" гарантирует «BYN», а не символ «Br»
 */
export function formatPrice(price) {
  if (price === null || price === undefined || isNaN(price)) {
    return "— BYN";
  }
  try {
    return new Intl.NumberFormat("ru-BY", {
      style: "currency",
      currency: "BYN",
      currencyDisplay: "code",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  } catch (error) {
    console.error("[formatters] formatPrice error:", error);
    return `${Number(price).toFixed(2)} BYN`;
  }
}

/**
 * Оставляет только цифры телефона (для сравнения и фильтрации).
 *
 * @param {string} phone
 * @returns {string}
 */
export function normalizePhone(phone) {
  if (!phone || typeof phone !== "string") return "";
  return phone.replace(/\D/g, "");
}

/**
 * Форматирует телефон РБ: "+375291234567" → "+375 (29) 123-45-67"
 */
export function formatPhone(phone) {
  if (!phone || typeof phone !== "string") return "";
  const cleaned = normalizePhone(phone);
  if (cleaned.length !== 12) return phone;
  return `+${cleaned.slice(0, 3)} (${cleaned.slice(3, 5)}) ${cleaned.slice(5, 8)}-${cleaned.slice(8, 10)}-${cleaned.slice(10, 12)}`;
}

/**
 * Форматирует дату в коротком виде: "15.06.2026"
 */
export function formatDateShort(dateString) {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (error) {
    console.error("[formatters] formatDateShort error:", error);
    return "";
  }
}

/**
 * Форматирует длительность: 60 → "1 ч", 90 → "1 ч 30 мин", 30 → "30 мин"
 *
 * ПОЧЕМУ опциональный t()?
 * Единицы времени («ч», «мин») локализуются через i18n при наличии функции перевода.
 *
 * @param {number} minutes - длительность в минутах
 * @param {Function} [t] - функция локализации из useLanguage()
 * @returns {string} отформатированная строка
 */
export function formatDuration(minutes, t) {
  if (!minutes || minutes <= 0) return "";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const parts = [];

  // Локализуемые единицы с fallback на русский
  const hourLabel = t ? t("time.hourShort") : "ч";
  const minuteLabel = t ? t("time.minuteShort") : "мин";

  if (hours > 0) parts.push(`${hours} ${hourLabel}`);
  if (mins > 0) parts.push(`${mins} ${minuteLabel}`);
  return parts.join(" ");
}

/**
 * Маскирует телефон для UI (для не-админов): "+375 (29) ***-**-67"
 * ПОЧЕМУ? Конфиденциальность данных клиента
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== "string") return "";
  const cleaned = normalizePhone(phone);
  if (cleaned.length !== 12) return phone;
  return `+${cleaned.slice(0, 3)} (${cleaned.slice(3, 5)}) ***-**-${cleaned.slice(10, 12)}`;
}

/**
 * Форматирует относительное время: "сегодня", "вчера", "2 дня назад"
 * ПОЧЕМУ? Улучшает UX в списке записей клиента
 */
export function formatRelativeDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.floor((target - today) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "сегодня";
  if (diffDays === 1) return "завтра";
  if (diffDays === -1) return "вчера";
  if (diffDays > 1 && diffDays <= 7) return `через ${diffDays} дн.`;
  if (diffDays < -1 && diffDays >= -7) return `${Math.abs(diffDays)} дн. назад`;
  return formatDateShort(dateString);
}
