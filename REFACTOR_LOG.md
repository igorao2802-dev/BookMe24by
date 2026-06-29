# REFACTOR_LOG — bookme24

Журнал осознанного рефакторинга перед защитой курсового проекта.  
Используйте при регрессиях и на защите для обоснования изменений.

---

## P1.2: Чистка артефактных комментариев

- **Дата:** 2026-06-30
- **Коммит:** *(не закоммичено на момент создания лога)* — базовая точка в git: `5a5f6f0` (`refactor(css): consolidate tokens and fix critical contrast`). После коммита P1.2 подставьте хеш: `git log -1 --format=%H -- REFACTOR_LOG.md` или по сообщению коммита.

### Удалено маркеров (до → после)

| Паттерн | Было (≈) | Стало |
|---------|----------|-------|
| 🔥 | ~280 вхождений в ~90 файлах | **0** |
| ЭТАП | ~120 | **0** |
| ИСПРАВЛЕНО / ИСПРАВЛЕНИЕ | ~55 | **0** |
| ЗАМЕЧАНИЕ | ~45 | **0** |
| TODO от ИИ / AI TODO | 0 | **0** |
| Here is the updated code / Fixed bug | 0 | **0** |

Проверка: `grep -rE "🔥|ЭТАП|ИСПРАВЛЕНО|ИСПРАВЛЕНИЕ|ЗАМЕЧАНИЕ" src/` → 0 совпадений.

### Метод

1. **Batch 1 (ручная правка):** `utils/`, `hooks/useRateLimiter.js`, `contexts/`, `index.js`
2. **Batch 2 (~71 файл):** точечная чистка JSX/CSS/JS с переписыванием полезного текста в формат «ПОЧЕМУ …»
3. **Batch 3 (8 файлов):** восстановление из git после неудачного bulk-скрипта + повторная ручная чистка

**Важно:** автоматический bulk-replace **не применялся** в финальной версии — он ломал JSDoc и синтаксис JSX. Финальная чистка — построчная.

### Файлы затронуты

#### Utils & entry

- `src/utils/validators.js`
- `src/utils/constants.js`
- `src/utils/formatters.js`
- `src/utils/storageHelper.js`
- `src/utils/checkTimeOverlap.js`
- `src/utils/audioHelper.js`
- `src/utils/bonusCalculator.js`
- `src/index.js`

#### Hooks

- `src/hooks/useRateLimiter.js`
- `src/hooks/useTimeSlots.js`
- `src/hooks/useSpecialists.js` *(только комментарии в рамках P1.2)*

#### Contexts

- `src/contexts/ThemeContext.jsx`
- `src/contexts/LanguageContext.jsx`

#### Admin

- `src/components/Admin/AdminBookingsTable.jsx`
- `src/components/Admin/AdminDashboard.css`
- `src/components/Admin/AdminFilterPanel.css`
- `src/components/Admin/AdminFilterPanel.jsx`
- `src/components/Admin/AdminServicesList.css`
- `src/components/Admin/AdminSpecialistsList.css`
- `src/components/Admin/AdminStats.css`
- `src/components/Admin/AdminStats.jsx`
- `src/components/Admin/BookingEditModal.jsx` *(комментарии; P2.1 — отдельно)*
- `src/components/Admin/ServiceForm.css`
- `src/components/Admin/ServiceForm.jsx`
- `src/components/Admin/ServiceModal.jsx`
- `src/components/Admin/SpecialistForm.css`
- `src/components/Admin/SpecialistForm.jsx`

#### Booking

- `src/components/Booking/BookingCard.css`
- `src/components/Booking/BookingForm.css`
- `src/components/Booking/BookingForm.jsx`
- `src/components/Booking/BookingList.css`
- `src/components/Booking/BookingList.jsx`
- `src/components/Booking/BookingWizard.css`
- `src/components/Booking/ConfirmationModal.css`
- `src/components/Booking/ConfirmationModal.jsx` *(комментарии; P2.1 — отдельно)*
- `src/components/Booking/ConsentModal.jsx`
- `src/components/Booking/ServiceSelector.css`
- `src/components/Booking/ServiceSelector.jsx`
- `src/components/Booking/SpecialistSelector.jsx`
- `src/components/Booking/TimeSlotPicker.css`

