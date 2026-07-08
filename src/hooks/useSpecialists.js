/**
 * useSpecialists.js — хук для управления списком специалистов
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Предоставляет CRUD-операции для специалистов.
 * Разделяет JSON-данные (read-only) и кастомные данные (localStorage).
 * Валидирует данные перед сохранением.
 *
 * ПОЧЕМУ без Toast?
 * Бизнес-хук возвращает { success, error } — Toast показывает useAdminDashboard.
 */
import { useMemo, useCallback } from "react";
import { validateSpecialistData, sanitizeSpecialistPayload } from "../utils/validateSpecialist";
import { generateSpecialistId } from "../utils/generateId";

export function useSpecialists({
  jsonSpecialists = [],
  customSpecialists,
  setCustomSpecialists,
}) {
  // ПОЧЕМУ setCustomSpecialists приходит из useSalonData?
  // Чтобы useServices и useSpecialists делили один React-state на ключ
  // CUSTOM_SPECIALISTS — иначе sync serviceIds ↔ specialistIds ломается.

  // ПОЧЕМУ useMemo: стабильная ссылка для deps CRUD-callback'ов (validateSpecialistData)
  const specialists = useMemo(
    () => [...customSpecialists, ...jsonSpecialists],
    [customSpecialists, jsonSpecialists],
  );

  const addSpecialist = useCallback(
    (specialistData) => {
      const validation = validateSpecialistData(specialistData, specialists);
      if (!validation.isValid) {
        return {
          success: false,
          error: Object.values(validation.errors)[0],
          errors: validation.errors,
        };
      }

      const sanitized = sanitizeSpecialistPayload(specialistData);

      const newSpecialist = {
        id: generateSpecialistId(),
        fullName: sanitized.fullName,
        fullNameEn: sanitized.fullNameEn,
        position: sanitized.position,
        positionEn: sanitized.positionEn,
        experience: sanitized.experience,
        // ПОЧЕМУ: рейтинг 4.5 по умолчанию — рассчитывается автоматически, не из формы
        rating: 4.5,
        serviceIds: sanitized.serviceIds,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      setCustomSpecialists((prev) => [newSpecialist, ...prev]);
      return { success: true, specialist: newSpecialist };
    },
    [specialists, setCustomSpecialists],
  );

  // === ОБНОВЛЕНИЕ СПЕЦИАЛИСТА ===
  const updateSpecialist = useCallback(
    (specialistId, updates) => {
      const existingSpecialist = specialists.find((s) => s.id === specialistId);
      if (!existingSpecialist) {
        return { success: false, error: "validation.specialist.notFound" };
      }
      if (!existingSpecialist.isCustom && !specialistId.startsWith("custom_")) {
        return {
          success: false,
          error: "validation.specialist.cannotModifyStandard",
        };
      }

      const mergedData = { ...existingSpecialist, ...updates };
      const validation = validateSpecialistData(
        mergedData,
        specialists,
        specialistId,
      );
      if (!validation.isValid) {
        return {
          success: false,
          error: Object.values(validation.errors)[0],
          errors: validation.errors,
        };
      }

      const sanitized = sanitizeSpecialistPayload(mergedData);

      setCustomSpecialists((prev) =>
        prev.map((s) =>
          s.id === specialistId
            ? {
                ...s,
                ...updates,
                fullName: sanitized.fullName,
                fullNameEn: sanitized.fullNameEn,
                position: sanitized.position,
                positionEn: sanitized.positionEn,
                experience: sanitized.experience,
                // ПОЧЕМУ: rating не обновляется из формы — рассчитывается автоматически
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );

      const updatedSpecialist = { ...existingSpecialist, ...sanitized };
      return { success: true, specialist: updatedSpecialist };
    },
    [specialists, setCustomSpecialists],
  );

  // === УДАЛЕНИЕ СПЕЦИАЛИСТА ===
  const deleteSpecialist = useCallback(
    (specialistId) => {
      const existingSpecialist = specialists.find((s) => s.id === specialistId);
      if (!existingSpecialist) {
        return { success: false, error: "validation.specialist.notFound" };
      }
      if (!existingSpecialist.isCustom && !specialistId.startsWith("custom_")) {
        return {
          success: false,
          error: "validation.specialist.cannotDeleteStandard",
        };
      }

      setCustomSpecialists((prev) => prev.filter((s) => s.id !== specialistId));
      return { success: true };
    },
    [specialists, setCustomSpecialists],
  );

  return {
    specialists,
    addSpecialist,
    updateSpecialist,
    deleteSpecialist,
  };
}

export default useSpecialists;
