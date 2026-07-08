# TEST_DOCUMENTATION.md

**Проект:** bookme24 — SPA онлайн-записи салона «Здоровье и красота»  
**Домен:** bookme24.by  
**Дата актуализации документа:** 2026-07-07  
**Автор аудита:** Осадчий Игорь Александрович  

---

## 1. Введение

### 1.1 Назначение документа

Настоящий документ описывает автоматизированное тестовое покрытие проекта **bookme24**. Документ предназначен для:

- фиксации реализованных unit-тестов перед защитой курсового проекта;
- трассировки тест-кейсов к бизнес-требованиям (расписание, валидация, админ-панель, бронирование);
- учёта пробелов покрытия и приоритизации доработок ([PROPOSED]).

### 1.2 Тестовый фреймворк

| Компонент | Технология | Версия |
|-----------|------------|--------|
| Test runner | Jest (via Create React App) | 5.0.1 |
| DOM / компоненты | React Testing Library | ^15.0.7 |
| User events | @testing-library/user-event | ^14.5.2 |
| Matchers | @testing-library/jest-dom | ^6.4.5 |

Тесты расположены в каталоге **`src/tests/`** (**23 файла**, **216** автоматизированных кейсов по состоянию на 2026-07-07).

### 1.3 Маркировка тест-кейсов

Схема: **`[Уровень]-[Доступ]-[Способ]-[Тип]`**

| Код | Расшифровка | Применение в проекте |
|-----|-------------|----------------------|
| **UT-WB-AU-FN** | Unit, White Box, Automated, Functional | Основной тип: проверка функций, хуков и утилит |
| **UT-WB-AU-RG** | Unit, White Box, Automated, Regression | Регрессия: P0.2 (race condition localStorage), P0.3 (пустой телефон), защита стандартных сущностей, confirm-flow |

**Уровни:** UT — unit-тест (изолированная функция/хук).  
**Доступ:** WB — белый ящик (знание внутренней реализации, моки зависимостей).  
**Способ:** AU — автоматизированный (Jest + RTL).  
**Тип:** FN — функциональный; RG — регрессионный.

### 1.4 Формат таблиц (IEEE 829)

Детальные кейсы оформлены по полям IEEE 829:

| Колонка | Содержание |
|---------|------------|
| **Код** | Уникальный идентификатор кейса |
| **Название** | Краткое имя сценария |
| **Цель** | Что проверяется с точки зрения требований |
| **Описание** | Суть сценария |
| **Предусловия** | Начальное состояние / моки |
| **Шаги** | Последовательность действий в тесте |
| **Ожидаемый результат** | Assert-условия |

---

## 2. Архитектура тестов

### 2.1 Сводная таблица модулей

| № | Модуль | Файлы тестов | Авто | RG | PROPOSED |
|---|--------|--------------|------|----|----------|
| 1 | Инфраструктура / Хранение | `useLocalStorage.test.js`, `useLocalStorage.stress.test.js` | 10 | 3 | 0 |
| 2 | Расписание и слоты | `checkTimeOverlap.test.js`, `useTimeSlots.test.js`, `validateBookingPipeline.test.js` | 16 | 0 | 6 |
| 3 | Валидация и форматирование | `validators.test.js`, `validators.comprehensive.test.js`, `validators-phone-required.test.js`, `validationMessages.test.js`, `formatters.test.js`, `phoneInputHelpers.test.js` | 124 | 4 | 2 |
| 4 | Админ | `useServices.test.js`, `useSpecialists.test.js`, `useSalonData.test.js`, `bookingsFilter.test.js`, `validateService.test.js` | 34 | 2 | 1 |
| 5 | Бронирование | `useBookingWizard.confirm.test.js`, `useBookingWizardEffects.test.js`, `bookingWizardStepValidation.test.js` | 13 | 2 | 1 |
| 6 | Личный кабинет | `profileHelpers.test.js` | 8 | 0 | 2 |
| 7 | Специалист / роли | `specialistHelpers.test.js`, `roleRouting.test.js` | 6 | 0 | 0 |
| 8 | UI / Диалоги | `useConfirmDialog.test.js` | 5 | 0 | 0 |
| | **Итого** | **23 файла** | **216** | **10** | **12** |

### 2.2 Карта файлов → тестируемые модули

```
src/tests/
├── useLocalStorage.test.js              → hooks/useLocalStorage
├── useLocalStorage.stress.test.js       → hooks/useLocalStorage (race condition)
├── checkTimeOverlap.test.js             → utils/checkTimeOverlap
├── useTimeSlots.test.js                 → hooks/useTimeSlots
├── validateBookingPipeline.test.js      → utils/validateBookingPipeline
├── validators.test.js                   → utils/validators
├── validators.comprehensive.test.js     → utils/validators, sanitizers, numberHelpers
├── validators-phone-required.test.js    → utils/validators (required flag)
├── validationMessages.test.js           → utils/validationMessages
├── formatters.test.js                   → utils/formatters
├── phoneInputHelpers.test.js            → utils/phoneInputHelpers
├── useServices.test.js                  → hooks/useServices
├── useSpecialists.test.js               → hooks/useSpecialists
├── useSalonData.test.js                 → hooks/useSalonData
├── validateService.test.js              → utils/validateService
├── bookingsFilter.test.js               → utils/bookingsHelpers
├── useBookingWizard.confirm.test.js     → hooks/useBookingWizard
├── useBookingWizardEffects.test.js      → hooks/bookingWizard/useBookingWizardEffects
├── bookingWizardStepValidation.test.js  → hooks/bookingWizard/stepValidation
├── profileHelpers.test.js               → utils/profileHelpers
├── specialistHelpers.test.js            → utils/specialistHelpers
├── roleRouting.test.js                  → utils/roleRouting
└── useConfirmDialog.test.js             → hooks/useConfirmDialog, UI/ConfirmDialog
```

### 2.3 Зависимости и моки (типовые)

| Область | Мокируемые зависимости |
|---------|------------------------|
| Хуки админки | `useLanguage`, `Toast` |
| useSalonData | `useBookings`, `useLocalStorage`, `generateId` |
| useBookingWizard | `react-router-dom`, `useLocalStorage`, `useRateLimiter`, `Toast`, `audioHelper` |
| useTimeSlots | `jest.setSystemTime` (фиксация «сейчас») |
| useLocalStorage | `jest.useFakeTimers`, `localStorage` (очистка в beforeEach) |

### 2.4 Реестр тестов по файлам

| Файл | describe / test | Кол-во | Коды кейсов |
|------|-----------------|--------|-------------|
| `useLocalStorage.test.js` | useLocalStorage | 7 | INF-001…007 |
| `useLocalStorage.stress.test.js` | useLocalStorage — stress | 2 | INF-RG-001…002 |
| `checkTimeOverlap.test.js` | checkTimeOverlap | 6 | SCH-001…006 |
| `checkTimeOverlap.test.js` | isWithinWorkingHours | 2 | SCH-007…008 |
| `useTimeSlots.test.js` | useTimeSlots | 4 | SCH-009…012 |
| `validateBookingPipeline.test.js` | assertBookingDuration | 2 | SCH-013…014 |
| `validateBookingPipeline.test.js` | validateBookingBeforeSave | 2 | SCH-015…016 |
| `validators.test.js` | validateBookingForm | 5 | VAL-001…004, VAL-RG-001 |
| `validators.test.js` | validatePhone | 6 | VAL-RG-002…003, VAL-005…008 |
| `validators.test.js` | validateEmail | 3 | VAL-009…011 |
| `formatters.test.js` | formatters.normalizePhone | 2 | VAL-012…013 |
| `useServices.test.js` | useServices | 5 | ADM-001…004, ADM-RG-001 |
| `useSpecialists.test.js` | useSpecialists | 5 | ADM-005…008, ADM-RG-002 |
| `useSalonData.test.js` | useSalonData | 3 | ADM-009…011 |
| `bookingsFilter.test.js` | filterBookings | 5 | ADM-012…016 |
| `bookingsFilter.test.js` | sortBookings | 3 | ADM-017…019 |
| `bookingsFilter.test.js` | countActiveFilters | 2 | ADM-020…021 |
| `useBookingWizard.confirm.test.js` | useBookingWizard — confirm | 2 | BKN-RG-001…002 |
| `profileHelpers.test.js` | filterClientBookings | 4 | PRF-001…004 |
| `profileHelpers.test.js` | computeClientStats | 1 | PRF-005 |
| `profileHelpers.test.js` | deriveProfileData | 3 | PRF-006…008 |
| `useConfirmDialog.test.js` | useConfirmDialog, ConfirmDialog | 5 | UI-001…005 |

> **Примечание:** раздел **3** — базовый набор v1.0 (77 кейсов). Раздел **3.1** — полные IEEE-таблицы для **139 новых** кейсов v1.1 (216 − 77).

### 2.5 Среда выполнения тестов

| Параметр | Значение |
|----------|----------|
| Node.js | ≥ 18.0.0 (см. `package.json` engines) |
| Test environment | jsdom (CRA default) |
| Timers | fake timers в useLocalStorage; system time в useTimeSlots |
| Storage | `window.localStorage` очищается в beforeEach |
| Язык тестов | Русские названия `test("...")` для читаемости отчёта |

---

## 3. Детальные тест-кейсы

### Модуль 1: Инфраструктура / Хранение

**Источник:** `useLocalStorage.test.js` (7 кейсов), `useLocalStorage.stress.test.js` (2 кейса)  
**Тестируемый объект:** `src/hooks/useLocalStorage.js`

#### 1.1 Базовые операции (useLocalStorage.test.js)

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| INF-001 | Начальное значение | UT-WB-AU-FN | Хук возвращает default при отсутствии ключа в storage | `localStorage` пуст; fake timers включены | `renderHook(() => useLocalStorage("test-key", "initial"))` | `result.current[0] === "initial"` |
| INF-002 | Запись в localStorage | UT-WB-AU-FN | Setter сохраняет значение в storage | `debounceMs: 0` | Вызвать setter `"new-value"`, прогнать таймеры | `localStorage.getItem("test-key") === JSON.stringify("new-value")` |
| INF-003 | Обновление state | UT-WB-AU-FN | React-state синхронно обновляется setter'ом | Ключ `"test-key"`, initial `"initial"` | Setter `"updated-value"` | `result.current[0] === "updated-value"` |
| INF-004 | Удаление ключа | UT-WB-AU-FN | remove сбрасывает storage и возвращает initial | Значение записано в storage | Вызвать `result.current[2]()` (remove) | `localStorage.getItem` — null; state — `"initial"` |
| INF-005 | Функциональное обновление | UT-WB-AU-FN | Setter принимает updater `(prev) => next` | Counter initial `0` | `set(prev => prev + 1)` | `result.current[0] === 1` |
| INF-006 | Debounce записи | UT-WB-AU-FN | Запись в storage откладывается на debounceMs | `debounceMs: 300` | Setter, до таймера — проверка storage; `advanceTimersByTime(300)` | До таймера — null; после — JSON значение |
| INF-007 | Sync между вкладками | UT-WB-AU-FN | Событие `storage` обновляет state | Хук с ключом `"sync-key"` | `dispatchEvent(StorageEvent)` с `newValue` | `result.current[0] === "from-other-tab"` |

#### 1.2 Stress / race condition (useLocalStorage.stress.test.js)

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| INF-RG-001 | 10 быстрых increment без debounce | UT-WB-AU-RG | P0.2: финальное значение при серии functional updates | `debounceMs: 0`, counter `0` | 10× `set(prev => prev + 1)` в одном act | state `10`; storage `JSON.stringify(10)` |
| INF-RG-002 | 10 быстрых append с debounce | UT-WB-AU-RG | P0.2: debounce не теряет финальный массив | `debounceMs: 300`, initial `[]` | 10× append `item-i`; advance 300ms | state length 10; storage содержит все 10 элементов |
| INF-RG-003 | 100 быстрых increment с debounce | UT-WB-AU-RG | P0.2: stress 100 updates, real timers | `debounceMs: 500`, counter `0` | 100× `set(prev => prev + 1)`; await 600ms | state `100`; storage `JSON.stringify(100)` |

