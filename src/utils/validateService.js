/**
 * validateService.js — валидация данных услуги (админка)
 *
 * ПОЧЕМУ отдельный модуль, а не inline в useServices?
 * - Чистая функция без React — легко тестировать изолированно
 * - useServices остаётся тонким CRUD-слоем
 * - Единые правила для ServiceForm и CRUD-хука
 */

import { SERVICE_CATEGORIES } from "./constants";
import { VALIDATION_LIMITS, PRICE_LIMITS } from "../constants/validationLimits";
import {
  validateServiceName,
  validateServiceDescription,
  validatePrice,
  validateDuration,
} from "./validators";
import { hasXSSPattern, sanitizeString } from "./sanitizers";

/**
 * Валидация одного поля формы услуги (onBlur / onChange после touch).
 * @returns {string|null} i18n-key ошибки
 */
export function validateServiceField(
  name,
  value,
  existingServices = [],
  currentId = null,
) {
  switch (name) {
    case "name": {
      const result = validateServiceName(value, { required: true });
      if (!result.isValid) return result.errorKey;
      const trimmed = result.sanitized;
      const isDuplicate = existingServices.some(
        (s) =>
          s.id !== currentId &&
          s.name.toLowerCase() === trimmed.toLowerCase(),
      );
      return isDuplicate ? "validation.service.nameDuplicate" : null;
    }
    case "category":
      if (!value || !Object.values(SERVICE_CATEGORIES).includes(value)) {
        return "validation.service.categoryRequired";
      }
      return null;
    case "description": {
      const result = validateServiceDescription(value, { required: true });
      return result.errorKey;
    }
    case "duration": {
      const result = validateDuration(value, {
        required: true,
        min: VALIDATION_LIMITS.DURATION.serviceMin,
        max: VALIDATION_LIMITS.DURATION.max,
        step: 0,
      });
      return result.errorKey;
    }
    case "price": {
      const result = validatePrice(value, {
        required: true,
        allowZero: false,
        integerOnly: true,
        min: VALIDATION_LIMITS.PRICE.min,
        max: PRICE_LIMITS.ABSOLUTE_MAX,
      });
      return result.errorKey;
    }
    case "specialistIds":
      return null;
    case "nameEn": {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return null;
      }
      const result = validateServiceName(value, { required: false });
      return result.errorKey;
    }
    case "descriptionEn": {
      if (!value || (typeof value === "string" && value.trim() === "")) {
        return null;
      }
      const result = validateServiceDescription(value, { required: false });
      return result.errorKey;
    }
    default:
      return null;
  }
}

/** Сбор ошибок по всем полям формы услуги */
export function validateAllServiceFields(
  formData,
  existingServices,
  currentId,
) {
  const errors = {};
  Object.keys(formData).forEach((key) => {
    const errorKey = validateServiceField(
      key,
      formData[key],
      existingServices,
      currentId,
    );
    if (errorKey) errors[key] = errorKey;
  });
  return errors;
}

/**
 * Санитизация payload услуги перед сохранением в localStorage.
 * ПОЧЕМУ после валидации?
 * Последний рубеж: даже при обходе UI опасные символы не попадут в хранилище.
 */
export function sanitizeServicePayload(data) {
  return {
    name: sanitizeString(String(data.name || "").trim()),
    category: data.category,
    description: sanitizeString(String(data.description || "").trim()),
    duration: Number(data.duration),
    price: Number(data.price),
    specialistIds: Array.isArray(data.specialistIds) ? data.specialistIds : [],
    nameEn: data.nameEn ? sanitizeString(String(data.nameEn).trim()) : "",
    descriptionEn: data.descriptionEn
      ? sanitizeString(String(data.descriptionEn).trim())
      : "",
    image: data.image,
  };
}

/**
 * Валидация + санитизация перед submit (форма и CRUD).
 * @returns {{ isValid: boolean, errors: Object, data?: Object }}
 */
export function prepareServiceForSave(
  formData,
  existingServices = [],
  currentId = null,
) {
  const errors = validateAllServiceFields(
    formData,
    existingServices,
    currentId,
  );

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    data: sanitizeServicePayload(formData),
  };
}

/**
 * @param {Object} data - поля услуги из формы
 * @param {Array} existingServices - текущий каталог для проверки дубликатов
 * @param {string|null} currentId - ID редактируемой услуги (null при создании)
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateServiceData(data, existingServices = [], currentId = null) {
  const prepared = prepareServiceForSave(
    {
      name: data.name,
      category: data.category,
      description: data.description,
      duration: data.duration,
      price: data.price,
      specialistIds: data.specialistIds,
      nameEn: data.nameEn || "",
      descriptionEn: data.descriptionEn || "",
    },
    existingServices,
    currentId,
  );

  return { isValid: prepared.isValid, errors: prepared.errors };
}

export default validateServiceData;
