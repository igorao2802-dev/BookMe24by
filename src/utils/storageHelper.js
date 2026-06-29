/**
 * storageHelper.js — безопасная обёртка над localStorage
 *
 * ПОЧЕМУ обёртка, а не прямой localStorage.getItem?
 * - try/catch защищает от битого JSON (не ломает приложение)
 * - Обработка QuotaExceededError (переполнение ~5MB)
 * - Защита от приватного режима Safari
 * - Централизованное логирование ошибок
 */

import { STORAGE_KEYS, STORAGE_SCHEMA_VERSION } from "./constants";
/**
 * Безопасное чтение из localStorage
 * @param {string} key
 * @param {*} fallback - значение по умолчанию
 * @returns {*} распарсенное значение или fallback
 */
export function safeGetItem(key, fallback = null) {
  // ПОЧЕМУ проверка window? SSR-совместимость (на будущее)
  if (typeof window === "undefined" || !window.localStorage) {
    return fallback;
  }

  try {
    const raw = localStorage.getItem(key);

    // ПОЧЕМУ проверяем null отдельно? "null" vs отсутствие ключа
    if (raw === null) {
      return fallback;
    }

    // JSON.parse может вернуть null, если в хранилище строка "null"
    const parsed = JSON.parse(raw);

    // 🔥 ИСПРАВЛЕНО: Number.isNaN вместо self-compare (parsed !== parsed)
    // ESLint ругался на no-self-compare
    if (Number.isNaN(parsed)) {
      console.warn(`[storageHelper] NaN при чтении "${key}", возврат fallback`);
      return fallback;
    }

    return parsed;
  } catch (error) {
    // ПОЧЕМУ console.error, а не throw? Не хотим ронять всё приложение
    // из-за одного битого ключа в localStorage
    console.error(`[storageHelper] Ошибка чтения ключа "${key}":`, error);
    return fallback;
  }
}

/**
 * Безопасная запись в localStorage
 * @param {string} key
 * @param {*} value - любое значение, будет сериализовано в JSON
 * @returns {boolean} true если запись успешна
 */
export function safeSetItem(key, value) {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    // === ОСОБАЯ ОБРАБОТКА QuotaExceededError ===
    if (
      error.name === "QuotaExceededError" ||
      error.code === 22 ||
      error.code === 1014
    ) {
      console.error(
        `[storageHelper] Переполнение localStorage при записи "${key}".` +
          `Рекомендуем очистить старые данные.`,
      );
    } else {
      console.error(`[storageHelper] Ошибка записи ключа "${key}":`, error);
    }
    return false;
  }
}

/**
 * Безопасное удаление ключа
 */
export function safeRemoveItem(key) {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`[storageHelper] Ошибка удаления ключа "${key}":`, error);
    return false;
  }
}

/**
 * Инициализация хранилища начальными данными (если пусто)
 * @param {string} key
 * @param {*} initialData
 * @returns {*} текущее значение в хранилище (или initialData)
 */
export function initializeStorage(key, initialData) {
  const existing = safeGetItem(key, null);

  if (existing === null) {
    safeSetItem(key, initialData);
    return initialData;
  }

  return existing;
}

/**
 * Функция-инициализатор для useState (выполняется 1 раз)
 */
export function createStateInitializer(key, fallback) {
  return safeGetItem(key, fallback);
}

/**
 * Миграция схемы localStorage при холодном старте приложения.
 *
 * ПОЧЕМУ версия в отдельном ключе?
 * При изменении структуры данных (переименование ключей, формат массивов)
 * можно пошагово обновлять storage без потери данных пользователя.
 *
 * @param {number} [targetVersion=STORAGE_SCHEMA_VERSION]
 * @returns {{ migrated: boolean, fromVersion: number|null, toVersion: number }}
 */
export function migrateStorage(targetVersion = STORAGE_SCHEMA_VERSION) {
  if (typeof window === "undefined" || !window.localStorage) {
    return {
      migrated: false,
      fromVersion: null,
      toVersion: targetVersion,
    };
  }

  try {
    const storedVersion = safeGetItem(STORAGE_KEYS.SCHEMA_VERSION, null);

    if (storedVersion === null) {
      safeSetItem(STORAGE_KEYS.SCHEMA_VERSION, targetVersion);
      return {
        migrated: true,
        fromVersion: null,
        toVersion: targetVersion,
      };
    }

    const fromVersion = Number(storedVersion);

    if (fromVersion === targetVersion) {
      return {
        migrated: false,
        fromVersion,
        toVersion: targetVersion,
      };
    }

    // Здесь будут пошаговые миграции при росте STORAGE_SCHEMA_VERSION:
    // if (fromVersion < 2) { ... rename keys, normalize arrays ... }

    safeSetItem(STORAGE_KEYS.SCHEMA_VERSION, targetVersion);
    return {
      migrated: true,
      fromVersion,
      toVersion: targetVersion,
    };
  } catch (error) {
    console.error("[storageHelper] Ошибка migrateStorage:", error);
    return {
      migrated: false,
      fromVersion: null,
      toVersion: targetVersion,
    };
  }
}