---

### Модуль 2: Расписание и слоты

#### 2.1 checkTimeOverlap (checkTimeOverlap.test.js)

**Тестируемый объект:** `src/utils/checkTimeOverlap.js`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| SCH-001 | Разные мастера | UT-WB-AU-FN | Окна разных specialistId не пересекаются | Запись sp-1 10:00, duration 120 | Новая запись sp-2 10:30, duration 60 | `hasOverlap === false` |
| SCH-002 | Пересечение через 20 мин | UT-WB-AU-FN | 2-часовая услуга + старт +20 мин → overlap | baseExisting sp-1, 10:00, 120 мин | Новая 10:20, 60 мин, buffer 15 | `hasOverlap === true`; conflicting id `booking-1` |
| SCH-003 | Старт в зоне буфера (12:00) | UT-WB-AU-FN | Буфер 15 мин после услуги учитывается | 10:00 + 120 мин + 15 buffer → до 12:15 | Старт 12:00, duration 30 | `hasOverlap === true` |
| SCH-004 | Старт после буфера (12:15) | UT-WB-AU-FN | Запись сразу после буфера разрешена | Та же baseExisting | Старт 12:15, duration 30 | `hasOverlap === false` |
| SCH-005 | Игнор cancelled | UT-WB-AU-FN | Отменённые записи не блокируют слот | existing со status `cancelled` | Новая 10:30, 60 мин | `hasOverlap === false` |
| SCH-006 | Исключение при редактировании | UT-WB-AU-FN | При edit id совпадает — self не конфликтует | existing id `booking-1` | Новая с тем же id, 10:00, 120 | `hasOverlap === false` |
| SCH-007 | isWithinWorkingHours — за конец смены | UT-WB-AU-FN | Запись выходит за 18:00 отклоняется | specialist пн–пт 09:00–18:00 | date пн, start 17:30, duration 60 | `isWithin === false` |
| SCH-008 | isWithinWorkingHours — в пределах смены | UT-WB-AU-FN | Запись в рабочем окне принимается | Тот же specialist | start 10:00, duration 60 | `isWithin === true` |

#### 2.2 useTimeSlots (useTimeSlots.test.js)

**Тестируемый объект:** `src/hooks/useTimeSlots.js`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| SCH-009 | Нет обязательных параметров | UT-WB-AU-FN | Хук возвращает ошибку без date/specialist/service | `setSystemTime` 2026-06-29 08:00 | `useTimeSlots({ date: null, specialist: null, service: null })` | `slots === []`; `error` truthy |
| SCH-010 | Нерабочий день (воскресенье) | UT-WB-AU-FN | Воскресенье — пустой список окон | specialist с `"0": null`, `"6": null` | date 2026-07-05 (вс) | `slots === []`; error содержит «не работает» |
| SCH-011 | Генерация окон в рабочий день | UT-WB-AU-FN | Рабочий день даёт непустой массив слотов | date 2026-06-30, stepMinutes 60 | renderHook useTimeSlots | `error === null`; slots.length > 0; объекты с startTime, endTime, isAvailable |
| SCH-012 | Занятость при пересечении | UT-WB-AU-FN | Существующая запись блокирует пересекающиеся окна | existing 11:00, duration 120 | Проверить слоты 11:00 и 14:00 | 11:00 `isAvailable === false`; 14:00 `isAvailable === true` |

#### 2.3 validateBookingPipeline (validateBookingPipeline.test.js)

**Тестируемый объект:** `src/utils/validateBookingPipeline.js`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| SCH-013 | assertBookingDuration без duration | UT-WB-AU-FN | Pipeline отклоняет запись без duration | Объект `{ startTime: "10:00" }` | `assertBookingDuration(...)` | `ok === false`; error `BOOKING_DURATION_ERROR_KEY` |
| SCH-014 | assertBookingDuration duration > 0 | UT-WB-AU-FN | Положительный duration проходит | `{ duration: 60 }` | `assertBookingDuration(...)` | `ok === true` |
| SCH-015 | validateBeforeSave без duration | UT-WB-AU-FN | Overlap не проверяется до валидации duration | existing b1 10:00; новая без duration | `validateBookingBeforeSave(...)` | `isValid === false`; error duration key |
| SCH-016 | validateBeforeSave overlap | UT-WB-AU-FN | При valid duration обнаруживается пересечение | existing 10:00, 60 мин | Новая 10:30, 60 мин | `isValid === false`; error содержит `"10:00"` |

---

### Модуль 3: Валидация и форматирование

#### 3.1 validateBookingForm (validators.test.js)

**Тестируемый объект:** `src/utils/validators.js` → `validateBookingForm`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| VAL-001 | Валидные данные | UT-WB-AU-FN | Полная форма проходит валидацию | name, phone +37529..., email | `validateBookingForm(validData)` | `isValid === true`; errors пуст |
| VAL-002 | Без имени | UT-WB-AU-FN | Пустое имя — ошибка | clientName `""` | validateBookingForm | `isValid === false`; `errors.clientName === "validation.name.required"` |
| VAL-003 | Некорректный телефон | UT-WB-AU-FN | Короткий/невалидный phone | clientPhone `"123"` | validateBookingForm | `isValid === false`; clientPhone error defined |
| VAL-RG-001 | Пустой телефон (P0.3) | UT-WB-AU-RG | Регрессия: пустой phone обязателен в форме записи | clientPhone `""` | validateBookingForm | `isValid === false`; `errors.clientPhone === "validation.phone.required"` |
| VAL-004 | Некорректный email | UT-WB-AU-FN | Невалидный формат email | clientEmail `"invalid-email"` | validateBookingForm | `isValid === false`; `errors.clientEmail === "validation.email.invalid"` |

#### 3.2 validatePhone (validators.test.js)

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| VAL-RG-002 | Пустая строка required=true | UT-WB-AU-RG | Обязательный телефон в форме записи | `validatePhone("", { required: true })` | — | `isValid === false`; errorKey `validation.phone.required` |
| VAL-RG-003 | Пустая строка required=false | UT-WB-AU-RG | Опциональный телефон в профиле | `validatePhone("", { required: false })` | — | `isValid === true` |
| VAL-005 | Корректный номер РБ | UT-WB-AU-FN | +37529... принимается | `"+375291234567"` | validatePhone | `isValid === true` |
| VAL-006 | Короткий номер | UT-WB-AU-FN | Недостаточная длина | `"+37529123"` | validatePhone | `isValid === false`; errorKey `validation.phone.tooShort` |
| VAL-007 | Неверный префикс | UT-WB-AU-FN | Не +375 | `"+792912345678"` | validatePhone | `isValid === false`; errorKey `validation.phone.invalidPrefix` |
| VAL-008 | Недопустимый код оператора | UT-WB-AU-FN | Код не из 17/25/29/33/44 | `"+375121234567"` | validatePhone | `isValid === false`; errorKey `validation.phone.invalidCode` |

#### 3.3 validateEmail (validators.test.js)

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| VAL-009 | Корректный email | UT-WB-AU-FN | Стандартный адрес | `"test@example.com"` | validateEmail | `isValid === true` |
| VAL-010 | Без @ | UT-WB-AU-FN | Отсутствие @ | `"invalid-email"` | validateEmail | `isValid === false`; errorKey `validation.email.invalid` |
| VAL-011 | Слишком длинный | UT-WB-AU-FN | Превышение лимита длины | 250×`a` + `@example.com` | validateEmail | `isValid === false`; errorKey `validation.email.tooLong` |

#### 3.4 normalizePhone (formatters.test.js)

**Тестируемый объект:** `src/utils/formatters.js` → `normalizePhone`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| VAL-012 | Удаление нецифровых символов | UT-WB-AU-FN | Форматированный ввод → только цифры | `"+375 (29) 123-45-67"` | normalizePhone | `"375291234567"` |
| VAL-013 | Пустой/невалидный ввод | UT-WB-AU-FN | Edge cases возвращают `""` | `""`, null, undefined, число | normalizePhone для каждого | Все результаты `""` |

---

### Модуль 4: Админ

#### 4.1 useServices (useServices.test.js)

**Тестируемый объект:** `src/hooks/useServices.js`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| ADM-001 | Создание услуги | UT-WB-AU-FN | addService добавляет кастомную услугу | customServices `[]`; моки Toast/Language | addService с name, category, duration, price | `success === true`; setCustomServices вызван с новой услугой |
| ADM-002 | Отклонение без названия | UT-WB-AU-FN | Валидация обязательного name | name `""` | addService | `success === false`; error `validation.service.nameRequired` |
| ADM-003 | Обновление услуги | UT-WB-AU-FN | updateService меняет поля | customServices с test-service-1 | updateService id, `{ name: "Новое название" }` | `success === true`; state содержит новое name |
| ADM-004 | Удаление кастомной услуги | UT-WB-AU-FN | deleteService удаляет isCustom | customServices с isCustom true | deleteService id | `success === true`; массив пуст |
| ADM-RG-001 | Защита стандартной услуги | UT-WB-AU-RG | JSON-услуга isCustom false не удаляется | jsonServices со standard-service-1 | deleteService standard id | `success === false`; error `validation.service.cannotDeleteStandard` |

#### 4.2 useSpecialists (useSpecialists.test.js)

**Тестируемый объект:** `src/hooks/useSpecialists.js`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| ADM-005 | Создание специалиста | UT-WB-AU-FN | addSpecialist с ФИО и должностью | customSpecialists `[]` | addSpecialist fullName, position, experience | `success === true`; rating 4.5 по умолчанию |
| ADM-006 | Отклонение без ФИО | UT-WB-AU-FN | fullName обязателен | fullName `""` | addSpecialist | `success === false`; error `validation.specialist.nameRequired` |
| ADM-007 | Обновление специалиста | UT-WB-AU-FN | updateSpecialist меняет поля | custom specialist test-specialist-1 | updateSpecialist id, new fullName | `success === true` |
| ADM-008 | Удаление кастомного | UT-WB-AU-FN | delete кастомного мастера | isCustom true | deleteSpecialist | `success === true`; массив пуст |
| ADM-RG-002 | Защита стандартного | UT-WB-AU-RG | JSON-специалист не удаляется | jsonSpecialists isCustom false | deleteSpecialist standard id | `success === false`; error `validation.specialist.cannotDeleteStandard` |

#### 4.3 useSalonData (useSalonData.test.js)

**Тестируемый объект:** `src/hooks/useSalonData.js`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| ADM-009 | addService sync в одном act | UT-WB-AU-FN | Услуга + serviceIds мастера без перезагрузки | mock useLocalStorage; custom_spec_1 | addService с specialistIds; rerender | setCustomServices и setCustomSpecialists по 1 разу; specialist.serviceIds содержит new id |
| ADM-010 | serviceIds без перезагрузки | UT-WB-AU-FN | Связь мастер↔услуга сразу в state | Тот же setup | addService + applySetter + rerender | specialist.serviceIds содержит id новой услуги |
| ADM-011 | specialistsWithServices для JSON-мастера | UT-WB-AU-FN | JSON-мастер обогащается связями | jsonSpecialists spc_json_1 | addService с specialistIds json id | enriched.serviceIds содержит id услуги |

#### 4.4 bookingsFilter (bookingsFilter.test.js)

