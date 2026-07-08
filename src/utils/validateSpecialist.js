/**
 * validateSpecialist.js — валидация данных специалиста (админка)
 */

import { VALIDATION_LIMITS } from "../constants/validationLimits";
import { validateServiceName, validateExperience } from "./validators";
import { hasXSSPattern, sanitizeString } from "./sanitizers";

/**
 * Валидация одного поля формы специалиста.
 * @returns {string|null} i18n-key ошибки
 */
export function validateSpecialistField(
  name,
  value,
  existingSpecialists = [],
  currentId = null,
) {
  switch (name) {
    case "fullName":
      if (!value || !value.trim()) return "validation.specialist.nameRequired";
      if (hasXSSPattern(value)) return "validation.xssDetected";
      if (value.trim().length < VALIDATION_LIMITS.SPECIALIST_NAME.minLength) {
        return "validation.tooShort";
      }
      if (value.trim().length > VALIDATION_LIMITS.SPECIALIST_NAME.maxLength) {
        return "validation.specialist.nameTooLong";
      }
      if (value.trim().split(/\s+/).length < 2) {
        return "validation.specialist.nameMinTwoWords";
      }
      if (
        existingSpecialists.some(
          (s) =>
            String(s.id) !== String(currentId) &&
            s.fullName.toLowerCase() === value.trim().toLowerCase(),
        )
      ) {
        return "validation.specialist.nameDuplicate";
      }
      return null;

    case "position":
      if (!value || !value.trim()) {
        return "validation.specialist.positionRequired";
      }
      if (hasXSSPattern(value)) return "validation.xssDetected";
      if (value.trim().length < VALIDATION_LIMITS.SPECIALIST_POSITION.minLength) {
        return "validation.tooShort";
      }
      return value.trim().length > VALIDATION_LIMITS.SPECIALIST_POSITION.maxLength
        ? "validation.specialist.positionTooLong"
        : null;

    case "experience": {
      const result = validateExperience(value, { required: true });
      return result.errorKey;
    }

    case "serviceIds":
      return !Array.isArray(value) || value.length === 0
        ? "validation.specialist.servicesEmpty"
        : null;

    case "fullNameEn": {
      if (!value || !value.trim()) return null;
      const result = validateServiceName(value, { required: false });
      return result.errorKey;
    }

    case "positionEn": {
      if (!value || !value.trim()) return null;
      if (hasXSSPattern(value)) return "validation.xssDetected";
      return value.trim().length > VALIDATION_LIMITS.SPECIALIST_POSITION.maxLength
        ? "validation.specialist.positionTooLong"
        : null;
    }

    default:
      return null;
  }
}

export function validateAllSpecialistFields(
  formData,
  existingSpecialists,
  currentId,
) {
  const errors = {};
  Object.keys(formData).forEach((key) => {
    const errorKey = validateSpecialistField(
      key,
      formData[key],
      existingSpecialists,
      currentId,
    );
    if (errorKey) errors[key] = errorKey;
  });
  return errors;
}

export function sanitizeSpecialistPayload(data) {
  return {
    fullName: sanitizeString(String(data.fullName || "").trim()),
    fullNameEn: data.fullNameEn
      ? sanitizeString(String(data.fullNameEn).trim())
      : "",
    position: sanitizeString(String(data.position || "").trim()),
    positionEn: data.positionEn
      ? sanitizeString(String(data.positionEn).trim())
      : "",
    experience: Number(data.experience),
    serviceIds: Array.isArray(data.serviceIds) ? data.serviceIds : [],
  };
}

export function prepareSpecialistForSave(
  formData,
  existingSpecialists = [],
  currentId = null,
) {
  const errors = validateAllSpecialistFields(
    formData,
    existingSpecialists,
    currentId,
  );

  if (Object.keys(errors).length > 0) {
    return { isValid: false, errors };
  }

  return {
    isValid: true,
    errors: {},
    data: sanitizeSpecialistPayload(formData),
  };
}

/**
 * @param {Object} data - поля специалista из формы
 * @param {Array} existingSpecialists - текущий список для проверки дубликатов
 * @param {string|null} currentId - ID редактируемого мастера
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateSpecialistData(
  data,
  existingSpecialists = [],
  currentId = null,
) {
  const prepared = prepareSpecialistForSave(
    {
      fullName: data.fullName,
      position: data.position,
      experience: data.experience,
      serviceIds: data.serviceIds,
      fullNameEn: data.fullNameEn || "",
      positionEn: data.positionEn || "",
    },
    existingSpecialists,
    currentId,
  );

  return { isValid: prepared.isValid, errors: prepared.errors };
}

export default validateSpecialistData;
