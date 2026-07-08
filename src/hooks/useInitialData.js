/**
 * useInitialData.js — bootstrap-хук приложения bookme24
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Единая точка «холодного старта» SPA: загрузка seed-JSON из public/data,
 * восстановление роли пользователя из localStorage и сборка domain-state
 * через useSalonData. App.jsx не должен знать деталей fetch и ключей хранилища.
 *
 * ПОЧЕМУ отдельный хук, а не useEffect прямо в App.jsx?
 * - Разделение ответственности: App.jsx — только провайдеры и композиция.
 * - Тестируемость: bootstrap можно покрыть unit-тестом без роутера и Layout.
 * - useSalonData вызывается на каждом рендере (правила хуков), но получает
 *   актуальные jsonServices/jsonSpecialists после завершения fetch.
 */

import { useState, useEffect } from 'react';

import { useSalonData } from './useSalonData';
import { useLocalStorage } from './useLocalStorage';
import { STORAGE_KEYS, USER_ROLES, STORAGE_DEBOUNCE_MS } from '../utils/constants';
import { migrateStorage } from '../utils/storageHelper';

/** Пути к seed-данным в public/ — CRA отдаёт их как статику без импорта в бандл */
const SEED_DATA_URLS = {
  services: '/data/services.json',
  specialists: '/data/specialists.json',
};

/**
 * Загружает и парсит оба JSON-файла параллельно.
 *
 * ПОЧЕМУ Promise.all?
 * services и specialists независимы — параллельный запрос сокращает
 * время до первого интерактивного экрана (TTI) при медленной сети.
 *
 * @returns {Promise<{ services: Array, specialists: Array }>}
 */
async function fetchSeedData() {
  const [servicesResponse, specialistsResponse] = await Promise.all([
    fetch(SEED_DATA_URLS.services),
    fetch(SEED_DATA_URLS.specialists),
  ]);

  if (!servicesResponse.ok) {
    throw new Error(
      `Не удалось загрузить ${SEED_DATA_URLS.services}: HTTP ${servicesResponse.status}`,
    );
  }

  if (!specialistsResponse.ok) {
    throw new Error(
      `Не удалось загрузить ${SEED_DATA_URLS.specialists}: HTTP ${specialistsResponse.status}`,
    );
  }

  const servicesPayload = await servicesResponse.json();
  const specialistsPayload = await specialistsResponse.json();

  return {
    services: servicesPayload.services ?? [],
    specialists: specialistsPayload.specialists ?? [],
  };
}

/**
 * Инициализирует приложение: seed-данные, localStorage, domain-state салона.
 *
 * @returns {{
 *   isLoading: boolean,
 *   error: Error | null,
 *   salon: ReturnType<typeof useSalonData>,
 *   userRole: string,
 *   setUserRole: Function,
 * }}
 */
export function useInitialData() {
  const [jsonServices, setJsonServices] = useState([]);
  const [jsonSpecialists, setJsonSpecialists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Роль переживает перезагрузку вкладки — демо-переключатель в Layout
  const [userRole, setUserRole] = useLocalStorage(
    STORAGE_KEYS.USER_ROLE,
    USER_ROLES.CLIENT,
    { debounceMs: STORAGE_DEBOUNCE_MS.DEFAULT },
  );

  // Domain-state строится поверх seed + пользовательских правок в localStorage
  const salon = useSalonData(jsonServices, jsonSpecialists);

  useEffect(() => {
    migrateStorage();

    let isCancelled = false;

    const loadSeedData = async () => {
      try {
        const seedData = await fetchSeedData();

        if (isCancelled) {
          return;
        }

        setJsonServices(seedData.services);
        setJsonSpecialists(seedData.specialists);
        setError(null);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        console.error('[useInitialData] Ошибка загрузки seed-данных:', error);
        setError(error instanceof Error ? error : new Error(String(error)));
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadSeedData();

    // ПОЧЕМУ cleanup?
    // Strict Mode в dev монтирует эффект дважды; без флага setState
    // после размонтирования вызовет предупреждение React.
    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    isLoading,
    error,
    salon,
    userRole,
    setUserRole,
  };
}

export default useInitialData;
