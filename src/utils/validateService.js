/**
 * validateService.js — валидация данных услуги (админка)
 *
 * ПОЧЕМУ отдельный модуль, а не inline в useServices?
 * - Чистая функция без React — легко тестировать изолированно
 * - useServices остаётся тонким CRUD-слоем
 */

import { SERVICE_CATEGORIES } from "./constants";

/**
 * @param {Object} data - поля услуги из формы
 * @param {Array} existingServices - текущий каталог для проверки дубликатов
 * @param {string|null} currentId - ID редактируемой услуги (null при создании)
 * @returns {{ isValid: boolean, errors: Object }}
 */
export function validateServiceData(data, existingServices = [], currentId = null) {
  const errors = {};

  if (!data.name || typeof data.name !== "string" || !data.name.trim()) {
    errors.name = "validation.service.nameRequired";
  } else if (data.name.trim().length > 100) {
    errors.name = "validation.service.nameTooLong";
  } else {
    const isDuplicate = existingServices.some(
      (service) =>
        service.id !== currentId &&
        service.name.toLowerCase() === data.name.trim().toLowerCase(),
    );
    if (isDuplicate) errors.name = "validation.service.nameDuplicate";
  }

  if (
    !data.category ||
    !Object.values(SERVICE_CATEGORIES).includes(data.category)
  ) {
    errors.category = "validation.service.categoryRequired";
  }

  if (!data.description || !data.description.trim()) {
    errors.description = "validation.service.descriptionRequired";
  } else if (data.description.trim().length > 500) {
    errors.description = "validation.service.descriptionTooLong";
  }

  if (
    data.duration === undefined ||
    data.duration === null ||
    data.duration === ""
  ) {
    errors.duration = "validation.service.durationRequired";
  } else {
    const duration = Number(data.duration);
    if (isNaN(duration) || duration < 15 || duration > 480) {
      errors.duration =
        duration < 15
          ? "validation.service.durationTooShort"
          : "validation.service.durationTooLong";
    }
  }

  if (data.price === undefined || data.price === null || data.price === "") {
    errors.price = "validation.service.priceRequired";
  } else {
    const price = Number(data.price);
    if (isNaN(price) || price <= 0 || price > 10000) {
      errors.price =
        price <= 0
          ? "validation.service.priceTooLow"
          : "validation.service.priceTooHigh";
    }
  }

  if (data.specialistIds !== undefined && !Array.isArray(data.specialistIds)) {
    errors.specialistIds = "validation.service.specialistsRequired";
  }

  if (data.nameEn && data.nameEn.trim().length > 100) {
    errors.nameEn = "validation.service.nameTooLong";
  }

  if (data.descriptionEn && data.descriptionEn.trim().length > 500) {
    errors.descriptionEn = "validation.service.descriptionTooLong";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
}

export default validateServiceData;
