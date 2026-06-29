/**
 * useFavorites.js — единый хук избранного (каталог + профиль)
 *
 * АРХИТЕКТУРНАЯ РОЛЬ:
 * Один owner ключа FAVORITES. Раньше CatalogPage и ProfilePage каждый
 * вызывали useLocalStorage отдельно — state синхронизировался через
 * storage event, но логика toggle дублировалась.
 *
 * ПОЧЕМУ useCallback для toggle/isFavorite?
 * Стабильные ссылки на функции — дочерние карточки не ререндерятся
 * без изменения favorites.
 */

import { useCallback } from "react";

import { useLocalStorage } from "./useLocalStorage";
import { STORAGE_KEYS, STORAGE_DEBOUNCE_MS } from "../utils/constants";

export function useFavorites() {
  const [favorites, setFavorites] = useLocalStorage(
    STORAGE_KEYS.FAVORITES,
    [],
    { debounceMs: STORAGE_DEBOUNCE_MS.DEFAULT },
  );

  const isFavorite = useCallback(
    (id) => favorites.includes(id),
    [favorites],
  );

  const toggle = useCallback(
    (id) => {
      setFavorites((prev) =>
        prev.includes(id)
          ? prev.filter((favId) => favId !== id)
          : [...prev, id],
      );
    },
    [setFavorites],
  );

  return { favorites, setFavorites, toggle, isFavorite };
}

export default useFavorites;