**Тестируемый объект:** `src/utils/bookingsHelpers.js`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| ADM-012 | filterBookings по статусу | UT-WB-AU-FN | Фильтр confirmed | mockBookings 3 записи | filterBookings `{ status: "confirmed" }` | length 1; id `"1"` |
| ADM-013 | filterBookings по специалисту | UT-WB-AU-FN | Фильтр specialistId | mockBookings | `{ specialistId: "spec-1" }` | length 2 |
| ADM-014 | filterBookings по searchQuery | UT-WB-AU-FN | Поиск по имени клиента | mockBookings | `{ searchQuery: "Иванова" }` | length 1; clientName «Иванова Анна» |
| ADM-015 | filterBookings диапазон дат | UT-WB-AU-FN | dateFrom / dateTo | mockBookings | июль 2026 | length 2 |
| ADM-016 | filterBookings комбинация | UT-WB-AU-FN | Несколько фильтров AND | mockBookings | status confirmed + spec-1 | length 1; id `"1"` |
| ADM-017 | sortBookings date-desc | UT-WB-AU-FN | Новые сверху | mockBookings | sortBookings `"date-desc"` | first date `2026-07-10`; last `2026-06-15` |
| ADM-018 | sortBookings date-asc | UT-WB-AU-FN | Старые сверху | mockBookings | sortBookings `"date-asc"` | first `2026-06-15`; last `2026-07-10` |
| ADM-019 | sortBookings по имени | UT-WB-AU-FN | Алфавит по clientName | mockBookings | sortBookings `"client"` | Иванова → Петров → Сидорова |
| ADM-020 | countActiveFilters дефолт | UT-WB-AU-FN | Пустые фильтры = 0 | filters all/default | countActiveFilters | `0` |
| ADM-021 | countActiveFilters несколько | UT-WB-AU-FN | Подсчёт активных | search + status + dateFrom | countActiveFilters | `3` |

---

### Модуль 5: Бронирование

**Источник:** `useBookingWizard.confirm.test.js`  
**Тестируемый объект:** `src/hooks/useBookingWizard.js` → `handleClearForm`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| BKN-RG-001 | confirm true → clearDraft | UT-WB-AU-RG | Пользователь подтверждает очистку формы | mock confirm resolves true; mock clearDraft | handleClearForm | confirm вызван с message/variant; clearDraft 1 раз |
| BKN-RG-002 | confirm false → draft сохранён | UT-WB-AU-RG | Отмена — черновик не трогается | confirm resolves false | handleClearForm | confirm вызван; clearDraft не вызван |

---

### Модуль 6: Личный кабинет

**Источник:** `profileHelpers.test.js`  
**Тестируемый объект:** `src/utils/profileHelpers.js`

#### 6.1 filterClientBookings

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| PRF-001 | Совпадение по нормализованному телефону | UT-WB-AU-FN | Форматированный phone матчит записи | mockBookings 4 записи | filterClientBookings `"+375 (29) 123-45-67"` | length 3; ids 1, 3, 4 |
| PRF-002 | Несовпадение телефона | UT-WB-AU-FN | Чужой номер — пустой результат | mockBookings | `"+375 (44) 999-99-99"` | `[]` |
| PRF-003 | Пустой входной массив | UT-WB-AU-FN | Edge case пустого списка | bookings `[]` | filter с любым phone | `[]` |
| PRF-004 | Пустой phone | UT-WB-AU-FN | Без фильтра — все записи date desc | mockBookings | filterClientBookings `""` | length 4; first date 2026-07-10 |

#### 6.2 computeClientStats

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| PRF-005 | Статистика клиента и салона | UT-WB-AU-FN | total, confirmed, cancelled, spent | mockBookings | filter +375291234567 → computeClientStats; затем все bookings | Клиент: total 3, confirmed 2, cancelled 0, spent 130; салон: total 4, cancelled 1 |

#### 6.3 deriveProfileData

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| PRF-006 | Приоритет userSettings | UT-WB-AU-FN | phone/email из settings перекрывают profile | profileData + userSettings | deriveProfileData | name из profile; phone/email из settings |
| PRF-007 | null profileData | UT-WB-AU-FN | Нет профиля — null | profileData null | deriveProfileData | `null` |
| PRF-008 | Пустые userSettings | UT-WB-AU-FN | Fallback на profileData | profileData заполнен; settings `{}` | deriveProfileData | возвращает profileData as-is |

---

### Модуль 7: UI / Диалоги

**Источник:** `useConfirmDialog.test.js`

#### 7.1 useConfirmDialog

**Тестируемый объект:** `src/hooks/useConfirmDialog.js`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| UI-001 | confirm → resolve true | UT-WB-AU-FN | Promise resolve при onConfirm | renderHook useConfirmDialog | confirm({ title, message, variant }); onConfirm | promise resolves true; isOpen false |
| UI-002 | cancel → resolve false | UT-WB-AU-FN | Promise resolve false при onCancel | renderHook | confirm; onCancel | promise resolves false; isOpen false |

#### 7.2 ConfirmDialog компонент

**Тестируемый объект:** `src/components/UI/ConfirmDialog.jsx`

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| UI-003 | Рендер и клик Confirm | UT-WB-AU-FN | Изолированный рендер диалога | isOpen true; message «Вы уверены?» | render; focus на Cancel; click «Да» | message in document; onConfirm 1 раз |
| UI-004 | Подписи по умолчанию без labels | UT-WB-AU-FN | Fallback i18n при отсутствии props | ConfirmDialog без confirmLabel/cancelLabel | render | кнопки «Отмена» / «Подтвердить» |
| UI-005 | Подписи по умолчанию при пустых строках | UT-WB-AU-FN | Fallback при confirmLabel="" | isOpen; пустые labels | render | кнопки «Отмена» / «Подтвердить» |

---

## 3.1 Дополнительные тест-кейсы v1.1 (IEEE 829)

**Дата:** 2026-07-07 | **Новых кейсов:** 139 (216 всего − 77 базовых v1.0)

Схема кодов v1.1: VCP — comprehensive validators; VPR — phone required API; VMS — validationMessages; SVC — validateService; BWS — wizard stepValidation; BKE — wizard effects; RRT — roleRouting; SPH — specialistHelpers; PHN — phoneInputHelpers.

### 3.1.1 useLocalStorage.stress.test.js (1 кейсов)

**Тестируемый объект:** src/hooks/useLocalStorage

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| INF-RG-003 | 100 быстрых functional updates с debounce → финальное значение в storage | UT-WB-AU-RG | P0.2: 100 быстрых functional updates с debounce | 100 быстрых functional updates с debounce → финальное значение в storage | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий 100 быстрых functional updates с debounce → финальное значение в storage через useLocalStorage — stress (race condition) | Jest assert в useLocalStorage.stress.test.js: 100 быстрых functional updates с debounce → финальное значение в storage |

### 3.1.2 validators.test.js (8 кейсов)

**Тестируемый объект:** src/utils/validators (validateEmail расширение)

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| VAL-014 | невалидный email invalid-email → validation.email.noAt | UT-WB-AU-FN | Детализация ошибок email и граничных случаев | невалидный email invalid-email → validation.email.noAt | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email invalid-email → validation.email.noAt через validateEmail | Jest assert в validators.test.js: невалидный email invalid-email → validation.email.noAt |
| VAL-015 | невалидный email test@ → validation.email.noDomain | UT-WB-AU-FN | Детализация ошибок email и граничных случаев | невалидный email test@ → validation.email.noDomain | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email test@ → validation.email.noDomain через validateEmail | Jest assert в validators.test.js: невалидный email test@ → validation.email.noDomain |
| VAL-016 | невалидный email @mail.ru → validation.email.emptyLocal | UT-WB-AU-FN | Детализация ошибок email и граничных случаев | невалидный email @mail.ru → validation.email.emptyLocal | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email @mail.ru → validation.email.emptyLocal через validateEmail | Jest assert в validators.test.js: невалидный email @mail.ru → validation.email.emptyLocal |
| VAL-017 | невалидный email test@mail → validation.email.noDomainDot | UT-WB-AU-FN | Детализация ошибок email и граничных случаев | невалидный email test@mail → validation.email.noDomainDot | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email test@mail → validation.email.noDomainDot через validateEmail | Jest assert в validators.test.js: невалидный email test@mail → validation.email.noDomainDot |
| VAL-018 | невалидный email test@mail.c → validation.email.shortTld | UT-WB-AU-FN | Детализация ошибок email и граничных случаев | невалидный email test@mail.c → validation.email.shortTld | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email test@mail.c → validation.email.shortTld через validateEmail | Jest assert в validators.test.js: невалидный email test@mail.c → validation.email.shortTld |
| VAL-019 | невалидный email user@domain.a → validation.email.shortTld | UT-WB-AU-FN | Детализация ошибок email и граничных случаев | невалидный email user@domain.a → validation.email.shortTld | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email user@domain.a → validation.email.shortTld через validateEmail | Jest assert в validators.test.js: невалидный email user@domain.a → validation.email.shortTld |
| VAL-020 | невалидный email --dee@dd.g → validation.email.startsWithDash | UT-WB-AU-FN | Детализация ошибок email и граничных случаев | невалидный email --dee@dd.g → validation.email.startsWithDash | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email --dee@dd.g → validation.email.startsWithDash через validateEmail | Jest assert в validators.test.js: невалидный email --dee@dd.g → validation.email.startsWithDash |
| VAL-021 | должен отклонить слишком длинный email | UT-WB-AU-FN | Детализация ошибок email и граничных случаев | должен отклонить слишком длинный email | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий должен отклонить слишком длинный email через validateEmail | Jest assert в validators.test.js: должен отклонить слишком длинный email |

### 3.1.3 validators.comprehensive.test.js (82 кейсов)

