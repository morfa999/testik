# KITSTUDIO - Мир звуков для FL Studio

Веб-приложение для публикации и скачивания сэмплов, лупов и ваншотов для FL Studio.

## Функции

### Пользователи
- 🎵 Каталог звуков с фильтрацией и поиском
- 🔊 Встроенный аудиоплеер с визуализацией waveform
- ⚡ Редактор звука (обрезка, реверс, изменение громкости/тональности)
- 🎨 Бесплатные и Premium звуки
- 💎 Два Premium тарифа (HD 299₽/мес, Ultra 599₽/мес)
- 📱 Адаптивный дизайн
- 🔔 Система уведомлений для пользователей
- 💬 Техподдержка через репорты (доступна без регистрации)
- 👑 Информация о подписках (доступна без регистрации)

### Админ-панель
- ✅ Модерация звуков
- 👥 Управление пользователями
- 🛡️ Назначение администраторов
- 📊 Репорты от пользователей
- 📢 Рассылка оповещений

## Технологии

### Frontend
- React 19 + TypeScript
- Tailwind CSS 4
- Vite

### Backend
- Node.js + Express
- PostgreSQL
- bcryptjs для хеширования паролей

## Установка

1. Клонируйте репозиторий
```bash
git clone <repo>
cd kitstudio
```

2. Установите зависимости
```bash
npm install
```

3. Создайте `.env` файл
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/kitstudio
NODE_ENV=development
```

4. Запустите сервер разработки
```bash
npm run dev
```

5. Для production сборки
```bash
npm run build
node server.js
```

## Структура проекта

```
src/
├── components/          # React компоненты
│   ├── AdminPanel.tsx   # Админ-панель
│   ├── AddModal.tsx     # Модал загрузки звука
│   ├── AudioEditor.tsx  # Редактор аудио
│   ├── AuthModal.tsx    # Авторизация
│   └── ...
├── data/                # Данные (категории, настройки)
├── store/               # Глобальное состояние
├── utils/               # Утилиты
├── App.tsx              # Главный компонент
└── main.tsx             # Точка входа

server.js                # Express сервер + API
```

## API Endpoints

### Авторизация
- `POST /api/register` - регистрация
- `POST /api/login` - вход
- `GET /api/me` - текущий пользователь
- `POST /api/logout` - выход

### Звуки
- `GET /api/sounds` - список звуков
- `POST /api/sounds` - добавить звук
- `POST /api/sounds/:id/download` - скачать

### Админ
- `GET /api/admin/sounds` - все звуки
- `GET /api/admin/pending` - звуки на модерации
- `GET /api/admin/users` - пользователи
- `GET /api/admin/reports` - репорты
- `POST /api/admin/broadcasts` - отправить уведомление

## Главный администратор

Email: `energoferon41@gmail.com`

Первый пользователь с этим email автоматически получит права администратора.

## Лицензия

MIT
