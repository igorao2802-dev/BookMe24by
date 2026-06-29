/**
 * validateSpecialist.js — валидация данных специалиста (админка)
 *
 * ПОЧЕМУ вынесено из useSpecialists?
 * - Та же причина, что validateService.js: изоляция бизнес-правил от хука
 */

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
  const errors = {};

  if (!data.fullName || typeof data.fullName !== "string") {
    errors.fullName = "validation.specialist.nameRequired";
  } else {
    const trimmedName = data.fullName.trim();
    if (trimmedName.length === 0) {
      errors.fullName = "validation.specialist.nameRequired";
    } else if (trimmedName.length > 100) {
      errors.fullName = "validation.specialist.nameTooLong";
    } else {
      const wordsCount = trimmedName.split(/\s+/).length;
      if (wordsCount < 2) {
        errors.fullName = "validation.specialist.nameMinTwoWords";
      }
      const isDuplicate = existingSpecialists.some(
        (spec) =>
          spec.id !== currentId &&
          spec.fullName.toLowerCase() === trimmedName.toLowerCase(),
      );
      if (isDuplicate) {
        errors.fullName = "validation.specialist.nameDuplicate";
      }
    }
  }

  if (!data.position || typeof data.position !== "string") {
    errors.position = "validation.specialist.positionRequired";
  } else {
    const trimmedPosition = data.position.trim();
    if (trimmedPosition.length === 0) {
      errors.position = "validation.specialist.positionRequired";
    } else if (trimmedPosition.length > 50) {
      errors.position = "validation.specialist.positionTooLong";
    }
  }

  if (
    data.experience === undefined ||
    data.experience === null ||
    data.experience === ""
  ) {
    errors.experience = "validation.specialist.experienceRequired";
  } else {
    const experience = Number(data.experience);
    if (isNaN(experience)) {
      errors.experience = "validation.specialist.experienceInvalid";
    } else if (experience < 0) {
      errors.experience = "validation.specialist.experienceNegative";
    } else if (experience > 50) {
      errors.experience = "validation.specialist.experienceTooHigh";
    }
  }

  if (
    !data.serviceIds ||
    !Array.isArray(data.serviceIds) ||
    data.serviceIds.length === 0
  ) {
    errors.serviceIds = "validation.specialist.servicesEmpty";
  }

  if (data.fullNameEn && data.fullNameEn.trim().length > 100) {
    errors.fullNameEn = "validation.specialist.nameTooLong";
  }
  if (data.positionEn && data.positionEn.trim().length > 50) {
    errors.positionEn = "validation.specialist.positionTooLong";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export default validateSpecialistData;
