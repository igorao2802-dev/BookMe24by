# CHANGELOG — Аудит курсового проекта BookMe24

Дата проверки: 7 июля 2026

## Сводка

| Блок | Статус | Комментарий |
|------|--------|-------------|
| БЛОК 3 — Логические ошибки | ✅ Исправлено | Все 4 проблемы устранены ранее |
| БЛОК 4 — Гигиена | ✅ Исправлено | Мусорные комментарии, мёртвые зависимости, README |
| БЛОК 5 — Тесты | ✅ Исправлено | 23 test suites, 216 тестов, все проходят |
| БЛОК 1 — Архитектура | ⚠️ Частично | Файлы < 300 строк (было 347–648), дальнейшее разбиение опционально |
| БЛОК 2 — Мемоизация | ✅ В норме | Избыточные useCallback/useMemo удалены |
| БЛОК 6 — Стресс-тесты | ⚠️ Частично | Скрипты в `scripts/`, отчёт STRESS_TEST_REPORT.md не создан |

**Проверки:** `npm test` — 216/216 ✅ | `npm run build` — успешно ✅

---

## БЛОК 3: Логические ошибки

### 3.1 Race condition в useLocalStorage — ✅ Исправлено

`latestValueRef` синхронно обновляется в setter; debounced-запись и flush при unmount используют актуальное значение, а не перечитывание из localStorage.

- Файл: `src/hooks/useLocalStorage.js`
- Тест: `src/tests/useLocalStorage.stress.test.js` (10 и 100 быстрых functional updates)

### 3.2 Рассинхрон темы — ✅ Исправлено (вариант B)

`ThemeContext` и `ThemeToggle` согласованы: только `light` / `dark`, без режима `auto`. Режим `auto` намеренно убран, чтобы исключить рассинхрон.

- Файлы: `src/contexts/ThemeContext.jsx`, `src/components/UI/ThemeToggle.jsx`
- Скрипт: `scripts/check-theme-sync.js` — нарушений нет

### 3.3 Дрейф API useBookings — ✅ Исправлено

`useBookings()` объявлен без параметров; вызов из `useSalonData.js` без аргументов. `App.jsx` делегирует в `useInitialData` / `useSalonData`.

- Скрипт: `scripts/check-api-drift.js` — нарушений нет

### 3.4 Противоречие валидации телефона — ✅ Исправлено

`validatePhone(phone, { required })` учитывает обязательность поля. `BookingForm` вызывает с `{ required: true }`, `SettingsForm` — без required (телефон опционален).

- Файлы: `src/utils/validators.js`, `src/components/Booking/BookingForm.jsx`
- Тесты: `src/tests/validators.test.js`, `src/tests/validators-phone-required.test.js`

---

## БЛОК 4: Гигиена проекта

### 4.1 Мусорные комментарии — ✅ Исправлено

В `src/` нет вхождений `🔥`, `ЭТАП`, `ИСПРАВЛЕНО`, `ЗАМЕЧАНИЕ`.

- Скрипт: `scripts/check-noise-comments.js` — нарушений нет

### 4.2 Мёртвые зависимости — ✅ Исправлено

Из `package.json` удалены: `react-hook-form`, `@hookform/resolvers`, `zod`, пакеты `date` / `fns`. Остаются только используемые зависимости (`date-fns`, `react-datepicker` и др.).

### 4.3 Битые скрипты и README — ✅ Исправлено

README приведён в соответствие с `package.json`: нет ложных упоминаний `lint`, `prettier`, `seed`. Скрипт `seed` удалён.

- Скрипт: `scripts/check-broken-scripts.js`, `scripts/check-readme-sync.js` — нарушений нет

---

## БЛОК 5: Тестирование

### 5.1 Покрытие критичной логики — ✅ Добавлено

