/**
 * validationMessages.js — семантические ключи i18n для ошибок валидации
 *
 * ПОЧЕМУ отдельный словарь?
 * Валидаторы возвращают конкретную причину; тексты и параметры — в ru.json/en.json.
 */

export const VALIDATION_MESSAGE_KEYS = {
  email: {
    required: "validation.email.required",
    tooLong: "validation.email.tooLong",
    noAt: "validation.email.noAt",
    emptyLocal: "validation.email.emptyLocal",
    startsWithDash: "validation.email.startsWithDash",
    startsWithDot: "validation.email.startsWithDot",
    endsWithInvalid: "validation.email.endsWithInvalid",
    consecutiveDots: "validation.email.consecutiveDots",
    noDomain: "validation.email.noDomain",
    noDomainDot: "validation.email.noDomainDot",
    shortTld: "validation.email.shortTld",
    invalidDomain: "validation.email.invalidDomain",
    invalid: "validation.email.invalid",
  },
  phone: {
    required: "validation.phone.required",
    tooShort: "validation.phone.tooShort",
    invalidPrefix: "validation.phone.invalidPrefix",
    invalidCode: "validation.phone.invalidCode",
  },
  name: {
    required: "validation.name.required",
    tooShort: "validation.name.tooShort",
    tooLong: "validation.name.tooLong",
    invalidChars: "validation.name.invalidChars",
  },
};

/**
 * Определяет конкретную причину невалидного email до общего fallback.
 * @param {string} email — уже trim()-нутое значение
 * @returns {string|null} i18n-key или null если формат ок для детальной проверки
 */
export function getEmailFormatErrorKey(email) {
  if (!email.includes("@")) {
    return VALIDATION_MESSAGE_KEYS.email.noAt;
  }

  const atIndex = email.indexOf("@");
  const localPart = email.slice(0, atIndex);
  const domainPart = email.slice(atIndex + 1);

  if (localPart.length === 0) {
    return VALIDATION_MESSAGE_KEYS.email.emptyLocal;
  }

  if (localPart.startsWith("-")) {
    return VALIDATION_MESSAGE_KEYS.email.startsWithDash;
  }

  if (localPart.startsWith(".")) {
    return VALIDATION_MESSAGE_KEYS.email.startsWithDot;
  }

  if (localPart.endsWith("-") || localPart.endsWith(".")) {
    return VALIDATION_MESSAGE_KEYS.email.endsWithInvalid;
  }

  if (email.includes("..")) {
    return VALIDATION_MESSAGE_KEYS.email.consecutiveDots;
  }

  if (domainPart.length === 0) {
    return VALIDATION_MESSAGE_KEYS.email.noDomain;
  }

  if (!domainPart.includes(".")) {
    return VALIDATION_MESSAGE_KEYS.email.noDomainDot;
  }

  const tld = domainPart.split(".").pop() || "";

  if (tld.length === 1) {
    return VALIDATION_MESSAGE_KEYS.email.shortTld;
  }

  if (!/^[a-zA-Z]{2,}$/.test(tld)) {
    return VALIDATION_MESSAGE_KEYS.email.invalidDomain;
  }

  return null;
}

/**
 * Перевод ключа ошибки валидации с опциональными параметрами i18n.
 */
export function translateValidationError(t, errorKey, errorParams = null) {
  if (!errorKey) return null;
  return t(errorKey, errorParams || {});
}
