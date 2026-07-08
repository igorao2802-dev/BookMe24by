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
 * ПОЧЕМУ без Toast?
 * Бизнес-хук не знает о UI — уведомления показывает useAdminDashboard
 * по результату { success, error } из CRUD-методов.
 */
import { useMemo, useCallback } from "react";
import { validateServiceData, sanitizeServicePayload } from "../utils/validateService";
import { generateServiceId } from "../utils/generateId";

export function useServices({
  jsonServices = [],
  customServices,
  setCustomServices,
  setCustomSpecialists,
}) {
  // ПОЧЕМУ customServices приходит снаружи?
  // Owner localStorage — useSalonData.js. Этот хук только мержит JSON + custom
  // и выполняет CRUD, не создавая второй React-state на тот же ключ.
  // ПОЧЕМУ useMemo: merge JSON + custom с перезаписью стандартных услуг кастомными копиями
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

      const sanitized = sanitizeServicePayload(serviceData);

      const newService = {
        id: generateServiceId(),
        name: sanitized.name,
        nameEn: sanitized.nameEn,
        category: sanitized.category,
        description: sanitized.description,
        descriptionEn: sanitized.descriptionEn,
        duration: sanitized.duration,
        price: sanitized.price,
        specialistIds: sanitized.specialistIds,
        image: serviceData.image || "/images/services/default.jpg",
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      setCustomServices((prev) => [newService, ...prev]);

      if (newService.specialistIds.length > 0) {
        syncSpecialistServices(newService.id, [], newService.specialistIds);
      }

      return { success: true, service: newService };
    },
    [services, setCustomServices, syncSpecialistServices],
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

      const sanitized = sanitizeServicePayload(mergedData);

      const isStandardService =
        !existingService.isCustom && !String(serviceId).startsWith("custom_");
      const oldSpecialistIds = existingService.specialistIds || [];
      const newSpecialistIds = sanitized.specialistIds;

      if (isStandardService) {
        const customCopy = {
          ...existingService,
          ...updates,
          id: serviceId,
          originalId: serviceId,
          name: sanitized.name,
          nameEn: sanitized.nameEn,
          description: sanitized.description,
          descriptionEn: sanitized.descriptionEn,
          duration: sanitized.duration,
          price: sanitized.price,
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
                  name: sanitized.name,
                  nameEn: sanitized.nameEn,
                  description: sanitized.description,
                  descriptionEn: sanitized.descriptionEn,
                  duration: sanitized.duration,
                  price: sanitized.price,
                  specialistIds: newSpecialistIds,
                  updatedAt: new Date().toISOString(),
                }
              : s,
          ),
        );
      }

      syncSpecialistServices(serviceId, oldSpecialistIds, newSpecialistIds);

      const updatedService = { ...existingService, ...sanitized };
      return { success: true, service: updatedService };
    },
    [services, setCustomServices, syncSpecialistServices],
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

      return { success: true };
    },
    [services, setCustomServices, setCustomSpecialists],
  );

  return {
    services,
    addService,
    updateService,
    deleteService,
  };
}

export default useServices;
