# Биохимия стройности

Production-ready landing page project для сбора заявок на гайд по похудению.

## Стек

- **Frontend**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Next.js API routes / Server Actions
- **Database**: Supabase PostgreSQL
- **Validation**: Zod
- **Deploy**: Vercel-ready

## Быстрый старт

### 1. Установка зависимостей

```bash
npm install
```

### 2. Настройка переменных окружения

Скопируйте `.env.example` в `.env.local`:

```bash
cp .env.example .env.local
```

Заполните переменные:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Panel
ADMIN_PASSWORD=your_secure_password

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Настройка Supabase

#### Создание таблицы leads

В SQL Editor Supabase выполните:

```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  telegram TEXT NOT NULL,
  email TEXT,
  goal TEXT NOT NULL CHECK (goal IN ('weight_loss', 'energy', 'nutrition', 'consultation')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed')),
  notes TEXT
);

-- RLS policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Allow inserts from authenticated clients
CREATE POLICY "Allow inserts" ON leads FOR INSERT WITH CHECK (true);

-- Allow selects for service role (admin)
CREATE POLICY "Allow service role read" ON leads FOR SELECT USING (true);

-- Allow updates for service role
CREATE POLICY "Allow service role update" ON leads FOR UPDATE USING (true);
```

### 4. Запуск проекта

```bash
npm run dev
```

Откройте http://localhost:3000

## Структура проекта

```
biochimia-stroinosti/
├── app/
│   ├── api/
│   │   ├── admin/
│   │   │   ├── auth/route.ts      # Auth API
│   │   │   └── leads/route.ts     # Leads CRUD API
│   │   └── leads/route.ts         # Public leads API
│   ├── admin/
│   │   ├── dashboard/page.tsx     # Admin dashboard
│   │   ├── layout.tsx
│   │   └── page.tsx               # Login page
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Hero.tsx
│   │   ├── Story.tsx
│   │   ├── Benefits.tsx
│   │   ├── LeadForm.tsx
│   │   └── Footer.tsx
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── types.ts               # TypeScript types
│   │   ├── utils.ts               # Utilities
│   │   └── validations.ts         # Zod schemas
│   ├── actions/
│   │   └── leads.ts               # Server actions
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                   # Landing page
├── public/
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## Развертывание на Vercel

### 1. Подключите репозиторий к Vercel

```bash
npm i -g vercel
vercel
```

### 2. Добавьте переменные окружения в Vercel

В панели Vercel → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_PASSWORD`
- `NEXT_PUBLIC_APP_URL`

### 3. Deploy

```bash
vercel --prod
```

## Функционал

### Landing Page

- Hero секция с before/after трансформацией
- История пути к результату (timeline)
- Преимущества гайда (benefits cards)
- Форма сбора заявок с валидацией
- Mobile-first адаптивный дизайн
- Sticky CTA на мобильных устройствах

### Admin Panel (/admin)

- Защищённый вход по паролю
- Dashboard со статистикой:
  - Всего заявок
  - Новых заявок
  - Заявок за сегодня
- Таблица заявок с:
  - Поиском по имени/Telegram
  - Фильтром по статусу
  - Пагинацией
- Редактирование статуса и заметок
- Export в CSV

## Дизайн-система

### Цвета

- Background: `#FAFAF7`
- Card: `#FFFFFF`
- Text: `#1E1E1E`
- Secondary: `#5F6368`
- Accent Green: `#A8BFA3`
- CTA Amber: `#E8A63A`

### Типографика

- Font: Inter (Google Fonts)
- Sizes: sm, base, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl

### Shadows

- Soft: `0 4px 20px rgba(0, 0, 0, 0.04)`
- Soft-lg: `0 8px 40px rgba(0, 0, 0, 0.08)`
- Glass: `0 8px 32px rgba(0, 0, 0, 0.08)`

### Border Radius

- 2xl: 16px
- 3xl: 24px

## Development

```bash
# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## Лицензия

MIT
