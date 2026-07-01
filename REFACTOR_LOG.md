# REFACTOR_LOG — bookme24

Журнал осознанного рефакторинга.  
---


## P1.1: Аудит useCallback / useMemo

- **Дата:** 2026-06-30
- **Коммит:** *(не закоммичено на момент создания лога)* — базовая точка в git: `5a5f6f0`. После коммита P1.1 подставьте хеш отдельного коммита или общего коммита рефакторинга.

### Контекст аудита

В проекте **нет** `React.memo()` — поэтому `useCallback` оправдан только если:
- значение передаётся в deps другого `useCallback` / `useEffect` / `useMemo`;
- или это тяжёлое вычисление в `useMemo`.

### Удалено мемоизаций

| Файл | Что убрано | Почему |
|------|------------|--------|
| `src/components/Profile/HistoryCard.jsx` | `useMemo` для `endTime` | `calculateEndTime()` — O(1), не expensive |
| `src/components/Booking/ConfirmationModal.jsx` | `useMemo` для `endTime` | то же |
| `src/components/Admin/BookingEditModal.jsx` | `useMemo` для `computedEndTime` | то же |
| `src/components/Catalog/FilterPanel.jsx` | `useMemo` для `maxPriceInCatalog` | один `Math.max` по массиву услуг |
| `src/hooks/useClientProfile.js` | `useMemo` для `resolvedPhone` | тривиальная строка `a \|\| b \|\| ""` |
| `src/hooks/useClientProfile.js` | `useCallback` для `toggleEdit`, `cancelEdit`, `handleUpdatePhone`, `handleUpdateEmail`, `saveSettings` | не deps других хуков, нет memo-компонентов |
| `src/hooks/useAdminDashboard.js` | `useMemo` для `activeFiltersCount` | `countActiveFilters()` — лёгкая функция |
| `src/components/Profile/ProfilePage.jsx` | `useCallback` для `handleUpdateSettings`, `goToWizard` | не deps других хуков |

### Дополнительно (сопутствующие правки)

| Файл | Изменение |
|------|-----------|
| `src/hooks/useLocalStorage.js` | убран `initialValue` из deps `setValue` (не используется после fix race condition) |

### Оставлено с обоснованием («ПОЧЕМУ»)

| Место | Причина |
|-------|---------|
| `useTimeSlots` → `useMemo` | генерация окон + `checkTimeOverlap` на каждый слот |
| `useLocalStorage` → `useCallback` (`setValue`, `removeValue`) | стабильный setter для persistence и передачи в дочерние компоненты |
| `LanguageContext` → `useMemo` (`t`) | функция в value Context — без мемоизации все потребители ререндерятся при каждом render провайдера |
| `useServices` → `useMemo` (`services`) | merge JSON + custom с Map и перезаписью стандартных услуг |
| `useSpecialists` → `useMemo` (`specialists`) | стабильная ссылка для deps CRUD-callback'ов (`validateSpecialistData`) |
| `useAdminDashboard` → `useMemo` (`sortedBookings`) | `filterBookings` + `sortBookings` при каждом ререндере табов/модалок |
| `CatalogPage` → `useMemo` (services, specialists) | filter + sort каталога при debounced поиске |
| `useBookings` → `useMemo` (`stats`) | пять проходов `filter` по массиву bookings |
| `useSalonData` → `useMemo` (`specialistsWithServices`) | `mergeSpecialistsWithServiceIds` — обогащение JSON-мастеров |
| `useClientProfile` → `useMemo` (`clientBookings`, `stats`, `profile` chain) | `filterClientBookings` и производные вычисления |
| `BookingEditModal` → `useMemo` (`specialistOptions`) | filter мастеров по `serviceIds` текущей услуги |
| `Button` → `useCallback` (`handleClick`) | интеграция `useRateLimiter` + Toast при `rateLimit` |
| `useAdminDashboard` / `useBookingWizard` → множество `useCallback` | handlers — deps друг друга (`notifySuccess` → `handleSaveService` и т.д.); часть API зафиксирована как Frozen Core |

### Риски

- Если удалённая мемоизация была нужна для **стабильности deps** в `useEffect`, возможны лишние срабатывания effect или, в редких случаях, цикл обновлений. На момент аудита: `npm test` — **77/77**, `npm run build` — успешно.
- Удаление `useMemo` для `specialists` в `useSpecialists` вызвало eslint-предупреждение о нестабильных deps CRUD — **восстановлено** с комментарием «ПОЧЕМУ useMemo: стабильная ссылка для deps CRUD-callback'ов».
- Без `React.memo` удаление `useCallback` в UI **не даёт** выигрыша в ререндерах детей, но упрощает код; обратный откат — тривиален при профилировании.

---

## Как использовать этот лог

### При регрессии

1. Определите затронутый файл (из таблиц выше).
2. Посмотрите diff относительно базового коммита:
   ```bash
   git diff 5a5f6f0 -- path/to/file
   ```
3. После коммита рефакторинга:
   ```bash
   git show <commit-hash> -- path/to/file
   ```
4. Если проблема в комментариях — ищите удалённые «ЗАМЕЧАНИЕ №N» в истории файла: `git log -p -- path/to/file`