**Тестируемый объект:** src/utils/validators, sanitizers, numberHelpers

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| VCP-001 | отклоняет пустое значение null | UT-WB-AU-FN | Проверка validateRequired | отклоняет пустое значение null | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий отклоняет пустое значение null через validateRequired | Jest assert в validators.comprehensive.test.js: отклоняет пустое значение null |
| VCP-002 | отклоняет пустое значение undefined | UT-WB-AU-FN | Проверка validateRequired | отклоняет пустое значение undefined | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий отклоняет пустое значение undefined через validateRequired | Jest assert в validators.comprehensive.test.js: отклоняет пустое значение undefined |
| VCP-003 | отклоняет пустое значение "" | UT-WB-AU-FN | Проверка validateRequired | отклоняет пустое значение "" | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий отклоняет пустое значение "" через validateRequired | Jest assert в validators.comprehensive.test.js: отклоняет пустое значение "" |
| VCP-004 | отклоняет пустое значение "   " | UT-WB-AU-FN | Проверка validateRequired | отклоняет пустое значение "   " | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий отклоняет пустое значение "   " через validateRequired | Jest assert в validators.comprehensive.test.js: отклоняет пустое значение "   " |
| VCP-005 | принимает значение "text" | UT-WB-AU-FN | Проверка validateRequired | принимает значение "text" | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий принимает значение "text" через validateRequired | Jest assert в validators.comprehensive.test.js: принимает значение "text" |
| VCP-006 | принимает значение 0 | UT-WB-AU-FN | Проверка validateRequired | принимает значение 0 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий принимает значение 0 через validateRequired | Jest assert в validators.comprehensive.test.js: принимает значение 0 |
| VCP-007 | принимает значение false | UT-WB-AU-FN | Проверка validateRequired | принимает значение false | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий принимает значение false через validateRequired | Jest assert в validators.comprehensive.test.js: принимает значение false |
| VCP-008 | required=false пропускает пустую строку | UT-WB-AU-FN | Проверка validateRequired | required=false пропускает пустую строку | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий required=false пропускает пустую строку через validateRequired | Jest assert в validators.comprehensive.test.js: required=false пропускает пустую строку |
| VCP-009 | валидный номер +375291234567 | UT-WB-AU-FN | Проверка validatePhone | валидный номер +375291234567 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидный номер +375291234567 через validatePhone | Jest assert в validators.comprehensive.test.js: валидный номер +375291234567 |
| VCP-010 | валидный форматированный номер | UT-WB-AU-FN | Проверка validatePhone | валидный форматированный номер | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидный форматированный номер через validatePhone | Jest assert в validators.comprehensive.test.js: валидный форматированный номер |
| VCP-011 | неверный код оператора | UT-WB-AU-FN | Проверка validatePhone | неверный код оператора | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий неверный код оператора через validatePhone | Jest assert в validators.comprehensive.test.js: неверный код оператора |
| VCP-012 | короткий номер | UT-WB-AU-FN | Проверка validatePhone | короткий номер | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий короткий номер через validatePhone | Jest assert в validators.comprehensive.test.js: короткий номер |
| VCP-013 | пустой с required:true | UT-WB-AU-FN | Проверка validatePhone | пустой с required:true | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий пустой с required:true через validatePhone | Jest assert в validators.comprehensive.test.js: пустой с required:true |
| VCP-014 | пустой с required:false | UT-WB-AU-FN | Проверка validatePhone | пустой с required:false | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий пустой с required:false через validatePhone | Jest assert в validators.comprehensive.test.js: пустой с required:false |
| VCP-015 | XSS в телефоне | UT-WB-AU-FN | Проверка validatePhone | XSS в телефоне | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий XSS в телефоне через validatePhone | Jest assert в validators.comprehensive.test.js: XSS в телефоне |
| VCP-016 | SQL-инъекция в телефоне | UT-WB-AU-FN | Проверка validatePhone | SQL-инъекция в телефоне | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий SQL-инъекция в телефоне через validatePhone | Jest assert в validators.comprehensive.test.js: SQL-инъекция в телефоне |
| VCP-017 | пустая строка валидна | UT-WB-AU-FN | Проверка validateEmail | пустая строка валидна | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий пустая строка валидна через validateEmail | Jest assert в validators.comprehensive.test.js: пустая строка валидна |
| VCP-018 | валидный email test@mail.ru | UT-WB-AU-FN | Проверка validateEmail | валидный email test@mail.ru | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидный email test@mail.ru через validateEmail | Jest assert в validators.comprehensive.test.js: валидный email test@mail.ru |
| VCP-019 | валидный email user.name@domain.com | UT-WB-AU-FN | Проверка validateEmail | валидный email user.name@domain.com | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидный email user.name@domain.com через validateEmail | Jest assert в validators.comprehensive.test.js: валидный email user.name@domain.com |
| VCP-020 | невалидный email test@ → validation.email.noDomain | UT-WB-AU-FN | Проверка validateEmail | невалидный email test@ → validation.email.noDomain | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email test@ → validation.email.noDomain через validateEmail | Jest assert в validators.comprehensive.test.js: невалидный email test@ → validation.email.noDomain |
| VCP-021 | невалидный email @mail.ru → validation.email.emptyLocal | UT-WB-AU-FN | Проверка validateEmail | невалидный email @mail.ru → validation.email.emptyLocal | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email @mail.ru → validation.email.emptyLocal через validateEmail | Jest assert в validators.comprehensive.test.js: невалидный email @mail.ru → validation.email.emptyLocal |
| VCP-022 | невалидный email test@mail → validation.email.noDomainDot | UT-WB-AU-FN | Проверка validateEmail | невалидный email test@mail → validation.email.noDomainDot | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email test@mail → validation.email.noDomainDot через validateEmail | Jest assert в validators.comprehensive.test.js: невалидный email test@mail → validation.email.noDomainDot |
| VCP-023 | невалидный email invalid-email → validation.email.noAt | UT-WB-AU-FN | Проверка validateEmail | невалидный email invalid-email → validation.email.noAt | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email invalid-email → validation.email.noAt через validateEmail | Jest assert в validators.comprehensive.test.js: невалидный email invalid-email → validation.email.noAt |
| VCP-024 | невалидный email test@mail.c → validation.email.shortTld | UT-WB-AU-FN | Проверка validateEmail | невалидный email test@mail.c → validation.email.shortTld | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email test@mail.c → validation.email.shortTld через validateEmail | Jest assert в validators.comprehensive.test.js: невалидный email test@mail.c → validation.email.shortTld |
| VCP-025 | невалидный email user@domain.a → validation.email.shortTld | UT-WB-AU-FN | Проверка validateEmail | невалидный email user@domain.a → validation.email.shortTld | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидный email user@domain.a → validation.email.shortTld через validateEmail | Jest assert в validators.comprehensive.test.js: невалидный email user@domain.a → validation.email.shortTld |
| VCP-026 | XSS в email | UT-WB-AU-FN | Проверка validateEmail | XSS в email | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий XSS в email через validateEmail | Jest assert в validators.comprehensive.test.js: XSS в email |
| VCP-027 | длина > 254 | UT-WB-AU-FN | Проверка validateEmail | длина > 254 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий длина > 254 через validateEmail | Jest assert в validators.comprehensive.test.js: длина > 254 |
| VCP-028 | валидное имя Иван | UT-WB-AU-FN | Проверка validateName | валидное имя Иван | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидное имя Иван через validateName | Jest assert в validators.comprehensive.test.js: валидное имя Иван |
| VCP-029 | валидное имя Иван Иванов | UT-WB-AU-FN | Проверка validateName | валидное имя Иван Иванов | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидное имя Иван Иванов через validateName | Jest assert в validators.comprehensive.test.js: валидное имя Иван Иванов |
| VCP-030 | валидное имя Анна-Мария | UT-WB-AU-FN | Проверка validateName | валидное имя Анна-Мария | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидное имя Анна-Мария через validateName | Jest assert в validators.comprehensive.test.js: валидное имя Анна-Мария |
| VCP-031 | невалидное имя A | UT-WB-AU-FN | Проверка validateName | невалидное имя A | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидное имя A через validateName | Jest assert в validators.comprehensive.test.js: невалидное имя A |
| VCP-032 | невалидное имя 123 | UT-WB-AU-FN | Проверка validateName | невалидное имя 123 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидное имя 123 через validateName | Jest assert в validators.comprehensive.test.js: невалидное имя 123 |
| VCP-033 | невалидное имя <script> | UT-WB-AU-FN | Проверка validateName | невалидное имя <script> | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидное имя <script> через validateName | Jest assert в validators.comprehensive.test.js: невалидное имя <script> |
| VCP-034 | невалидное имя Иван123 | UT-WB-AU-FN | Проверка validateName | невалидное имя Иван123 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидное имя Иван123 через validateName | Jest assert в validators.comprehensive.test.js: невалидное имя Иван123 |
| VCP-035 | длина > 100 | UT-WB-AU-FN | Проверка validateName | длина > 100 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий длина > 100 через validateName | Jest assert в validators.comprehensive.test.js: длина > 100 |
| VCP-036 | валидная цена 100 | UT-WB-AU-FN | Проверка validatePrice | валидная цена 100 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидная цена 100 через validatePrice | Jest assert в validators.comprehensive.test.js: валидная цена 100 |
| VCP-037 | валидная цена 0 | UT-WB-AU-FN | Проверка validatePrice | валидная цена 0 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидная цена 0 через validatePrice | Jest assert в validators.comprehensive.test.js: валидная цена 0 |
| VCP-038 | валидная цена 9999 | UT-WB-AU-FN | Проверка validatePrice | валидная цена 9999 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидная цена 9999 через validatePrice | Jest assert в validators.comprehensive.test.js: валидная цена 9999 |
| VCP-039 | невалидная цена -1 | UT-WB-AU-FN | Проверка validatePrice | невалидная цена -1 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидная цена -1 через validatePrice | Jest assert в validators.comprehensive.test.js: невалидная цена -1 |
| VCP-040 | невалидная цена "abc" | UT-WB-AU-FN | Проверка validatePrice | невалидная цена "abc" | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидная цена "abc" через validatePrice | Jest assert в validators.comprehensive.test.js: невалидная цена "abc" |
| VCP-041 | невалидная цена Infinity | UT-WB-AU-FN | Проверка validatePrice | невалидная цена Infinity | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидная цена Infinity через validatePrice | Jest assert в validators.comprehensive.test.js: невалидная цена Infinity |
| VCP-042 | цена выше лимита салона | UT-WB-AU-FN | Проверка validatePrice | цена выше лимита салона | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий цена выше лимита салона через validatePrice | Jest assert в validators.comprehensive.test.js: цена выше лимита салона |
| VCP-043 | строка "100" парсится | UT-WB-AU-FN | Проверка validatePrice | строка "100" парсится | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий строка "100" парсится через validatePrice | Jest assert в validators.comprehensive.test.js: строка "100" парсится |
| VCP-044 | цена 0 с allowZero:false | UT-WB-AU-FN | Проверка validatePrice | цена 0 с allowZero:false | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий цена 0 с allowZero:false через validatePrice | Jest assert в validators.comprehensive.test.js: цена 0 с allowZero:false |
| VCP-045 | валидная длительность 15 | UT-WB-AU-FN | Проверка validateDuration | валидная длительность 15 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидная длительность 15 через validateDuration | Jest assert в validators.comprehensive.test.js: валидная длительность 15 |
| VCP-046 | валидная длительность 30 | UT-WB-AU-FN | Проверка validateDuration | валидная длительность 30 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидная длительность 30 через validateDuration | Jest assert в validators.comprehensive.test.js: валидная длительность 30 |
| VCP-047 | валидная длительность 60 | UT-WB-AU-FN | Проверка validateDuration | валидная длительность 60 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидная длительность 60 через validateDuration | Jest assert в validators.comprehensive.test.js: валидная длительность 60 |
| VCP-048 | валидная длительность 480 | UT-WB-AU-FN | Проверка validateDuration | валидная длительность 480 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидная длительность 480 через validateDuration | Jest assert в validators.comprehensive.test.js: валидная длительность 480 |
| VCP-049 | невалидная длительность 0 | UT-WB-AU-FN | Проверка validateDuration | невалидная длительность 0 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидная длительность 0 через validateDuration | Jest assert в validators.comprehensive.test.js: невалидная длительность 0 |
| VCP-050 | невалидная длительность 4 | UT-WB-AU-FN | Проверка validateDuration | невалидная длительность 4 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидная длительность 4 через validateDuration | Jest assert в validators.comprehensive.test.js: невалидная длительность 4 |
| VCP-051 | невалидная длительность 481 | UT-WB-AU-FN | Проверка validateDuration | невалидная длительность 481 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидная длительность 481 через validateDuration | Jest assert в validators.comprehensive.test.js: невалидная длительность 481 |
| VCP-052 | невалидная длительность 15.5 | UT-WB-AU-FN | Проверка validateDuration | невалидная длительность 15.5 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидная длительность 15.5 через validateDuration | Jest assert в validators.comprehensive.test.js: невалидная длительность 15.5 |
| VCP-053 | невалидная длительность -10 | UT-WB-AU-FN | Проверка validateDuration | невалидная длительность -10 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий невалидная длительность -10 через validateDuration | Jest assert в validators.comprehensive.test.js: невалидная длительность -10 |
| VCP-054 | текст до 500 символов | UT-WB-AU-FN | Проверка validateComment | текст до 500 символов | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий текст до 500 символов через validateComment | Jest assert в validators.comprehensive.test.js: текст до 500 символов |
| VCP-055 | > 500 символов | UT-WB-AU-FN | Проверка validateComment | > 500 символов | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий > 500 символов через validateComment | Jest assert в validators.comprehensive.test.js: > 500 символов |
| VCP-056 | <script> отклоняется | UT-WB-AU-FN | Проверка validateComment | <script> отклоняется | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий <script> отклоняется через validateComment | Jest assert в validators.comprehensive.test.js: <script> отклоняется |
| VCP-057 | пустой с required:false | UT-WB-AU-FN | Проверка validateComment | пустой с required:false | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий пустой с required:false через validateComment | Jest assert в validators.comprehensive.test.js: пустой с required:false |
| VCP-058 | дата в будущем валидна | UT-WB-AU-FN | Проверка validateDate | дата в будущем валидна | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий дата в будущем валидна через validateDate | Jest assert в validators.comprehensive.test.js: дата в будущем валидна |
| VCP-059 | дата в прошлом невалидна | UT-WB-AU-FN | Проверка validateDate | дата в прошлом невалидна | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий дата в прошлом невалидна через validateDate | Jest assert в validators.comprehensive.test.js: дата в прошлом невалидна |
| VCP-060 | 10:00 в рабочем дне | UT-WB-AU-FN | Проверка validateTime | 10:00 в рабочем дне | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий 10:00 в рабочем дне через validateTime | Jest assert в validators.comprehensive.test.js: 10:00 в рабочем дне |
| VCP-061 | 08:00 вне рабочего дня | UT-WB-AU-FN | Проверка validateTime | 08:00 вне рабочего дня | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий 08:00 вне рабочего дня через validateTime | Jest assert в validators.comprehensive.test.js: 08:00 вне рабочего дня |
| VCP-062 | 10:07 не кратно 15 | UT-WB-AU-FN | Проверка validateTime | 10:07 не кратно 15 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий 10:07 не кратно 15 через validateTime | Jest assert в validators.comprehensive.test.js: 10:07 не кратно 15 |
| VCP-063 | обычный запрос | UT-WB-AU-FN | Проверка validateSearchQuery | обычный запрос | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий обычный запрос через validateSearchQuery | Jest assert в validators.comprehensive.test.js: обычный запрос |
| VCP-064 | XSS в поиске | UT-WB-AU-FN | Проверка validateSearchQuery | XSS в поиске | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий XSS в поиске через validateSearchQuery | Jest assert в validators.comprehensive.test.js: XSS в поиске |
| VCP-065 | слишком длинный запрос | UT-WB-AU-FN | Проверка validateSearchQuery | слишком длинный запрос | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий слишком длинный запрос через validateSearchQuery | Jest assert в validators.comprehensive.test.js: слишком длинный запрос |
| VCP-066 | обрезает ввод до 100 символов | UT-WB-AU-FN | Проверка processSearchInput | обрезает ввод до 100 символов | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий обрезает ввод до 100 символов через processSearchInput | Jest assert в validators.comprehensive.test.js: обрезает ввод до 100 символов |
| VCP-067 | удаляет опасные символы | UT-WB-AU-FN | Проверка sanitizeInput / sanitizers | удаляет опасные символы | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий удаляет опасные символы через sanitizeInput / sanitizers | Jest assert в validators.comprehensive.test.js: удаляет опасные символы |
| VCP-068 | sanitizeNameInput отсекает цифры и спецсимволы | UT-WB-AU-FN | Проверка sanitizeInput / sanitizers | sanitizeNameInput отсекает цифры и спецсимволы | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий sanitizeNameInput отсекает цифры и спецсимволы через sanitizeInput / sanitizers | Jest assert в validators.comprehensive.test.js: sanitizeNameInput отсекает цифры и спецсимволы |
| VCP-069 | null/undefined без ошибок | UT-WB-AU-FN | Проверка sanitizeInput / sanitizers | null/undefined без ошибок | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий null/undefined без ошибок через sanitizeInput / sanitizers | Jest assert в validators.comprehensive.test.js: null/undefined без ошибок |
| VCP-070 | sanitizeObject рекурсивно | UT-WB-AU-FN | Проверка sanitizeInput / sanitizers | sanitizeObject рекурсивно | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий sanitizeObject рекурсивно через sanitizeInput / sanitizers | Jest assert в validators.comprehensive.test.js: sanitizeObject рекурсивно |
| VCP-071 | hasXSSPattern обнаруживает <script>alert(1)</script> | UT-WB-AU-FN | Проверка XSS-тесты | hasXSSPattern обнаруживает <script>alert(1)</script> | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий hasXSSPattern обнаруживает <script>alert(1)</script> через XSS-тесты | Jest assert в validators.comprehensive.test.js: hasXSSPattern обнаруживает <script>alert(1)</script> |
| VCP-072 | hasXSSPattern обнаруживает <img src=x onerror=alert(1)> | UT-WB-AU-FN | Проверка XSS-тесты | hasXSSPattern обнаруживает <img src=x onerror=alert(1)> | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий hasXSSPattern обнаруживает <img src=x onerror=alert(1)> через XSS-тесты | Jest assert в validators.comprehensive.test.js: hasXSSPattern обнаруживает <img src=x onerror=alert(1)> |
| VCP-073 | hasXSSPattern обнаруживает javascript:alert(1) | UT-WB-AU-FN | Проверка XSS-тесты | hasXSSPattern обнаруживает javascript:alert(1) | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий hasXSSPattern обнаруживает javascript:alert(1) через XSS-тесты | Jest assert в validators.comprehensive.test.js: hasXSSPattern обнаруживает javascript:alert(1) |
| VCP-074 | hasXSSPattern обнаруживает "><script>alert(1)</script> | UT-WB-AU-FN | Проверка XSS-тесты | hasXSSPattern обнаруживает "><script>alert(1)</script> | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий hasXSSPattern обнаруживает "><script>alert(1)</script> через XSS-тесты | Jest assert в validators.comprehensive.test.js: hasXSSPattern обнаруживает "><script>alert(1)</script> |
| VCP-075 | hasXSSPattern обнаруживает {{constructor.constructor("alert(1)")()}} | UT-WB-AU-FN | Проверка XSS-тесты | hasXSSPattern обнаруживает {{constructor.constructor("alert(1)")()}} | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий hasXSSPattern обнаруживает {{constructor.constructor("alert(1)")()}} через XSS-тесты | Jest assert в validators.comprehensive.test.js: hasXSSPattern обнаруживает {{constructor.constructor("alert(1)")()}} |
| VCP-076 | parseValidNumber отклоняет e и несколько точек | UT-WB-AU-FN | Проверка numberHelpers | parseValidNumber отклоняет e и несколько точек | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий parseValidNumber отклоняет e и несколько точек через numberHelpers | Jest assert в validators.comprehensive.test.js: parseValidNumber отклоняет e и несколько точек |
| VCP-077 | clampNumber | UT-WB-AU-FN | Проверка numberHelpers | clampNumber | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий clampNumber через numberHelpers | Jest assert в validators.comprehensive.test.js: clampNumber |
| VCP-078 | isReasonableNumber | UT-WB-AU-FN | Проверка numberHelpers | isReasonableNumber | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий isReasonableNumber через numberHelpers | Jest assert в validators.comprehensive.test.js: isReasonableNumber |
| VCP-079 | очень длинная строка в comment | UT-WB-AU-FN | Проверка Edge-cases | очень длинная строка в comment | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий очень длинная строка в comment через Edge-cases | Jest assert в validators.comprehensive.test.js: очень длинная строка в comment |
| VCP-080 | Unicode в имени | UT-WB-AU-FN | Проверка Edge-cases | Unicode в имени | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий Unicode в имени через Edge-cases | Jest assert в validators.comprehensive.test.js: Unicode в имени |
| VCP-081 | эмодзи в комментарии допустимы | UT-WB-AU-FN | Проверка Edge-cases | эмодзи в комментарии допустимы | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий эмодзи в комментарии допустимы через Edge-cases | Jest assert в validators.comprehensive.test.js: эмодзи в комментарии допустимы |
| VCP-082 | переводы строк в комментарии | UT-WB-AU-FN | Проверка Edge-cases | переводы строк в комментарии | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий переводы строк в комментарии через Edge-cases | Jest assert в validators.comprehensive.test.js: переводы строк в комментарии |

