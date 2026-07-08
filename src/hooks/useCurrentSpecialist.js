/**
 * useCurrentSpecialist.js — текущий мастер для роли «Специалист»
 *
 * ПОЧЕМУ localStorage?
 * В демо-режиме нет серверной авторизации — привязка мастера к сессии
 * сохраняется между перезагрузками вкладки.
 */

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS, STORAGE_DEBOUNCE_MS } from "../utils/constants";

/**
 * @param {Array} specialists — актуальный каталог мастеров
 * @returns {{
 *   currentSpecialistId: string,
 *   currentSpecialist: object | null,
 *   setCurrentSpecialistId: Function,
 * }}
 */
export function useCurrentSpecialist(specialists = []) {
  const [storedSpecialistId, setStoredSpecialistId] = useLocalStorage(
    STORAGE_KEYS.CURRENT_SPECIALIST_ID,
    "",
    { debounceMs: STORAGE_DEBOUNCE_MS.DEFAULT },
  );

  const resolvedSpecialistId = useMemo(() => {
    if (
      storedSpecialistId &&
      specialists.some(
        (specialist) => String(specialist.id) === String(storedSpecialistId),
      )
    ) {
      return storedSpecialistId;
    }

    return specialists[0]?.id || "";
  }, [storedSpecialistId, specialists]);

  const currentSpecialist = useMemo(
    () =>
      specialists.find(
        (specialist) => String(specialist.id) === String(resolvedSpecialistId),
      ) || null,
    [specialists, resolvedSpecialistId],
  );

  const setCurrentSpecialistId = useCallback(
    (specialistId) => {
      setStoredSpecialistId(specialistId);
    },
    [setStoredSpecialistId],
  );

  return {
    currentSpecialistId: resolvedSpecialistId,
    currentSpecialist,
    setCurrentSpecialistId,
  };
}

export default useCurrentSpecialist;