| Модуль | Тест |
|--------|------|
| `useTimeSlots.js` | `src/tests/useTimeSlots.test.js` |
| `checkTimeOverlap.js` | `src/tests/checkTimeOverlap.test.js` |
| `validateBookingPipeline.js` | `src/tests/validateBookingPipeline.test.js` |
| `useLocalStorage` (stress) | `src/tests/useLocalStorage.stress.test.js` |
| `validators.js` | `src/tests/validators.test.js` |

Всего: **23 test suites, 216 тестов** — все проходят.

Дополнительно к базовому набору (77 кейсов, см. TEST_DOCUMENTATION.md):

| Модуль | Тест |
|--------|------|
| `validators.js` (расширенный) | `validators.comprehensive.test.js` (78 кейсов) |
| `validationMessages.js` | `validationMessages.test.js` |
| `validateService.js` | `validateService.test.js` |
| `bookingWizard/stepValidation.js` | `bookingWizardStepValidation.test.js` |
| `useBookingWizardEffects.js` | `useBookingWizardEffects.test.js` |
| `roleRouting.js` | `roleRouting.test.js` |
| `specialistHelpers.js` | `specialistHelpers.test.js` |
| `phoneInputHelpers.js` | `phoneInputHelpers.test.js` |

### 5.2 Некорректные моки — ✅ Исправлено

`useServices.test.js` и `useSpecialists.test.js` используют `applySetter()` для проверки functional updates `(prev) => ...`, а не готовых массивов.

---

## БЛОК 1: Архитектура (частично)

Крупные «империи» разбиты на подмодули. Текущие размеры:

| Файл | Было (аудит) | Сейчас |
|------|--------------|--------|
| `BookingWizard.jsx` | 648 | 268 |
| `AdminDashboard.jsx` | 411 | 223 |
| `ProfilePage.jsx` | 366 | 233 |
| `ServiceForm.jsx` | 433 | 258 |
| `CatalogPage.jsx` | 347 | 216 |
| `useServices.js` | 360 | 265 |

Логика вынесена в `src/hooks/bookingWizard/`, `src/hooks/adminDashboard/`. Порог аудита — 300 строк (скрипт `check-file-size.js` — нарушений нет). Дальнейшее разбиение до < 200 строк — опционально.

### 1.2 Смешение слоёв (Toast в хуках) — ✅ Исправлено

`useServices`, `useSpecialists` возвращают `{ success, error, data }`. Toast вызывается в UI-слое (`AdminDashboard` → `createToastNotify`). Скрипт `check-layer-violations.js` — нарушений нет.

---

## БЛОК 2: Мемоизация — ✅ В норме

Избыточные `useCallback`/`useMemo` удалены из `AdminDashboard`, `BookingWizard` и др. Скрипт `check-hooks-usage.js` — нарушений нет.

---

## БЛОК 6: Стресс-тесты — ⚠️ Частично

Скрипты в `scripts/`:

- `stress-test-localstorage.js`
- `stress-test-xss.js`
- `stress-test-performance.js`
- `npm run audit:stress` — запуск всех трёх

Полный набор из 26 Playwright-сценариев и `STRESS_TEST_REPORT.md` не реализованы (низкий приоритет).

---

## Изменённые / ключевые файлы (итог рефакторинга)

- `src/hooks/useLocalStorage.js`
- `src/contexts/ThemeContext.jsx`
- `src/components/UI/ThemeToggle.jsx`
- `src/utils/validators.js`
- `src/hooks/useServices.js`, `src/hooks/useSpecialists.js`
- `src/hooks/useAdminDashboard.js`, `src/hooks/adminDashboard/*`
- `src/hooks/bookingWizard/*`
- `src/tests/*` (23 файла)
- `package.json`, `README.md`
- `scripts/check-*.js`, `scripts/run-audit-block*.js`

---

## Критерии готовности

- [x] Все проблемы БЛОКА 3
- [x] Все проблемы БЛОКА 4
- [x] > 50% БЛОКА 5 (фактически 100% критичных модулей)
- [x] CHANGELOG.md
- [x] `npm test` — все тесты проходят
- [x] `npm run build` — сборка без ошибок