### 3.1.4 validators-phone-required.test.js (3 кейсов)

**Тестируемый объект:** src/utils/validators (isValid API)

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| VPR-001 | validatePhone("") с required: true должно возвращать isValid: false | UT-WB-AU-FN | Проверка Валидация телефона с required | validatePhone("") с required: true должно возвращать isValid: false | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий validatePhone("") с required: true должно возвращать isValid: false через Валидация телефона с required | Jest assert в validators-phone-required.test.js: validatePhone("") с required: true должно возвращать isValid: false |
| VPR-002 | validatePhone("") с required: false должно возвращать isValid: true | UT-WB-AU-FN | Проверка Валидация телефона с required | validatePhone("") с required: false должно возвращать isValid: true | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий validatePhone("") с required: false должно возвращать isValid: true через Валидация телефона с required | Jest assert в validators-phone-required.test.js: validatePhone("") с required: false должно возвращать isValid: true |
| VPR-003 | validatePhone("+375291234567") должно возвращать isValid: true | UT-WB-AU-FN | Проверка Валидация телефона с required | validatePhone("+375291234567") должно возвращать isValid: true | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий validatePhone("+375291234567") должно возвращать isValid: true через Валидация телефона с required | Jest assert в validators-phone-required.test.js: validatePhone("+375291234567") должно возвращать isValid: true |

### 3.1.5 validationMessages.test.js (12 кейсов)

**Тестируемый объект:** src/utils/validationMessages

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| VMS-001 | email invalid-email → validation.email.noAt | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | email invalid-email → validation.email.noAt | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий email invalid-email → validation.email.noAt через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: email invalid-email → validation.email.noAt |
| VMS-002 | email test@ → validation.email.noDomain | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | email test@ → validation.email.noDomain | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий email test@ → validation.email.noDomain через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: email test@ → validation.email.noDomain |
| VMS-003 | email @mail.ru → validation.email.emptyLocal | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | email @mail.ru → validation.email.emptyLocal | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий email @mail.ru → validation.email.emptyLocal через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: email @mail.ru → validation.email.emptyLocal |
| VMS-004 | email test@mail → validation.email.noDomainDot | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | email test@mail → validation.email.noDomainDot | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий email test@mail → validation.email.noDomainDot через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: email test@mail → validation.email.noDomainDot |
| VMS-005 | email test@mail.c → validation.email.shortTld | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | email test@mail.c → validation.email.shortTld | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий email test@mail.c → validation.email.shortTld через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: email test@mail.c → validation.email.shortTld |
| VMS-006 | email user@domain.a → validation.email.shortTld | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | email user@domain.a → validation.email.shortTld | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий email user@domain.a → validation.email.shortTld через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: email user@domain.a → validation.email.shortTld |
| VMS-007 | email --dee@dd.g → validation.email.startsWithDash | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | email --dee@dd.g → validation.email.startsWithDash | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий email --dee@dd.g → validation.email.startsWithDash через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: email --dee@dd.g → validation.email.startsWithDash |
| VMS-008 | email .user@mail.ru → validation.email.startsWithDot | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | email .user@mail.ru → validation.email.startsWithDot | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий email .user@mail.ru → validation.email.startsWithDot через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: email .user@mail.ru → validation.email.startsWithDot |
| VMS-009 | email user.@mail.ru → validation.email.endsWithInvalid | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | email user.@mail.ru → validation.email.endsWithInvalid | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий email user.@mail.ru → validation.email.endsWithInvalid через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: email user.@mail.ru → validation.email.endsWithInvalid |
| VMS-010 | email user..name@mail.ru → validation.email.consecutiveDots | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | email user..name@mail.ru → validation.email.consecutiveDots | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий email user..name@mail.ru → validation.email.consecutiveDots через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: email user..name@mail.ru → validation.email.consecutiveDots |
| VMS-011 | валидный email возвращает null из getEmailFormatErrorKey | UT-WB-AU-FN | Проверка getEmailFormatErrorKey | валидный email возвращает null из getEmailFormatErrorKey | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий валидный email возвращает null из getEmailFormatErrorKey через getEmailFormatErrorKey | Jest assert в validationMessages.test.js: валидный email возвращает null из getEmailFormatErrorKey |
| VMS-012 | возвращает errorParams.min для короткого имени | UT-WB-AU-FN | Проверка validateName tooShort params | возвращает errorParams.min для короткого имени | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий возвращает errorParams.min для короткого имени через validateName tooShort params | Jest assert в validationMessages.test.js: возвращает errorParams.min для короткого имени |

