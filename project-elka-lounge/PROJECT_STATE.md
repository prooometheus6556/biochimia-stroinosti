# ELKA LOUNGE OPERATING PLATFORM

## Описание проекта
Единая платформа управления для заведения **«Ёлка-лаунж на крыше»** (одна локация).
Включает клиентское PWA для бронирования столов и Admin CRM для хостес.

---

## Информация о заведении
* **Название:** ЁЛКА Lounge Bar
* **Адрес:** г. Новосибирск, Красный проспект, 182/1
* **Локация:** 12 этаж (rooftop)
* **Режим работы:** Ежедневно с 12:00 до 02:00
* **Телефон:** +7 (999) 999-99-99

---

## Технический стек
| Компонент | Технология |
|----------|------------|
| Фреймворк | Next.js 14 (App Router) |
| Язык | TypeScript |
| Стилизация | Tailwind CSS |
| База данных | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (postgres_changes) |
| Notifications | Telegram Bot API |
| UI | Custom Components + Sonner (временно отключён) |
| Деплой | Vercel |

---

## Дизайн-система "Soft Dark Graphite"

### Цветовая палитра
```
Фон приложения:    #1C1C1E (graphite-base)
Карточки/панели:   #2C2C2E (graphite-card)
Границы:          #3A3A3C (graphite-border)
Текст основной:   #F5F5F7 (on-surface)
Текст вторичный:  #98989D (on-surface-variant)
Акцент (neon):    #9FFB00 (primary-fixed)
Акцент hover:     #8BDC00 (primary-fixed-dim)
Ошибки:           #FF453A
```

### Типографика
* **Шрифт:** Manrope (Google Fonts)
* **Fallback:** system-ui, sans-serif