#### Catalog

- `src/components/Catalog/CatalogPage.css`
- `src/components/Catalog/CatalogPage.jsx` *(комментарии; P2.1 — отдельно)*
- `src/components/Catalog/FavoritesList.css`
- `src/components/Catalog/FavoritesList.jsx`
- `src/components/Catalog/FilterPanel.css`
- `src/components/Catalog/FilterPanel.jsx` *(комментарии; P2.1 — отдельно)*
- `src/components/Catalog/SearchBar.jsx`
- `src/components/Catalog/ServiceCard.css`
- `src/components/Catalog/ServiceCard.jsx`
- `src/components/Catalog/ServiceSelector.css`
- `src/components/Catalog/ServiceSelector.jsx`
- `src/components/Catalog/SortPanel.css`
- `src/components/Catalog/SortPanel.jsx`

#### Profile

- `src/components/Profile/BonusCard.css`
- `src/components/Profile/BonusCard.jsx`
- `src/components/Profile/BookingHistory.css`
- `src/components/Profile/BookingHistory.jsx`
- `src/components/Profile/FavoritesSection.css`
- `src/components/Profile/HistoryCard.css`
- `src/components/Profile/HistoryCard.jsx` *(комментарии; P2.1 — отдельно)*
- `src/components/Profile/ProfilePage.css`
- `src/components/Profile/ProfileStats.css`
- `src/components/Profile/ProfileStats.jsx`
- `src/components/Profile/SettingsForm.css`
- `src/components/Profile/SettingsForm.jsx`

#### UI & Layout

- `src/components/UI/Button.jsx` *(комментарии; P2.1 — отдельно)*
- `src/components/UI/EmptyState.jsx`
- `src/components/UI/Input.css`
- `src/components/UI/Input.jsx`
- `src/components/UI/LanguageToggle.css`
- `src/components/UI/LanguageToggle.jsx`
- `src/components/UI/Spinner.jsx`
- `src/components/UI/ThemeToggle.css`
- `src/components/UI/ThemeToggle.jsx`
- `src/components/UI/Toast.css`
- `src/components/UI/Toast.jsx`
- `src/components/Layout/Layout.css`

#### Data & styles

- `src/data/initialServices.js`
- `src/styles/globals.css`
- `src/styles/tokens.css`

### Риски

- Возможная **потеря контекста** в местах, где маркер (🔥, ЭТАП, ЗАМЕЧАНИЕ №N) шёл рядом с полезным текстом и был удалён целиком вместо переписывания.
- В CSS остались комментарии вида `/* ПОЧЕМУ: … */` с артефактами автозамены (обрезанные заголовки секций) — на синтаксис не влияют, но могут выглядеть неаккуратно; при необходимости — точечная правка.
- Файлы **вне** `src/` (например `README.md`, `package.json`) в P1.2 не входили, но могли измениться в других фазах аудита.

---

## P2.1: Аудит useCallback / useMemo

- **Дата:** 2026-06-30
- **Коммит:** *(не закоммичено на момент создания лога)* — базовая точка в git: `5a5f6f0`. После коммита P2.1 подставьте хеш отдельного коммита или общего коммита рефакторинга.

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

### На защите

- Покажите этот файл как **доказательство осознанного рефакторинга**, а не «случайной чистки».
- Акцент: артефакты ИИ/дневник разработки удалены; остались только «ПОЧЕМУ»; мемоизация оставлена только там, где есть измеримая причина.
- Метрики приёмки P1.2/P2.1: grep маркеров = 0; тесты 77/77; build OK.

### Рекомендуемые коммиты (если ещё не сделаны)

```bash
# P1.2
git add src/ REFACTOR_LOG.md
git commit -m "docs/refactor: remove artifact comments (P1.2)"

# P2.1 (если разделяете)
git add src/hooks/ src/components/
git commit -m "refactor: audit useCallback/useMemo with ПОЧЕМУ comments (P2.1)"
```

После коммита обновите поля **Коммит** в этом файле фактическими хешами.