### 3.1.6 validateService.test.js (9 кейсов)

**Тестируемый объект:** src/utils/validateService

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| SVC-001 | отклоняет XSS в названии | UT-WB-AU-FN | Проверка validateServiceField | отклоняет XSS в названии | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий отклоняет XSS в названии через validateServiceField | Jest assert в validateService.test.js: отклоняет XSS в названии |
| SVC-002 | отклоняет отрицательную длительность | UT-WB-AU-FN | Проверка validateServiceField | отклоняет отрицательную длительность | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий отклоняет отрицательную длительность через validateServiceField | Jest assert в validateService.test.js: отклоняет отрицательную длительность |
| SVC-003 | отклоняет пустое название | UT-WB-AU-FN | Проверка validateServiceField | отклоняет пустое название | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий отклоняет пустое название через validateServiceField | Jest assert в validateService.test.js: отклоняет пустое название |
| SVC-004 | принимает валидное название | UT-WB-AU-FN | Проверка validateServiceField | принимает валидное название | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий принимает валидное название через validateServiceField | Jest assert в validateService.test.js: принимает валидное название |
| SVC-005 | собирает ошибки по невалидной форме | UT-WB-AU-FN | Проверка validateAllServiceFields | собирает ошибки по невалидной форме | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий собирает ошибки по невалидной форме через validateAllServiceFields | Jest assert в validateService.test.js: собирает ошибки по невалидной форме |
| SVC-006 | отклоняет XSS при сохранении через CRUD | UT-WB-AU-FN | Проверка validateServiceData | отклоняет XSS при сохранении через CRUD | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий отклоняет XSS при сохранении через CRUD через validateServiceData | Jest assert в validateService.test.js: отклоняет XSS при сохранении через CRUD |
| SVC-007 | отклоняет отрицательную длительность при сохранении через CRUD | UT-WB-AU-FN | Проверка validateServiceData | отклоняет отрицательную длительность при сохранении через CRUD | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий отклоняет отрицательную длительность при сохранении через CRUD через validateServiceData | Jest assert в validateService.test.js: отклоняет отрицательную длительность при сохранении через CRUD |
| SVC-008 | санитизирует опасные символы после валидации | UT-WB-AU-FN | Проверка prepareServiceForSave | санитизирует опасные символы после валидации | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий санитизирует опасные символы после валидации через prepareServiceForSave | Jest assert в validateService.test.js: санитизирует опасные символы после валидации |
| SVC-009 | не возвращает data при ошибках | UT-WB-AU-FN | Проверка prepareServiceForSave | не возвращает data при ошибках | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий не возвращает data при ошибках через prepareServiceForSave | Jest assert в validateService.test.js: не возвращает data при ошибках |

### 3.1.7 useServices.test.js (2 кейсов)

**Тестируемый объект:** src/hooks/useServices

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| ADM-022 | должен отклонить XSS в названии | UT-WB-AU-FN | XSS и отрицательная длительность при addService | должен отклонить XSS в названии | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий должен отклонить XSS в названии через useServices | Jest assert в useServices.test.js: должен отклонить XSS в названии |
| ADM-023 | должен отклонить отрицательную длительность | UT-WB-AU-FN | XSS и отрицательная длительность при addService | должен отклонить отрицательную длительность | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий должен отклонить отрицательную длительность через useServices | Jest assert в useServices.test.js: должен отклонить отрицательную длительность |

### 3.1.8 bookingWizardStepValidation.test.js (8 кейсов)

**Тестируемый объект:** src/hooks/bookingWizard/stepValidation

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| BWS-001 | SERVICE без serviceId → ошибка | UT-WB-AU-FN | Проверка getStepValidationErrorKey | SERVICE без serviceId → ошибка | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий SERVICE без serviceId → ошибка через getStepValidationErrorKey | Jest assert в bookingWizardStepValidation.test.js: SERVICE без serviceId → ошибка |
| BWS-002 | CONTACTS с невалидной формой → первый errorKey | UT-WB-AU-FN | Проверка getStepValidationErrorKey | CONTACTS с невалидной формой → первый errorKey | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий CONTACTS с невалидной формой → первый errorKey через getStepValidationErrorKey | Jest assert в bookingWizardStepValidation.test.js: CONTACTS с невалидной формой → первый errorKey |
| BWS-003 | DATETIME без времени → невалиден | UT-WB-AU-FN | Проверка isCurrentStepValid | DATETIME без времени → невалиден | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий DATETIME без времени → невалиден через isCurrentStepValid | Jest assert в bookingWizardStepValidation.test.js: DATETIME без времени → невалиден |
| BWS-004 | SERVICE с serviceId → валиден | UT-WB-AU-FN | Проверка isCurrentStepValid | SERVICE с serviceId → валиден | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий SERVICE с serviceId → валиден через isCurrentStepValid | Jest assert в bookingWizardStepValidation.test.js: SERVICE с serviceId → валиден |
| BWS-005 | возвращает первую ошибку по порядку полей | UT-WB-AU-FN | Проверка getFirstContactsValidationError | возвращает первую ошибку по порядку полей | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий возвращает первую ошибку по порядку полей через getFirstContactsValidationError | Jest assert в bookingWizardStepValidation.test.js: возвращает первую ошибку по порядку полей |
| BWS-006 | шаги 1–4 → booking.buttons.next | UT-WB-AU-FN | Проверка getNextButtonLabelKey | шаги 1–4 → booking.buttons.next | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий шаги 1–4 → booking.buttons.next через getNextButtonLabelKey | Jest assert в bookingWizardStepValidation.test.js: шаги 1–4 → booking.buttons.next |
| BWS-007 | шаг 5 → booking.buttons.confirm | UT-WB-AU-FN | Проверка getNextButtonLabelKey | шаг 5 → booking.buttons.confirm | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий шаг 5 → booking.buttons.confirm через getNextButtonLabelKey | Jest assert в bookingWizardStepValidation.test.js: шаг 5 → booking.buttons.confirm |
| BWS-008 | DATETIME сбрасывает date и startTime | UT-WB-AU-FN | Проверка getClearStepUpdates | DATETIME сбрасывает date и startTime | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий DATETIME сбрасывает date и startTime через getClearStepUpdates | Jest assert в bookingWizardStepValidation.test.js: DATETIME сбрасывает date и startTime |

### 3.1.9 useBookingWizardEffects.test.js (3 кейсов)

**Тестируемый объект:** src/hooks/bookingWizard/useBookingWizardEffects

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| BKE-001 | preselect единственного мастера на шаге 2 без смены шага | UT-WB-AU-FN | Проверка useWizardSingleSpecialistPreselect | preselect единственного мастера на шаге 2 без смены шага | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий preselect единственного мастера на шаге 2 без смены шага через useWizardSingleSpecialistPreselect | Jest assert в useBookingWizardEffects.test.js: preselect единственного мастера на шаге 2 без смены шага |
| BKE-002 | не preselect на других шагах | UT-WB-AU-FN | Проверка useWizardSingleSpecialistPreselect | не preselect на других шагах | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий не preselect на других шагах через useWizardSingleSpecialistPreselect | Jest assert в useBookingWizardEffects.test.js: не preselect на других шагах |
| BKE-003 | не preselect если мастер уже выбран | UT-WB-AU-FN | Проверка useWizardSingleSpecialistPreselect | не preselect если мастер уже выбран | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий не preselect если мастер уже выбран через useWizardSingleSpecialistPreselect | Jest assert в useBookingWizardEffects.test.js: не preselect если мастер уже выбран |

### 3.1.10 roleRouting.test.js (3 кейсов)