### Стилистика
* Bento Grid Layout на главной странице
* Floating Bottom Navigation Bar
* Glassmorphism эффекты на карточках
* Неоновые glow-эффекты (#9FFB00)
* Noise texture overlay
* Tonal layering вместо жёстких границ

---

## Архитектура базы данных (Supabase)

### Таблицы

#### `guests`
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | PRIMARY KEY |
| phone | VARCHAR(20) | UNIQUE, NOT NULL |
| name | VARCHAR(255) | |
| is_adult | BOOLEAN | DEFAULT true |
| created_at | TIMESTAMP | |

#### `tables`
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | PRIMARY KEY |
| number | VARCHAR(10) | UNIQUE (0-12, 11.5) |
| capacity | INTEGER | |
| features | TEXT[] | ['window_view', 'ps5'] |
| is_active | BOOLEAN | DEFAULT true |

#### `reservations`
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | PRIMARY KEY |
| guest_id | UUID | FOREIGN KEY → guests |
| table_id | UUID | FOREIGN KEY → tables (nullable) |
| status | VARCHAR(20) | waitlist/confirmed/seated/completed/cancelled |
| expected_duration_minutes | INTEGER | |
| arrival_time | TIMESTAMP | |
| created_at | TIMESTAMP | |

#### `menu_items`
| Поле | Тип | Описание |
|------|-----|---------|
| id | UUID | PRIMARY KEY |
| category | VARCHAR(100) | |
| name | VARCHAR(255) | |
| price | DECIMAL | |
| is_available | BOOLEAN | DEFAULT true |

---

## Реализованный функционал

### Клиентская часть (PWA)

#### Главная страница (`/`)
- [x] Age Gate (18+) с проверкой localStorage
- [x] Hero секция с логотипом и приветствием
- [x] Bento Grid с карточками действий (Бронирование, Меню, Заказ, Контакты)
- [x] Floating Bottom Navigation Bar
- [x] Адаптивная вёрстка под мобильные устройства

#### Страница бронирования (`/booking`)
- [x] Форма с валидацией (имя, телефон, дата, время, гости)
- [x] Выбор конкретного стола (опционально)
- [x] Блокировка прошедших дат (`min={сегодня}`)
- [x] Блокировка времени ранее 12:00
- [x] **Жёсткая валидация времени (Frontend)**:
  - Минимум 30 минут до визита (буфер)
  - График работы: Пн-Чт, Вс — до 02:00; Пт-Сб — до 04:00
- [x] **Toast-уведомления** (sonner) вместо inline ошибок
- [x] **Защита от двойного клика** (кнопка disabled + spinner)
- [x] **Динамическая фильтрация столов**:
  - `fetchReservationsForDate(date)` — Server Action для загрузки броней дня
  - Фильтрация по вместимости (`table.capacity >= guests`)
  - Фильтрация по пересечению времени (математика: `newStart < resEnd && newEnd > resStart`)
  - Автосброс выбранного стола при конфликте + toast.info
  - Визуальная индикация "занят" на недоступных столах
  - Блокировка отправки если нет доступных столов
- [x] Вычисление длительности визита
- [x] **Success Screen** после успешной брони:
  - Красивое отображение даты (формат ru-RU: "8 апреля 2026")
  - Понятное имя стола ("CITY — Стол 1", "PS5 — Стол 10", "Любой свободный")

#### Страница меню (`/menu`)
- [x] Группировка по категориям
- [x] Отображение цены в рублях
- [x] Визуальное отличие недоступных позиций (зачёркнутый текст)
- [x] **Динамическое обновление** при изменении в админке
- [x] Кэширование отключено (`force-dynamic`)

#### Страница контактов (`/contacts`)
- [x] Адрес с акцентом на "12 этаж"
- [x] Режим работы
- [x] Телефон
- [x] Интегрированная карта (Яндекс.Карты iframe)
- [x] Кнопка "Проложить маршрут в 2ГИС"

### Админка (`/admin`)

#### Система вкладок
- [x] Вкладка "Бронирование" — Шахматка + Ближайшие брони
- [x] Вкладка "Стоп-лист" — Управление меню
- [x] Tabs UI с иконками

#### Шахматка столов
- [x] Визуальное отображение 14 столов (0-12, 11.5)
- [x] Зоны: CITY (1-7), PS5 (10, 12), Standard (остальные)
- [x] Статусы: свободен (зелёный), занят (оранжевый), заблокирован (янтарный)
- [x] Клик на **занятый** стол → модалка бронирования (просмотр + завершение)
- [x] Клик на **свободный** стол → модалка ручного бронирования
- [x] Кнопка "Освободить стол"
- [x] Брони с префиксом "БЛОК:" подсвечиваются янтарным (amber) — видно, что это блокировка, а не гость

#### Лист ожидания (Waitlist)
- [x] Список броней со статусом waitlist/confirmed
- [x] Отображение гостя, телефона, времени, длительности
- [x] Кнопка "Посадить" с выбором стола
- [x] Автоматическое скрытие броней старше 3 часов

#### Стоп-лист (Stop List)
- [x] Группировка по категориям
- [x] Тумблеры для включения/выключения позиций
- [x] Счётчик недоступных позиций
- [x] Optimistic UI

### Server Actions

#### `createReservation(data)`
- [x] Валидация: запрет бронирования в прошлое
- [x] Валидация UUID для table_id (защита от "invalid input syntax")
- [x] **Race Condition Protection**: использует RPC `book_table_safe` с `LOCK TABLE`
- [x] Поиск/создание гостя по телефону
- [x] Создание брони со статусом "waitlist"
- [x] `revalidatePath('/admin')` после создания

#### `book_table_safe` (PostgreSQL Stored Procedure)
- [x] Файл: `supabase/migrations/20260408_create_safe_booking_rpc.sql`
- [x] **Сигнатура**: `book_table_safe(p_date_time, p_duration_minutes, p_guest_name, p_guest_phone, p_guests_count, p_table_id)`
- [x] `LOCK TABLE reservations IN SHARE ROW EXCLUSIVE MODE` — атомарная блокировка
- [x] Проверка конфликтов с буфером +30 минут
- [x] Возвращает JSON: `{success, data?, error?}`
- [x] **Важно**: параметры RPC СТРОГО соответствуют сигнатуре БД — не менять имена!

#### `getTables()`
- [x] Получение активных столов с UUID, номером, features

#### `createAdminReservation(data)` (admin.ts)
- [x] Мультивыбор столов (для групп 7+ человек)
- [x] Режим "Блок" — имя начинается с "БЛОК:" → янтарная подсветка
- [x] `Promise.all` параллельные вызовы `book_table_safe` для каждого стола
- [x] Race condition protection: если один стол занят — вся операция откатывается
- [x] Автообновление админки после успешного создания
- [x] **Telegram-уведомление** с пометкой "Бронь (админ)" или "Блокировка стола"

#### `TableManagementModal` (admin/components)
- [x] Клик на свободный стол → модалка "Управление столом"
- [x] **Блок A**: текущий статус (свободен / занят сейчас)
- [x] **Блок B**: мини-таймлайн на день (12:00–02:00) с занятыми/свободными слотами
- [x] Клик по слоту в таймлайне → автозаполнение времени бронирования
- [x] Быстрая форма: имя, телефон, дата, время, длительность, гости
- [x] Выделение конфликтов (занятые слоты + слот с выбранным временем)
- [x] Пульсирующая точка — текущий час

#### `sendTelegramNotification(booking)`
- [x] Проверка наличия ключей с логированием
- [x] Формирование сообщения в Markdown
- [x] Отправка через Telegram Bot API
- [x] **Fire-and-forget**: никогда не блокирует ответ клиенту

---

## Инфраструктура

### Vercel Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=https://vdikxfwxpqlxixykgghz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
TELEGRAM_BOT_TOKEN=8685769271:AAHiVRGMikVgKU3Amq2OOPOwHIn-bdXyREs
TELEGRAM_CHAT_ID=333906877
```

### Supabase Realtime
- [x] Включён для таблицы `reservations`
- [x] Компонент `RealtimeListener.tsx` с локальным Supabase клиентом
- [x] Уведомления при создании новой брони с auto-dismiss
- [x] Слушает все события: INSERT, UPDATE, DELETE (event: '*')
- [x] Optimistic updates через `onRealtimeUpdate` callback
- [x] Мгновенное обновление UI при завершении/посадке гостя

### PWA Support
- [x] manifest.json в `/public`
- [x] PWA meta tags (theme-color, apple-mobile-web-app-*)
- [x] SVG favicon

### Timezone (UTC+7)
- [x] `actions.ts` — форматирование даты с учётом UTC+7 (Новосибирск)
- [x] `UpcomingBookings` — `toLocaleTimeString` с `timeZone: 'Asia/Novosibirsk'`
- [x] `Chessboard` — корректное отображение времени в модалке

### Telegram-уведомления
- [x] Токены добавлены в Vercel Dashboard
- [x] Формат сообщения:
  ```
  🔔 Новая бронь!
  👤 Гость: Имя
  📞 Телефон: +7 ...
  📅 Дата: 8 апреля 2026
  🕐 Время: 19:00
  👥 Гостей: 3
  ⏱ Длительность: 180 мин
  🪑 Стол: CITY — Стол 1
  ```

---

## Текущий статус разработки

### ✅ Завершённые этапы

| Шаг | Описание | Статус |
|-----|----------|--------|
| 1 | Инициализация PROJECT_STATE.md | ✅ |
| 2 | Базовая настройка UI (Tailwind, Dark Theme) | ✅ |
| 3 | Настройка Supabase (таблицы: guests, tables, reservations) | ✅ |
| 4 | Клиентский путь бронирования (PWA) | ✅ |
| 5 | Admin CRM и шахматка столов | ✅ |
| 6 | Интерактивное меню и Стоп-лист | ✅ |
| 7 | Страница Контактов и финализация Хаба | ✅ |
| 8 | Редизайн в Soft Dark Graphite тему | ✅ |
| 9 | Telegram-уведомления для хостес | ✅ |
| 10 | Полировка PWA и RealtimeListener | ✅ |
| 11 | Рефакторинг админки (вкладки), Optimistic Realtime, Timezone UTC+7 | ✅ |
| 12 | Race Condition Protection: хранимая процедура `book_table_safe` | ✅ |
| 13 | Идеальный UX: Toast-уведомления, валидация времени, защита от двойного клика | ✅ |
| 14 | Динамическая фильтрация столов по занятости и вместимости | ✅ |
| 15 | Исправление syntax errors в BookingFormClient.tsx | ✅ |
| 16 | Исправление вместимости столов (DB: 4→6 для больших, 2 для малых) | ✅ |
| 17 | Ручное бронирование / блокировка столов для администратора | ✅ |
| 18 | Телефонное бронирование: TableManagementModal с таймлайном, быстрой формой и Telegram-уведомлениями | ✅ |
| 19 | Фикс бага: date/time инициализация + валидация + честный отлов DB-ошибок | ✅ |
| 20 | Фикс рассинхрона RPC: параметры приведены в соответствие с сигнатурой БД (p_table_id, p_arrival_time, p_expected_duration_minutes, ...) | ✅ |
| 21 | Фикс timezone: UTC+3 → UTC+7 (Asia/Novosibirsk) в getAdminData и UpcomingBookings | ✅ |
| 22 | Фикс: удалён phantom "11.5" из TABLE_NUMBERS; table 13 → capacity=6 | ✅ |
| 23 | Откат и правильный фикс: стол 11.5 возвращён, добавлен DISPLAY_NUMBER_MAP (Path A + Path B SQL) | ✅ |
| 24 | Graphite theme redesign + AdminClient с вкладками + TableManagementModal | ✅ |
| 25 | Фикс timezone handling: lib/datetime.ts + исправления в UpcomingBookings, Chessboard, TableManagementModal | ✅ |
| 26 | Система No-Show и Early Leave: updateReservationStatus с endEarly, кнопки отмены/освобождения | ✅ |
| 27 | Фикс timezone, редизайн date/time, защита вместимости для малых столов | ✅ |
| 28 | CORE TIMEZONE RULE: жесткий UTC+7, убраны getHours(), date/time inputs активны | ✅ |
| 29 | One-click "Посадить гостя" без выбора стола, toast уведомления | ✅ |
| 30 | Фикс позиционирования календаря: relative контейнер, top-full, z-[9999] | ✅ |

### 📋 Бэклог

- [ ] Service Worker для offline-режима
- [ ] Push-уведомления для гостей
- [ ] История бронирований для гостя
- [ ] Админка: экспорт данных в Excel
- [ ] Аналитика: популярные столы, средняя длительность

---

## Деплой

| Окружение | URL | Примечание |
|-----------|-----|------------|
| Production | https://project-elka-lounge.vercel.app | Последний: ALyy6QZwygmGocRmSgbV8F2dS7q8 |
| Preview | vercel.app/*/project-elka-lounge | Перед merge |

**⚠️ ВАЖНО: После каждой итерации обязательно запускать `npx vercel --prod` для деплоя в production!**

---

## Референсы

* Дизайн-спецификация: `/Users/promet/Documents/stitch-3/DESIGN.md`
* HTML прототип: `/Users/promet/Documents/stitch-3/code.html`
* Скриншот дизайна: `/Users/promet/Documents/stitch-3/screen.png`

---

## Известные проблемы

1. **Sonner Toaster** — используется, но проверить на hydration errors при необходимости

## Отличия от оригинального дизайна

* Sonner Toaster используется вместо toast()
* RealtimeListener создаёт локальный Supabase клиент внутри "use client"

---

*Последнее обновление: 9 апреля 2026*

---

## Архитектура утилит

### lib/datetime.ts
Централизованные утилиты для работы с часовым поясом UTC+7 (Новосибирск):
- `NOVOSIBIRSK_TZ` — константа часового пояса
- `formatTimeLocal(isoString)` — форматирование времени с учётом часового пояса
- `parseToLocalDateTime(isoString)` — парсинг ISO-строки в Date
- `getLocalNow()` — текущее время в UTC+7
- `getHoursDiff(arrivalTimeISO)` — разница в часах между now и arrival_time
