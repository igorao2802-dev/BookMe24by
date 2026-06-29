/**
 * useSpecialists.js — хук для управления списком специалистов
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Предоставляет CRUD-операции для специалистов.
 * Разделяет JSON-данные (read-only) и кастомные данные (localStorage).
 * Валидирует данные перед сохранением.
 *
 * 🔥 ЭТАП 6.3: Добавлены add/update/delete операции
 * 🔥 ЭТАП 7.6: Локализация Toast-уведомлений
 * 🔥 ЭТАП 5.3: Добавлена поддержка двуязычных полей (fullNameEn, positionEn)
 * 🔥 ЭТАП 12: Удалена валидация rating, дефолтное значение 4.5 при создании
 * 🔥 ИСПРАВЛЕНО: Все опечатки в строках валидации (убраны пробелы)
 */
import { useMemo, useCallback } from "react";
import { useLanguage } from "./useLanguage";
import Toast from "../components/UI/Toast";
import { validateSpecialistData } from "../utils/validateSpecialist";
import { generateSpecialistId } from "../utils/generateId";

export function useSpecialists({
  jsonSpecialists = [],
  customSpecialists,
  setCustomSpecialists,
}) {
  const { t } = useLanguage();

  // ПОЧЕМУ setCustomSpecialists приходит из useSalonData?
  // Чтобы useServices и useSpecialists делили один React-state на ключ
  // CUSTOM_SPECIALISTS — иначе sync serviceIds ↔ specialistIds ломается.

  const specialists = useMemo(
    () => [...customSpecialists, ...jsonSpecialists],
    [customSpecialists, jsonSpecialists],
  );

  // === ДОБАВЛЕНИЕ СПЕЦИАЛИСТА ===
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

      const newSpecialist = {
        id: generateSpecialistId(),
        fullName: specialistData.fullName.trim(),
        fullNameEn: specialistData.fullNameEn
          ? specialistData.fullNameEn.trim()
          : "",
        position: specialistData.position.trim(),
        positionEn: specialistData.positionEn
          ? specialistData.positionEn.trim()
          : "",
        experience: Number(specialistData.experience),
        //  ЭТАП 12: Дефолтное значение рейтинга 4.5 (рассчитывается автоматически)
        rating: 4.5,
        serviceIds: specialistData.serviceIds,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      setCustomSpecialists((prev) => [newSpecialist, ...prev]);
      Toast.success(
        t("admin.specialists.addSuccess", { name: newSpecialist.fullName }),
      );
      return { success: true, specialist: newSpecialist };
    },
    [specialists, setCustomSpecialists, t],
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

      setCustomSpecialists((prev) =>
        prev.map((s) =>
          s.id === specialistId
            ? {
                ...s,
                ...updates,
                fullName: updates.fullName?.trim() || s.fullName,
                fullNameEn:
                  updates.fullNameEn !== undefined
                    ? updates.fullNameEn.trim()
                    : s.fullNameEn || "",
                position: updates.position?.trim() || s.position,
                positionEn:
                  updates.positionEn !== undefined
                    ? updates.positionEn.trim()
                    : s.positionEn || "",
                experience:
                  updates.experience !== undefined
                    ? Number(updates.experience)
                    : s.experience,
                // 🔥 ЭТАП 12: rating НЕ обновляется из формы — рассчитывается автоматически
                updatedAt: new Date().toISOString(),
              }
            : s,
        ),
      );

      const updatedSpecialist = { ...existingSpecialist, ...updates };
      Toast.success(
        t("admin.specialists.updateSuccess", {
          name: updatedSpecialist.fullName,
        }),
      );
      return { success: true, specialist: updatedSpecialist };
    },
    [specialists, setCustomSpecialists, t],
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
      Toast.success(
        t("admin.specialists.deleteSuccess", {
          name: existingSpecialist.fullName,
        }),
      );
      return { success: true };
    },
    [specialists, setCustomSpecialists, t],
  );

  return {
    specialists,
    addSpecialist,
    updateSpecialist,
    deleteSpecialist,
  };
}

export default useSpecialists;
