/**
 * useServices.js — хук для управления каталогом услуг
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * - Загружает JSON-услуги и мержит с кастомными из localStorage
 * - CRUD операции: addService, updateService, deleteService
 * - Двусторонняя синхронизация specialistIds ↔ serviceIds
 * - При редактировании стандартной услуги создаётся кастомная копия
 * - Удаление стандартных услуг запрещено
 *
 * 🔥 ИСПРАВЛЕНО:
 * - Устранены все опечатки (oldSpecialistIds, newSpecialistIds и др.)
 * - Убраны trailing spaces во всех строках
 * - Исправлены все && вместо & &
 * - Исправлены все стрелочные функции (prev) =>
 */
import { useMemo, useCallback } from "react";
import { useLanguage } from "./useLanguage";
import Toast from "../components/UI/Toast";
import { validateServiceData } from "../utils/validateService";
import { generateServiceId } from "../utils/generateId";

export function useServices({
  jsonServices = [],
  customServices,
  setCustomServices,
  setCustomSpecialists,
}) {
  const { t } = useLanguage();

  // ПОЧЕМУ customServices приходит снаружи?
  // Owner localStorage — useSalonData.js. Этот хук только мержит JSON + custom
  // и выполняет CRUD, не создавая второй React-state на тот же ключ.
  const services = useMemo(() => {
    const customMap = new Map(customServices.map((s) => [s.id, s]));
    const merged = [];

    // Сначала добавляем кастомные услуги без originalId
    customServices.forEach((s) => {
      if (!s.originalId) merged.push(s);
    });

    // Затем JSON-услуги (перезаписанные кастомными, если есть)
    jsonServices.forEach((s) => {
      if (customMap.has(s.id)) {
        merged.push(customMap.get(s.id));
      } else {
        merged.push(s);
      }
    });

    return merged;
  }, [customServices, jsonServices]);

  // === Двусторонняя синхронизация ===
  const syncSpecialistServices = useCallback(
    (serviceId, oldSpecialistIds = [], newSpecialistIds = []) => {
      setCustomSpecialists((prev) =>
        prev.map((specialist) => {
          const currentServiceIds = specialist.serviceIds || [];
          let updatedServiceIds = currentServiceIds;

          if (
            oldSpecialistIds.includes(specialist.id) &&
            !newSpecialistIds.includes(specialist.id)
          ) {
            updatedServiceIds = updatedServiceIds.filter(
              (id) => String(id) !== String(serviceId),
            );
          }

          if (
            newSpecialistIds.includes(specialist.id) &&
            !updatedServiceIds.some((id) => String(id) === String(serviceId))
          ) {
            updatedServiceIds = [...updatedServiceIds, serviceId];
          }

          return { ...specialist, serviceIds: updatedServiceIds };
        }),
      );
    },
    [setCustomSpecialists],
  );

  const addService = useCallback(
    (serviceData) => {
      const validation = validateServiceData(serviceData, services);
      if (!validation.isValid) {
        return {
          success: false,
          error: Object.values(validation.errors)[0],
          errors: validation.errors,
        };
      }

      const newService = {
        id: generateServiceId(),
        name: serviceData.name.trim(),
        nameEn: serviceData.nameEn ? serviceData.nameEn.trim() : "",
        category: serviceData.category,
        description: serviceData.description.trim(),
        descriptionEn: serviceData.descriptionEn
          ? serviceData.descriptionEn.trim()
          : "",
        duration: Number(serviceData.duration),
        price: Number(serviceData.price),
        specialistIds: serviceData.specialistIds || [],
        image: serviceData.image || "/images/services/default.jpg",
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      setCustomServices((prev) => [newService, ...prev]);

      if (newService.specialistIds.length > 0) {
        syncSpecialistServices(newService.id, [], newService.specialistIds);
      }

      Toast.success(t("admin.services.addSuccess", { name: newService.name }));
      return { success: true, service: newService };
    },
    [services, setCustomServices, t, syncSpecialistServices],
  );

  const updateService = useCallback(
    (serviceId, updates) => {
      const existingService = services.find((s) => s.id === serviceId);
      if (!existingService) {
        return { success: false, error: "validation.service.notFound" };
      }

      const mergedData = { ...existingService, ...updates };
      const validation = validateServiceData(mergedData, services, serviceId);
      if (!validation.isValid) {
        return {
          success: false,
          error: Object.values(validation.errors)[0],
          errors: validation.errors,
        };
      }

      const isStandardService =
        !existingService.isCustom && !String(serviceId).startsWith("custom_");
      const oldSpecialistIds = existingService.specialistIds || [];
      const newSpecialistIds =
        updates.specialistIds !== undefined
          ? updates.specialistIds
          : oldSpecialistIds;

      if (isStandardService) {
        const customCopy = {
          ...existingService,
          ...updates,
          id: serviceId,
          originalId: serviceId,
          name: updates.name?.trim() || existingService.name,
          nameEn:
            updates.nameEn !== undefined
              ? updates.nameEn.trim()
              : existingService.nameEn || "",
          description:
            updates.description?.trim() || existingService.description,
          descriptionEn:
            updates.descriptionEn !== undefined
              ? updates.descriptionEn.trim()
              : existingService.descriptionEn || "",
          duration:
            updates.duration !== undefined
              ? Number(updates.duration)
              : existingService.duration,
          price:
            updates.price !== undefined
              ? Number(updates.price)
              : existingService.price,
          specialistIds: newSpecialistIds,
          isCustom: true,
          updatedAt: new Date().toISOString(),
        };

        setCustomServices((prev) => {
          const filtered = prev.filter(
            (s) => String(s.id) !== String(serviceId),
          );
          return [customCopy, ...filtered];
        });
      } else {
        setCustomServices((prev) =>
          prev.map((s) =>
            String(s.id) === String(serviceId)
              ? {
                  ...s,
                  ...updates,
                  name: updates.name?.trim() || s.name,
                  nameEn:
                    updates.nameEn !== undefined
                      ? updates.nameEn.trim()
                      : s.nameEn || "",
                  description: updates.description?.trim() || s.description,
                  descriptionEn:
                    updates.descriptionEn !== undefined
                      ? updates.descriptionEn.trim()
                      : s.descriptionEn || "",
                  duration:
                    updates.duration !== undefined
                      ? Number(updates.duration)
                      : s.duration,
                  price:
                    updates.price !== undefined
                      ? Number(updates.price)
                      : s.price,
                  specialistIds: newSpecialistIds,
                  updatedAt: new Date().toISOString(),
                }
              : s,
          ),
        );
      }

      syncSpecialistServices(serviceId, oldSpecialistIds, newSpecialistIds);

      const updatedService = { ...existingService, ...updates };
      Toast.success(
        t("admin.services.updateSuccess", { name: updatedService.name }),
      );
      return { success: true, service: updatedService };
    },
    [services, setCustomServices, t, syncSpecialistServices],
  );

  const deleteService = useCallback(
    (serviceId) => {
      const existingService = services.find((s) => s.id === serviceId);
      if (!existingService) {
        return { success: false, error: "validation.service.notFound" };
      }

      if (
        !existingService.isCustom &&
        !String(serviceId).startsWith("custom_")
      ) {
        return {
          success: false,
          error: "validation.service.cannotDeleteStandard",
        };
      }

      setCustomServices((prev) =>
        prev.filter((s) => String(s.id) !== String(serviceId)),
      );

      setCustomSpecialists((prev) =>
        prev.map((specialist) => ({
          ...specialist,
          serviceIds: (specialist.serviceIds || []).filter(
            (id) => String(id) !== String(serviceId),
          ),
        })),
      );

      Toast.success(
        t("admin.services.deleteSuccess", { name: existingService.name }),
      );
      return { success: true };
    },
    [services, setCustomServices, setCustomSpecialists, t],
  );

  return {
    services,
    addService,
    updateService,
    deleteService,
  };
}

export default useServices;