**Тестируемый объект:** src/utils/roleRouting

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| RRT-001 | возвращает домашний путь по роли | UT-WB-AU-FN | Проверка roleRouting | возвращает домашний путь по роли | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий возвращает домашний путь по роли через roleRouting | Jest assert в roleRouting.test.js: возвращает домашний путь по роли |
| RRT-002 | специалисту доступны только маршруты /specialist/* | UT-WB-AU-FN | Проверка roleRouting | специалисту доступны только маршруты /specialist/* | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий специалисту доступны только маршруты /specialist/* через roleRouting | Jest assert в roleRouting.test.js: специалисту доступны только маршруты /specialist/* |
| RRT-003 | клиенту и админу недоступен кабинет мастера | UT-WB-AU-FN | Проверка roleRouting | клиенту и админу недоступен кабинет мастера | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий клиенту и админу недоступен кабинет мастера через roleRouting | Jest assert в roleRouting.test.js: клиенту и админу недоступен кабинет мастера |

### 3.1.11 specialistHelpers.test.js (3 кейсов)

**Тестируемый объект:** src/utils/specialistHelpers

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| SPH-001 | filterBookingsBySpecialist возвращает записи мастера | UT-WB-AU-FN | Проверка specialistHelpers | filterBookingsBySpecialist возвращает записи мастера | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий filterBookingsBySpecialist возвращает записи мастера через specialistHelpers | Jest assert в specialistHelpers.test.js: filterBookingsBySpecialist возвращает записи мастера |
| SPH-002 | computeSpecialistStats считает KPI мастера | UT-WB-AU-FN | Проверка specialistHelpers | computeSpecialistStats считает KPI мастера | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий computeSpecialistStats считает KPI мастера через specialistHelpers | Jest assert в specialistHelpers.test.js: computeSpecialistStats считает KPI мастера |
| SPH-003 | getSpecialistServices возвращает услуги мастера | UT-WB-AU-FN | Проверка specialistHelpers | getSpecialistServices возвращает услуги мастера | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий getSpecialistServices возвращает услуги мастера через specialistHelpers | Jest assert в specialistHelpers.test.js: getSpecialistServices возвращает услуги мастера |

### 3.1.12 phoneInputHelpers.test.js (3 кейсов)

**Тестируемый объект:** src/utils/phoneInputHelpers

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| PHN-001 | formatPartialByPhone форматирует по мере ввода | UT-WB-AU-FN | Проверка phoneInputHelpers | formatPartialByPhone форматирует по мере ввода | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий formatPartialByPhone форматирует по мере ввода через phoneInputHelpers | Jest assert в phoneInputHelpers.test.js: formatPartialByPhone форматирует по мере ввода |
| PHN-002 | курсор остаётся в зоне кода оператора при замене 20 → 29 | UT-WB-AU-FN | Проверка phoneInputHelpers | курсор остаётся в зоне кода оператора при замене 20 → 29 | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий курсор остаётся в зоне кода оператора при замене 20 → 29 через phoneInputHelpers | Jest assert в phoneInputHelpers.test.js: курсор остаётся в зоне кода оператора при замене 20 → 29 |
| PHN-003 | processPhoneInput не отправляет курсор в конец при правке середины | UT-WB-AU-FN | Проверка phoneInputHelpers | processPhoneInput не отправляет курсор в конец при правке середины | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий processPhoneInput не отправляет курсор в конец при правке середины через phoneInputHelpers | Jest assert в phoneInputHelpers.test.js: processPhoneInput не отправляет курсор в конец при правке середины |

### 3.1.13 useConfirmDialog.test.js (2 кейсов)

**Тестируемый объект:** src/components/UI/ConfirmDialog

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| UI-004 | показывает подписи по умолчанию, если labels не переданы | UT-WB-AU-FN | Fallback i18n-подписей кнопок диалога | показывает подписи по умолчанию, если labels не переданы | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий показывает подписи по умолчанию, если labels не переданы через ConfirmDialog | Jest assert в useConfirmDialog.test.js: показывает подписи по умолчанию, если labels не переданы |
| UI-005 | показывает подписи по умолчанию при пустых строках из хука | UT-WB-AU-FN | Fallback i18n-подписей кнопок диалога | показывает подписи по умолчанию при пустых строках из хука | Модуль импортирован; окружение jsdom; моки по файлу теста | Выполнить сценарий показывает подписи по умолчанию при пустых строках из хука через ConfirmDialog | Jest assert в useConfirmDialog.test.js: показывает подписи по умолчанию при пустых строках из хука |

---

## 4. Предложенные кейсы [PROPOSED]

Кейсы из аудита, **не реализованные** или частично реализованные в `src/tests/` на дату **2026-07-07**. Приоритеты: **P0** — критично; **P1** — желательно; **P2** — улучшение.

> **Реализовано с v1.0:** расширенная валидация (`validators.comprehensive.test.js` — 82 кейса), форматированный телефон, XSS, `validationMessages`, `validateService`, шаги wizard (`bookingWizardStepValidation`), роли (`roleRouting`), helpers специалиста и маска телефона.

### 4.1 Сводная таблица (13 оставшихся кейсов)

| Код | Модуль | Название | Приоритет | Статус |
|-----|--------|----------|-----------|--------|
| PROP-P0-001 | useTimeSlots | MIN_ADVANCE 2 ч | P0 | ❌ |
| PROP-P0-002 | useTimeSlots | Первый слот 09:00 | P0 | ❌ |
| PROP-P0-003 | useTimeSlots | Последний слот до 18:00 | P0 | ❌ |
| PROP-P0-004 | validateBookingPipeline | working hours в pipeline | P0 | ❌ |
| PROP-P0-005 | validateBookingPipeline | Граница 18:00 | P0 | ❌ |
| PROP-P0-006 | validateBookingPipeline | Full pipeline success | P0 | ❌ |
| PROP-P1-003 | formatPhone | Читаемый формат РБ | P1 | ❌ |
| PROP-P1-004 | formatPhone | Идемпотентность | P1 | ❌ |
| PROP-P1-005 | formatPhone | Некорректная длина | P1 | ❌ |
| PROP-P1-006 | formatPhone | Пустой ввод | P1 | ❌ |
| PROP-P1-007 | useBookingWizard | Полный flow wizard | P1 | ❌ |
| PROP-P2-004 | profileHelpers | null phone | P2 | ❌ |
| PROP-P2-005 | profileHelpers | Пустая статистика | P2 | ❌ |

**Закрыто с v1.0 → v1.1:** PROP-P1-001, PROP-P1-002 (в `validators.comprehensive`), PROP-P2-001, PROP-P2-002 (Toast не вызывается в unit CRUD), PROP-P2-003 (частично в `useSalonData`).

### 4.2 Детализация P0 (критичные)

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| PROP-P0-001 | MIN_ADVANCE 2 ч | Бизнес-правило: запись не раньше чем через 2 ч | Слоты до now+2h помечены unavailable | `setSystemTime` близко к рабочему дню | useTimeSlots на сегодня | Слоты раньше порога `isAvailable === false` |
| PROP-P0-002 | Первый слот 09:00 | Соответствие workingHours.start | Первое окно начинается в 09:00 | specialist пн 09:00–18:00 | Генерация слотов | `slots[0].startTime === "09:00"` |
| PROP-P0-003 | Последний слот до 18:00 | Услуга не выходит за end смены | Последний start + duration ≤ 18:00 | service duration 60 | Слоты на рабочий день | Нет слота с endTime > 18:00 |
| PROP-P0-004 | Working hours в pipeline | validateBeforeSave вызывает isWithinWorkingHours | Запись 17:30 + 60 мин отклоняется | specialist 09–18 | validateBookingBeforeSave | `isValid === false`; error working hours |
| PROP-P0-005 | Boundary 18:00 | Старт 17:00 + 60 мин — ровно на границе | Граничный кейс конца смены | duration 60 | start 17:00 | `isValid === true` (или явно задокументированное правило) |
| PROP-P0-006 | Full pipeline success | Happy path без overlap и с duration | Полная валидная запись | пустой existing | validateBookingBeforeSave valid payload | `isValid === true`; error null |

### 4.3 Детализация P1 (полные таблицы IEEE 829)

#### 4.3.1 validatePhone — форматированный ввод и коды операторов

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| PROP-P1-001 | validatePhone formatted input | UT-WB-AU-FN | Пользователь вводит маску, validate нормализует | Функция validatePhone импортирована | `validatePhone("+375 (29) 123-45-67")` | `isValid === true`; errorKey undefined |
| PROP-P1-002 | validatePhone all operator codes | UT-WB-AU-FN | Все коды РБ 17/25/29/33/44 принимаются | Массив кодов `[17, 25, 29, 33, 44]` | Для каждого: `validatePhone("+375{code}1234567")` | Каждый вызов: `isValid === true` |

#### 4.3.2 formatPhone — полное покрытие (formatters.test.js)

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| PROP-P1-003 | formatPhone readable RB | UT-WB-AU-FN | Цифры → читаемый формат РБ | normalizePhone работает | `formatPhone("375291234567")` | `"+375 (29) 123-45-67"` |
| PROP-P1-004 | formatPhone idempotent | UT-WB-AU-FN | Повторное форматирование не ломает строку | Уже отформатированный номер | `formatPhone("+375 (29) 123-45-67")` | Тот же результат без дублирования скобок |
| PROP-P1-005 | formatPhone invalid length | UT-WB-AU-FN | Короткий номер не маскируется | Ввод `"37529"` | formatPhone | `""` или исходник без ложной маски |
| PROP-P1-006 | formatPhone empty input | UT-WB-AU-FN | Пустой/null ввод | `""`, null, undefined | formatPhone для каждого | `""` |

#### 4.3.3 useBookingWizard — полный flow

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| PROP-P1-007 | Wizard full booking flow | UT-WB-AU-FN | Прохождение шагов 1–5 до onCreateBooking | Моки services, specialists, onCreateBooking, navigate; валидный draft | selectService → specialist → date → slot → submitForm | onCreateBooking вызван 1 раз с payload; Toast.success; playBookingConfirmation; navigate на success |

### 4.4 Детализация P2 (полные таблицы IEEE 829)

#### 4.4.1 Side-effects и merge в админ-хуках

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| PROP-P2-001 | useServices Toast zero-call | UT-WB-AU-FN | Unit CRUD не вызывает Toast | Toast замокан; afterEach clearMocks | addService, updateService, deleteService (success paths) | Toast.success.mock.calls.length === 0; Toast.error === 0 |
| PROP-P2-002 | useSpecialists Toast zero-call | UT-WB-AU-FN | Аналогично для specialists | Toast замокан | addSpecialist, updateSpecialist, deleteSpecialist | Toast не вызывался |
| PROP-P2-003 | useSalonData merge catalogs | UT-WB-AU-FN | services = json + custom без дубликатов | jsonServices 2 шт.; customServices 1 шт. | renderHook useSalonData | services.length === 3; id уникальны |

#### 4.4.2 profileHelpers — edge cases

| Код | Название | Цель | Описание | Предусловия | Шаги | Ожидаемый результат |
|-----|----------|------|----------|-------------|------|---------------------|
| PROP-P2-004 | filterClientBookings null phone | UT-WB-AU-FN | Defensive: null вместо string | mockBookings непустой | filterClientBookings(bookings, null) | `[]` (без throw) |
| PROP-P2-005 | computeClientStats empty array | UT-WB-AU-FN | Пустой вход — нулевая статистика | bookings `[]` | computeClientStats([]) | `{ total: 0, confirmed: 0, cancelled: 0, spent: 0 }` |

### 4.5 Связь proposed с бизнес-требованиями

| ID требования | PROPOSED-код | Бизнес-правило |
|---------------|--------------|----------------|
| BR-SCH-01 | PROP-P0-001…003 | Рабочие часы 09:00–18:00, MIN_ADVANCE 2 ч |
| BR-SCH-02 | PROP-P0-004…006 | Pipeline сохранения записи |
| BR-VAL-01 | ~~PROP-P1-001…002~~ | ✅ Реализовано в validators.comprehensive |
| BR-VAL-02 | PROP-P1-003…006 | Отображение телефона (formatPhone) |
| BR-BKN-01 | PROP-P1-007 | Полный submit wizard |
| BR-ADM-01 | ~~PROP-P2-001…003~~ | ✅ Toast в UI; merge частично в useSalonData |
| BR-PRF-01 | PROP-P2-004…005 | Устойчивость личного кабинета |

---

## 5. Матрица покрытия

| Область | Unit ✅ | Пробел ❌ |
|---------|---------|-----------|
| localStorage / race condition | ✅ stress + base (INF-001…RG-002) | — |
| Пересечение слотов / буфер 15 мин | ✅ SCH-001…006 | — |
| MIN_ADVANCE 2 ч | ❌ только код в useTimeSlots | → PROP-P0-001 |
| CRUD услуг / мастеров | ✅ ADM-001…011, validateService | — |
| Фильтры админ-записей | ✅ ADM-012…021 | UI AdminDashboard (компонент) |
| validatePhone P0.3 | ✅ VAL-RG-001…003, comprehensive | formatted input ✅ в comprehensive |
| formatPhone | ❌ нет тестов | → PROP-P1-003…006 |
| Wizard бронирование | ⚠️ confirm + stepValidation + effects | steps 1–5 submit (PROP-P1-007) |
| Личный кабинет helpers | ✅ PRF-001…008 | ProfilePage UI, бонусы |
| ConfirmDialog | ✅ UI-001…005 | E2E с BookingWizard |
| Роли / специалист | ✅ roleRouting, specialistHelpers | — |
| E2E / ST / IT | ❌ | Cypress / Playwright; интеграция страниц |
| Тема / язык / избранное | ❌ | нет unit-тестов |
| useBookings / useAdminDashboard | ❌ | оркестрация в UI-слое |

### 5.1 Легенда

| Символ | Значение |
|--------|----------|
| ✅ | Покрыто автоматизированными unit-тестами |
| ⚠️ | Частичное покрытие |
| ❌ | Не покрыто или только в production-коде |

### 5.2 Покрытие по типам тестирования

| Тип | Статус | Комментарий |
|-----|--------|-------------|
| Unit (UT) | 216 кейсов | Основной объём документа |
| Integration (IT) | ❌ | Страницы CatalogPage, AdminDashboard не тестируются изолированно |
| System (ST) | ❌ | Нет прогона полного user journey |
| E2E | ❌ | Рекомендуется Playwright для booking flow |
| Regression (RG) | 10+ кейсов | P0.2, P0.3, защита стандартных сущностей, confirm |

### 5.3 Матрица трассировки: код → исходный файл → функция

| Код | Файл теста | Тестируемая функция / хук |
|-----|------------|---------------------------|
| INF-001…007 | useLocalStorage.test.js | `useLocalStorage` |
| INF-RG-001…002 | useLocalStorage.stress.test.js | `useLocalStorage` (race) |
| SCH-001…006 | checkTimeOverlap.test.js | `checkTimeOverlap` |
| SCH-007…008 | checkTimeOverlap.test.js | `isWithinWorkingHours` |
| SCH-009…012 | useTimeSlots.test.js | `useTimeSlots` |
| SCH-013…016 | validateBookingPipeline.test.js | `assertBookingDuration`, `validateBookingBeforeSave` |
| VAL-001…011 | validators.test.js | `validateBookingForm`, `validatePhone`, `validateEmail` |
| VAL-012…013 | formatters.test.js | `normalizePhone` |
| ADM-001…004 | useServices.test.js | `useServices` → add/update/delete |
| ADM-RG-001 | useServices.test.js | deleteService (standard guard) |
| ADM-005…008 | useSpecialists.test.js | `useSpecialists` |
| ADM-RG-002 | useSpecialists.test.js | deleteSpecialist (standard guard) |
| ADM-009…011 | useSalonData.test.js | `useSalonData` → addService, specialistsWithServices |
| ADM-012…021 | bookingsFilter.test.js | `filterBookings`, `sortBookings`, `countActiveFilters` |
| BKN-RG-001…002 | useBookingWizard.confirm.test.js | `handleClearForm` |
| PRF-001…008 | profileHelpers.test.js | `filterClientBookings`, `computeClientStats`, `deriveProfileData` |
| UI-001…002 | useConfirmDialog.test.js | `useConfirmDialog` |
| UI-003 | useConfirmDialog.test.js | `<ConfirmDialog />` |

### 5.4 Непокрытые модули production-кода (для справки)

| Модуль | Путь | Рекомендуемый тип теста |
|--------|------|-------------------------|
| useBookings | hooks/useBookings.js | Unit + IT с localStorage |
| useAdminDashboard | hooks/useAdminDashboard.js | Unit (оркестрация фильтров) |
| BookingWizard | components/Booking/BookingWizard.jsx | RTL component test |
| AdminDashboard | components/Admin/AdminDashboard.jsx | RTL + моки hooks |
| ProfilePage | components/Profile/ProfilePage.jsx | RTL |
| ThemeToggle / useTheme | components/UI, hooks | Unit snapshot |
| Favorites | Catalog/FavoritesList | Unit filter logic |
| useLanguage | hooks/useLanguage.js | Unit t() keys |

---

## 6. Как запускать тесты

### 6.1 Все тесты (интерактивный режим CRA)

```bash
npm test
```

Jest запускается в watch-режиме: перезапуск при изменении файлов. В консоли доступны фильтры по имени теста.

### 6.2 Однократный прогон (CI / перед коммитом)

```bash
CI=true npm test -- --watchAll=false
```

На Windows (PowerShell):

```powershell
$env:CI="true"; npm test -- --watchAll=false
```

### 6.3 Запуск по модулям (pattern)

| Модуль | Команда |
|--------|---------|
| 1 — localStorage | `npm test -- useLocalStorage --watchAll=false` |
| 2 — расписание | `npm test -- checkTimeOverlap useTimeSlots validateBookingPipeline --watchAll=false` |
| 3 — валидация | `npm test -- validators formatters --watchAll=false` |
| 4 — админ | `npm test -- useServices useSpecialists useSalonData bookingsFilter --watchAll=false` |
| 5 — бронирование | `npm test -- useBookingWizard --watchAll=false` |
| 6 — профиль | `npm test -- profileHelpers --watchAll=false` |
| 7 — UI | `npm test -- useConfirmDialog --watchAll=false` |

### 6.4 Один файл или один кейс

```bash
# Один файл
npm test -- src/tests/checkTimeOverlap.test.js --watchAll=false

# По имени теста (regex)
npm test -- -t "буфер 15 мин" --watchAll=false
```

### 6.5 Coverage (опционально)

```bash
npm test -- --coverage --watchAll=false
```

Отчёт: `coverage/lcov-report/index.html`.

### 6.6 Ожидаемый результат полного прогона

```
Test Suites: 23 passed, 23 total
Tests:       216 passed, 216 total
```

---

## Приложение A. Соответствие кодов кейсов и маркировки UT

| Префикс кода | Маркировка по умолчанию |
|--------------|-------------------------|
| INF-001…007 | UT-WB-AU-FN |
| INF-RG-001…003 | UT-WB-AU-RG |
| SCH-001…016 | UT-WB-AU-FN |
| VAL-001…004, 005…021 | UT-WB-AU-FN |
| VAL-RG-001…003 | UT-WB-AU-RG |
| VCP-001…082 | UT-WB-AU-FN |
| VPR-001…003 | UT-WB-AU-FN |
| VMS-001…012 | UT-WB-AU-FN |
| SVC-001…009 | UT-WB-AU-FN |
| BWS-001…008 | UT-WB-AU-FN |
| BKE-001…003 | UT-WB-AU-FN |
| RRT-001…003 | UT-WB-AU-FN |
| SPH-001…003 | UT-WB-AU-FN |
| PHN-001…003 | UT-WB-AU-FN |
| ADM-001…004, 005…011, 012…023 | UT-WB-AU-FN |
| ADM-RG-001…002 | UT-WB-AU-RG |
| BKN-RG-001…002 | UT-WB-AU-RG |
| PRF-001…008 | UT-WB-AU-FN |
| UI-001…005 | UT-WB-AU-FN |

## Приложение B. История изменений документа

| Дата | Версия | Изменение |
|------|--------|-----------|
| 2026-06-30 | 1.0 | Первичная сборка после аудита 77 авто-тестов и 18 proposed |
| 2026-07-07 | 1.1 | Актуализация: 23 suites / 216 тестов; новые модули валидации, wizard, роли |
| 2026-07-07 | 1.2 | Раздел 3.1: полные IEEE-таблицы для 139 новых тест-кейсов v1.1 |

## Приложение C. Полный перечень имён тестов Jest (как в отчёте CI)

### useLocalStorage.test.js

1. должен вернуть начальное значение → INF-001  
2. должен сохранить значение в localStorage → INF-002  
3. должен обновить значение → INF-003  
4. должен удалить значение → INF-004  
5. должен использовать функциональное обновление → INF-005  
6. должен применить debounce при записи → INF-006  
7. должен синхронизироваться между вкладками → INF-007  

### useLocalStorage.stress.test.js

1. 10 быстрых functional updates → в storage записано последнее значение → INF-RG-001  
2. 10 быстрых functional updates с debounce → финальное значение после таймера → INF-RG-002  

### checkTimeOverlap.test.js

1. не считает пересечением окна разных мастеров → SCH-001  
2. обнаруживает пересечение при 2-часовой услуге и старте через 20 минут → SCH-002  
3. учитывает буфер 15 мин между клиентами → SCH-003  
4. разрешает запись сразу после буфера → SCH-004  
5. игнорирует отменённые записи → SCH-005  
6. исключает редактируемую запись по id → SCH-006  
7. отклоняет запись, выходящую за конец рабочего дня → SCH-007  
8. принимает запись в пределах рабочего дня → SCH-008  

### useTimeSlots.test.js

1. возвращает ошибку без обязательных параметров → SCH-009  
2. возвращает пустой список в нерабочий день → SCH-010  
3. генерирует окна в рабочий день → SCH-011  
4. помечает окна занятыми при пересечении с существующей записью → SCH-012  

### validateBookingPipeline.test.js

1. отклоняет запись без duration → SCH-013  
2. принимает запись с положительным duration → SCH-014  
3. отклоняет создание без duration до overlap → SCH-015  
4. обнаруживает пересечение при валидном duration → SCH-016  

### validators.test.js

1. должен пройти валидацию с корректными данными → VAL-001  
2. должен отклонить форму без имени → VAL-002  
3. должен отклонить форму с некорректным телефоном → VAL-003  
4. должен отклонить форму с пустым телефоном → VAL-RG-001  
5. должен отклонить форму с некорректным email → VAL-004  
6. должен отклонить пустой телефон при required=true → VAL-RG-002  
7. должен принять пустой телефон при required=false (профиль) → VAL-RG-003  
8. должен принять корректный белорусский номер → VAL-005  
9. должен отклонить короткий номер → VAL-006  
10. должен отклонить номер без префикса +375 → VAL-007  
11. должен отклонить номер с неверным кодом оператора → VAL-008  
12. должен принять корректный email → VAL-009  
13. должен отклонить email без @ → VAL-010  
14. должен отклонить слишком длинный email → VAL-011  

### formatters.test.js

1. удаляет все нецифровые символы → VAL-012  
2. возвращает пустую строку для пустого или невалидного ввода → VAL-013  

### useServices.test.js

1. должен создать новую услугу → ADM-001  
2. должен отклонить услугу без названия → ADM-002  
3. должен обновить существующую услугу → ADM-003  
4. должен удалить услугу → ADM-004  
5. не должен удалить стандартную услугу → ADM-RG-001  

### useSpecialists.test.js

1. должен создать нового специалиста → ADM-005  
2. должен отклонить специалиста без ФИО → ADM-006  
3. должен обновить существующего специалиста → ADM-007  
4. должен удалить специалиста → ADM-008  
5. не должен удалить стандартного специалиста → ADM-RG-002  

### useSalonData.test.js

1. addService синхронно обновляет serviceIds мастера в одном act → ADM-009  
2. addService обновляет serviceIds кастомного мастера без перезагрузки → ADM-010  
3. specialistsWithServices обогащает JSON-мастеров связями из услуг → ADM-011  

### bookingsFilter.test.js

1. должен фильтровать по статусу → ADM-012  
2. должен фильтровать по специалисту → ADM-013  
3. должен фильтровать по поисковому запросу → ADM-014  
4. должен фильтровать по диапазону дат → ADM-015  
5. должен применить несколько фильтров одновременно → ADM-016  
6. должен сортировать по дате (новые сверху) → ADM-017  
7. должен сортировать по дате (старые сверху) → ADM-018  
8. должен сортировать по имени клиента → ADM-019  
9. должен вернуть 0 для дефолтных фильтров → ADM-020  
10. должен посчитать несколько активных фильтров → ADM-021  

### useBookingWizard.confirm.test.js

1. confirm resolve true → clearDraft вызывается → BKN-RG-001  
2. confirm resolve false → clearDraft НЕ вызывается → BKN-RG-002  

### profileHelpers.test.js

1. должен вернуть записи с совпадающим телефоном → PRF-001  
2. должен вернуть пустой массив при несовпадении телефона → PRF-002  
3. должен вернуть пустой массив для пустого входного списка → PRF-003  
4. без телефона возвращает все записи, отсортированные по date desc → PRF-004  
5. должен корректно считать total, confirmed, cancelled и spent → PRF-005  
6. должен отдавать приоритет userSettings над profileData → PRF-006  
7. должен вернуть null если profileData отсутствует → PRF-007  
8. должен использовать profileData если userSettings пустые → PRF-008  

### useConfirmDialog.test.js

1. confirm открывает диалог и resolve true при onConfirm → UI-001  
2. confirm resolve false при onCancel → UI-002  
3. рендерится изолированно с message и кнопками → UI-003  
4. показывает подписи по умолчанию, если labels не переданы → UI-004  
5. показывает подписи по умолчанию при пустых строках из хука → UI-005  

### validators.comprehensive.test.js (82 кейса → VCP-001…082)

См. раздел **3.1.3** — полная IEEE-таблица.

### validators-phone-required.test.js (3 кейса → VPR-001…003)

См. раздел **3.1.4**.

### validationMessages.test.js (12 кейсов → VMS-001…012)

См. раздел **3.1.5**.

### validateService.test.js (9 кейсов → SVC-001…009)

См. раздел **3.1.6**.

### bookingWizardStepValidation.test.js (8 кейсов → BWS-001…008)

См. раздел **3.1.8**.

### useBookingWizardEffects.test.js (3 кейса → BKE-001…003)

См. раздел **3.1.9**.

### roleRouting.test.js (3 кейса → RRT-001…003)

См. раздел **3.1.10**.

### specialistHelpers.test.js (3 кейса → SPH-001…003)

См. раздел **3.1.11**.

### phoneInputHelpers.test.js (3 кейса → PHN-001…003)

См. раздел **3.1.12**.

<!--
## Приложение D. Чек-лист для демонстрации на защите

- [ ] Запустить `CI=true npm test -- --watchAll=false` — 77 passed  
- [ ] Показать INF-RG-001/002 как регрессию race condition (P0.2)  
- [ ] Показать VAL-RG-001 как регрессию пустого телефона (P0.3)  
- [ ] Показать SCH-003/004 — буфер 15 мин между клиентами  
- [ ] Показать ADM-RG-001/002 — защита стандартных услуг/мастеров  
- [ ] Объяснить 18 PROPOSED из раздела 4  
- [ ] Показать матрицу покрытия (раздел 5) — что есть и чего нет  
-->
---

*Конец документа TEST_DOCUMENTATION.md*
