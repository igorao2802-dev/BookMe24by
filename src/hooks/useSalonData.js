/**
 * useSalonData.js — единый оркестратор domain-state салона
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Собирает услуги, мастеров и записи в одной точке.
 * App.jsx получает готовый API и передаёт его страницам через props —
 * компоненты отображения не знают о localStorage и не владеют CRUD-логикой.
 *
 * ПОЧЕМУ именно здесь живёт useLocalStorage для CUSTOM_*?
 * Раньше useServices и useSpecialists каждый создавали свой экземпляр
 * useLocalStorage(CUSTOM_SPECIALISTS). В одной вкладке React-state
 * не синхронизировался: правка serviceIds через услугу не обновляла
 * список мастеров до перезагрузки страницы.
 * Owner должен быть один — этот хук.
 *
 * @param {Array} jsonServices — начальный каталог из public/data/services.json
 * @param {Array} jsonSpecialists — начальный список из public/data/specialists.json
 */

import { useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { useServices } from "./useServices";
import { useSpecialists } from "./useSpecialists";
import { useBookings } from "./useBookings";
import { STORAGE_KEYS, STORAGE_DEBOUNCE_MS } from "../utils/constants";

/**
 * Обогащает мастеров актуальными serviceIds на основе связей в услугах.
 *
 * ПОЧЕМУ отдельная функция, а не правка JSON?
 * Связь двусторонняя: услуга хранит specialistIds, мастер — serviceIds.
 * После CRUD услуги поле specialist.serviceIds может отставать;
 * эта функция выравнивает данные для админки и каталога.
 */
function mergeSpecialistsWithServiceIds(specialists, services) {
  return specialists.map((specialist) => {
    const linkedFromServices = services
      .filter(
        (service) =>
          service.specialistIds &&
          service.specialistIds.includes(specialist.id),
      )
      .map((service) => service.id);

    const existingIds = specialist.serviceIds || [];
    const combinedIds = [...existingIds, ...linkedFromServices];

    return {
      ...specialist,
      serviceIds: [...new Set(combinedIds)],
    };
  });
}

export function useSalonData(jsonServices = [], jsonSpecialists = []) {
  // === ЕДИНСТВЕННЫЙ OWNER КАСТОМНЫХ СУЩНОСТЕЙ В LOCALSTORAGE ===
  const [customServices, setCustomServices] = useLocalStorage(
    STORAGE_KEYS.CUSTOM_SERVICES,
    [],
    { debounceMs: STORAGE_DEBOUNCE_MS.DEFAULT },
  );

  const [customSpecialists, setCustomSpecialists] = useLocalStorage(
    STORAGE_KEYS.CUSTOM_SPECIALISTS,
    [],
    { debounceMs: STORAGE_DEBOUNCE_MS.DEFAULT },
  );

  // === CRUD-СЛОИ (без собственного доступа к localStorage) ===
  const {
    services,
    addService,
    updateService,
    deleteService,
  } = useServices({
    jsonServices,
    customServices,
    setCustomServices,
    setCustomSpecialists,
  });

  const {
    specialists,
    addSpecialist,
    updateSpecialist,
    deleteSpecialist,
  } = useSpecialists({
    jsonSpecialists,
    customSpecialists,
    setCustomSpecialists,
  });

  const {
    bookings,
    stats,
    createBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    clearAllBookings,
  } = useBookings();

  // ПОЧЕМУ useMemo: mergeSpecialistsWithServiceIds обогащает JSON-мастеров serviceIds из услуг
  const specialistsWithServices = useMemo(
    () => mergeSpecialistsWithServiceIds(specialists, services),
    [specialists, services],
  );

  return {
    services,
    specialists,
    specialistsWithServices,
    bookings,
    stats,
    addService,
    updateService,
    deleteService,
    addSpecialist,
    updateSpecialist,
    deleteSpecialist,
    createBooking,
    updateBooking,
    cancelBooking,
    deleteBooking,
    clearAllBookings,
  };
}

export default useSalonData;
